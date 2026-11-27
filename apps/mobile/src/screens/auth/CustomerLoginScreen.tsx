import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { DevSutraLogo } from '../../components/common/DevSutraLogo';
import { OTPWidget, DefaultWidget } from '@msg91comm/sendotp-react-native';

declare const process: any;

const MSG91_WIDGET_ID =
  process.env.EXPO_PUBLIC_MSG91_WIDGET_ID || '366b7a694f47303732323236';
const MSG91_TOKEN_AUTH =
  process.env.EXPO_PUBLIC_MSG91_WIDGET_TOKEN_AUTH ||
  process.env.EXPO_PUBLIC_MSG91_TOKEN_AUTH ||
  '295404TnCaCSX6Dohd6b07ff1bP1';

interface CustomerLoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (user: any, isNewCustomer: boolean) => void;
  onNavigateForgotPassword?: () => void;
}

export const CustomerLoginScreen: React.FC<CustomerLoginScreenProps> = ({
  onBack,
  onLoginSuccess,
}) => {
  const {
    loginCustomerWithWidgetToken,
    sendCustomerOtp,
    loginCustomerWithOtp,
  } = useAuth();

  // Mobile OTP States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [reqId, setReqId] = useState<string | undefined>(undefined);
  const [showWidget, setShowWidget] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle completion from official MSG91 DefaultWidget modal
  const handleVerificationComplete = async (result: any) => {
    setShowWidget(false);
    if (!result) return;
    if (result.success) {
      const accessToken = result.message;
      const rawId = result.identifier || phone;
      const cleanDigits = (rawId || '').replace(/[^0-9]/g, '');
      const last10 = cleanDigits.slice(-10);
      const formattedPhone = `+91${last10}`;

      try {
        setLoading(true);
        setError(null);
        setSuccess('Mobile verified! Signing in to DevSutra...');
        const res = await loginCustomerWithWidgetToken(formattedPhone, accessToken);
        setSuccess('Verification successful! Welcome to DevSutra.');
        onLoginSuccess(res.user, Boolean(res.isNewCustomer));
      } catch (err: any) {
        setError(err?.message || 'Server verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (
        result.message &&
        result.message !== 'Widget closed' &&
        result.message !== 'cancelled'
      ) {
        let msg = typeof result.message === 'string' ? result.message : '';
        if (
          !msg ||
          msg.toLowerCase().includes('verification failed') ||
          msg.toLowerCase().includes('failed')
        ) {
          msg = 'चुकीचा किंवा कालबाह्य OTP (Incorrect or expired verification code). कृपया SMS मधील नवीन OTP टाका किंवा Resend SMS वर क्लिक करा.';
        }
        setError(msg);
      }
    }
  };

  // Initialize official MSG91 React Native SDK on mount
  useEffect(() => {
    try {
      if (MSG91_WIDGET_ID && MSG91_TOKEN_AUTH) {
        OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
      }
    } catch (e) {
      console.warn('[MSG91 SDK] initializeWidget error:', e);
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Mask phone for display (e.g. +91 98******45)
  const maskPhone = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      return `+91 ${last10.slice(0, 2)}******${last10.slice(-2)}`;
    }
    return val;
  };

  // 1. Send OTP Request (Mobile OTP with explicit 4-digit requirement and automatic backend fallback)
  const handleSendOtp = async () => {
    if (loading) return;
    setError(null);
    setSuccess(null);

    const cleaned = phone.trim().replace(/[^0-9]/g, '');
    if (!cleaned) {
      setError('Please enter your 10-digit mobile number.');
      return;
    }

    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError('Please enter a valid mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    const sdkIdentifier = `91${cleaned}`;
    const formattedPhone = `+91${cleaned}`;

    try {
      setLoading(true);

      let dispatched = false;
      let sessionReqId: string | undefined = undefined;

      // Step A: Attempt dispatch via official MSG91 client SDK
      try {
        if (MSG91_WIDGET_ID && MSG91_TOKEN_AUTH) {
          await OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
        }

        const sdkRes = await OTPWidget.sendOTP({
          identifier: sdkIdentifier,
          otp_length: 4,
          otpLength: 4,
        });

        // Handle Invisible OTP / Direct Verification
        const directToken =
          sdkRes?.invisibleVerified === true
            ? sdkRes?.['access-token'] ||
              sdkRes?.accessToken ||
              (typeof sdkRes?.message === 'string' ? sdkRes.message : undefined)
            : sdkRes?.['access-token'] || sdkRes?.accessToken;

        if (directToken) {
          const res = await loginCustomerWithWidgetToken(formattedPhone, directToken);
          setSuccess('Verification successful! Welcome to DevSutra.');
          onLoginSuccess(res.user, Boolean(res.isNewCustomer));
          return;
        }

        if (sdkRes?.type === 'success') {
          sessionReqId =
            sdkRes?.reqId ||
            sdkRes?.data?.reqId ||
            (typeof sdkRes?.message === 'string' && sdkRes.message.trim().length > 0
              ? sdkRes.message.trim()
              : undefined);
          if (sessionReqId) {
            dispatched = true;
            // Force SMS channel 11 immediately so MSG91 sends SMS even if invisible verification was pending
            try {
              await OTPWidget.retryOTP({
                reqId: sessionReqId,
                retryChannel: 11,
                otp_length: 4,
                otpLength: 4,
              });
            } catch (retryE) {
              // ignore
            }
          }
        } else {
          console.warn('[MSG91 SDK] sendOTP non-success:', sdkRes?.message || sdkRes);
        }
      } catch (sdkError: any) {
        console.warn('[MSG91 SDK] sendOTP exception (falling back to server):', sdkError?.message || sdkError);
      }

      // Step B: If client SDK failed or IP was blocked, automatically fall back to server-side MSG91 dispatch!
      if (!dispatched) {
        console.log('[Auth] Client SDK blocked or failed, dispatching via server for', formattedPhone);
        const backendRes = await sendCustomerOtp(formattedPhone, 'sms');
        if (backendRes && (backendRes.success || backendRes.reqId)) {
          sessionReqId = backendRes.reqId || 'BACKEND_SENT';
          dispatched = true;
        } else {
          throw new Error(
            backendRes?.message ||
            backendRes?.error ||
            'SMS gateway verification code send failed. Please try again in 30 seconds.',
          );
        }
      }

      if (!sessionReqId) {
        throw new Error('Verification session could not be established. Please try again.');
      }

      setReqId(sessionReqId);
      setOtpSent(true);
      setCooldown(60);
      setSuccess(
        `A 4-digit verification code has been sent via SMS to ${maskPhone(formattedPhone)}.`,
      );
    } catch (err: any) {
      let errMsg =
        err?.message ||
        'Failed to dispatch SMS verification code. Please check your mobile number and try again.';
      if (errMsg === 'IPBlocked' || errMsg.includes('IPBlocked')) {
        errMsg = 'सुरक्षा कारणास्तव तात्पुरता ब्लॉक झाला आहे. कृपया ३० सेकंद थांबा किंवा पुन्हा प्रयत्न करा.';
      } else if (errMsg === 'AuthenticationFailure' || errMsg.includes('AuthenticationFailure')) {
        errMsg = 'SMS gateway authentication error. Please retry in a moment.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Request (Supports both MSG91 client SDK & server fallback)
  const handleVerifyOtp = async () => {
    if (loading) return;
    setError(null);
    setSuccess(null);

    const cleanOtp = otp.trim().replace(/[^0-9]/g, '');
    if (!cleanOtp || cleanOtp.length < 4 || cleanOtp.length > 6) {
      setError('कृपया ४-अंकी पडताळणी कोड टाका (Please enter 4-digit verification code).');
      return;
    }

    const cleanPhone = `+91${phone.trim().replace(/[^0-9]/g, '')}`;

    if (!reqId) {
      setError('Verification session expired or missing. Please request a new verification code.');
      setOtpSent(false);
      return;
    }

    try {
      setLoading(true);

      let accessToken: string | undefined = undefined;

      // Attempt verification through client SDK if reqId was issued by client SDK
      if (reqId !== 'BACKEND_SENT') {
        try {
          if (MSG91_WIDGET_ID && MSG91_TOKEN_AUTH) {
            await OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
          }

          const verifyRes = await OTPWidget.verifyOTP({
            reqId,
            otp: cleanOtp,
          });

          if (
            verifyRes &&
            verifyRes.type !== 'error' &&
            verifyRes.type !== 'failed' &&
            verifyRes.status !== 'fail' &&
            (verifyRes as any).success !== false
          ) {
            accessToken =
              verifyRes?.['access-token'] ||
              verifyRes?.accessToken ||
              verifyRes?.data?.['access-token'] ||
              verifyRes?.data?.accessToken ||
              (verifyRes?.type === 'success' &&
              typeof verifyRes?.message === 'string' &&
              verifyRes.message.trim().length > 0
                ? verifyRes.message.trim()
                : undefined);
          }
        } catch (sdkVerifyErr: any) {
          console.warn('[MSG91 SDK] verifyOTP exception (falling back to backend):', sdkVerifyErr?.message);
        }
      }

      // If client SDK returned an access token, verify with backend verifyCustomerWidgetToken
      if (accessToken) {
        const res = await loginCustomerWithWidgetToken(cleanPhone, accessToken);
        setSuccess('Verification successful! Welcome to DevSutra.');
        onLoginSuccess(res.user, Boolean(res.isNewCustomer));
        return;
      }

      // Fallback: Verify OTP directly with backend Render endpoint
      const res = await loginCustomerWithOtp(cleanPhone, cleanOtp, undefined, reqId);
      setSuccess('Verification successful! Welcome to DevSutra.');
      onLoginSuccess(res.user, Boolean(res.isNewCustomer));
    } catch (e: any) {
      let msg = e.message || 'पडताळणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.';
      const lower = msg.toLowerCase();
      if (
        lower.includes('verification failed') ||
        lower.includes('authentication') ||
        lower.includes('unauthorized') ||
        lower.includes('invalid') ||
        lower.includes('ipblocked')
      ) {
        msg = 'चुकीचा किंवा कालबाह्य OTP (Incorrect or expired verification code). कृपया पुन्हा तपासा किंवा Resend SMS वर क्लिक करा.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Resend OTP Request (Supports both client retry and backend dispatch fallback)
  const handleResendOtp = async () => {
    if (loading || cooldown > 0) return;
    setError(null);
    setSuccess(null);

    const formattedPhone = `+91${phone.trim().replace(/[^0-9]/g, '')}`;

    try {
      setLoading(true);

      let resent = false;
      let newReqId: string | undefined = undefined;

      if (reqId && reqId !== 'BACKEND_SENT') {
        try {
          if (MSG91_WIDGET_ID && MSG91_TOKEN_AUTH) {
            await OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
          }

          const retryRes = await OTPWidget.retryOTP({
            reqId,
            retryChannel: 11,
            otp_length: 4,
            otpLength: 4,
          });

          if (retryRes?.type === 'success') {
            newReqId =
              retryRes?.reqId ||
              retryRes?.data?.reqId ||
              (typeof retryRes?.message === 'string' && retryRes.message.trim().length > 0
                ? retryRes.message.trim()
                : undefined);
            resent = true;
          }
        } catch (sdkRetryErr: any) {
          console.warn('[MSG91 SDK] retryOTP failed (falling back to backend):', sdkRetryErr?.message);
        }
      }

      if (!resent) {
        const backendRes = await sendCustomerOtp(formattedPhone, 'sms');
        if (backendRes && backendRes.success) {
          newReqId = backendRes.reqId || 'BACKEND_SENT';
          resent = true;
        } else {
          throw new Error(backendRes?.message || 'Failed to resend SMS verification code.');
        }
      }

      if (newReqId) {
        setReqId(newReqId);
      }

      setCooldown(60);
      setSuccess('A 4-digit verification code has been resent via SMS.');
    } catch (retryErr: any) {
      const errorMsg =
        retryErr?.message ||
        'Failed to resend SMS code. Please wait and try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Devotee Sign In</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand & Welcome Hero */}
          <View style={styles.header}>
            <DevSutraLogo variant="vertical" size="md" />
            <Text style={styles.mantraText}>॥ ॐ श्री गणेशाय नमः ॥</Text>
            <Text style={styles.title}>Welcome to DevSutra</Text>
            <Text style={styles.subtitle}>
              Sign in with your mobile number to book certified Vedic priests, sacred rituals & pure samagri.
            </Text>
          </View>

          {/* Error Message Box */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          {/* Success Message Box */}
          {success && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.successBoxText}>{success}</Text>
            </View>
          )}

          {/* Main Mobile OTP Card */}
          <View style={styles.formCard}>
            {!otpSent ? (
              // Step 1: Mobile Number Input + Send OTP
              <View>
                <View style={styles.phoneInputGroup}>
                  <Text style={styles.phoneLabel}>Mobile Number *</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.countryCodeBadge}>
                      <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneNumberInput}
                      placeholder="98220 12345"
                      placeholderTextColor={colors.textMuted}
                      value={phone}
                      onChangeText={(val) => {
                        const cleaned = val.replace(/[^0-9]/g, '').slice(0, 10);
                        setPhone(cleaned);
                        setError(null);
                      }}
                      keyboardType="phone-pad"
                      maxLength={10}
                      editable={!loading}
                      autoFocus
                    />
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={15}
                    color={colors.goldDark}
                  />
                  <Text style={styles.infoRowText}>
                    We will send a 4-digit SMS verification code to your Indian mobile number via MSG91.
                  </Text>
                </View>

                <Button
                  title="Send 4-Digit OTP"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  onPress={handleSendOtp}
                  icon={
                    <Ionicons
                      name="paper-plane-outline"
                      size={18}
                      color={colors.textWhite}
                    />
                  }
                  style={{ marginTop: 16 }}
                />

                <TouchableOpacity
                  onPress={() => {
                    setError(null);
                    setShowWidget(true);
                  }}
                  disabled={loading}
                  activeOpacity={0.7}
                  style={{ marginTop: 14, alignItems: 'center', paddingVertical: 4 }}
                >
                  <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>
                    Or verify via Official MSG91 Widget
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Step 2: 4-Digit Mobile SMS OTP Verification
              <View>
                <View style={styles.verifyTargetBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.verifyTargetLabel}>SMS verification code sent to:</Text>
                    <Text style={styles.verifyTargetEmail}>{maskPhone(`+91${phone}`)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (loading) return;
                      setOtpSent(false);
                      setOtp('');
                      setReqId(undefined);
                      setError(null);
                      setSuccess(null);
                    }}
                    style={styles.editTargetBtn}
                    disabled={loading}
                  >
                    <Ionicons name="pencil" size={13} color={colors.primary} />
                    <Text style={styles.editTargetBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Enter 4-Digit Verification Code (४-अंकी OTP) *"
                  placeholder="• • • •"
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val.replace(/[^0-9]/g, ''));
                    setError(null);
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                  leftIcon="lock-closed-outline"
                  style={styles.otpInputText}
                  editable={!loading}
                  autoFocus
                />

                <Button
                  title="Verify OTP"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  onPress={handleVerifyOtp}
                  icon={<Ionicons name="arrow-forward" size={18} color={colors.textWhite} />}
                  style={{ marginTop: 12 }}
                />

                {/* Resend Action Row */}
                <View style={styles.otpActionsRow}>
                  {cooldown > 0 ? (
                    <View style={styles.cooldownWrap}>
                      <Ionicons name="time-outline" size={14} color={colors.textLight} />
                      <Text style={styles.cooldownText}>Resend SMS in {cooldown}s</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={loading}
                      style={styles.resendBtn}
                    >
                      <Ionicons name="refresh" size={14} color={colors.primary} />
                      <Text style={styles.resendLink}>Resend SMS Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Trust Footnote */}
          <View style={styles.footerTrust}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text style={styles.footerTrustText}>
              End-to-End Secure • Vedic Gurukul Certified • 100% Shuddh Samagri
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Official MSG91 DefaultWidget Modal */}
      <DefaultWidget
        visible={showWidget}
        onClose={() => setShowWidget(false)}
        onCompletion={handleVerificationComplete}
        widgetId={MSG91_WIDGET_ID}
        tokenAuth={MSG91_TOKEN_AUTH}
        theme="light"
        primaryColor={colors.primary}
        primaryButtonTextColor="#FFFFFF"
        matchBorderToPrimaryColor={true}
        defaultVerificationType="mobile"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mantraText: {
    fontSize: 13,
    color: colors.goldDark,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  errorBoxText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.error,
    fontWeight: '600',
    lineHeight: 18,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BCF0DA',
  },
  successBoxText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.success,
    fontWeight: '600',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phoneInputGroup: {
    marginBottom: 16,
  },
  phoneLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: '#FAFAF8',
    overflow: 'hidden',
  },
  countryCodeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: '#F0ECE4',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  phoneNumberInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF9F0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEEBC8',
  },
  infoRowText: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textLight,
    lineHeight: 16,
  },
  verifyTargetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9F0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEEBC8',
  },
  verifyTargetLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 2,
  },
  verifyTargetEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  editTargetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  editTargetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  otpInputText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.primary,
  },
  otpActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  cooldownWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cooldownText: {
    fontSize: 12,
    color: colors.textLight,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  footerTrust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerTrustText: {
    fontSize: 10.5,
    color: colors.textLight,
    textAlign: 'center',
  },
});
