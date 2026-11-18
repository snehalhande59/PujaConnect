import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Button } from '../../components/common/Button';

interface WelcomeScreenProps {
  onSelectRole: (role: 'CUSTOMER' | 'PANDIT') => void;
  onLanguagePress: () => void;
  currentLanguage?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectRole,
  onLanguagePress,
  currentLanguage = 'English',
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Top Hero Banner */}
        <View style={styles.heroSection}>
          <View style={styles.langRow}>
            <Button
              title={`🌐 ${currentLanguage}`}
              variant="outline"
              size="sm"
              onPress={onLanguagePress}
              style={styles.langBtn}
              textStyle={styles.langBtnText}
            />
          </View>

          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={38} color={colors.gold} />
          </View>
          <Text style={styles.brandTitle}>DevSutra</Text>
          <Text style={styles.brandTagline}>Your Sacred Journey, Simplified.</Text>
          <Text style={styles.heroDesc}>
            India&apos;s premier online puja booking and certified Vedic pandit marketplace.
          </Text>
        </View>

        {/* Action Selection Cards */}
        <View style={styles.cardsSection}>
          <Text style={styles.selectionPrompt}>Choose Your Portal to Continue</Text>

          {/* Devotee / Customer Card */}
          <View style={styles.portalCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="people" size={24} color={colors.secondary} />
              </View>
              <View style={styles.cardTextCol}>
                <Text style={styles.cardTitle}>Devotee / Customer</Text>
                <Text style={styles.cardSubtitle}>
                  Discover rituals, book verified pandits & order complete puja samagri kits.
                </Text>
              </View>
            </View>

            <Button
              title="Continue as Devotee"
              variant="primary"
              size="lg"
              onPress={() => onSelectRole('CUSTOMER')}
              icon={<Ionicons name="arrow-forward" size={18} color={colors.textWhite} />}
            />
          </View>

          {/* Pandit / Acharya Card */}
          <View style={[styles.portalCard, styles.panditCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: colors.goldLight }]}>
                <Ionicons name="school" size={24} color={colors.goldDark} />
              </View>
              <View style={styles.cardTextCol}>
                <Text style={styles.cardTitle}>Vedic Pandit / Shastri</Text>
                <Text style={styles.cardSubtitle}>
                  Accept puja bookings, manage ritual availability & track earnings.
                </Text>
              </View>
            </View>

            <Button
              title="Pandit Partner Portal"
              variant="secondary"
              size="lg"
              onPress={() => onSelectRole('PANDIT')}
              icon={<Ionicons name="shield-checkmark" size={18} color={colors.textWhite} />}
            />
          </View>
        </View>

        {/* Bottom Trust Indicators */}
        <View style={styles.trustFooter}>
          <View style={styles.trustItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.trustText}>Vedic Gurukul Certified</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="cube" size={16} color={colors.success} />
            <Text style={styles.trustText}>100% Shuddh Samagri</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="time" size={16} color={colors.success} />
            <Text style={styles.trustText}>On-Time Gurus</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    backgroundColor: colors.primaryDark,
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  langRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  langBtn: {
    borderColor: 'rgba(255, 248, 236, 0.3)',
    backgroundColor: 'rgba(255, 248, 236, 0.1)',
  },
  langBtnText: {
    color: colors.background,
    fontSize: 11,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(196, 154, 69, 0.15)',
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.background,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: colors.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  heroDesc: {
    fontSize: 12,
    color: 'rgba(255, 248, 236, 0.8)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    maxWidth: 290,
  },
  cardsSection: {
    padding: 20,
    marginTop: -16,
  },
  selectionPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  portalCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  panditCard: {
    borderColor: colors.goldLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 17,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textLight,
  },
});
