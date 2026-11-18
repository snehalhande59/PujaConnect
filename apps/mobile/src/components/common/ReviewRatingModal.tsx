import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ReviewRatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess?: (review: { rating: number; comment: string; authorName: string }) => void;
}

export const ReviewRatingModal: React.FC<ReviewRatingModalProps> = ({
  visible,
  onClose,
  onSubmitSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const [rating, setRating] = useState<number>(5);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Pune');
  const [pujaName, setPujaName] = useState('सत्यनारायण पूजा');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('माहिती आवश्यक', 'कृपया आपले नाव प्रविष्ट करा.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('अभिप्राय आवश्यक', 'कृपया आपला पूजेचा अनुभव लिहा.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'धन्यवाद! 🙏',
        'आपला अभिप्राय व रेटिंग यशस्वीरीत्या जतन केले गेले आहे.',
        [
          {
            text: 'ठीक आहे',
            onPress: () => {
              if (onSubmitSuccess) {
                onSubmitSuccess({ rating, comment, authorName: `${name} (${city})` });
              }
              setName('');
              setComment('');
              onClose();
            },
          },
        ]
      );
    }, 600);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.safe}>
        <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>आपला अनुभव शेअर करा</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topCard}>
            <Ionicons name="star" size={32} color={colors.gold} />
            <Text style={styles.cardHeading}>पूजा व पुरोहित सेवा रेटिंग</Text>
            <Text style={styles.cardSub}>
              आपला अनुभव इतर भक्तांना योग्य वैदिक पुरोहित निवडण्यास मदत करतो.
            </Text>

            {/* Interactive 5-Star Selection */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={38}
                    color={star <= rating ? '#EAB308' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 5 ? 'उत्कृष्ट व शास्त्रोक्त विधी (५ / ५)' : `${rating} स्टार रेटिंग`}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.label}>आपले नाव (Your Full Name) *</Text>
            <TextInput
              style={styles.input}
              placeholder="उदा. राहुल देशमुख"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>शहर (City)</Text>
            <TextInput
              style={styles.input}
              placeholder="उदा. पुणे / मुंबई / नाशिक"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.label}>झालेली पूजा (Puja Name)</Text>
            <TextInput
              style={styles.input}
              placeholder="उदा. सत्यनारायण पूजा / वास्तु शांती"
              placeholderTextColor="#94A3B8"
              value={pujaName}
              onChangeText={setPujaName}
            />

            <Text style={styles.label}>आपला पूजेचा अनुभव (Your Review & Feedback) *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="गुरुजींचे उच्चार, वेळेवर आगमन व पूजेचा एकूण पवित्र अनुभव कसा वाटला?"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'जतन करत आहे...' : 'रेटिंग व पुनरावलोकन सबमिट करा'}
              </Text>
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF8EC',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0CB',
  },
  backBtn: {
    padding: 6,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE2CE',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },
  cardSub: {
    fontSize: 12,
    color: '#78655A',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starBtn: {
    padding: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginTop: 4,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE2CE',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B2A20',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FAF5ED',
    borderWidth: 1,
    borderColor: '#E2D5C3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
