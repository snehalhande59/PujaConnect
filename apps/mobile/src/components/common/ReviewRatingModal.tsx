import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { api } from '../../api/client';
import { Booking } from '../../types';

interface ReviewRatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess?: (review: { rating: number; comment: string; authorName: string }) => void;
  defaultBooking?: Booking | null;
}

export const ReviewRatingModal: React.FC<ReviewRatingModalProps> = ({
  visible,
  onClose,
  onSubmitSuccess,
  defaultBooking = null,
}) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const [rating, setRating] = useState<number>(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(defaultBooking?.id || null);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (visible) {
      setRating(5);
      setComment('');
      if (defaultBooking) {
        setSelectedBookingId(defaultBooking.id);
      } else {
        // Fetch user's completed or existing bookings
        setLoadingBookings(true);
        api.getMyBookings()
          .then((bks) => {
            if (Array.isArray(bks) && bks.length > 0) {
              setUserBookings(bks);
              setSelectedBookingId(bks[0].id);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingBookings(false));
      }
    }
  }, [visible, defaultBooking]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('अभिप्राय आवश्यक', 'कृपया आपला पूजेचा अनुभव किंवा अभिप्राय प्रविष्ट करा.');
      return;
    }

    try {
      setSubmitting(true);
      // Submit actual rating and comment to PostgreSQL database
      await api.submitReview({
        bookingId: selectedBookingId || undefined,
        rating,
        comment: comment.trim(),
        authorName: name.trim() || undefined,
      });

      Alert.alert(
        'धन्यवाद! 🙏',
        `आपले ${rating}-स्टार रेटिंग व अभिप्राय यशस्वीरीत्या डेटाबेसमध्ये जतन झाले आहे.`,
        [
          {
            text: 'ठीक आहे',
            onPress: () => {
              if (onSubmitSuccess) {
                onSubmitSuccess({
                  rating,
                  comment: comment.trim(),
                  authorName: name.trim() || 'वेदमित्र भाविक',
                });
              }
              setName('');
              setComment('');
              onClose();
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(
        'रेटिंग त्रुटी',
        e?.message || 'रेटिंग सबमिट करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.'
      );
    } finally {
      setSubmitting(false);
    }
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
                    size={36}
                    color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 5
                ? 'अत्यंत समाधानी (5 / 5 ⭐)'
                : rating === 4
                ? 'उत्तम विधी व अनुभव (4 / 5 ⭐)'
                : rating === 3
                ? 'चांगला अनुभव (3 / 5 ⭐)'
                : rating === 2
                ? 'साधारण अनुभव (2 / 5 ⭐)'
                : 'सुधारणा आवश्यक (1 / 5 ⭐)'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {userBookings.length > 0 && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>कोणत्या पूजेचा अनुभव आहे? (Select Ceremony):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bookingPillRow}>
                  {userBookings.map((b) => {
                    const isSelected = selectedBookingId === b.id;
                    return (
                      <TouchableOpacity
                        key={b.id}
                        onPress={() => setSelectedBookingId(b.id)}
                        style={[styles.bookingPill, isSelected && styles.bookingPillActive]}
                      >
                        <Text style={[styles.bookingPillText, isSelected && styles.bookingPillTextActive]}>
                          {b.puja?.title || 'वेदिक पूजा'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>आपले नाव (Name - Optional):</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="उदा. राहुल जोशी"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>आपला सविस्तर अनुभव व प्रतिक्रिया (Comment):</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={comment}
                onChangeText={setComment}
                placeholder="उदा. गुरुजी वेळेवर आले, सर्व मंत्रोच्चार स्पष्ट व शास्त्रोक्त होते. पूजा अतिशय शांततेत पार पडली..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>रेटिंग व अभिप्राय सबमिट करा</Text>
                </>
              )}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1E5D1',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#832812',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3E8D8',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  starBtn: {
    padding: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3E8D8',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  bookingPillRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bookingPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  bookingPillActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  bookingPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  bookingPillTextActive: {
    color: '#92400E',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#832812',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
