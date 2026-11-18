import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { PanditProfile } from '../../types';

interface PanditProfileScreenProps {
  onNavigateVerification: () => void;
  onNavigateAvailability: () => void;
  onNavigateEarnings: () => void;
}

export const PanditProfileScreen: React.FC<PanditProfileScreenProps> = ({
  onNavigateVerification,
  onNavigateAvailability,
  onNavigateEarnings,
}) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<PanditProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api.getMyPanditProfile()
      .then((p) => setProfile(p))
      .catch((e) => console.warn('Could not load pandit profile:', e));
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your Pandit Partner account?', [
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

  const isVerified =
    profile?.verificationStatus === 'VERIFIED' || profile?.verificationStatus === 'APPROVED';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="school" size={38} color={colors.secondary} />
          </View>
          <Text style={styles.name}>
            Pt. {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Vedic Acharya'}
          </Text>
          <Text style={styles.email}>{user?.email || 'pandit@devsutra.com'}</Text>
          <Text style={styles.location}>
            {profile?.city || 'Pune'}, {profile?.state || 'Maharashtra'}
          </Text>

          <View
            style={[
              styles.statusBadge,
              isVerified ? styles.statusApproved : styles.statusPending,
            ]}
          >
            <Ionicons
              name={isVerified ? 'shield-checkmark' : 'time-outline'}
              size={14}
              color={isVerified ? '#166534' : '#92400E'}
            />
            <Text
              style={[
                styles.statusText,
                isVerified ? styles.statusApprovedText : styles.statusPendingText,
              ]}
            >
              {isVerified ? 'Certified DevSutra Purohit' : 'Verification Under Review'}
            </Text>
          </View>
        </View>

        {/* Vedic Credentials Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Vedic Qualifications</Text>

          <View style={styles.credRow}>
            <Text style={styles.credLabel}>Experience:</Text>
            <Text style={styles.credVal}>{profile?.experienceYears || 10}+ Years in Vedic Vidhi</Text>
          </View>

          <View style={styles.credRow}>
            <Text style={styles.credLabel}>Base Dakshina:</Text>
            <Text style={[styles.credVal, { color: colors.secondary, fontWeight: '800' }]}>
              ₹{profile?.basePrice || 2100}
            </Text>
          </View>

          <View style={styles.credRow}>
            <Text style={styles.credLabel}>Languages:</Text>
            <Text style={styles.credVal}>
              {(profile?.languages || ['Hindi', 'Sanskrit', 'Marathi']).join(', ')}
            </Text>
          </View>

          <View style={styles.credRow}>
            <Text style={styles.credLabel}>Gotra / Lineage:</Text>
            <Text style={styles.credVal}>Shukla Yajurveda / Gurukul Lineage</Text>
          </View>
        </View>

        {/* Quick Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={onNavigateVerification}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.secondary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>Verification Documents</Text>
              <Text style={styles.menuItemSubtitle}>Aadhaar, PAN & Gurukul certificates</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.borderDark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onNavigateAvailability}>
            <View style={[styles.menuIconBg, { backgroundColor: colors.goldLight }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.goldDark} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>Schedule & Muhurat Availability</Text>
              <Text style={styles.menuItemSubtitle}>Set working days and operational radius</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.borderDark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onNavigateEarnings}>
            <View style={[styles.menuIconBg, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="wallet-outline" size={20} color="#166534" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuItemTitle}>Dakshina Ledger & Bank Account</Text>
              <Text style={styles.menuItemSubtitle}>View direct bank transfers and payouts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.borderDark} />
          </TouchableOpacity>
        </View>

        {/* Support Helpdesk */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Purohit Partner Support</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <Ionicons name="call-outline" size={18} color={colors.secondary} />
            <Text style={styles.supportText}>Partner Helpline: +91 800-DEVSUTRA</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <Ionicons name="mail-outline" size={18} color={colors.secondary} />
            <Text style={styles.supportText}>pandit-care@devsutra.com</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loggingOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutBtnText}>
            {loggingOut ? 'Signing Out...' : 'Sign Out of Partner Portal'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DevSutra Pandit Portal v1.0.0 (Vedic Edition)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusApprovedText: {
    color: '#166534',
  },
  statusPendingText: {
    color: '#92400E',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  credLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  credVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  supportText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
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
    marginTop: 10,
  },
});
