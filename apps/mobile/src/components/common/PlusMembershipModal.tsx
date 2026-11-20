import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface PlusMembershipModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PlusMembershipModal: React.FC<PlusMembershipModalProps> = ({
  visible,
  onClose,
  onUpgrade,
}) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;
  const benefits = [
    {
      icon: 'sparkles',
      title: 'Flat 10% Off on Every Puja',
      desc: 'Instant savings on all regular, festive, and hawan bookings throughout the year.',
    },
    {
      icon: 'time',
      title: 'Priority Pandit Assignment',
      desc: 'Top-rated Vedic Gurukul Acharyas assigned within 2 hours of booking.',
    },
    {
      icon: 'calendar',
      title: 'Free Auspicious Muhurat Consultation',
      desc: 'Direct telephonic consultation with senior astrologers for dates and nakshatras.',
    },
    {
      icon: 'gift',
      title: 'Double Puja Mudra Cashback',
      desc: 'Earn 10% Puja Mudras on each completed ceremony, redeemable for cash off.',
    },
    {
      icon: 'shield-checkmark',
      title: 'Free Consecrated Ganga Jal & Prasad',
      desc: 'Complimentary temple sanctified Prasad box delivered with doorstep samagri.',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.safe}>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.logoBadgeBox}>
              <Text style={styles.brandTitle}>devsutra</Text>
              <View style={styles.plusPill}>
                <Text style={styles.plusPillText}>Plus</Text>
              </View>
            </View>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Membership Card */}
            <View style={styles.membershipCard}>
              <View style={styles.cardRibbon}>
                <Text style={styles.cardRibbonText}>SACRED DEVOTEE PASS</Text>
              </View>

              <Text style={styles.planName}>DevSutra Plus Annual</Text>
              <Text style={styles.planPrice}>₹999 / year</Text>
              <Text style={styles.planSubtitle}>
                Save up to ₹8,500 annually across family pujas, havans, and consecrated samagri.
              </Text>
            </View>

            {/* Benefits List */}
            <Text style={styles.benefitsHeading}>Exclusive Membership Privileges</Text>

            <View style={styles.benefitsList}>
              {benefits.map((b, idx) => (
                <View key={idx} style={styles.benefitItem}>
                  <View style={styles.benefitIconCircle}>
                    <Ionicons name={b.icon as any} size={20} color={colors.gold} />
                  </View>
                  <View style={styles.benefitTextCol}>
                    <Text style={styles.benefitTitle}>{b.title}</Text>
                    <Text style={styles.benefitDesc}>{b.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Subscribe CTA */}
            <TouchableOpacity
              style={styles.subscribeBtn}
              activeOpacity={0.85}
              onPress={() => {
                onUpgrade();
                onClose();
              }}
            >
              <Text style={styles.subscribeBtnText}>Join DevSutra Plus • ₹999/Year</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0CB',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 4,
  },
  logoBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  plusPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  membershipCard: {
    backgroundColor: '#7B2635',
    borderRadius: 16,
    padding: 22,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  cardRibbon: {
    alignSelf: 'flex-start',
    backgroundColor: '#C49A45',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  cardRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFE26B',
    marginBottom: 8,
  },
  planSubtitle: {
    fontSize: 12,
    color: '#EDE0CB',
    lineHeight: 18,
  },
  benefitsHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 16,
    marginBottom: 28,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    gap: 12,
  },
  benefitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#382820',
    marginBottom: 3,
  },
  benefitDesc: {
    fontSize: 11,
    color: '#735C50',
    lineHeight: 16,
  },
  subscribeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
