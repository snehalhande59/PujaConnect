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

interface PanditLoginScreenProps {
  onBack: () => void;
  onNavigateRegister: () => void;
  onSwitchToCustomer: () => void;
}

export const PanditLoginScreen: React.FC<PanditLoginScreenProps> = ({
  onBack,
  onNavigateRegister,
  onSwitchToCustomer,
}) => {
  const { loginPandit } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your registered email and password.');
      return;
    }

    try {
      setLoading(true);
      await loginPandit(email, password);
    } catch (e: any) {
      setError(e.message || 'Pandit authentication failed.');
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
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Pandit Partner Portal</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="school" size={28} color={colors.secondary} />
            </View>
            <Text style={styles.title}>Shastri & Acharya Sign In</Text>
            <Text style={styles.subtitle}>
              Access your ritual requests, devotee venue details, and earnings ledger.
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          <View style={styles.formCard}>
            <Input
              label="Registered Pandit Email or Mobile"
              placeholder="pandit@devsutra.com"
              value={email}
              onChangeText={setEmail}
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

            <Button
              title="Sign In to Pandit Portal"
              variant="secondary"
              size="lg"
              loading={loading}
              onPress={handleLogin}
              style={{ marginTop: 8 }}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New Vedic Priest? </Text>
            <TouchableOpacity onPress={onNavigateRegister}>
              <Text style={styles.registerLink}>Apply for Verification</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onSwitchToCustomer} style={styles.switchRoleBtn}>
            <Ionicons name="person-outline" size={16} color={colors.primary} />
            <Text style={styles.switchRoleText}>Are you a Devotee? Switch to Devotee Login</Text>
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
    height: 56,
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
    color: colors.secondary,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginVertical: 18,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondaryLight,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 290,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.25)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: colors.textLight,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    gap: 6,
  },
  switchRoleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
