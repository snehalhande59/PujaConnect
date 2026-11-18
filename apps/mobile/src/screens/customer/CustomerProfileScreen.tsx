import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface CustomerProfileScreenProps {
  onBack?: () => void;
  onNavigateAddresses: () => void;
  onNavigateOrders: () => void;
  onSelectLanguage: () => void;
  onSwitchToPandit: () => void;
}

export const CustomerProfileScreen: React.FC<CustomerProfileScreenProps> = ({
  onBack,
  onNavigateAddresses,
  onNavigateOrders,
  onSelectLanguage,
  onSwitchToPandit,
}) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your DevSutra account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch (e) {
            console.warn('Logout error:', e);
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.safe}>
      {/* Top Header */}
      <View style={[styles.topBar, { paddingTop: headerPaddingTop }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <Text style={styles.topBarTitle}>My Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.userName}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Sacred Devotee'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'devotee@devsutra.com'}</Text>
            {user?.phoneNumber && (
              <Text style={styles.userPhone}>
                <Ionicons name="call-outline" size={12} color={colors.textSecondary} />{' '}
                {user.phoneNumber}
              </Text>
            )}
            <View style={styles.devoteeBadge}>
              <Ionicons name="sparkles" size={12} color={colors.secondary} />
              <Text style={styles.devoteeBadgeText}>Verified DevSutra Member</Text>
            </View>
          </View>
        </View>

        {/* Quick Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account & Addresses</Text>

          <TouchableOpacity style={styles.menuItem} onPress={onNavigateAddresses}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.backgroundLight }]}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>Saved Puja Venues & Addresses</Text>
              <Text style={styles.menuItemSubtitle}>Manage home, office & ancestral addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.borderDark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onNavigateOrders}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="bag-check-outline" size={20} color={colors.secondary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>Samagri Order History</Text>
              <Text style={styles.menuItemSubtitle}>View status of delivered puja items & kits</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.borderDark} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <TouchableOpacity style={styles.menuItem} onPress={onSelectLanguage}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.goldLight }]}>
              <Ionicons name="globe-outline" size={20} color={colors.goldDark} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>App Language / भाषा</Text>
              <Text style={styles.menuItemSubtitle}>English, हिन्दी, मराठी, etc.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.borderDark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onSwitchToPandit}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="school-outline" size={20} color={colors.secondary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>Are You a Vedic Pandit?</Text>
              <Text style={styles.menuItemSubtitle}>Switch to Pandit Partner Portal</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.borderDark} />
          </TouchableOpacity>
        </View>

        {/* Support & Legal */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support & Guarantees</Text>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#166534" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>DevSutra Authentic Vidhi Guarantee</Text>
              <Text style={styles.menuItemSubtitle}>100% verified Purohits & pure havan samagri</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.backgroundLight }]}>
              <Ionicons name="headset-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>Devotee Care Support</Text>
              <Text style={styles.menuItemSubtitle}>support@devsutra.com • 9 AM - 9 PM</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loggingOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutBtnText}>
            {loggingOut ? 'Signing Out...' : 'Sign Out of DevSutra'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DevSutra App v1.0.0 (Vedic Edition)</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  devoteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  devoteeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 20,
  },
});
