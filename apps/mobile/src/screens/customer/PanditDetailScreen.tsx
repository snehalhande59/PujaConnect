import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { PanditProfile } from '../../types';

interface PanditDetailScreenProps {
  pandit: PanditProfile;
  onBack: () => void;
  onBookPandit: (pandit: PanditProfile) => void;
}

export const PanditDetailScreen: React.FC<PanditDetailScreenProps> = ({
  pandit,
  onBack,
  onBookPandit,
}) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const panditName = pandit.user
    ? `Pt. ${pandit.user.firstName} ${pandit.user.lastName || ''}`.trim()
    : 'Pt. Vedic Scholar';

  return (
    <View style={styles.safe}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: headerPaddingTop }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Pandit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.secondary} />
          </View>

          <Text style={styles.name}>{panditName}</Text>

          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#166534" />
            <Text style={styles.verifiedText}>DevSutra Certified Vedic Purohit</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{pandit.experienceYears || 10}+ Yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Ionicons name="star" size={14} color="#D97724" />
                <Text style={styles.statVal}>{pandit.rating || '4.9'}</Text>
              </View>
              <Text style={styles.statLabel}>{pandit.totalReviews || 18}+ Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{pandit.city}</Text>
              <Text style={styles.statLabel}>{pandit.state || 'India'}</Text>
            </View>
          </View>
        </View>

        {/* Vedic Lineage & Bio */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Vedic Qualifications & Lineage</Text>
          <Text style={styles.bodyText}>
            {pandit.bio ||
              'Formally trained in Vedic mantras, Shodashopachara Vidhi, and sacred rituals with pure Sanskrit pronunciation and deep scriptural understanding.'}
          </Text>
        </View>

        {/* Languages Known */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Languages Chanted & Spoken</Text>
          <View style={styles.chipsRow}>
            {(pandit.languages || ['Hindi', 'Sanskrit', 'Marathi']).map((lang, idx) => (
              <View key={idx} style={styles.chip}>
                <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.secondary} />
                <Text style={styles.chipText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ritual Specializations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Sacred Puja Specializations</Text>
          <View style={styles.chipsRow}>
            {(
              pandit.specializations || [
                'Griha Pravesh',
                'Satyanarayan Katha',
                'Maha Rudrabhishek',
                'Vastu Shanti',
                'Navgrah Havan',
              ]
            ).map((spec, idx) => (
              <View key={idx} style={[styles.chip, styles.chipGold]}>
                <Ionicons name="flame-outline" size={13} color={colors.goldDark} />
                <Text style={[styles.chipText, styles.chipTextGold]}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Assurance Banner */}
        <View style={styles.assuranceCard}>
          <Ionicons name="checkmark-circle" size={22} color="#166534" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.assuranceTitle}>Identity & Gurukul Verified</Text>
            <Text style={styles.assuranceSubtitle}>
              Government ID verified, traditional Gurukul qualifications examined by DevSutra panel.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Starting Dakshina</Text>
          <Text style={styles.bottomPrice}>₹{pandit.basePrice || 2100}</Text>
        </View>
        <TouchableOpacity style={styles.bookCtaBtn} onPress={() => onBookPandit(pandit)}>
          <Text style={styles.bookCtaText}>Book with Pt. {pandit.user?.firstName || 'Pandit'}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 18,
    width: '100%',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.borderLight,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  chipGold: {
    backgroundColor: colors.goldLight,
  },
  chipTextGold: {
    color: colors.goldDark,
  },
  assuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  assuranceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  assuranceSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  bookCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  bookCtaText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
});
