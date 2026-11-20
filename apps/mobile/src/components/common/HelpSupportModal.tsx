import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const callPhone = (number: string) => {
    Linking.openURL(`tel:${number}`).catch((err) => console.warn('Could not call:', err));
  };

  const openWhatsApp = (number: string) => {
    Linking.openURL(`https://wa.me/${number}`).catch((err) => console.warn('Could not open WhatsApp:', err));
  };

  const sendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch((err) => console.warn('Could not send email:', err));
  };

  const faqs = [
    {
      q: 'How are DevSutra Pandits verified?',
      a: 'Every Pandit undergoes strict identity background verification, Gurukul credential checks, and oral Sanskrit recitation assessments before being onboarded.',
    },
    {
      q: 'Is puja samagri included in the booking?',
      a: 'Yes, our packages provide end-to-end service with all necessary 100% pure, temple-grade ceremonial samagri included.',
    },
    {
      q: 'Can I choose my preferred regional language?',
      a: 'Yes! You can choose Pandits fluent in Marathi, Hindi, Sanskrit, Gujarati, Telugu, Tamil, and Kannada during checkout.',
    },
    {
      q: 'What is Puja Mudra and how does it work?',
      a: '1 Puja Mudra is equal to 1 Rupee. You can use your Mudras directly at checkout for an instant discount on your booking dakshina.',
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
            <Text style={styles.headerTitle}>DevSutra Seva & Support</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Quick Contact Options */}
            <Text style={styles.sectionHeading}>Contact Devotee Helpline</Text>

            <View style={styles.contactRow}>
              {/* Call */}
              <TouchableOpacity
                style={styles.contactCard}
                activeOpacity={0.8}
                onPress={() => callPhone('+919822012345')}
              >
                <View style={[styles.contactIconCircle, { backgroundColor: '#EBF5FF' }]}>
                  <Ionicons name="call" size={22} color="#1D4ED8" />
                </View>
                <Text style={styles.contactCardTitle}>Call Seva</Text>
                <Text style={styles.contactCardSubtitle}>+91 98220 12345</Text>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity
                style={styles.contactCard}
                activeOpacity={0.8}
                onPress={() => openWhatsApp('919822012345')}
              >
                <View style={[styles.contactIconCircle, { backgroundColor: '#EAF8EE' }]}>
                  <Ionicons name="logo-whatsapp" size={22} color="#16A34A" />
                </View>
                <Text style={styles.contactCardTitle}>WhatsApp</Text>
                <Text style={styles.contactCardSubtitle}>Instant Support</Text>
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                style={styles.contactCard}
                activeOpacity={0.8}
                onPress={() => sendEmail('support@devsutra.in')}
              >
                <View style={[styles.contactIconCircle, { backgroundColor: '#FFF8EC' }]}>
                  <Ionicons name="mail" size={22} color={colors.primary} />
                </View>
                <Text style={styles.contactCardTitle}>Email Seva</Text>
                <Text style={styles.contactCardSubtitle}>support@devsutra.in</Text>
              </TouchableOpacity>
            </View>

            {/* Operating Hours Banner */}
            <View style={styles.hoursBanner}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={styles.hoursText}>
                Seva Desk Hours: 7:00 AM – 10:00 PM IST (Mon to Sun)
              </Text>
            </View>

            {/* FAQs */}
            <Text style={[styles.sectionHeading, { marginTop: 24 }]}>
              Frequently Asked Questions
            </Text>

            <View style={styles.faqList}>
              {faqs.map((faq, idx) => (
                <View key={idx} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>Q. {faq.q}</Text>
                  <Text style={styles.faqAnswer}>{faq.a}</Text>
                </View>
              ))}
            </View>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE0CB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  contactIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#382820',
    marginBottom: 2,
  },
  contactCardSubtitle: {
    fontSize: 9.5,
    color: '#735C50',
    textAlign: 'center',
  },
  hoursBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EDE0CB',
  },
  hoursText: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '600',
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDE0CB',
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 11.5,
    color: '#5C4A42',
    lineHeight: 17,
  },
});
