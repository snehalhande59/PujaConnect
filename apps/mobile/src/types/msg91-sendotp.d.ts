declare module '@msg91comm/sendotp-react-native' {
  export class OTPWidget {
    static initializeWidget(widgetId: string, tokenAuth: string): Promise<void>;
    static sendOTP(body: { identifier: string; [key: string]: any }): Promise<any>;
    static verifyOTP(body: { reqId: string; otp: string; [key: string]: any }): Promise<any>;
    static retryOTP(body: { reqId: string; retryChannel?: number; [key: string]: any }): Promise<any>;
    static getWidgetProcess(): Promise<any>;
    static getTruecallerSession(): Promise<any>;
  }
  export const DefaultWidget: any;
  export class BiometricAuth {
    static isSensorAvailable(): Promise<any>;
    static authenticate(): Promise<string>;
  }
}
