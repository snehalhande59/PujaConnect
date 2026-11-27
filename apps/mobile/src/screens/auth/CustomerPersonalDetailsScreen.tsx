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
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface CustomerPersonalDetailsScreenProps {
  initialFullName?: string;
  initialPhoneNumber?: string;
  onComplete: () => void;
  onBack?: () => void;
}

export type GenderType = 'Male' | 'Female' | 'Other';

export const CustomerPersonalDetailsScreen: React.FC<CustomerPersonalDetailsScreenProps> = ({
  initialFullName = '',
  initialPhoneNumber = '',
  onComplete,
  onBack,
}) => {
  const { refreshProfile } = useAuth();

  // Personal Fields
  const [fullName, setFullName] = useState(initialFullName);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<GenderType>('Male');
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const digits = (initialPhoneNumber || '').replace(/[^0-9]/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      return digits.slice(2);
    }
    return digits;
  });

  // Address Fields
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedAge = age.trim();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const trimmedHouse = house.trim();
    const trimmedStreet = street.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const cleanPin = pincode.replace(/[^0-9]/g, '');

    // 1. Validate Personal
    if (!trimmedName || trimmedName.length < 2) {
      setError('कृपया तुमचे पूर्ण नाव प्रविष्ट करा (Please enter your full name).');
      return;
    }

    const ageNum = parseInt(trimmedAge, 10);
    if (!trimmedAge || isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
      setError('कृपया वैध वय प्रविष्ट करा (Please enter a valid age between 5 and 120).');
      return;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    // 2. Validate Address
    if (!trimmedHouse) {
      setError('घर क्र. / इमारत नाव प्रविष्ट करा (Flat / House No. is required).');
      return;
    }

    if (!trimmedStreet) {
      setError('परिसर / रस्ता प्रविष्ट करा (Street / Area / Landmark is required).');
      return;
    }

    if (!trimmedCity) {
      setError('शहर निवडा किंवा प्रविष्ट करा (City is required).');
      return;
    }

    if (!cleanPin || cleanPin.length !== 6) {
      setError('कृपया ६-अंकी पिनकोड प्रविष्ट करा (Please enter a valid 6-digit PIN code).');
      return;
    }

    try {
      setLoading(true);

      // Split Name into First & Last
      const parts = trimmedName.split(/\s+/);
      const firstName = parts[0] || 'Devotee';
      const lastName = parts.slice(1).join(' ') || '';

      // 1. Update Customer Profile on Backend
      await api.updateCustomerProfile({
        firstName,
        lastName,
        city: trimmedCity,
        state: trimmedState,
      });

      // 2. Add Customer Address on Backend
      await api.addAddress({
        fullName: trimmedName,
        phoneNumber: cleanPhone,
        addressLine1: trimmedHouse,
        addressLine2: trimmedStreet,
        city: trimmedCity,
        state: trimmedState,
        pincode: cleanPin,
        isDefault: true,
      });

      // 3. Refresh user profile in Auth context
      await refreshProfile();

      // 4. Proceed directly to DevSutra Homepage!
      onComplete();
    } catch (err: any) {
      setError(err?.message || 'माहिती जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
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
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <Text style={styles.topBarTitle}>Devotee Profile Setup</Text>
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
            <Text style={styles.title}>Welcome to DevSutra</Text>
            <Text style={styles.subtitle}>
              कृपया तुमची माहिती भरा जेणेकरून वैदिक पूजेची व गुरुजींची व्यवस्था सहज होईल.
            </Text>
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
            {/* Section 1: Personal Details */}
            <Text style={styles.sectionHeader}>
              <Ionicons name="person" size={15} color={colors.primary} /> वैयक्तिक माहिती (Personal Details)
            </Text>

            <Input
              label="Full Name (पूर्ण नाव) *"
              placeholder="उदा. राहुल सचिन जोशी"
              value={fullName}
              onChangeText={(val) => {
                setFullName(val);
                setError(null);
              }}
              leftIcon="person-outline"
              autoCapitalize="words"
              editable={!loading}
            />

            {/* Age & Gender Row */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Input
                  label="Age (वय) *"
                  placeholder="उदा. 28"
                  value={age}
                  onChangeText={(val) => {
                    setAge(val.replace(/[^0-9]/g, ''));
                    setError(null);
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                  leftIcon="calendar-outline"
                  editable={!loading}
                />
              </View>

              <View style={{ flex: 1.5 }}>
                <Text style={styles.genderLabel}>Gender (लिंग) *</Text>
                <View style={styles.genderChipsRow}>
                  {(['Male', 'Female', 'Other'] as GenderType[]).map((g) => {
                    const isSelected = gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setGender(g)}
                        style={[styles.genderChip, isSelected && styles.genderChipActive]}
                        activeOpacity={0.8}
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.genderChipText,
                            isSelected && styles.genderChipTextActive,
                          ]}
                        >
                          {g === 'Male' ? 'पुरुष' : g === 'Female' ? 'स्त्री' : 'इतर'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Mobile Number (Read-only / verified) */}
            <View style={{ marginTop: 6, marginBottom: 14 }}>
              <Input
                label="Verified Mobile Number (पडताळलेला नंबर) *"
                placeholder="9876543210"
                value={phoneNumber}
                onChangeText={(val) => setPhoneNumber(val.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                maxLength={10}
                leftIcon="call-outline"
                editable={false}
              />
            </View>

            {/* Section 2: Address Details */}
            <Text style={[styles.sectionHeader, { marginTop: 12 }]}>
              <Ionicons name="home" size={15} color={colors.primary} /> पूजेचा पत्ता (Puja Address)
            </Text>

            <Input
              label="Flat / House / Building (घर क्र. / इमारत) *"
              placeholder="उदा. फ्लॅट ४०२, शिवनेरी हाइट्स"
              value={house}
              onChangeText={(val) => {
                setHouse(val);
                setError(null);
              }}
              leftIcon="home-outline"
              editable={!loading}
            />

            <Input
              label="Area / Street / Landmark (परिसर / रस्ता) *"
              placeholder="उदा. गणपती मंदिरा जवळ, कोथरूड"
              value={street}
              onChangeText={(val) => {
                setStreet(val);
                setError(null);
              }}
              leftIcon="location-outline"
              editable={!loading}
            />

            {/* City & Pincode Row */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Input
                  label="City (शहर) *"
                  placeholder="Pune"
                  value={city}
                  onChangeText={(val) => {
                    setCity(val);
                    setError(null);
                  }}
                  leftIcon="business-outline"
                  editable={!loading}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="PIN Code (पिनकोड) *"
                  placeholder="411038"
                  value={pincode}
                  onChangeText={(val) => {
                    setPincode(val.replace(/[^0-9]/g, ''));
                    setError(null);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  leftIcon="pin-outline"
                  editable={!loading}
                />
              </View>
            </View>

            <Button
              title="Save & Enter DevSutra (माहिती जतन करा)"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              onPress={handleSubmit}
              icon={<Ionicons name="arrow-forward" size={18} color={colors.textWhite} />}
              style={{ marginTop: 20 }}
            />
          </View>

          {/* Security Notice */}
          <View style={styles.securityNote}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.goldDark} />
            <Text style={styles.securityNoteText}>
              तुमची माहिती सुरक्षित ठेवली जाते आणि फक्त पूजा समन्वयासाठी वापरली जाते.
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
    marginBottom: 20,
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
    fontSize: 12.5,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
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
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE4',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  genderChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 4,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#FAFAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  genderChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  genderChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  securityNoteText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
  },
});
