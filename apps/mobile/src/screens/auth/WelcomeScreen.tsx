import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Button } from '../../components/common/Button';
import { DevSutraLogo } from '../../components/common/DevSutraLogo';

interface WelcomeScreenProps {
  onSelectUser: () => void;
  onLanguagePress?: () => void;
  currentLanguage?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectUser,
  onLanguagePress,
  currentLanguage = 'English',
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Top Hero Banner */}
        <View style={styles.heroSection}>
          {onLanguagePress && (
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
          )}

          <View style={{ marginVertical: 12, alignItems: 'center' }}>
            <DevSutraLogo variant="vertical" size="xl" />
          </View>
          <Text style={styles.mantraText}>॥ ॐ श्री गणेशाय नमः ॥</Text>
          <Text style={styles.brandTagline}>Your Sacred Journey, Simplified.</Text>
          <Text style={styles.heroDesc}>
            India&apos;s premier platform for authentic Vedic rituals, certified pandits & shuddh samagri.
          </Text>
        </View>

        {/* Action Selection Cards - Customer User Entry Only */}
        <View style={styles.cardsSection}>
          <Text style={styles.selectionPrompt}>Welcome to DevSutra</Text>

          {/* Devotee / Customer Single Entry Card */}
          <TouchableOpacity
            style={styles.portalCard}
            activeOpacity={0.9}
            onPress={onSelectUser}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBg, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="person" size={24} color={colors.secondary} />
              </View>
              <View style={styles.cardTextCol}>
                <Text style={styles.cardTitle}>I am User</Text>
                <Text style={styles.cardSubtitle}>
                  Book verified Vedic pandits, personalized rituals & certified samagri for your family.
                </Text>
              </View>
            </View>

            <Button
              title="I am User"
              variant="primary"
              size="lg"
              onPress={onSelectUser}
              icon={<Ionicons name="arrow-forward" size={18} color={colors.textWhite} />}
            />
          </TouchableOpacity>
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
  mantraText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: 6,
  },
  brandTagline: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: '700',
    marginTop: 2,
  },
  heroDesc: {
    fontSize: 12,
    color: 'rgba(255, 248, 236, 0.85)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    maxWidth: 300,
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
    padding: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
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
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: colors.textLight,
    lineHeight: 18,
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
