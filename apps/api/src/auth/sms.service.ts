import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  reqId?: string;
  provider: string;
  error?: string;
  simulated?: boolean;
}

export interface VerifyOtpResult {
  success: boolean;
  provider: string;
  error?: string;
  accessToken?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly smsProvider = process.env.SMS_PROVIDER || 'TWILIO';
  private readonly twilioSid = process.env.TWILIO_ACCOUNT_SID || '';
  private readonly twilioToken = process.env.TWILIO_AUTH_TOKEN || '';
  private readonly twilioFrom = process.env.TWILIO_PHONE_NUMBER || '';
  private readonly twilioVerifySid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

  private readonly msg91AuthKey = (
    process.env.MSG91_AUTH_KEY && !process.env.MSG91_AUTH_KEY.startsWith('591944')
      ? process.env.MSG91_AUTH_KEY
      : '295404AJalkFMerGjU5d8822cb'
  ).trim();
  private readonly msg91WidgetId = (
    process.env.MSG91_WIDGET_ID ||
    '366b7a694f47303732323236'
  ).trim();
  private readonly msg91WidgetTokenAuth = (
    process.env.MSG91_WIDGET_TOKEN_AUTH ||
    process.env.MSG91_TOKEN_AUTH ||
    process.env.WIDGET_TOKEN_AUTH ||
    '295404TnCaCSX6Dohd6b07ff1bP1'
  ).trim();
  private readonly msg91TemplateId =
    process.env.MSG91_TEMPLATE_ID ||
    process.env.MSG91_OTP_TEMPLATE_ID ||
    '';
  private readonly msg91SenderId =
    process.env.MSG91_SENDER_ID || process.env.MSG91_SENDER || 'DEVSUT';

  // Internal storage for access token returned by MSG91 widget on successful verification
  private lastWidgetAccessToken?: string;

  /**
   * Check if MSG91 Widget configuration (Widget ID and TokenAuth) is available
   */
  isWidgetConfigured(): boolean {
    return Boolean(this.msg91WidgetId && this.msg91WidgetTokenAuth);
  }

  /**
   * Retrieve the internally preserved access token from the last successful widget OTP verification
   */
  getLastWidgetAccessToken(): string | undefined {
    return this.lastWidgetAccessToken;
  }

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
   * Generate cryptographically secure numeric OTP (defaults to 4 digits as per MSG91 widget setting, or 6 digits)
   */
  generateOtp(digits: number = 4): string {
    if (digits === 4) {
      return crypto.randomInt(1000, 10000).toString();
    }
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
   * Send actual SMS OTP through MSG91 OTP Widget API
   * POST https://api.msg91.com/api/v5/widget/sendOtp
   */
  async sendOtpSms(phoneNumber: string): Promise<SendSmsResult> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const maskedPhone = `${normalizedPhone.slice(0, 6)}****${normalizedPhone.slice(-2)}`;

    // Indian mobile format without '+' (e.g. 919822012345)
    const mobileNumber = normalizedPhone.replace(/[^0-9]/g, '');

    if (this.isWidgetConfigured()) {
      return this.sendOtpWidget(mobileNumber, maskedPhone);
    }

    if (this.twilioSid && this.twilioToken && this.twilioFrom) {
      const fallbackOtp = this.generateOtp();
      return this.sendViaTwilio(normalizedPhone, fallbackOtp, maskedPhone);
    }

    this.logger.warn(
      `MSG91 OTP Widget credentials (MSG91_WIDGET_ID, MSG91_WIDGET_TOKEN_AUTH) are not configured for ${maskedPhone}.`,
    );

    return {
      success: false,
      provider: 'UNCONFIGURED',
      error:
        'MSG91 SMS gateway is not configured on the server. Please sign in using Email OTP.',
    };
  }

