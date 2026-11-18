import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { APP_IMAGES } from '../../theme/culturalAssets';

interface WalletScreenProps {
  onOpenDrawer?: () => void;
  onOpenNotifications?: () => void;
  onSelectCity?: () => void;
  selectedCity?: string;
  onBookPuja?: () => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  onOpenDrawer,
  onOpenNotifications,
  onSelectCity,
  selectedCity = 'Pune',
  onBookPuja,
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Top App Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={onOpenDrawer}>
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationSelector} onPress={onSelectCity}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.locationText}>{selectedCity}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* DevSutra Mudra Balance Card */}
        <View style={styles.balanceCard}>
          <Image
            source={APP_IMAGES.devsutraMudra}
            style={styles.mudraCoin}
            resizeMode="contain"
          />
          <View style={styles.balanceInfo}>
            <Text style={styles.mudraTitle}>DevSutra Mudra</Text>
            <Text style={styles.mudraBalance}>300</Text>
          </View>
        </View>

        {/* Note banner */}
        <View style={styles.noteBanner}>
          <Text style={styles.noteText}>
            Note: 1 DevSutra Mudra equals 1 Rupee.
          </Text>
        </View>

        {/* Section Heading */}
        <Text style={styles.sectionHeading}>Wallet Activity</Text>

        {/* Activity Card */}
        <View style={styles.activityCard}>
          <View style={styles.activityLeft}>
            <Text style={styles.activityTitle}>Present Offer</Text>
            <Text style={styles.activityDate}>2026-11-17</Text>
            <Text style={styles.activityExpiry}>Expires On : 2027-02-15</Text>
          </View>
          <View style={styles.activityRight}>
            <Text style={styles.creditAmount}>+ 300</Text>
            <Text style={styles.creditStatus}>Amount Credited</Text>
          </View>
        </View>

        {/* DevSutra Mudra Usage Information */}
        <View style={styles.usageGuideCard}>
          <View style={styles.guideHeader}>
            <Ionicons name="sparkles" size={16} color={colors.gold} />
            <Text style={styles.guideTitle}>How to Redeem DevSutra Mudra</Text>
          </View>
          <Text style={styles.guideItem}>
            • Apply your 300 DevSutra Mudras directly at checkout for an instant ₹300 discount.
          </Text>
          <Text style={styles.guideItem}>
            • Valid on all Vedic Pujas, Hawans, and authentic Puja Samagri store kits.
          </Text>
          <Text style={styles.guideItem}>
            • Earn 5% back in DevSutra Mudra on every completed sacred ceremony.
          </Text>

          <TouchableOpacity style={styles.bookCta} onPress={onBookPuja}>
            <Text style={styles.bookCtaText}>Book Puja & Redeem Mudra</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF8EC',
  },
  menuBtn: {
    padding: 6,
    justifyContent: 'space-between',
    height: 22,
    width: 26,
  },
  hamburgerBar: {
    width: 20,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  bellBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 16,
  },
  mudraCoin: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  balanceInfo: {
    justifyContent: 'center',
  },
  mudraTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  mudraBalance: {
    fontSize: 22,
    fontWeight: '800',
    color: '#15803D',
  },
  noteBanner: {
    backgroundColor: '#FFF8EC',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginVertical: 12,
  },
  noteText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 18,
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#FFF8EC',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  activityLeft: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#382820',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 11,
    color: '#735C50',
    marginBottom: 2,
  },
  activityExpiry: {
    fontSize: 11,
    color: '#735C50',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  creditAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 4,
  },
  creditStatus: {
    fontSize: 11,
    color: '#735C50',
  },
  usageGuideCard: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: '#EDE0CB',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  guideItem: {
    fontSize: 11.5,
    lineHeight: 18,
    color: '#5C4A42',
    marginBottom: 6,
  },
  bookCta: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  bookCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
