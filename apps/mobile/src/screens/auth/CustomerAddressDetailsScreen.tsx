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
import { api, storage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface CustomerAddressDetailsScreenProps {
  personalDetails: {
    fullName: string;
    phoneNumber: string;
  };
  userEmail?: string;
  onBack: () => void;
  onComplete: () => void;
}

export const CustomerAddressDetailsScreen: React.FC<CustomerAddressDetailsScreenProps> = ({
  personalDetails,
  userEmail = '',
  onBack,
  onComplete,
}) => {
  const { user, refreshProfile } = useAuth();

  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    const trimmedHouse = house.trim();
    const trimmedStreet = street.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const cleanPin = pincode.replace(/[^0-9]/g, '');

    if (!trimmedHouse) {
      setError('House / Flat / Building name is required.');
      return;
    }

    if (!trimmedStreet) {
      setError('Street / Area / Landmark is required.');
      return;
    }

    if (!trimmedCity) {
      setError('City is required.');
      return;
    }

    if (!trimmedState) {
      setError('State is required.');
      return;
    }

    if (!cleanPin || cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit Indian PIN code (e.g. 411038).');
      return;
    }

    try {
      setLoading(true);

      // 1. Split full name into firstName and lastName
      const nameParts = personalDetails.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Devotee';
      const lastName = nameParts.slice(1).join(' ') || '';

      // 2. Real Backend Save: Update Customer Profile
      await api.updateCustomerProfile({
        firstName,
        lastName,
        city: trimmedCity,
        state: trimmedState,
      });

      // 3. Real Backend Save: Add Default Address
      await api.addAddress({
        fullName: personalDetails.fullName.trim(),
        phoneNumber: personalDetails.phoneNumber.trim(),
        addressLine1: trimmedHouse,
        addressLine2: trimmedStreet,
        city: trimmedCity,
        state: trimmedState,
        pincode: cleanPin,
        isDefault: true,
      });

      // 4. Update local user storage and refresh auth context
      if (user) {
        const updatedUser = {
          ...user,
          firstName,
          lastName,
          phoneNumber: personalDetails.phoneNumber.trim(),
        };
        await storage.setUser(updatedUser);
      }
      await refreshProfile();

      // 5. Complete registration and redirect to Customer Homepage
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to save address details. Please try again.');
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
          <Text style={styles.topBarTitle}>Puja Location Details</Text>
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
            <Text style={styles.title}>Where Should Puja Take Place?</Text>
            <Text style={styles.subtitle}>
              This address ensures your verified Vedic pandits arrive on-time with complete holy samagri.
            </Text>
          </View>

          {/* Stepper Indicator */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepBadgeCompleted}>
              <Ionicons name="checkmark" size={14} color={colors.textWhite} />
            </View>
            <View style={[styles.stepperLine, { backgroundColor: colors.success }]} />
            <View style={styles.stepBadgeActive}>
              <Text style={styles.stepBadgeTextActive}>2</Text>
            </View>
          </View>
          <Text style={styles.stepperLabel}>Step 2 of 2: Address Details</Text>

          {/* Summary Box */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryItem}>
              <Ionicons name="person-outline" size={14} color={colors.primary} />
              <Text style={styles.summaryText}>{personalDetails.fullName}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="call-outline" size={14} color={colors.primary} />
              <Text style={styles.summaryText}>+91 {personalDetails.phoneNumber}</Text>
            </View>
          </View>

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
              label="House / Flat / Building *"
              placeholder="e.g. Flat 402, Shivam Residency"
              value={house}
              onChangeText={(val) => {
                setHouse(val);
                setError(null);
              }}
              leftIcon="business-outline"
            />

            <Input
              label="Street / Area / Landmark *"
              placeholder="e.g. Near Ganpati Mandir, Kothrud"
              value={street}
              onChangeText={(val) => {
                setStreet(val);
                setError(null);
              }}
              leftIcon="location-outline"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="City *"
                  placeholder="e.g. Pune"
                  value={city}
                  onChangeText={(val) => {
                    setCity(val);
                    setError(null);
                  }}
                  leftIcon="map-outline"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label="State *"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChangeText={(val) => {
                    setState(val);
                    setError(null);
                  }}
                  leftIcon="navigate-outline"
                />
              </View>
            </View>

            <Input
              label="PIN Code *"
              placeholder="411038"
              value={pincode}
              onChangeText={(val) => {
                setPincode(val.replace(/[^0-9]/g, ''));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              leftIcon="keypad-outline"
            />

            <Button
              title="Save & Go to Homepage"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleSave}
              icon={<Ionicons name="checkmark-done" size={18} color={colors.textWhite} />}
              style={{ marginTop: 16 }}
            />
          </View>

          {/* Trust Footer */}
          <View style={styles.trustNote}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text style={styles.trustNoteText}>
              Verified Pandit services available across major residential zones.
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
  stepBadgeCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginHorizontal: 8,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '700',
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
  row: {
    flexDirection: 'row',
  },
  trustNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  trustNoteText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
  },
});
