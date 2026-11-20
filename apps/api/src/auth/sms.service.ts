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

  private readonly msg91AuthKey = process.env.MSG91_AUTH_KEY || '';
  private readonly msg91TemplateId = process.env.MSG91_TEMPLATE_ID || '';
  private readonly msg91SenderId = process.env.MSG91_SENDER_ID || 'DEVSUT';

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
   * Send actual SMS OTP through configured provider (Twilio or MSG91)
   */
  async sendOtpSms(phoneNumber: string, otp: string): Promise<SendSmsResult> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const maskedPhone = `${normalizedPhone.slice(0, 6)}****${normalizedPhone.slice(-2)}`;

    // 1. Check Twilio integration
    if (this.twilioSid && this.twilioToken && this.twilioFrom) {
      return this.sendViaTwilio(normalizedPhone, otp, maskedPhone);
    }

    // 2. Check MSG91 integration
    if (this.msg91AuthKey && this.msg91TemplateId) {
      return this.sendViaMsg91(normalizedPhone, otp, maskedPhone);
    }

    // 3. Fallback / Development mode when live gateway keys are not provided
    this.logger.warn(
      `[SMS GATEWAY NOT CONFIGURED] Real SMS Gateway credentials missing in .env. ` +
      `To deliver real SMS messages to ${maskedPhone}, configure TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN or MSG91_AUTH_KEY. ` +
      `[DEV-OTP FOR TEST VERIFICATION: ${otp}]`,
    );

    return {
      success: true,
      provider: 'SIMULATED_GATEWAY',
      simulated: true,
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
        Body: `Your PujaConnect DevSutra verification OTP is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
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
   * Send SMS via MSG91 OTP API
   */
  private async sendViaMsg91(
    to: string,
    otp: string,
    maskedPhone: string,
  ): Promise<SendSmsResult> {
    try {
      // MSG91 mobile parameter without '+'
      const mobileNumber = to.replace('+', '');
      const url = `https://control.msg91.com/api/v5/otp?template_id=${this.msg91TemplateId}&mobile=${mobileNumber}&authkey=${this.msg91AuthKey}&otp=${otp}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.type === 'error') {
        this.logger.error(`MSG91 SMS delivery failed: ${data.message || response.statusText}`);
        return {
          success: false,
          provider: 'MSG91',
          error: data.message || `MSG91 error ${response.status}`,
        };
      }

      this.logger.log(`[MSG91 SMS Sent] Successfully delivered OTP SMS to ${maskedPhone}`);
      return {
        success: true,
        provider: 'MSG91',
      };
    } catch (err: any) {
      this.logger.error(`MSG91 API connection exception: ${err.message}`);
      return {
        success: false,
        provider: 'MSG91',
        error: err.message,
      };
    }
  }
}
