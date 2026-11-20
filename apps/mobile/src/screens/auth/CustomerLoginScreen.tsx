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
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onSwitchToPandit: () => void;
}

export const CustomerLoginScreen: React.FC<CustomerLoginScreenProps> = ({
  onBack,
  onNavigateRegister,
  onNavigateForgotPassword,
  onSwitchToPandit,
}) => {
  const { loginCustomer, sendCustomerOtp, loginCustomerWithOtp } = useAuth();

  // Mode: 'otp' (primary) vs 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  // OTP Fields
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Password Fields
  const [password, setPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Mask email for display
  const getMaskedIdentifier = (val: string) => {
    if (!val.includes('@')) return val;
    const [local, domain] = val.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  // 1. Send OTP
  const handleSendOtp = async () => {
    setError(null);
    setSuccess(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    if (!trimmed.includes('@')) {
      setError(
        'Mobile SMS OTP is temporarily unavailable. Please enter your email address to sign in.',
      );
      return;
    }

    try {
      setLoading(true);
      const res = await sendCustomerOtp(trimmed, 'email');
      setOtpSent(true);
      setCooldown(res?.cooldownSeconds || 60);
      setSuccess(res?.message || '6-digit verification code has been sent to your email.');
    } catch (e: any) {
      setError(e.message || 'Unable to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    setError(null);
    setSuccess(null);

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      await loginCustomerWithOtp(
        identifier.trim(),
        trimmedOtp,
        fullName.trim() || undefined,
      );
      setSuccess('Verification successful! Opening your account...');
    } catch (e: any) {
      setError(e.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Login
  const handlePasswordLogin = async () => {
    setError(null);
    setSuccess(null);

    if (!identifier.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await loginCustomer(identifier.trim(), password);
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
          <Text style={styles.topBarTitle}>Customer Sign In</Text>
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
            <Text style={styles.title}>Welcome to PujaConnect</Text>
            <Text style={styles.subtitle}>
              Sign in to book certified Vedic pandits, view rituals & order pure samagri.
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
                <Text style={styles.recommendedBadgeText}>Fast</Text>
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

          {/* Notification / Error / Success Messages */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.successBoxText}>{success}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            {authMode === 'otp' ? (
              // --- OTP MODE ---
              !otpSent ? (
                // Step 1: Request OTP
                <View>
                  <Input
                    label="Email Address or Mobile Number"
                    placeholder="devotee@example.com or 9876543210"
                    value={identifier}
                    onChangeText={(val) => {
                      setIdentifier(val);
                      setError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    leftIcon="mail-outline"
                  />

                  <View style={styles.infoRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={colors.goldDark} />
                    <Text style={styles.infoRowText}>
                      We will email you a 6-digit verification code. No password needed!
                    </Text>
                  </View>

                  <Button
                    title="Send Verification Code"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    onPress={handleSendOtp}
                    style={{ marginTop: 16 }}
                  />
                </View>
              ) : (
                // Step 2: Verify OTP
                <View>
                  <View style={styles.verifyTargetBox}>
                    <Text style={styles.verifyTargetLabel}>Code sent to:</Text>
                    <Text style={styles.verifyTargetEmail}>
                      {getMaskedIdentifier(identifier)}
                    </Text>
                  </View>

                  <Input
                    label="Enter 6-Digit OTP"
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

                  <Input
                    label="Your Name (Optional)"
                    placeholder="Enter full name"
                    value={fullName}
                    onChangeText={setFullName}
                    leftIcon="person-outline"
                    autoCapitalize="words"
                  />

                  <Button
                    title="Verify & Sign In"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    onPress={handleVerifyOtp}
                    style={{ marginTop: 12 }}
                  />

                  {/* Resend and Edit Actions */}
                  <View style={styles.otpActionsRow}>
                    {cooldown > 0 ? (
                      <View style={styles.cooldownWrap}>
                        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.cooldownText}>Resend in {cooldown}s</Text>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                        <Text style={styles.resendLink}>Resend Code</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => {
                        setOtpSent(false);
                        setOtp('');
                        setError(null);
                        setSuccess(null);
                      }}
                    >
                      <Text style={styles.changeEmailLink}>Change Email</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            ) : (
              // --- PASSWORD MODE ---
              <View>
                <Input
                  label="Email Address or Mobile Number"
                  placeholder="devotee@example.com or 9876543210"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                />

                <Input
                  label="Password"
                  placeholder="••••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  leftIcon="lock-closed-outline"
                />

                <TouchableOpacity onPress={onNavigateForgotPassword} style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

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

          {/* Footer Clean Actions */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to PujaConnect? </Text>
            <TouchableOpacity onPress={onNavigateRegister}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onSwitchToPandit} style={styles.switchRoleBtn}>
            <Ionicons name="school-outline" size={16} color={colors.secondary} />
            <Text style={styles.switchRoleText}>Are you a Pandit? Sign in to Pandit Portal</Text>
          </TouchableOpacity>
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
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginVertical: 14,
  },
  mantraText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold,
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 290,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recommendedBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  recommendedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
    lineHeight: 16,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  successBoxText: {
    flex: 1,
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    lineHeight: 16,
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
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  infoRowText: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    lineHeight: 15,
  },
  verifyTargetBox: {
    backgroundColor: colors.cardAlt,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifyTargetLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  verifyTargetEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  otpInputText: {
    letterSpacing: 4,
    fontSize: 18,
    fontWeight: '700',
  },
  otpActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  cooldownWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cooldownText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  resendLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  changeEmailLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    textDecorationLine: 'underline',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: colors.textLight,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
    gap: 6,
  },
  switchRoleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
});
