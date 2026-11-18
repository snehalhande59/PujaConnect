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
import { useAuth } from '../../context/AuthContext';

interface PanditRegisterScreenProps {
  onBack: () => void;
  onNavigateLogin: () => void;
}

const AVAILABLE_LANGUAGES = [
  'Hindi',
  'Sanskrit',
  'Marathi',
  'Gujarati',
  'Telugu',
  'Tamil',
  'Bengali',
  'English',
];

const AVAILABLE_SPECIALIZATIONS = [
  'Griha Pravesh',
  'Maha Rudrabhishek',
  'Satyanarayan Katha',
  'Vastu Shanti',
  'Maha Mrityunjaya',
  'Ganesh Puja',
  'Vivah Sanskar',
  'Navgrah Shanti',
  'Havan & Yagya',
  'Kundali & Astrology',
];

export const PanditRegisterScreen: React.FC<PanditRegisterScreenProps> = ({
  onBack,
  onNavigateLogin,
}) => {
  const { registerPandit } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [experienceYears, setExperienceYears] = useState('10');
  const [basePrice, setBasePrice] = useState('2100');
  const [bio, setBio] = useState('');

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi', 'Sanskrit']);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([
    'Griha Pravesh',
    'Satyanarayan Katha',
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) {
      if (selectedSpecializations.length > 1) {
        setSelectedSpecializations(selectedSpecializations.filter((s) => s !== spec));
      }
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!fullName.trim()) {
      setError('Please provide your full Vedic scholar / Pandit name.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Mobile phone number is required for booking alerts.');
      return;
    }
    if (!city.trim()) {
      setError('Please specify your operational city (e.g. Pune, Mumbai).');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await registerPandit({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        city: city.trim(),
        state: state.trim(),
        experienceYears: parseInt(experienceYears, 10) || 5,
        basePrice: parseFloat(basePrice) || 2100,
        languages: selectedLanguages,
        specializations: selectedSpecializations,
        bio: bio.trim() || `Certified Vedic Pandit specializing in traditional rituals with authentic Vidhi.`,
      });
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please check details.');
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
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Pandit Registration</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="school" size={26} color={colors.secondary} />
            </View>
            <Text style={styles.title}>Join Pandit Partner Network</Text>
            <Text style={styles.subtitle}>
              Connect with thousands of devotees, manage authentic puja bookings & receive sacred dakshina.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.sectionHeading}>1. Personal & Contact Details</Text>

            <Input
              label="Full Name with Title"
              placeholder="e.g. Pt. Ramesh Shastri"
              value={fullName}
              onChangeText={setFullName}
              leftIcon="person-outline"
            />

            <Input
              label="Email Address"
              placeholder="shastri@devsutra.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Mobile Number"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              leftIcon="call-outline"
            />

            <Input
              label="Password (min 8 characters)"
              placeholder="••••••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />

            <Text style={[styles.sectionHeading, { marginTop: 16 }]}>2. Vedic Experience & Location</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="Operational City"
                  placeholder="e.g. Pune"
                  value={city}
                  onChangeText={setCity}
                  leftIcon="location-outline"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label="State"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChangeText={setState}
                  leftIcon="map-outline"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="Experience (Yrs)"
                  placeholder="10"
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  keyboardType="numeric"
                  leftIcon="time-outline"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label="Base Dakshina (₹)"
                  placeholder="2100"
                  value={basePrice}
                  onChangeText={setBasePrice}
                  keyboardType="numeric"
                  leftIcon="cash-outline"
                />
              </View>
            </View>

            {/* Languages Multi-Select */}
            <Text style={styles.fieldLabel}>Languages You Can Chant & Converse In</Text>
            <View style={styles.chipsContainer}>
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => toggleLanguage(lang)}
                    style={[styles.chip, isSelected && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {isSelected ? `✓ ${lang}` : lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Specializations Multi-Select */}
            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Rituals & Puja Specializations</Text>
            <View style={styles.chipsContainer}>
              {AVAILABLE_SPECIALIZATIONS.map((spec) => {
                const isSelected = selectedSpecializations.includes(spec);
                return (
                  <TouchableOpacity
                    key={spec}
                    onPress={() => toggleSpecialization(spec)}
                    style={[styles.chip, isSelected && styles.chipActiveSecondary]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActiveSecondary]}>
                      {isSelected ? `✓ ${spec}` : spec}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Vedic Bio / Gurukul Background"
              placeholder="Write a brief overview of your Vedic lineage, education and expertise..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              style={{ height: 80, marginTop: 12 }}
            />

            <Button
              title={loading ? 'Registering...' : 'Register as Verified Pandit'}
              variant="secondary"
              size="lg"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: 20 }}
            />
          </View>

          {/* Bottom Login Link */}
          <View style={styles.bottomBar}>
            <Text style={styles.bottomText}>Already registered as a Pandit?</Text>
            <TouchableOpacity onPress={onNavigateLogin}>
              <Text style={styles.loginLink}>Sign In Here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorBoxText: {
    color: colors.error,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  chipActiveSecondary: {
    backgroundColor: colors.goldLight,
    borderColor: colors.goldDark,
  },
  chipTextActiveSecondary: {
    color: colors.goldDark,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  bottomText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
});
