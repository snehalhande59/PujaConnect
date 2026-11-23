import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;
  private host?: string;
  private port: number = 587;
  private secure: boolean = false;
  private user?: string;
  private pass?: string;
  private lastVerificationResult: {
    verified: boolean;
    timestamp: string;
    code?: string;
    responseCode?: string;
    command?: string;
    message?: string;
  } | null = null;
  private lastSendResult: {
    success: boolean;
    timestamp: string;
    code?: string;
    responseCode?: string;
    command?: string;
    message?: string;
  } | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const rawHost = this.configService.get<string>('SMTP_HOST');
    const rawPort = this.configService.get<number | string>('SMTP_PORT', 587);
    const rawUser = this.configService.get<string>('SMTP_USER');
    const rawPass = this.configService.get<string>('SMTP_PASS');

    // Trim host and user
    const host = rawHost ? rawHost.trim() : undefined;
    const port = Number(rawPort) || 587;
    const user = rawUser ? rawUser.trim() : undefined;

    // Trim pass and remove all whitespace (including spaces in Google App Passwords)
    const pass = rawPass
      ? rawPass.trim().replace(/\s+/g, '').replace(/^["']|["']$/g, '')
      : undefined;

    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true' ||
      port === 465;

    this.host = host;
    this.port = port;
    this.secure = secure;
    this.user = user;
    this.pass = pass;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
          // Standard socket timeouts to prevent indefinite hanging
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        });
        this.isConfigured = true;
        this.logger.log(
          `SMTP transport initialized: host=${host}, port=${port}, secure=${secure}, userConfigured=true, passLength=${pass.length}`,
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to initialize SMTP transport: code=${err?.code || 'UNKNOWN'}, message=${err?.message || 'Initialization error'}`,
        );
        this.isConfigured = false;
        this.transporter = null;
      }
    } else {
      this.logger.warn(
        `SMTP configuration is incomplete: hostConfigured=${Boolean(host)}, userConfigured=${Boolean(user)}, passConfigured=${Boolean(pass)}. Email delivery service is disabled.`,
      );
      this.isConfigured = false;
    }
  }

  /**
   * Verify SMTP transporter on application startup.
   * Catches errors and logs structured diagnostic warnings; NEVER crashes the application.
   */
  async onModuleInit() {
    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.verify();
        this.lastVerificationResult = {
          verified: true,
          timestamp: new Date().toISOString(),
          message: `SMTP connection verified successfully on port ${this.port} (secure: ${this.secure}). Ready to deliver emails.`,
        };
        this.logger.log(
          `SMTP connection verified successfully on port ${this.port}. Ready to deliver emails.`,
        );
      } catch (err: any) {
        const code = err?.code || 'UNKNOWN';
        const responseCode = err?.responseCode || 'N/A';
        const command = err?.command || 'N/A';
        const rawMsg = err?.message || 'SMTP verification failed';
        const sanitizedMsg = rawMsg.replace(
          /([a-zA-Z0-9_\-\.]{3,})@([a-zA-Z0-9_\-\.]+)/g,
          '***@$2',
        );
        this.lastVerificationResult = {
          verified: false,
          timestamp: new Date().toISOString(),
          code,
          responseCode,
          command,
          message: sanitizedMsg,
        };
        this.logger.warn(
          `[SMTP Startup Verification Warning] Connection check on port ${this.port} failed (code=${code}, responseCode=${responseCode}, command=${command}): ${sanitizedMsg}`,
        );

        // If port was 587 and failed with ETIMEDOUT / ECONNREFUSED, test port 465 (SSL direct)
        if (this.port === 587 && (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ESOCKET')) {
          this.logger.log('Port 587 timed out. Testing port 465 (SSL direct) as fallback...');
          try {
            const sslTransporter = nodemailer.createTransport({
              host: this.host,
              port: 465,
              secure: true,
              auth: {
                user: this.user,
                pass: this.pass,
              },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 15000,
            });
            await sslTransporter.verify();
            this.transporter = sslTransporter;
            this.port = 465;
            this.secure = true;
            this.lastVerificationResult = {
              verified: true,
              timestamp: new Date().toISOString(),
              message: 'SMTP connection verified successfully on fallback port 465 (SSL). Ready to deliver emails.',
            };
            this.logger.log('SMTP connection verified successfully on fallback port 465 (SSL).');
          } catch (sslErr: any) {
            const sslCode = sslErr?.code || 'UNKNOWN';
            const sslMsg = sslErr?.message || 'Port 465 verification failed';
            this.lastVerificationResult = {
              verified: false,
              timestamp: new Date().toISOString(),
              code: sslCode,
              message: `Port 587 failed (${code}), and fallback port 465 also failed (${sslCode}): ${sslMsg}`,
            };
            this.logger.warn(`Port 465 fallback also failed: code=${sslCode}, message=${sslMsg}`);
          }
        }
      }
    } else {
      this.lastVerificationResult = {
        verified: false,
        timestamp: new Date().toISOString(),
        message: 'SMTP configuration is incomplete in environment variables.',
      };
    }
  }

  /**
   * Get safe SMTP status without exposing passwords or secrets
   */
  public getSmtpStatus() {
    const rawHost = this.configService.get<string>('SMTP_HOST');
    const rawPort = this.configService.get<number | string>('SMTP_PORT', 587);
    const rawUser = this.configService.get<string>('SMTP_USER');
    const rawPass = this.configService.get<string>('SMTP_PASS');
    const rawSecure = this.configService.get<string>('SMTP_SECURE');
    const rawFrom = this.configService.get<string>('SMTP_FROM');

    return {
      configured: this.isConfigured,
      host: rawHost ? rawHost.trim() : null,
      port: Number(rawPort) || 587,
      secure: rawSecure === 'true' || Number(rawPort) === 465,
      userConfigured: Boolean(rawUser && rawUser.trim()),
      userMasked: rawUser ? this.maskEmail(rawUser.trim()) : null,
      passConfigured: Boolean(rawPass && rawPass.trim()),
      passLength: rawPass ? rawPass.trim().replace(/\s+/g, '').length : 0,
      fromConfigured: Boolean(rawFrom && rawFrom.trim()),
      verification: this.lastVerificationResult,
      lastSend: this.lastSendResult,
    };
  }

  /**
   * Check whether SMTP credentials are fully configured
   */
  public getIsConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Send a clearly labeled automated test email using the branded template
   */
  async sendTestEmail(
    toEmail: string,
    testCode: string = '123456',
  ): Promise<SendEmailResult> {
    const masked = this.maskEmail(toEmail);
    const rawFrom = this.configService.get<string>('SMTP_FROM');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const fromAddress = rawFrom
      ? rawFrom.trim()
      : (smtpUser ? `DevSutra <${smtpUser.trim()}>` : 'DevSutra <no-reply@devsutra.in>');

    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        error:
          'Email service is currently unavailable. SMTP configuration is missing.',
      };
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TEST] DevSutra SMTP Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FDFBF7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2D241E;
    }
    .wrapper {
      width: 100%;
      background-color: #FDFBF7;
      padding: 32px 16px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #EFE8DC;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(128, 0, 32, 0.04);
    }
    .header {
      background: linear-gradient(135deg, #800020 0%, #5C0017 100%);
      padding: 28px 24px;
      text-align: center;
    }
    .brand-name {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .brand-tagline {
      color: #F7D070;
      font-size: 13px;
      margin-top: 4px;
      letter-spacing: 0.2px;
    }
    .content {
      padding: 32px 28px;
      text-align: center;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #1F1916;
      margin: 0 0 12px 0;
    }
    .subtitle {
      font-size: 14px;
      color: #6B5E55;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    .test-badge {
      display: inline-block;
      background-color: #EDE9FE;
      color: #6B21A8;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .otp-box {
      background-color: #FBF7F0;
      border: 2px dashed #D4AF37;
      border-radius: 12px;
      padding: 18px 24px;
      margin: 0 auto 24px auto;
      display: inline-block;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #800020;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
    }
    .warning {
      font-size: 13px;
      color: #C2410C;
      background-color: #FFF7ED;
      border: 1px solid #FFEDD5;
      border-radius: 8px;
      padding: 14px 18px;
      line-height: 1.5;
      margin-top: 20px;
    }
    .footer {
      background-color: #F7F3EB;
      padding: 16px 24px;
      text-align: center;
      font-size: 11px;
      color: #9C8E84;
      border-top: 1px solid #EFE8DC;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-name">DevSutra</h1>
        <div class="brand-tagline">Vedic Rituals & Certified Pandits</div>
      </div>
      <div class="content">
        <span class="test-badge">⚠️ Automated Delivery Test</span>
        <h2 class="title">SMTP Configuration Test</h2>
        <p class="subtitle">This is an automated test email to confirm that the DevSutra email service is correctly configured and operational.</p>
        <div class="otp-box">
          <div class="otp-code">${testCode}</div>
        </div>
        <div class="warning">
          <strong>Security Notice:</strong> This is a temporary test-only code. It is NOT a real login OTP and cannot be used to sign in to DevSutra.
        </div>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} DevSutra. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[TEST] DevSutra SMTP Verification`,
        text: `This is an automated test email from DevSutra. Test Code: ${testCode}. This is for SMTP verification only and cannot be used to log in.`,
        html: htmlContent,
      });

      this.logger.log(
        `Test email sent successfully to ${masked} (messageId: ${info.messageId})`,
      );
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      const code = err?.code || 'UNKNOWN';
      const responseCode = err?.responseCode || 'N/A';
      const command = err?.command || 'N/A';
      const rawMsg = err?.message || 'Failed to deliver test email';
      const sanitizedMsg = rawMsg.replace(
        /([a-zA-Z0-9_\-\.]{3,})@([a-zA-Z0-9_\-\.]+)/g,
        '***@$2',
      );
      this.logger.error(
        `Failed to send test email to ${masked}: code=${code}, responseCode=${responseCode}, command=${command}, message=${sanitizedMsg}`,
      );
      return {
        success: false,
        error: 'Failed to deliver test email. Please check server logs for details.',
      };
    }
  }

  /**
   * Verify SMTP readiness or throw ServiceUnavailableException
   */
  public assertConfigured(): void {
    if (!this.isConfigured || !this.transporter) {
      throw new ServiceUnavailableException(
        'Email service is currently unavailable. SMTP configuration is missing.',
      );
    }
  }

  /**
   * Helper to mask email address for safe logging (e.g. m***a@gmail.com)
   */
  public maskEmail(email: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) return '***';
    const [name, domain] = parts;
    if (name.length <= 2) {
      return `${name[0] || '*'}***@${domain}`;
    }
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  }

  /**
   * Send 6-digit branded OTP verification email
   * NOTE: Never logs raw OTP, SMTP passwords, or full email addresses.
   * If SMTP is not configured, it returns success: false or throws ServiceUnavailableException.
   */
  async sendOtpEmail(
    toEmail: string,
    otp: string,
    throwOnError: boolean = false,
  ): Promise<SendEmailResult> {
    const masked = this.maskEmail(toEmail);
    const rawFrom = this.configService.get<string>('SMTP_FROM');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const fromAddress = rawFrom
      ? rawFrom.trim()
      : (smtpUser ? `DevSutra <${smtpUser.trim()}>` : 'DevSutra <no-reply@devsutra.in>');

    if (!this.isConfigured || !this.transporter) {
      this.logger.error(
        `Email OTP delivery aborted for ${masked}: SMTP service is not configured.`,
      );
      if (throwOnError) {
        throw new ServiceUnavailableException(
          'Email service is currently unavailable. SMTP configuration is missing.',
        );
      }
      return {
        success: false,
        error:
          'Email service is currently unavailable. SMTP configuration is missing.',
      };
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevSutra Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FDFBF7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2D241E;
    }
    .wrapper {
      width: 100%;
      background-color: #FDFBF7;
      padding: 32px 16px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #EFE8DC;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(128, 0, 32, 0.04);
    }
    .header {
      background: linear-gradient(135deg, #800020 0%, #5C0017 100%);
      padding: 28px 24px;
      text-align: center;
    }
    .brand-name {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .brand-tagline {
      color: #F7D070;
      font-size: 13px;
      margin-top: 4px;
      letter-spacing: 0.2px;
    }
    .content {
      padding: 32px 28px;
      text-align: center;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #1F1916;
      margin: 0 0 12px 0;
    }
    .subtitle {
      font-size: 14px;
      color: #6B5E55;
      line-height: 1.5;
      margin: 0 0 28px 0;
    }
    .otp-box {
      background-color: #FBF7F0;
      border: 2px dashed #D4AF37;
      border-radius: 12px;
      padding: 18px 24px;
      margin: 0 auto 24px auto;
      display: inline-block;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #800020;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
    }
    .badge {
      display: inline-block;
      background-color: #FFF3E0;
      color: #B26A00;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 20px;
    }
    .warning {
      font-size: 12px;
      color: #8C7E74;
      line-height: 1.5;
      margin-top: 20px;
      border-top: 1px solid #F0EAE1;
      padding-top: 20px;
    }
    .footer {
      background-color: #F7F3EB;
      padding: 16px 24px;
      text-align: center;
      font-size: 11px;
      color: #9C8E84;
      border-top: 1px solid #EFE8DC;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-name">DevSutra</h1>
        <div class="brand-tagline">Vedic Rituals & Certified Gurukul Pandits</div>
      </div>
      <div class="content">
        <h2 class="title">Verify Your Email</h2>
        <p class="subtitle">Use the verification code below to complete your login or registration with DevSutra.</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <div>
          <span class="badge">⏱ Valid for 5 minutes</span>
        </div>
        <div class="warning">
          <strong>Security Notice:</strong> Never share this code with anyone. DevSutra representatives will never ask for your one-time password. If you did not request this verification, you can safely ignore this email.
        </div>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} DevSutra. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `${otp} is your DevSutra verification code`,
        text: `Your DevSutra verification code is: ${otp}. This code is valid for 5 minutes. Never share this code with anyone.`,
        html: htmlContent,
      });

      this.lastSendResult = {
        success: true,
        timestamp: new Date().toISOString(),
        message: `OTP email delivered (messageId: ${info.messageId})`,
      };
      this.logger.log(
        `OTP email sent successfully to ${masked} (messageId: ${info.messageId})`,
      );
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      // If port 587 timed out during send and we haven't switched to 465 yet, try port 465 once
      if (this.port === 587 && this.host && this.user && this.pass && (err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED' || err?.code === 'ESOCKET')) {
        this.logger.warn(`sendMail timed out on port 587. Attempting retry via port 465 (SSL direct)...`);
        try {
          const sslTransporter = nodemailer.createTransport({
            host: this.host,
            port: 465,
            secure: true,
            auth: {
              user: this.user,
              pass: this.pass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
          });
          const info = await sslTransporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: `${otp} is your DevSutra verification code`,
            text: `Your DevSutra verification code is: ${otp}. This code is valid for 5 minutes. Never share this code with anyone.`,
            html: htmlContent,
          });
          this.transporter = sslTransporter;
          this.port = 465;
          this.secure = true;
          this.lastSendResult = {
            success: true,
            timestamp: new Date().toISOString(),
            message: `OTP email delivered via port 465 (messageId: ${info.messageId})`,
          };
          this.logger.log(`OTP email sent successfully via port 465 to ${masked} (messageId: ${info.messageId})`);
          return {
            success: true,
            messageId: info.messageId,
          };
        } catch (retryErr: any) {
          this.logger.error(`Port 465 retry also failed: ${retryErr?.code} ${retryErr?.message}`);
        }
      }

      const code = err?.code || 'UNKNOWN';
      const responseCode = err?.responseCode || 'N/A';
      const command = err?.command || 'N/A';
      const rawMsg = err?.message || 'Failed to deliver OTP email';
      const sanitizedMsg = rawMsg.replace(
        /([a-zA-Z0-9_\-\.]{3,})@([a-zA-Z0-9_\-\.]+)/g,
        '***@$2',
      );
      this.lastSendResult = {
        success: false,
        timestamp: new Date().toISOString(),
        code,
        responseCode,
        command,
        message: sanitizedMsg,
      };
      this.logger.error(
        `Failed to send OTP email to ${masked}: code=${code}, responseCode=${responseCode}, command=${command}, message=${sanitizedMsg}`,
      );
      if (throwOnError) {
        // Generic customer-facing error: never expose internal SMTP error codes or stack traces
        throw new ServiceUnavailableException(
          'Failed to deliver verification email. Please try again later.',
        );
      }
      return {
        success: false,
        error: 'Failed to deliver verification email. Please try again later.',
      };
    }
  }

  /**
   * Send real email to customer when booking status changes (CONFIRMED, COMPLETED, CANCELLED)
   */
  async sendBookingStatusEmail(
    toEmail: string,
    details: {
      customerName: string;
      bookingNumber: string;
      pujaName: string;
      status: string;
      date?: string;
      panditName?: string;
      reason?: string;
    },
  ): Promise<SendEmailResult> {
    const masked = this.maskEmail(toEmail);
    const rawFrom = this.configService.get<string>('SMTP_FROM');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const fromAddress = rawFrom
      ? rawFrom.trim()
      : (smtpUser ? `DevSutra <${smtpUser.trim()}>` : 'DevSutra <no-reply@devsutra.in>');

    if (!this.isConfigured || !this.transporter) {
      this.logger.warn(`SMTP not configured. Skipping status email to ${masked}`);
      return { success: false, error: 'SMTP not configured' };
    }

    const isConfirmed = details.status === 'CONFIRMED';
    const isCompleted = details.status === 'COMPLETED';
    const isCancelled = details.status === 'CANCELLED' || details.status === 'REJECTED';

    let subject = `[DevSutra] Sacred Puja Status: ${details.status} (Booking #${details.bookingNumber})`;
    let statusBadgeColor = '#B26A00';
    let statusBgColor = '#FFF3E0';
    let messageBody = `Your booking for ${details.pujaName} status has been updated to <strong>${details.status}</strong>.`;

    if (isConfirmed) {
      subject = `[DevSutra] Sacred Puja Confirmed: ${details.pujaName} (Booking #${details.bookingNumber})`;
      statusBadgeColor = '#1B5E20';
      statusBgColor = '#E8F5E9';
      messageBody = `Shubh Samachar! Your booking for <strong>${details.pujaName}</strong> has been officially confirmed by DevSutra. Our verified Vedic Pandit has been reserved for your auspicious Muhurat.`;
    } else if (isCompleted) {
      subject = `[DevSutra] Sacred Puja Completed – Divine Blessings (Booking #${details.bookingNumber})`;
      statusBadgeColor = '#0D47A1';
      statusBgColor = '#E3F2FD';
      messageBody = `May the divine grace and Vedic blessings bring peace, prosperity, and harmony to you and your family. Your ritual <strong>${details.pujaName}</strong> has been successfully performed.`;
    } else if (isCancelled) {
      subject = `[DevSutra] Booking Cancellation Notice (Booking #${details.bookingNumber})`;
      statusBadgeColor = '#B71C1C';
      statusBgColor = '#FFEBEE';
      messageBody = `Your booking for <strong>${details.pujaName}</strong> has been cancelled. ${details.reason ? `Reason: ${details.reason}` : ''}`;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C241E; }
    .wrapper { width: 100%; padding: 32px 0; }
    .container { max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #EFE8DC; overflow: hidden; box-shadow: 0 4px 20px rgba(44, 36, 30, 0.05); }
    .header { background: linear-gradient(135deg, #4A0E17 0%, #2A080C 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
    .brand-name { font-size: 26px; font-weight: 800; letter-spacing: 1px; color: #D4AF37; margin: 0; }
    .brand-tagline { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #E8DCC4; margin-top: 6px; }
    .content { padding: 32px 28px; }
    .status-badge { display: inline-block; background-color: ${statusBgColor}; color: ${statusBadgeColor}; font-weight: 700; font-size: 13px; padding: 6px 16px; border-radius: 999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; background-color: #FAF7F2; border-radius: 12px; overflow: hidden; }
    .details-table td { padding: 12px 16px; border-bottom: 1px solid #EFE8DC; }
    .details-table td.label { font-weight: 600; color: #8C7E74; width: 35%; }
    .details-table td.value { font-weight: 700; color: #2C241E; }
    .footer { background-color: #F7F3EB; padding: 18px 24px; text-align: center; font-size: 11px; color: #9C8E84; border-top: 1px solid #EFE8DC; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-name">DevSutra</h1>
        <div class="brand-tagline">Vedic Rituals & Certified Gurukul Pandits</div>
      </div>
      <div class="content">
        <span class="status-badge">${details.status}</span>
        <h2 style="margin: 0 0 12px 0; color: #2C241E; font-size: 20px;">Namaste ${details.customerName},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4A3E36; margin: 0 0 20px 0;">${messageBody}</p>

        <table class="details-table">
          <tr>
            <td class="label">Booking Number</td>
            <td class="value">#${details.bookingNumber}</td>
          </tr>
          <tr>
            <td class="label">Sacred Puja</td>
            <td class="value">${details.pujaName}</td>
          </tr>
          ${details.panditName ? `<tr><td class="label">Vedic Pandit</td><td class="value">Pt. ${details.panditName}</td></tr>` : ''}
          ${details.date ? `<tr><td class="label">Shubh Muhurat</td><td class="value">${details.date}</td></tr>` : ''}
          <tr>
            <td class="label">Current Status</td>
            <td class="value" style="color: ${statusBadgeColor};">${details.status}</td>
          </tr>
        </table>

        <p style="font-size: 12px; color: #8C7E74; margin-top: 24px; line-height: 1.5;">
          You can track this booking live in your DevSutra Customer Dashboard at any time. For questions or muhurat adjustments, reply directly to this email.
        </p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} DevSutra. Vedic Rituals Made Authentic & Accessible.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        text: `Namaste ${details.customerName},\n\nYour booking #${details.bookingNumber} for ${details.pujaName} is now ${details.status}.\n\nDevSutra Vedic Platform`,
        html: htmlContent,
      });

      this.logger.log(`Booking status email [${details.status}] sent to ${masked} (messageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      const code = err?.code || 'UNKNOWN';
      const responseCode = err?.responseCode || 'N/A';
      const command = err?.command || 'N/A';
      const rawMsg = err?.message || 'Failed to send booking status email';
      const sanitizedMsg = rawMsg.replace(
        /([a-zA-Z0-9_\-\.]{3,})@([a-zA-Z0-9_\-\.]+)/g,
        '***@$2',
      );
      this.logger.error(
        `Failed to send booking status email to ${masked}: code=${code}, responseCode=${responseCode}, command=${command}, message=${sanitizedMsg}`,
      );
      return { success: false, error: 'Failed to deliver booking status email' };
    }
  }
}
