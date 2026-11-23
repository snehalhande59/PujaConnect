import React, { useState } from 'react';
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
import { DevSutraLogo } from '../../components/common/DevSutraLogo';

interface CustomerPersonalDetailsScreenProps {
  initialFullName?: string;
  initialPhoneNumber?: string;
  userEmail?: string;
  onNext: (details: { fullName: string; phoneNumber: string }) => void;
  onBack?: () => void;
}

export const CustomerPersonalDetailsScreen: React.FC<CustomerPersonalDetailsScreenProps> = ({
  initialFullName = '',
  initialPhoneNumber = '',
  userEmail = '',
  onNext,
  onBack,
}) => {
  const [fullName, setFullName] = useState(initialFullName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    const trimmedName = fullName.trim();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!cleanPhone) {
      setError('Mobile number is required for booking updates & priest coordination.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    onNext({
      fullName: trimmedName,
      phoneNumber: cleanPhone,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <Text style={styles.topBarTitle}>Devotee Registration</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Sacred Branding */}
          <View style={styles.header}>
            <DevSutraLogo variant="vertical" size="md" />
            <Text style={styles.mantraText}>॥ ॐ श्री गणेशाय नमः ॥</Text>
            <Text style={styles.title}>Tell Us About Yourself</Text>
            <Text style={styles.subtitle}>
              Your name and mobile number ensure authentic ritual coordination with verified Vedic priests.
            </Text>
          </View>

          {/* Stepper Indicator */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepBadgeActive}>
              <Text style={styles.stepBadgeTextActive}>1</Text>
            </View>
            <View style={styles.stepperLine} />
            <View style={styles.stepBadgeInactive}>
              <Text style={styles.stepBadgeTextInactive}>2</Text>
            </View>
          </View>
          <Text style={styles.stepperLabel}>Step 1 of 2: Personal Details</Text>

          {/* Verified Email Banner */}
          {userEmail ? (
            <View style={styles.verifiedBox}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.verifiedBoxText}>
                Verified Email: <Text style={{ fontWeight: '700' }}>{userEmail}</Text>
              </Text>
            </View>
          ) : null}

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            <Input
              label="Full Name *"
              placeholder="e.g. Aarav Sharma"
              value={fullName}
              onChangeText={(val) => {
                setFullName(val);
                setError(null);
              }}
              leftIcon="person-outline"
              autoCapitalize="words"
              autoCorrect={false}
            />

            <View style={{ marginTop: 4 }}>
              <Input
                label="Mobile Number (India) *"
                placeholder="9876543210"
                value={phoneNumber}
                onChangeText={(val) => {
                  setPhoneNumber(val.replace(/[^0-9]/g, ''));
                  setError(null);
                }}
                keyboardType="phone-pad"
                maxLength={10}
                leftIcon="call-outline"
              />
              <Text style={styles.helperText}>
                We will only use this number for Muhurat coordination and priest arrival updates.
              </Text>
            </View>

            <Button
              title="Continue to Address Details"
              variant="primary"
              size="lg"
              onPress={handleNext}
              icon={<Ionicons name="arrow-forward" size={18} color={colors.textWhite} />}
              style={{ marginTop: 20 }}
            />
          </View>

          {/* Security Notice */}
          <View style={styles.securityNote}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.goldDark} />
            <Text style={styles.securityNoteText}>
              Your information is stored safely and never shared with third parties.
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
    marginBottom: 16,
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  stepBadgeActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeTextActive: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
  stepperLine: {
    width: 48,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  stepBadgeInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeTextInactive: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '700',
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  verifiedBoxText: {
    fontSize: 12,
    color: '#065F46',
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
  helperText: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: -8,
    marginBottom: 12,
    lineHeight: 15,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  securityNoteText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
  },
});
