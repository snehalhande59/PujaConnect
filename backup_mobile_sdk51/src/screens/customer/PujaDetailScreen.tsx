import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Puja } from '../../types';
import { Badge } from '../../components/common/Badge';

interface PujaDetailScreenProps {
  puja: Puja;
  onBack: () => void;
  onBookNow: (puja: Puja) => void;
}

export const PujaDetailScreen: React.FC<PujaDetailScreenProps> = ({
  puja,
  onBack,
  onBookNow,
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {puja.title}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="flame" size={44} color={colors.gold} />
          </View>
          <Text style={styles.heroTitle}>{puja.title}</Text>
          <Text style={styles.categoryName}>
            {puja.category?.name || 'Sacred Vedic Sanskar'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="time-outline" size={16} color={colors.secondary} />
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{puja.durationMinutes || 120} Mins</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Ionicons name="cash-outline" size={16} color={colors.primary} />
              <Text style={styles.statLabel}>Starting Dakshina</Text>
              <Text style={styles.statValue}>₹{puja.basePrice}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#166534" />
              <Text style={styles.statLabel}>Vedic Vidhi</Text>
              <Text style={styles.statValue}>100% Certified</Text>
            </View>
          </View>
        </View>

        {/* Significance & Vidhi Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Spiritual Significance</Text>
          <Text style={styles.bodyText}>
            {puja.description ||
              'This sacred ceremony invokes the cosmic blessings of the divine deities, purifying your living environment and harmonizing planetary influences according to classical Vedic scriptures.'}
          </Text>
        </View>

        {/* Key Ritual Steps Performed */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Key Rituals Included in Vidhi</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Sankalpa & Kalash Sthapana</Text>
                <Text style={styles.stepDesc}>
                  Devotee sankalpa invoking gotra, family names and auspicious intentions.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Shodashopachara Pujan</Text>
                <Text style={styles.stepDesc}>
                  16-step traditional Vedic worship with flower garlands, sandalwood & dhoop.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Sacred Vedic Havan / Homam</Text>
                <Text style={styles.stepDesc}>
                  Ahuti of pure cow ghee, medicinal herbs and navdhanya into sacred Agni.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Maha Aarti & Vedic Ashirwad</Text>
                <Text style={styles.stepDesc}>
                  Final Mangal Aarti, distribution of sacred prasad and pandit blessings.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Samagri Inclusions Note */}
        <View style={styles.samagriNoteCard}>
          <Ionicons name="gift-outline" size={24} color={colors.secondary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.samagriNoteTitle}>Samagri Kit Option</Text>
            <Text style={styles.samagriNoteDesc}>
              You can choose to bring your own ingredients or add a complete 100% pure DevSutra Samagri Kit during booking.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Dakshina</Text>
          <Text style={styles.bottomPrice}>₹{puja.basePrice}</Text>
        </View>
        <TouchableOpacity style={styles.bookCtaBtn} onPress={() => onBookNow(puja)}>
          <Text style={styles.bookCtaText}>Book This Puja</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  heroCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textWhite,
    textAlign: 'center',
  },
  categoryName: {
    fontSize: 13,
    color: colors.goldLight,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepsList: {
    gap: 14,
  },
  stepItem: {
    flexDirection: 'row',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  samagriNoteCard: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
    marginBottom: 16,
  },
  samagriNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  samagriNoteDesc: {
    fontSize: 11,
    color: colors.textPrimary,
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
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  bookCtaText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
