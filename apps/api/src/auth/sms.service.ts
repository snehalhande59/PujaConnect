import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  simulated?: boolean;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly smsProvider = process.env.SMS_PROVIDER || 'TWILIO';
  private readonly twilioSid = process.env.TWILIO_ACCOUNT_SID || '';
  private readonly twilioToken = process.env.TWILIO_AUTH_TOKEN || '';
  private readonly twilioFrom = process.env.TWILIO_PHONE_NUMBER || '';
  private readonly twilioVerifySid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

  private readonly msg91AuthKey =
    process.env.MSG91_AUTH_KEY ||
    process.env.MSG91_TOKEN_AUTH ||
    process.env.MSG91_API_KEY ||
    '';
  private readonly msg91TemplateId =
    process.env.MSG91_TEMPLATE_ID ||
    process.env.MSG91_OTP_TEMPLATE_ID ||
    process.env.MSG91_WIDGET_ID ||
    '';
  private readonly msg91SenderId =
    process.env.MSG91_SENDER_ID || process.env.MSG91_SENDER || 'DEVSUT';

  /**
   * Normalize phone number to standard E.164 +91XXXXXXXXXX format
   */
  normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `+91${cleaned.substring(1)}`;
    }
    if (phone.startsWith('+')) {
      return phone;
    }
    return `+91${cleaned}`;
  }

  /**
   * Validate Indian mobile number format
   */
  isValidIndianMobile(phone: string): boolean {
    const normalized = this.normalizePhoneNumber(phone);
    // E.164 for India: +91 followed by 10 digits starting with 6, 7, 8, or 9
    return /^\+91[6-9]\d{9}$/.test(normalized);
  }

  /**
   * Generate cryptographically secure 6-digit numeric OTP
   */
  generateOtp(): string {
    const min = 100000;
    const max = 999999;
    return crypto.randomInt(min, max + 1).toString();
  }

  /**
   * Hash OTP for secure storage in database
   */
  hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Verify candidate OTP against stored hash
   */
  verifyOtpHash(candidateOtp: string, storedHash: string): boolean {
    const candidateHash = this.hashOtp(candidateOtp);
    return crypto.timingSafeEqual(
      Buffer.from(candidateHash, 'hex'),
      Buffer.from(storedHash, 'hex'),
    );
  }

  /**
   * Send actual SMS OTP through configured provider (MSG91 or Twilio)
   */
  async sendOtpSms(phoneNumber: string, otp: string): Promise<SendSmsResult> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const maskedPhone = `${normalizedPhone.slice(0, 6)}****${normalizedPhone.slice(-2)}`;

    const configuredProvider = (this.smsProvider || '').toUpperCase();

    // 1. Explicitly configured as MSG91
    if (configuredProvider === 'MSG91' && this.msg91AuthKey && this.msg91TemplateId) {
      return this.sendViaMsg91(normalizedPhone, otp, maskedPhone);
    }

    // 2. Explicitly configured as TWILIO
    if (configuredProvider === 'TWILIO' && this.twilioSid && this.twilioToken && this.twilioFrom) {
      return this.sendViaTwilio(normalizedPhone, otp, maskedPhone);
    }

    // 3. Fallback: If MSG91 credentials exist, prefer MSG91 (configured for India)
    if (this.msg91AuthKey && this.msg91TemplateId) {
      return this.sendViaMsg91(normalizedPhone, otp, maskedPhone);
    }

    // 4. Fallback: Check Twilio credentials
    if (this.twilioSid && this.twilioToken && this.twilioFrom) {
      return this.sendViaTwilio(normalizedPhone, otp, maskedPhone);
    }

    // 5. Gateway credentials missing in environment
    this.logger.warn(
      `SMS gateway credentials are not configured in environment. SMS OTP delivery disabled for ${maskedPhone}.`,
    );

    return {
      success: false,
      provider: 'UNCONFIGURED',
      error: 'SMS service is temporarily unconfigured. Please sign in using Email OTP.',
    };
  }

  /**
   * Send SMS via Twilio REST API
   */
  private async sendViaTwilio(
    to: string,
    otp: string,
    maskedPhone: string,
  ): Promise<SendSmsResult> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioSid}/Messages.json`;
      const body = new URLSearchParams({
        To: to,
        From: this.twilioFrom,
        Body: `Your DevSutra verification OTP is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
      });

      const auth = Buffer.from(`${this.twilioSid}:${this.twilioToken}`).toString('base64');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        this.logger.error(`Twilio SMS delivery failed: ${data.message || response.statusText}`);
        return {
          success: false,
          provider: 'TWILIO',
          error: data.message || `Twilio error ${response.status}`,
        };
      }

      this.logger.log(`[Twilio SMS Sent] Successfully delivered OTP SMS to ${maskedPhone} (SID: ${data.sid})`);
      return {
        success: true,
        messageId: data.sid,
        provider: 'TWILIO',
      };
    } catch (err: any) {
      this.logger.error(`Twilio API connection exception: ${err.message}`);
      return {
        success: false,
        provider: 'TWILIO',
        error: err.message,
      };
    }
  }

  /**
   * Send SMS via MSG91 OTP API (v5 OTP API)
   */
  private async sendViaMsg91(
    to: string,
    otp: string,
    maskedPhone: string,
  ): Promise<SendSmsResult> {
    try {
      // MSG91 mobile parameter requires country code without '+' (e.g. 919822012345)
      const mobileNumber = to.replace(/[^0-9]/g, '');

      // MSG91 v5 OTP endpoint with authkey header and required parameters
      const url = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(
        this.msg91TemplateId,
      )}&mobile=${encodeURIComponent(mobileNumber)}&otp=${encodeURIComponent(otp)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authkey: this.msg91AuthKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.type === 'error') {
        const errorMsg =
          data.message ||
          (typeof data === 'string'
            ? data
            : `MSG91 HTTP ${response.status}: ${response.statusText}`);
        this.logger.error(`MSG91 SMS delivery failed for ${maskedPhone}: ${errorMsg}`);
        return {
          success: false,
          provider: 'MSG91',
          error: errorMsg,
        };
      }

      this.logger.log(`[MSG91 SMS Sent] Successfully delivered OTP SMS to ${maskedPhone}`);
      return {
        success: true,
        messageId: data.message || 'DELIVERED',
        provider: 'MSG91',
      };
    } catch (err: any) {
      this.logger.error(`MSG91 API connection exception: ${err.message}`);
      return {
        success: false,
        provider: 'MSG91',
        error: err.message || 'Failed to connect to MSG91 SMS gateway.',
      };
    }
  }
}
