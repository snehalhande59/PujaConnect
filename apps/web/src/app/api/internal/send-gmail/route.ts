import { NextRequest, NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0] || '*'}***@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

function verifyRelayAuth(req: NextRequest): { authorized: boolean; reason?: string } {
  const configuredSecret = process.env.GMAIL_RELAY_SECRET?.trim();
  if (!configuredSecret) {
    return { authorized: false, reason: 'GMAIL_RELAY_SECRET is not configured on relay server.' };
  }

  const incomingSecret =
    req.headers.get('x-relay-secret')?.trim() ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (!incomingSecret || incomingSecret !== configuredSecret) {
    return { authorized: false, reason: 'Invalid or missing relay authentication secret.' };
  }

  return { authorized: true };
}

/**
 * GET /api/internal/send-gmail
 * Health check endpoint for relay diagnostics (requires x-relay-secret)
 */
export async function GET(req: NextRequest) {
  const auth = verifyRelayAuth(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.reason || 'Unauthorized' },
      { status: 401 },
    );
  }

  const rawHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const rawPort = process.env.SMTP_PORT || '465';
  const rawUser = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  const rawFrom = process.env.SMTP_FROM?.trim();

  return NextResponse.json({
    status: 'ok',
    relay: 'Vercel Gmail SMTP Relay',
    host: rawHost.trim(),
    port: Number(rawPort) || 465,
    secure: process.env.SMTP_SECURE === 'true' || Number(rawPort) === 465,
    userConfigured: Boolean(rawUser),
    userMasked: rawUser ? maskEmail(rawUser) : null,
    passConfigured: Boolean(rawPass),
    passLength: rawPass ? rawPass.replace(/\s+/g, '').length : 0,
    fromConfigured: Boolean(rawFrom),
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/internal/send-gmail
 * Server-to-server email dispatch route
 */
export async function POST(req: NextRequest) {
  const auth = verifyRelayAuth(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.reason || 'Unauthorized' },
      { status: 401 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 },
    );
  }

  const { to, subject, html, text, purpose } = body || {};

  if (!to || typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    return NextResponse.json(
      { success: false, error: 'A single valid recipient email address is required.' },
      { status: 400 },
    );
  }

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return NextResponse.json(
      { success: false, error: 'Email subject is required.' },
      { status: 400 },
    );
  }

  if (!html && !text) {
    return NextResponse.json(
      { success: false, error: 'Email content (html or text) is required.' },
      { status: 400 },
    );
  }

  const rawHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const rawPort = process.env.SMTP_PORT || '465';
  const rawUser = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  const rawFrom = process.env.SMTP_FROM?.trim();

  const host = rawHost.trim();
  const port = Number(rawPort) || 465;
  const user = rawUser;
  // Clean pass (remove spaces in App Password)
  const pass = rawPass ? rawPass.replace(/\s+/g, '').replace(/^["']|["']$/g, '') : undefined;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    return NextResponse.json(
      {
        success: false,
        error: 'SMTP credentials (SMTP_USER / SMTP_PASS) are not configured on the relay server.',
      },
      { status: 500 },
    );
  }

  // Gmail SMTP requires the from address to match the authenticated Gmail user or be authorized
  const fromAddress = rawFrom || `DevSutra <${user}>`;
  const maskedRecipient = maskEmail(to.trim());

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to: to.trim(),
      subject: subject.trim(),
      text: text || undefined,
      html: html || undefined,
    });

    console.log(
      `[Vercel Gmail Relay] Delivered email (purpose=${purpose || 'general'}) to ${maskedRecipient} (messageId: ${info.messageId})`,
    );

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      deliveredTo: maskedRecipient,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const code = err?.code || 'UNKNOWN';
    const responseCode = err?.responseCode || 'N/A';
    const command = err?.command || 'N/A';
    const rawMsg = err?.message || 'SMTP delivery failed';
    const sanitizedMsg = rawMsg.replace(
      /([a-zA-Z0-9_\-\.]{3,})@([a-zA-Z0-9_\-\.]+)/g,
      '***@$2',
    );

    console.error(
      `[Vercel Gmail Relay Error] Failed to send email to ${maskedRecipient}: code=${code}, responseCode=${responseCode}, command=${command}, message=${sanitizedMsg}`,
    );

    return NextResponse.json(
      {
        success: false,
        error: sanitizedMsg,
        code,
        responseCode,
      },
      { status: 500 },
    );
  }
}
