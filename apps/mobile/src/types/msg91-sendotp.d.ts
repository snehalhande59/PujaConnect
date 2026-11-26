declare module '@msg91comm/sendotp-react-native' {
  export interface APIResponse {
    type?: string;
    status?: string;
    message?: string;
    'access-token'?: string;
    accessToken?: string;
    code?: number;
  }

  export interface SendOTPResponse extends APIResponse {
    reqId?: string;
    data?: { reqId?: string; [key: string]: any };
    invisibleVerified?: boolean;
  }

  export interface VerifyOTPResponse extends APIResponse {
    data?: { 'access-token'?: string; accessToken?: string; [key: string]: any };
  }

  export interface RetryOTPResponse extends APIResponse {
    reqId?: string;
    data?: { reqId?: string; [key: string]: any };
  }

  export class OTPWidget {
    static initializeWidget(widgetId: string, tokenAuth: string): Promise<void>;
    static sendOTP(body: { identifier: string; [key: string]: any }): Promise<SendOTPResponse>;
    static verifyOTP(body: { reqId: string; otp: string; [key: string]: any }): Promise<VerifyOTPResponse>;
    static retryOTP(body: { reqId: string; retryChannel?: number; [key: string]: any }): Promise<RetryOTPResponse>;
    static getWidgetProcess(): Promise<any>;
    static getTruecallerSession(): Promise<any>;
  }

  export const DefaultWidget: any;

  export class BiometricAuth {
    static isSensorAvailable(): Promise<any>;
    static authenticate(): Promise<string>;
  }
}
