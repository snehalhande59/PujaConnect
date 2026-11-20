import {
  Injectable,
  Logger,
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
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true' ||
      Number(port) === 465;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port: Number(port),
          secure,
          auth: {
            user,
            pass,
          },
        });
        this.isConfigured = true;
        this.logger.log(
          `SMTP transport initialized for host ${host}:${port} (secure: ${secure})`,
        );
      } catch (err: any) {
        this.logger.error(`Failed to initialize SMTP transport: ${err?.message}`);
        this.isConfigured = false;
        this.transporter = null;
      }
    } else {
      this.logger.warn(
        'SMTP configuration is missing or incomplete. Email delivery service is disabled.',
      );
      this.isConfigured = false;
    }
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
    const fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      'DevSutra <no-reply@devsutra.in>';

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
      this.logger.error(
        `Failed to send test email to ${masked}: ${err?.message}`,
      );
      return {
        success: false,
        error: err?.message || 'Failed to deliver test email',
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
    const fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      'DevSutra <no-reply@devsutra.in>';

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

      this.logger.log(
        `OTP email sent successfully to ${masked} (messageId: ${info.messageId})`,
      );
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      this.logger.error(
        `Failed to send OTP email to ${masked}: ${err?.message}`,
      );
      if (throwOnError) {
        throw new ServiceUnavailableException(
          'Failed to deliver verification email. Please try again later.',
        );
      }
      return {
        success: false,
        error: err?.message || 'Failed to deliver OTP email',
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
    const fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      'DevSutra <no-reply@devsutra.in>';

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
      this.logger.error(`Failed to send booking status email to ${masked}: ${err?.message}`);
      return { success: false, error: err?.message };
    }
  }
}
