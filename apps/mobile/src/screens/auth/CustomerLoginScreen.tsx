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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { DevSutraLogo } from '../../components/common/DevSutraLogo';

interface CustomerLoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (user: any, isNewCustomer: boolean) => void;
  onNavigateForgotPassword?: () => void;
}

export const CustomerLoginScreen: React.FC<CustomerLoginScreenProps> = ({
  onBack,
  onLoginSuccess,
  onNavigateForgotPassword,
}) => {
  const { sendCustomerOtp, loginCustomerWithOtp, loginCustomer } = useAuth();

  // Mode: 'otp' (primary Email OTP) vs 'password' (fallback)
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  // Email OTP state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Password login state
  const [password, setPassword] = useState('');

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // 1. Send OTP Request
  const handleSendOtp = async () => {
    setError(null);
    setSuccess(null);

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
          'Failed to deliver verification code. Please check your email and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP Request
  const handleVerifyOtp = async () => {
    setError(null);
    setSuccess(null);

    const cleanOtp = otp.trim().replace(/[^0-9]/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginCustomerWithOtp(email.trim(), cleanOtp);
      setSuccess('Verification successful!');
      onLoginSuccess(res.user, Boolean(res.isNewCustomer));
    } catch (e: any) {
      setError(e.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Login Fallback
  const handlePasswordLogin = async () => {
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
        {/* Top Bar */}
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
          {/* Header */}
          <View style={styles.header}>
            <DevSutraLogo variant="vertical" size="md" />
            <Text style={styles.mantraText}>॥ ॐ श्री गणेशाय नमः ॥</Text>
            <Text style={styles.title}>Welcome to DevSutra</Text>
            <Text style={styles.subtitle}>
              Sign in to book certified Vedic priests, sacred rituals & pure samagri for your family.
            </Text>
          </View>

          {/* Mode Switch Pills */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => {
                setAuthMode('otp');
                setError(null);
                setSuccess(null);
              }}
              style={[styles.tabButton, authMode === 'otp' && styles.tabButtonActive]}
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={authMode === 'otp' ? colors.card : colors.textLight}
              />
              <Text
                style={[styles.tabButtonText, authMode === 'otp' && styles.tabButtonTextActive]}
              >
                Email OTP
              </Text>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedBadgeText}>Instant</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAuthMode('password');
                setError(null);
                setSuccess(null);
              }}
              style={[styles.tabButton, authMode === 'password' && styles.tabButtonActive]}
            >
              <Ionicons
                name="key-outline"
                size={16}
                color={authMode === 'password' ? colors.card : colors.textLight}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  authMode === 'password' && styles.tabButtonTextActive,
                ]}
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

          {/* Main Form Card */}
          <View style={styles.formCard}>
            {authMode === 'otp' ? (
              // --- EMAIL OTP FLOW ---
              !otpSent ? (
                // Step 1: Email Input
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
                  />

                  <View style={styles.infoRow}>
                    <Ionicons name="shield-checkmark-outline" size={15} color={colors.goldDark} />
                    <Text style={styles.infoRowText}>
                      We will email you a 6-digit verification code. No password required!
                    </Text>
                  </View>

                  <Button
                    title="Send Verification Code"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    onPress={handleSendOtp}
                    icon={<Ionicons name="paper-plane-outline" size={18} color={colors.textWhite} />}
                    style={{ marginTop: 16 }}
                  />
                </View>
              ) : (
                // Step 2: 6-Digit OTP Input
                <View>
                  <View style={styles.verifyTargetBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.verifyTargetLabel}>Verification code sent to:</Text>
                      <Text style={styles.verifyTargetEmail}>{maskEmail(email)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setOtpSent(false);
                        setOtp('');
                        setError(null);
                        setSuccess(null);
                      }}
                      style={styles.editEmailBtn}
                    >
                      <Ionicons name="pencil" size={13} color={colors.primary} />
                      <Text style={styles.editEmailBtnText}>Change</Text>
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
                  />

                  <Button
                    title="Verify & Continue"
                    variant="primary"
                    size="lg"
                    loading={loading}
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
                      <TouchableOpacity onPress={handleSendOtp} disabled={loading} style={styles.resendBtn}>
                        <Ionicons name="refresh" size={14} color={colors.primary} />
                        <Text style={styles.resendLink}>Resend Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )
            ) : (
              // --- PASSWORD LOGIN FALLBACK ---
              <View>
                <Input
                  label="Email Address *"
                  placeholder="devotee@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                />

                <Input
                  label="Password *"
                  placeholder="••••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  leftIcon="lock-closed-outline"
                />

                {onNavigateForgotPassword && (
                  <TouchableOpacity onPress={onNavigateForgotPassword} style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}

                <Button
                  title="Sign In with Password"
                  variant="primary"
                  size="lg"
                  loading={loading}
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
    gap: 6,
    paddingVertical: 10,
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.textLight,
  },
  tabButtonTextActive: {
    color: colors.card,
  },
  recommendedBadge: {
    backgroundColor: '#F7D070',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  recommendedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#800020',
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
  editEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editEmailBtnText: {
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
});