  /**
   * Send OTP via MSG91 Widget Send OTP API
   * POST https://api.msg91.com/api/v5/widget/sendOtp
   * Body: { widgetId, tokenAuth, identifier }
   */
  async sendOtpWidget(
    mobileNumber: string,
    maskedPhone: string,
  ): Promise<SendSmsResult> {
    if (!this.isWidgetConfigured()) {
      this.logger.error('[MSG91 Widget] sendOtp failed: Widget ID or TokenAuth is not configured.');
      return {
        success: false,
        provider: 'MSG91_WIDGET',
        error: 'MSG91 Widget configuration (Widget ID and TokenAuth) is missing.',
      };
    }

    try {
      const url = 'https://api.msg91.com/api/v5/widget/sendOtp';
      const body = {
        widgetId: this.msg91WidgetId,
        tokenAuth: this.msg91WidgetTokenAuth,
        identifier: mobileNumber,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      const authKeyToUse = this.msg91AuthKey || this.msg91WidgetTokenAuth;
      if (authKeyToUse) {
        headers['authkey'] = authKeyToUse;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.type === 'error' || data.type === 'failed' || data.status === 'fail' || data.hasError) {
        const errorMsg =
          data.message ||
          (typeof data === 'string'
            ? data
            : `MSG91 Error ${response.status}: ${response.statusText}`);
        this.logger.error(`[MSG91 Widget] sendOtp failed for ${maskedPhone}: ${errorMsg}`);
        return {
          success: false,
          provider: 'MSG91_WIDGET',
          error: errorMsg,
        };
      }

      // Extract reqId from MSG91 response (message or reqId or data)
      const reqId =
        data.reqId ||
        data.data?.reqId ||
        (typeof data.data === 'string' && data.data.length > 10 ? data.data : undefined) ||
        (typeof data.message === 'string' && /^[0-9a-fA-F]{16,}$/.test(data.message.trim())
          ? data.message.trim()
          : undefined) ||
        (typeof data.message === 'string' && data.message.length > 15
          ? data.message.trim()
          : undefined);

      this.logger.log(`[MSG91 Widget] OTP sent to ${maskedPhone} (reqId: ${reqId || 'OK'})`);

      return {
        success: true,
        reqId,
        messageId: reqId || 'SENT',
        provider: 'MSG91_WIDGET',
      };
    } catch (err: any) {
      this.logger.error(`[MSG91 Widget] Connection error for ${maskedPhone}: ${err.message}`);
      return {
        success: false,
        provider: 'MSG91_WIDGET',
        error: err.message || 'Failed to connect to MSG91 SMS gateway.',
      };
    }
  }

  /**
   * Verify OTP via MSG91 Widget Verify OTP API
   * POST https://api.msg91.com/api/v5/widget/verifyOtp
   * Body: { widgetId, tokenAuth, reqId, otp }
   */
  async verifyOtpWidget(
    otp: string,
    reqId?: string,
    phoneNumber?: string,
  ): Promise<VerifyOtpResult> {
    if (!this.isWidgetConfigured()) {
      return {
        success: false,
        provider: 'UNCONFIGURED',
        error: 'MSG91 Widget configuration (Widget ID and TokenAuth) is missing.',
      };
    }

    const cleanReqId = reqId?.trim();
    if (!cleanReqId) {
      this.logger.warn('[MSG91 Widget] verifyOtp rejected: missing reqId');
      return {
        success: false,
        provider: 'MSG91_WIDGET',
        error: 'Request ID (reqId) is required for MSG91 OTP verification.',
      };
    }

    const cleanOtp = otp?.trim();
    if (!cleanOtp) {
      return {
        success: false,
        provider: 'MSG91_WIDGET',
        error: 'Verification code (OTP) is required.',
      };
    }

    try {
      const url = 'https://api.msg91.com/api/v5/widget/verifyOtp';
      const body = {
        widgetId: this.msg91WidgetId,
        tokenAuth: this.msg91WidgetTokenAuth,
        reqId: cleanReqId,
        otp: cleanOtp,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      const authKeyToUse = this.msg91AuthKey || this.msg91WidgetTokenAuth;
      if (authKeyToUse) {
        headers['authkey'] = authKeyToUse;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.type === 'error' || data.type === 'failed' || data.status === 'fail' || data.hasError) {
        const errorMsg =
          data.message ||
          (typeof data === 'string'
            ? data
            : 'Invalid or expired verification code.');
        this.logger.warn(`[MSG91 Widget] verifyOtp failed: ${errorMsg}`);
        return {
          success: false,
          provider: 'MSG91_WIDGET',
          error: errorMsg,
        };
      }

      // Check MSG91 success response
      const isVerified =
        data.type === 'success' ||
        (typeof data.message === 'string' &&
          (data.message.toLowerCase().includes('verified') ||
            data.message.toLowerCase().includes('success'))) ||
        Boolean(data['access-token']) ||
        Boolean(data.accessToken);

      if (isVerified) {
        const accessToken =
          data['access-token'] || data.accessToken || data.data?.accessToken;
        // Preserve returned access token internally
        this.lastWidgetAccessToken = accessToken;

        this.logger.log(`[MSG91 Widget] OTP verified successfully via MSG91`);
        return {
          success: true,
          provider: 'MSG91_WIDGET',
          accessToken,
        };
      }

      return {
        success: false,
        provider: 'MSG91_WIDGET',
        error: data.message || 'OTP verification failed.',
      };
    } catch (err: any) {
      this.logger.error(`[MSG91 Widget] verifyOtp connection error: ${err.message}`);
      return {
        success: false,
        provider: 'MSG91_WIDGET',
        error: err.message || 'Failed to verify OTP with MSG91 gateway.',
      };
    }
  }

  /**
   * Securely verify MSG91 Widget Access Token with MSG91 server
   * POST https://api.msg91.com/api/v5/widget/verifyAccessToken
   * Headers: { authkey: MSG91_AUTH_KEY, 'Content-Type': 'application/json' }
   * Body: { "access-token": accessToken }
   */
  async verifyAccessToken(accessToken: string): Promise<{
    success: boolean;
    identifier?: string;
    error?: string;
  }> {
    const cleanToken = accessToken?.trim();
    if (!cleanToken) {
      return { success: false, error: 'Access token is required for verification.' };
    }

    // Server-to-server verifyAccessToken strictly requires MSG91_AUTH_KEY only
    const candidateKeys = Array.from(
      new Set(
        [
          '295404AJalkFMerGjU5d8822cb',
          process.env.MSG91_AUTH_KEY && !process.env.MSG91_AUTH_KEY.startsWith('591944')
            ? process.env.MSG91_AUTH_KEY.trim()
            : undefined,
          process.env.MSG91_MASTER_AUTH_KEY && !process.env.MSG91_MASTER_AUTH_KEY.startsWith('591944')
            ? process.env.MSG91_MASTER_AUTH_KEY.trim()
            : undefined,
        ].filter((k): k is string => Boolean(k && k.trim())),
      ),
    );

    const endpoints = [
      'https://control.msg91.com/api/v5/widget/verifyAccessToken',
      'https://api.msg91.com/api/v5/widget/verifyAccessToken',
    ];

    let lastError = 'Failed to connect to MSG91 token verification service.';

    for (const serverAuthKey of candidateKeys) {
      // Test both official payload format (body-only authkey as documented in MSG91 dashboard curl)
      // and dual header+body format
      const attemptConfigs = [
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: {
            authkey: serverAuthKey,
            'access-token': cleanToken,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authkey: serverAuthKey,
          },
          body: {
            authkey: serverAuthKey,
            'access-token': cleanToken,
            accessToken: cleanToken,
          },
        },
      ];

      for (const url of endpoints) {
        for (const config of attemptConfigs) {
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: config.headers,
              body: JSON.stringify(config.body),
            });

            const data = await response.json().catch(() => ({}));

            if (
              response.ok &&
              (data.type === 'success' ||
                data.status === 'success' ||
                (data.message && /^\+?[0-9]{10,15}$/.test(String(data.message).trim()))) &&
              !data.hasError
            ) {
            let rawVerifiedId =
              (typeof data.message === 'string' && /^\+?[0-9]{10,15}$/.test(data.message.trim())
                ? data.message.trim()
                : undefined) ||
              (typeof data.data?.identifier === 'string' && /^\+?[0-9]{10,15}$/.test(data.data.identifier.trim())
                ? data.data.identifier.trim()
                : undefined) ||
              (typeof data.data?.mobile === 'string' && /^\+?[0-9]{10,15}$/.test(data.data.mobile.trim())
                ? data.data.mobile.trim()
                : undefined) ||
              (typeof data.data?.phone === 'string' && /^\+?[0-9]{10,15}$/.test(data.data.phone.trim())
                ? data.data.phone.trim()
                : undefined) ||
              (typeof data.data?.number === 'string' && /^\+?[0-9]{10,15}$/.test(data.data.number.trim())
                ? data.data.number.trim()
                : undefined) ||
              (typeof data.data === 'string' && /^\+?[0-9]{10,15}$/.test(data.data.trim())
                ? data.data.trim()
                : undefined) ||
              (typeof data.identifier === 'string' && /^\+?[0-9]{10,15}$/.test(data.identifier.trim())
                ? data.identifier.trim()
                : undefined) ||
              (typeof data.mobile === 'string' && /^\+?[0-9]{10,15}$/.test(data.mobile.trim())
                ? data.mobile.trim()
                : undefined);

            // If MSG91 responded success but didn't return phone in message or data, extract from verified JWT payload
            if (!rawVerifiedId && cleanToken.includes('.')) {
              try {
                const parts = cleanToken.split('.');
                if (parts.length >= 2) {
                  const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
                  const payload = JSON.parse(payloadJson);
                  const candidate =
                    payload.identifier ||
                    payload.mobile ||
                    payload.phone ||
                    payload.number ||
                    payload.sub ||
                    payload.data?.mobile ||
                    payload.data?.identifier;
                  if (typeof candidate === 'string' && /^\+?[0-9]{10,15}$/.test(candidate.trim())) {
                    rawVerifiedId = candidate.trim();
                    this.logger.log(`[MSG91] Extracted verified identifier from validated token payload: ${rawVerifiedId}`);
                  }
                }
              } catch (jwtErr) {
                // ignore parsing error
              }
            }

            if (!rawVerifiedId) {
              this.logger.warn(
                '[MSG91] verifyAccessToken returned non-phone identifier: ' + JSON.stringify(data),
              );
              return {
                success: false,
                error: 'MSG91 did not return a valid verified phone number.',
              };
            }

            const normalized = this.normalizePhoneNumber(rawVerifiedId);
            if (!this.isValidIndianMobile(normalized)) {
              return {
                success: false,
                error: 'Verified number is not a valid Indian mobile number.',
              };
            }

            this.logger.log(`[MSG91] Access token cryptographically verified by MSG91: ${normalized}`);
            return {
              success: true,
              identifier: normalized,
            };
          }

          if (data.message) {
            lastError = data.message;
          }
        } catch (err: any) {
          lastError = err?.message || 'Connection error to MSG91';
        }
      }
    }
  }

    this.logger.warn(`[MSG91] verifyAccessToken all candidates failed. Last error: ${lastError}`);
    return {
      success: false,
      error: lastError,
    };
  }

  /**
   * Resend/Retry OTP via MSG91 Widget Retry OTP API
   * POST https://api.msg91.com/api/v5/widget/retryOtp
   * Body: { widgetId, tokenAuth, reqId, retryChannel? }
   */
  async retryOtpWidget(reqId: string, retryType?: string): Promise<SendSmsResult> {
    if (!this.isWidgetConfigured()) {
      return {
        success: false,
        provider: 'UNCONFIGURED',
        error: 'MSG91 Widget configuration (Widget ID and TokenAuth) is missing.',
      };
    }

    const cleanReqId = reqId?.trim();
    if (!cleanReqId) {
      return {
        success: false,
        provider: 'MSG91_WIDGET',
        error: 'Request ID (reqId) is required to retry OTP.',
      };
    }

    try {
      const url = 'https://api.msg91.com/api/v5/widget/retryOtp';
      const body: Record<string, any> = {
        widgetId: this.msg91WidgetId,
        tokenAuth: this.msg91WidgetTokenAuth,
        reqId: cleanReqId,
      };
      if (retryType) {
        body.retryType = retryType;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      const authKeyToUse = this.msg91AuthKey || this.msg91WidgetTokenAuth;
      if (authKeyToUse) {
        headers['authkey'] = authKeyToUse;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.type === 'error' || data.type === 'failed' || data.status === 'fail' || data.hasError) {
        const errorMsg = data.message || `MSG91 retry failed (${response.status})`;
        this.logger.warn(`[MSG91 Widget] retryOtp failed for reqId ${cleanReqId}: ${errorMsg}`);
        return {
          success: false,
          provider: 'MSG91_WIDGET',
          error: errorMsg,
        };
      }

      this.logger.log(`[MSG91 Widget] OTP retried for reqId ${cleanReqId}`);
      return {
        success: true,
        reqId: cleanReqId,
        provider: 'MSG91_WIDGET',
      };
    } catch (err: any) {
      this.logger.error(`[MSG91 Widget] retryOtp connection error: ${err.message}`);
      return {
        success: false,
        provider: 'MSG91_WIDGET',
        error: err.message || 'Failed to retry OTP with MSG91 gateway.',
      };
    }
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
