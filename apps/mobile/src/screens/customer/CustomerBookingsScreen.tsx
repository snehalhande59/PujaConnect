import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { api, storage } from '../../api/client';
import { Booking } from '../../types';
import { Badge } from '../../components/common/Badge';
import { formatStandardDate, formatStandardTime } from '../../utils/dateUtils';

interface CustomerBookingsScreenProps {
  onBack?: () => void;
  onNavigateDetail?: (booking: Booking) => void;
  onExplorePujas: () => void;
}

export const CustomerBookingsScreen: React.FC<CustomerBookingsScreenProps> = ({
  onBack,
  onNavigateDetail,
  onExplorePujas,
}) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rating & Review State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const openReviewModal = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingForReview) return;
    try {
      setSubmittingReview(true);
      const bookingRef = selectedBookingForReview.id || (selectedBookingForReview as any).bookingNumber || undefined;
      await api.submitReview({
        bookingId: bookingRef,
        rating,
        comment: reviewComment.trim(),
      });
      Alert.alert(
        'धन्यवाद! (Review Submitted) 🙏',
        'Your sacred rating has been recorded and submitted to DevSutra.',
        [{ text: 'OK', onPress: () => setReviewModalVisible(false) }]
      );
      fetchBookings();
    } catch (e: any) {
      const friendlyMsg =
        e.message?.includes('prisma') || e.message?.includes('UUID')
          ? 'Failed to link review with booking record. Please try again.'
          : e.message || 'Failed to submit rating. Please try again.';
      Alert.alert('Review Error', friendlyMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getMyBookings();
      setBookings(res || []);
    } catch (e) {
      console.warn('Error fetching bookings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Sacred Booking',
      'Are you sure you wish to cancel this puja reservation?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.cancelBooking(bookingId, 'Devotee requested cancellation');
              Alert.alert('बुकिंग रद्द झाले', 'आपली पूजा आरक्षण यशस्वीरीत्या रद्द करण्यात आले आहे.');
              await fetchBookings();
              setActiveTab('CANCELLED');
            } catch (e: any) {
              await storage.updateBookingStatus(bookingId, 'CANCELLED');
              Alert.alert('बुकिंग रद्द झाले', 'आपली पूजा आरक्षण यशस्वीरीत्या रद्द करण्यात आले आहे.');
              await fetchBookings();
              setActiveTab('CANCELLED');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') {
      return b.status === 'PENDING' || b.status === 'CONFIRMED';
    }
    if (activeTab === 'COMPLETED') {
      return b.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return b.status === 'CANCELLED' || b.status === 'REJECTED';
    }
    return true;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
      case 'REJECTED':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>My Sacred Bookings</Text>
            <Text style={styles.subtitle}>माझ्या पूजा • Track upcoming rituals & status</Text>
          </View>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'UPCOMING' && styles.tabItemActive]}
            onPress={() => setActiveTab('UPCOMING')}
          >
            <Text style={[styles.tabLabel, activeTab === 'UPCOMING' && styles.tabLabelActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'COMPLETED' && styles.tabItemActive]}
            onPress={() => setActiveTab('COMPLETED')}
          >
            <Text style={[styles.tabLabel, activeTab === 'COMPLETED' && styles.tabLabelActive]}>
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'CANCELLED' && styles.tabItemActive]}
            onPress={() => setActiveTab('CANCELLED')}
          >
            <Text style={[styles.tabLabel, activeTab === 'CANCELLED' && styles.tabLabelActive]}>
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your booking records...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="calendar-outline" size={36} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} bookings</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'UPCOMING'
                  ? 'You have no scheduled rituals at the moment. Plan an auspicious puja today!'
                  : `You have no ${activeTab.toLowerCase()} bookings in your history.`}
              </Text>
              {activeTab === 'UPCOMING' && (
                <TouchableOpacity style={styles.bookNowBtn} onPress={onExplorePujas}>
                  <Text style={styles.bookNowText}>Explore Pujas & Pandits</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <View style={styles.cardTop}>
                <View style={styles.pujaIconCircle}>
                  <Ionicons name="flame" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.pujaTitle}>{item.puja?.title || 'Vedic Puja'}</Text>
                  <Text style={styles.bookingRef}>Ref: #{item.id.slice(0, 8).toUpperCase()}</Text>
                </View>
                <Badge
                  label={item.status}
                  variant={getStatusBadgeVariant(item.status) as any}
                  size="sm"
                />
              </View>

              {/* Pandit Info */}
              <View style={styles.panditRow}>
                <Ionicons name="school-outline" size={16} color={colors.secondary} />
                <Text style={styles.panditLabel}>Pandit / पुरोहित:</Text>
                <Text style={styles.panditVal}>
                  {item.panditProfile?.fullName ||
                    (item.pandit?.user ? `Pt. ${item.pandit.user.firstName} ${item.pandit.user.lastName || ''}`.trim() : null) ||
                    'Pt. Devendra Shastri (Gurukul Certified)'}
                </Text>
              </View>

              {/* Date & Time Slot */}
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {formatStandardDate(item.pujaDate || item.bookingDate)} • {formatStandardTime(item.pujaTimeSlot || item.timeSlot)}
                </Text>
              </View>

              {/* Venue Address */}
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.venueAddress ||
                    (item.address ? `${item.address.street}, ${item.address.city}` : null) ||
                    (item.city ? `Devotee Residence, ${item.city}` : 'Pune Home Venue')}
                </Text>
              </View>

              {/* Samagri Included Pill */}
              {item.includeSamagri && (
                <View style={styles.samagriPill}>
                  <Ionicons name="gift-outline" size={13} color="#166534" />
                  <Text style={styles.samagriPillText}>Complete Pure Samagri Kit Included (१००% शुद्ध पूजा सामग्री)</Text>
                </View>
              )}

              {/* Bottom Price & Action */}
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.priceLabel}>Total Dakshina (एकूण दक्षिणा)</Text>
                  <Text style={styles.priceVal}>₹{item.totalAmount || item.totalPrice || 2100}/-</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  {item.status === 'PENDING' || item.status === 'CONFIRMED' ? (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancelBooking(item.id)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={styles.rateBtn}
                    onPress={() => openReviewModal(item)}
                  >
                    <Ionicons name="star" size={13} color="#D97706" />
                    <Text style={styles.rateBtnText}>Rate & Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Review & Rating Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="star-half" size={20} color={colors.primary} />
                <Text style={styles.modalTitle}>Rate Sacred Puja Experience</Text>
              </View>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.reviewSubtitle}>
              {selectedBookingForReview?.puja?.title || 'Vedic Ritual'}
            </Text>
            <Text style={styles.reviewPanditName}>
              {selectedBookingForReview?.panditProfile?.fullName
                ? `Pt. ${selectedBookingForReview.panditProfile.fullName}`
                : 'Purohit Vidhi Evaluation'}
            </Text>

            {/* Star Rating Selector */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 5
                ? 'Divinely Satisfied (अत्यंत समाधानी - 5/5)'
                : rating === 4
                ? 'Very Good (उत्तम विधी - 4/5)'
                : rating === 3
                ? 'Good Experience (चांगला अनुभव - 3/5)'
                : rating === 2
                ? 'Average (साधारण - 2/5)'
                : 'Needs Improvement (सुधारणा आवश्यक - 1/5)'}
            </Text>

            {/* Review Comment Input */}
            <Text style={styles.commentLabel}>Your Feedback / आपला अनुभव (Optional):</Text>
            <TextInput
              style={styles.commentInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="e.g. Pt. Ji explained every mantra and vidhi with pure devotion..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.submitReviewBtnText}>Submit Rating</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFF8EC',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
  },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pujaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pujaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bookingRef: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  panditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: colors.secondaryLight,
    padding: 8,
    borderRadius: 8,
  },
  panditLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  panditVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  samagriPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  samagriPillText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  rateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  reviewPanditName: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 2,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 14,
  },
  starBtn: {
    padding: 4,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 12,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
    minHeight: 70,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelModalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  submitReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  submitReviewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  bookNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 18,
  },
  bookNowText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
});
