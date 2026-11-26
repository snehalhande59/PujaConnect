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

export type CustomerLoginMethod = 'email_otp' | 'mobile_otp' | 'password';

export const CustomerLoginScreen: React.FC<CustomerLoginScreenProps> = ({
  onBack,
  onLoginSuccess,
  onNavigateForgotPassword,
}) => {
  const {
    sendCustomerOtp,
    loginCustomerWithOtp,
    loginCustomerWithWidgetToken,
    loginCustomer,
  } = useAuth();

  // Three primary login methods clearly visible at the top:
  // 1. Email OTP
  // 2. Mobile OTP
  // 3. Password
  const [method, setMethod] = useState<CustomerLoginMethod>('email_otp');

  // Input States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // OTP Verification States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [reqId, setReqId] = useState<string | undefined>(undefined);
  const [otpLength, setOtpLength] = useState<number>(4);
  const [showWidget, setShowWidget] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle completion from official MSG91 DefaultWidget modal
  const handleVerificationComplete = async (result: any) => {
    console.log('[MSG91 DefaultWidget] Verification complete:', result);
    if (result?.success) {
      const accessToken =
        result['access-token'] || result.accessToken || result.message;
      const rawIdentifier = result.identifier || phone;
      const digits = (rawIdentifier || '').replace(/[^0-9]/g, '');
      const cleanPhone =
        digits.length === 10
          ? `+91${digits}`
          : digits.startsWith('91') && digits.length === 12
          ? `+${digits}`
          : `+${digits}`;

      try {
        setLoading(true);
        const res = await loginCustomerWithWidgetToken(cleanPhone, accessToken);
        if (res.user?.role === 'PANDIT') {
          setSuccess(`Namaste Pt. ${res.user.firstName || ''}! Redirecting to Pandit Portal...`);
        } else {
          setSuccess('Verification successful! Welcome to DevSutra.');
        }
        setShowWidget(false);
        onLoginSuccess(res.user, Boolean(res.isNewCustomer));
      } catch (backendErr: any) {
        setError(backendErr.message || 'Verification token accepted, but devotee sign-in failed.');
        setShowWidget(false);
      } finally {
        setLoading(false);
      }
    } else {
      setError(result?.message || 'Verification was cancelled or failed.');
      setShowWidget(false);
    }
  };

  // Initialize official MSG91 React Native SDK & dynamically fetch widget configuration
  useEffect(() => {
    try {
      if (MSG91_WIDGET_ID && MSG91_TOKEN_AUTH) {
        OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
        OTPWidget.getWidgetProcess()
          .then((res: any) => {
            const length = res?.data?.otpLength;
            if (length && !isNaN(Number(length))) {
              setOtpLength(Number(length));
              console.log('[MSG91 SDK] Dynamic widget otpLength loaded:', length);
            }
          })
          .catch((err: any) => {
            console.warn('[MSG91 SDK] getWidgetProcess error:', err?.message);
          });
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

  // Mask email for display (e.g. s***e@gmail.com)
  const maskEmail = (val: string) => {
    if (!val || !val.includes('@')) return val;
    const [local, domain] = val.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  // Mask phone for display (e.g. +91 98******45)
  const maskPhone = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      return `+91 ${last10.slice(0, 2)}******${last10.slice(-2)}`;
    }
    return val;
  };

  // Switch between the 3 methods
  const handleSelectMethod = (selected: CustomerLoginMethod) => {
    if (loading) return;
    setMethod(selected);
    setOtpSent(false);
    setOtp('');
    setReqId(undefined);
    setError(null);
    setSuccess(null);
  };

  // 1. Send OTP Request (Email OTP or Mobile OTP)
  const handleSendOtp = async () => {
    if (loading) return;
    setError(null);
    setSuccess(null);

    if (method === 'email_otp') {
      const trimmed = email.trim();
      if (!trimmed) {
        setError('Please enter your email address.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setError('Please enter a valid email address (e.g. devotee@example.com).');
        return;
      }

      try {
        setLoading(true);
        const res = await sendCustomerOtp(trimmed, 'email');
        setOtpSent(true);
        setCooldown(res?.cooldownSeconds || 60);
        setSuccess(
          res?.message || `A 6-digit verification code has been sent to ${maskEmail(trimmed)}.`,
        );
      } catch (e: any) {
        setError(
          e.message ||
            'Failed to deliver email verification code. Please check your email and try again.',
        );
      } finally {
        setLoading(false);
      }
    } else if (method === 'mobile_otp') {
      // Mobile SMS OTP via official MSG91 React Native SDK ONLY
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

      if (!MSG91_TOKEN_AUTH) {
        setError(
          'SMS authentication is not configured. Please sign in using Email OTP or restart the app.',
        );
        return;
      }

      try {
        setLoading(true);

        // Ensure widget is initialized
        if (MSG91_WIDGET_ID && MSG91_TOKEN_AUTH) {
          await OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
        }

        // Send OTP using official MSG91 React Native SDK
        const sdkRes = await OTPWidget.sendOTP({ identifier: sdkIdentifier });

        if (sdkRes?.type !== 'success') {
          throw new Error(
            sdkRes?.message || 'Failed to dispatch SMS verification code.',
          );
        }

        // Handle Invisible OTP / Direct Verification (if silent network auth succeeded)
        const directToken =
          sdkRes?.invisibleVerified === true
            ? sdkRes?.['access-token'] ||
              sdkRes?.accessToken ||
              (typeof sdkRes?.message === 'string' ? sdkRes.message : undefined)
            : sdkRes?.['access-token'] || sdkRes?.accessToken;

        if (directToken) {
          const res = await loginCustomerWithWidgetToken(formattedPhone, directToken);
          if (res.user?.role === 'PANDIT') {
            setSuccess(`Namaste Pt. ${res.user.firstName || ''}! Redirecting to Pandit Portal...`);
          } else {
            setSuccess('Verification successful!');
          }
          onLoginSuccess(res.user, Boolean(res.isNewCustomer));
          return;
        }

        // As documented in official SDK Readme (line 113) and DefaultWidget/services/otpService.ts:
        // sendOTP returns { type: 'success', message: '<reqId>' }
        const extractedReqId =
          sdkRes?.reqId ||
          sdkRes?.data?.reqId ||
          (typeof sdkRes?.message === 'string' && sdkRes.message.trim().length > 0
            ? sdkRes.message.trim()
            : undefined);

        if (!extractedReqId) {
          throw new Error(
            'Verification session could not be established. Please try again.',
          );
        }

        setReqId(extractedReqId);
        setOtpSent(true);
        setCooldown(60);
        setSuccess(
          `A 6-digit verification code has been sent via SMS to ${maskPhone(formattedPhone)}.`,
        );
      } catch (sdkError: any) {
        // SDK failure stops here and reports the error. NO fallback to old REST API.
        let errMsg =
          sdkError?.message ||
          'Failed to dispatch SMS verification code. Please check your mobile number and try again.';
        if (errMsg === 'AuthenticationFailure' || errMsg.includes('AuthenticationFailure')) {
          errMsg = 'SMS gateway authentication error. Please retry in a moment or sign in using Email OTP.';
        }
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  // 2. Verify OTP Request
  const handleVerifyOtp = async () => {
    if (loading) return;
    setError(null);
    setSuccess(null);

    const cleanOtp = otp.trim().replace(/[^0-9]/g, '');
    if (!cleanOtp) {
      setError(`Please enter the complete ${otpLength}-digit verification code.`);
      return;
    }

    if (method === 'mobile_otp') {
      const cleanPhone = `+91${phone.trim().replace(/[^0-9]/g, '')}`;

      // Never call verifyOTP with an empty reqId
      if (!reqId) {
        setError('Verification session expired or missing. Please request a new verification code.');
        setOtpSent(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Verify OTP strictly through official MSG91 React Native SDK
        let accessToken: string | undefined = undefined;
        try {
          if (MSG91_WIDGET_ID && MSG91_TOKEN_AUTH) {
            await OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
          }

          console.log('[MSG91 Calling verifyOTP]:', { reqId, otp: cleanOtp, widgetId: MSG91_WIDGET_ID });
          const verifyRes = await OTPWidget.verifyOTP({
            reqId,
            otp: cleanOtp,
          });
          console.log('[MSG91 verifyOTP response]:', JSON.stringify(verifyRes));

          if (
            verifyRes?.type === 'error' ||
            verifyRes?.type === 'failed' ||
            verifyRes?.status === 'fail'
          ) {
            const rawMsg = (verifyRes?.message || '').toLowerCase();
            let userMsg =
              verifyRes?.message ||
              'Invalid or expired verification code. Please try again.';
            if (rawMsg.includes('verification failed')) {
              userMsg = `Invalid OTP code. Please enter the ${otpLength}-digit code received in your latest SMS (${maskPhone(
                cleanPhone,
              )}), or tap "Verify with MSG91 Official Widget" below.`;
            }
            throw new Error(userMsg);
          }

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
        } catch (sdkVerifyErr: any) {
          const errMsg =
            sdkVerifyErr?.message ||
            'Invalid or expired verification code. Please try again.';
          setError(errMsg);
          setLoading(false);
          return;
        }

        // 2. Validate that an Access Token was returned by MSG91
        if (!accessToken) {
          setError('Verification failed. No valid verification token received from MSG91.');
          setLoading(false);
          return;
        }

        // 3. Cryptographically validate token with NestJS backend
        // Never trust client-side OTP success alone! Never fallback to loginCustomerWithOtp!
        const res = await loginCustomerWithWidgetToken(cleanPhone, accessToken);

        if (res.user?.role === 'PANDIT') {
          setSuccess(`Namaste Pt. ${res.user.firstName || ''}! Redirecting to Pandit Portal...`);
        } else {
          setSuccess('Verification successful!');
        }
        onLoginSuccess(res.user, Boolean(res.isNewCustomer));
      } catch (e: any) {
        setError(e.message || 'Invalid or expired verification code. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Email OTP Flow
    const identifier = email.trim();

    try {
      setLoading(true);
      const res = await loginCustomerWithOtp(identifier, cleanOtp, undefined, reqId);
      if (res.user?.role === 'PANDIT') {
        setSuccess(`Namaste Pt. ${res.user.firstName || ''}! Redirecting to Pandit Portal...`);
      } else {
        setSuccess('Verification successful!');
      }
      onLoginSuccess(res.user, Boolean(res.isNewCustomer));
    } catch (e: any) {
      setError(e.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Resend OTP Request (Email OTP via backend, Mobile OTP via SDK retryOTP)
  const handleResendOtp = async () => {
    if (loading || cooldown > 0) return;
    setError(null);
    setSuccess(null);

    if (method === 'email_otp') {
      // Email OTP resend continues using existing backend flow
      return handleSendOtp();
    }

    if (method === 'mobile_otp') {
      if (!reqId) {
        setError('No active verification session found. Please send a new OTP first.');
        return;
      }

      try {
        setLoading(true);

        if (MSG91_WIDGET_ID && MSG91_TOKEN_AUTH) {
          await OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
        }

        // Official SDK retryOTP with SMS channel 11
        const retryRes = await OTPWidget.retryOTP({
          reqId,
          retryChannel: 11,
        });

        // Do not show resend success unless the SDK explicitly confirms success (type === 'success')
        if (retryRes?.type !== 'success') {
          throw new Error(
            retryRes?.message || 'Failed to resend SMS verification code.',
          );
        }

        // As documented in DefaultWidget/services/otpService.ts:
        // const newReqId = response.reqId || response.message;
        // If a new reqId is returned, update state; otherwise retain the existing reqId
        const newReqId =
          retryRes?.reqId ||
          retryRes?.data?.reqId ||
          (typeof retryRes?.message === 'string' && retryRes.message.trim().length > 0
            ? retryRes.message.trim()
            : undefined);

        if (newReqId) {
          setReqId(newReqId);
        }

        setCooldown(60);
        setSuccess('Verification code resent via SMS.');
      } catch (retryErr: any) {
        const errorMsg =
          retryErr?.message ||
          'Failed to resend SMS code. Please wait and try again.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  // 3. Password Login
  const handlePasswordLogin = async () => {
    if (loading) return;
    setError(null);
    setSuccess(null);

    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginCustomer(trimmed, password);
      onLoginSuccess(res.user, false);
    } catch (e: any) {
      setError(e.message || 'Login failed. Please check your credentials.');
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
              Sign in to book certified Vedic priests, sacred rituals & pure samagri for your family.
            </Text>
          </View>

          {/* THREE VISIBLE LOGIN METHODS: EMAIL OTP | MOBILE OTP | PASSWORD */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => handleSelectMethod('email_otp')}
              style={[
                styles.tabButton,
                method === 'email_otp' && styles.tabButtonActive,
              ]}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons
                name="mail-outline"
                size={15}
                color={method === 'email_otp' ? colors.card : colors.textLight}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  method === 'email_otp' && styles.tabButtonTextActive,
                ]}
                numberOfLines={1}
              >
                Email OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectMethod('mobile_otp')}
              style={[
                styles.tabButton,
                method === 'mobile_otp' && styles.tabButtonActive,
              ]}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={15}
                color={method === 'mobile_otp' ? colors.card : colors.textLight}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  method === 'mobile_otp' && styles.tabButtonTextActive,
                ]}
                numberOfLines={1}
              >
                Mobile OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectMethod('password')}
              style={[
                styles.tabButton,
                method === 'password' && styles.tabButtonActive,
              ]}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons
                name="key-outline"
                size={15}
                color={method === 'password' ? colors.card : colors.textLight}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  method === 'password' && styles.tabButtonTextActive,
                ]}
                numberOfLines={1}
              >
                Password
              </Text>
            </TouchableOpacity>
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

          {/* Main Login Card */}
          <View style={styles.formCard}>
            {method === 'email_otp' ? (
              // ==========================================
              // 1. EMAIL OTP FLOW
              // ==========================================
              !otpSent ? (
                // Step 1: Email Input + Send OTP
                <View>
                  <Input
                    label="Email Address *"
                    placeholder="devotee@example.com"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      setError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    leftIcon="mail-outline"
                    editable={!loading}
                  />

                  <View style={styles.infoRow}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={15}
                      color={colors.goldDark}
                    />
                    <Text style={styles.infoRowText}>
                      We will email you a 6-digit verification code. No password required!
                    </Text>
                  </View>

                  <Button
                    title="Send OTP"
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
                </View>
              ) : (
                // Step 2: 6-Digit Email OTP Verification
                <View>
                  <View style={styles.verifyTargetBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.verifyTargetLabel}>Verification code sent to:</Text>
                      <Text style={styles.verifyTargetEmail}>{maskEmail(email)}</Text>
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
                    label="Enter 6-Digit Verification Code *"
                    placeholder="• • • • • •"
                    value={otp}
                    onChangeText={(val) => {
                      setOtp(val.replace(/[^0-9]/g, ''));
                      setError(null);
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    leftIcon="lock-closed-outline"
                    style={styles.otpInputText}
                    editable={!loading}
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
                        <Text style={styles.cooldownText}>Resend code in {cooldown}s</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={loading}
                        style={styles.resendBtn}
                      >
                        <Ionicons name="refresh" size={14} color={colors.primary} />
                        <Text style={styles.resendLink}>Resend Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )
            ) : method === 'mobile_otp' ? (
              // ==========================================
              // 2. MOBILE OTP FLOW (SMS VIA MSG91)
              // ==========================================
              !otpSent ? (
                // Step 1: Mobile Input with +91 + Send OTP
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
                        autoFocus={method === 'mobile_otp'}
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
                      We will send a {otpLength}-digit SMS verification code to your Indian mobile number via MSG91.
                    </Text>
                  </View>

                  <Button
                    title="Send OTP"
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

                  {/* Official MSG91 Modal Widget Verification Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setError(null);
                      setShowWidget(true);
                    }}
                    style={styles.openWidgetBtn}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                    <Text style={styles.openWidgetBtnText}>
                      Verify via MSG91 Official Widget
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Step 2: Mobile SMS OTP Verification (Dynamic 4 or 6 Digits)
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
                    label={`Enter ${otpLength}-Digit Verification Code *`}
                    placeholder={otpLength === 4 ? '• • • •' : '• • • • • •'}
                    value={otp}
                    onChangeText={(val) => {
                      setOtp(val.replace(/[^0-9]/g, ''));
                      setError(null);
                    }}
                    keyboardType="number-pad"
                    maxLength={otpLength}
                    leftIcon="lock-closed-outline"
                    style={styles.otpInputText}
                    editable={!loading}
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

                  {/* Direct MSG91 Official Widget Fallback */}
                  <TouchableOpacity
                    onPress={() => {
                      setError(null);
                      setShowWidget(true);
                    }}
                    style={styles.openWidgetSecondaryBtn}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="shield-checkmark-outline" size={15} color={colors.primary} />
                    <Text style={styles.openWidgetSecondaryBtnText}>
                      Having issue? Verify with MSG91 Official Widget
                    </Text>
                  </TouchableOpacity>

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
              )
            ) : (
              // ==========================================
              // 3. PASSWORD LOGIN FLOW
              // ==========================================
              <View>
                <Input
                  label="Email Address *"
                  placeholder="devotee@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                  editable={!loading}
                />

                <Input
                  label="Password *"
                  placeholder="••••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  leftIcon="lock-closed-outline"
                  editable={!loading}
                />

                {onNavigateForgotPassword && (
                  <TouchableOpacity
                    onPress={onNavigateForgotPassword}
                    style={styles.forgotBtn}
                    disabled={loading}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}

                <Button
                  title="Sign In with Password"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  onPress={handlePasswordLogin}
                  style={{ marginTop: 8 }}
                />
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
        defaultCountry={{
          name: 'India',
          dial_code: '91',
          code: 'IN',
          flag: '🇮🇳',
        }}
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
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
  },
  mantraText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gold,
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(128, 0, 32, 0.06)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 11,
    paddingHorizontal: 2,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  tabButtonTextActive: {
    color: colors.card,
  },
  phoneInputGroup: {
    marginBottom: 14,
  },
  phoneLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    height: 50,
    overflow: 'hidden',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 0, 32, 0.06)',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  countryCodeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
  },
  phoneNumberInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    marginBottom: 8,
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
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  verifyTargetLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  verifyTargetEmail: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  editTargetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    letterSpacing: 6,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
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
  openWidgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  openWidgetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  openWidgetSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight || '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  openWidgetSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
