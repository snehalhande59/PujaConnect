import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { PanditProfile, Booking } from '../../types';
import { Badge } from '../../components/common/Badge';

interface PanditDashboardScreenProps {
  onNavigateBookings: () => void;
  onNavigateAvailability: () => void;
  onNavigateEarnings: () => void;
  onNavigateVerification: () => void;
  onNavigateProfile: () => void;
}

export const PanditDashboardScreen: React.FC<PanditDashboardScreenProps> = ({
  onNavigateBookings,
  onNavigateAvailability,
  onNavigateEarnings,
  onNavigateVerification,
  onNavigateProfile,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PanditProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [profRes, bookRes] = await Promise.allSettled([
        api.getMyPanditProfile(),
        api.getMyPanditBookings(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value) {
        setProfile(profRes.value);
        setIsAvailable(profRes.value.isAvailable ?? true);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value) {
        setBookings(bookRes.value || []);
      }
    } catch (e) {
      console.warn('Error loading pandit dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAccept = async (id: string) => {
    try {
      setActioningId(id);
      await api.acceptBooking(id);
      Alert.alert('Booking Accepted 🙏', 'You have confirmed this sacred puja booking.');
      loadData();
    } catch (e: any) {
      Alert.alert('Acceptance Error', e.message || 'Could not accept booking.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = (id: string) => {
    Alert.alert('Decline Request', 'Are you sure you cannot conduct this ritual?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          try {
            setActioningId(id);
            await api.rejectBooking(id, 'Pandit unavailable for this Muhurat slot');
            loadData();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not decline booking.');
          } finally {
            setActioningId(null);
          }
        },
      },
    ]);
  };

  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const upcomingConfirmed = bookings.filter((b) => b.status === 'CONFIRMED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  const totalDakshina = completedBookings.reduce(
    (sum, b) => sum + (parseFloat(String(b.totalPrice)) || 0),
    0
  );

  const verificationStatus = profile?.verificationStatus || 'APPROVED';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerProfileBtn} onPress={onNavigateProfile}>
          <View style={styles.avatar}>
            <Ionicons name="school" size={20} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.panditGreeting}>Namaste,</Text>
            <Text style={styles.panditName}>
              Pt. {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Acharya'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Availability Toggle */}
        <View style={styles.availToggleContainer}>
          <Text style={[styles.availText, isAvailable && styles.availTextActive]}>
            {isAvailable ? 'Taking Pujas' : 'Unavailable'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: colors.borderLight, true: colors.secondaryLight }}
            thumbColor={isAvailable ? colors.secondary : colors.borderDark}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.secondary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Verification Alert Banner */}
        {verificationStatus === 'APPROVED' ? (
          <View style={styles.verifiedBanner}>
            <Ionicons name="shield-checkmark" size={20} color="#166534" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.verifiedBannerTitle}>DevSutra Verified Scholar</Text>
              <Text style={styles.verifiedBannerDesc}>
                Your identity & Gurukul credentials are authenticated.
              </Text>
            </View>
          </View>
        ) : verificationStatus === 'REJECTED' ? (
          <View style={styles.rejectedBanner}>
            <Ionicons name="alert-circle" size={24} color={colors.error} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.rejectedBannerTitle}>Verification Action Required</Text>
              <Text style={styles.rejectedBannerDesc}>
                {profile?.rejectionReason || 'Please review and re-upload your Vedic documents.'}
              </Text>
              <TouchableOpacity style={styles.reUploadBtn} onPress={onNavigateVerification}>
                <Text style={styles.reUploadBtnText}>Re-Upload Documents</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={22} color="#92400E" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.pendingBannerTitle}>Verification Pending</Text>
              <Text style={styles.pendingBannerDesc}>
                Our Vedic review panel is reviewing your certificates.
              </Text>
              <TouchableOpacity onPress={onNavigateVerification} style={{ marginTop: 4 }}>
                <Text style={styles.linkText}>View Uploaded Documents →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity style={styles.metricCard} onPress={onNavigateEarnings}>
            <View style={[styles.metricIconBg, { backgroundColor: colors.goldLight }]}>
              <Ionicons name="cash-outline" size={20} color={colors.goldDark} />
            </View>
            <Text style={styles.metricValue}>₹{totalDakshina}</Text>
            <Text style={styles.metricLabel}>Total Dakshina</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} onPress={onNavigateBookings}>
            <View style={[styles.metricIconBg, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="flame-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.metricValue}>{completedBookings.length}</Text>
            <Text style={styles.metricLabel}>Completed Pujas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} onPress={onNavigateBookings}>
            <View style={[styles.metricIconBg, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="notifications-outline" size={20} color="#166534" />
            </View>
            <Text style={[styles.metricValue, { color: colors.secondary }]}>
              {pendingRequests.length}
            </Text>
            <Text style={styles.metricLabel}>New Requests</Text>
          </TouchableOpacity>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconBg, { backgroundColor: colors.backgroundLight }]}>
              <Ionicons name="star" size={20} color="#D97724" />
            </View>
            <Text style={styles.metricValue}>{profile?.rating || '4.9'}</Text>
            <Text style={styles.metricLabel}>Devotee Rating</Text>
          </View>
        </View>

        {/* Pending Ritual Requests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Puja Requests ({pendingRequests.length})</Text>
          <Text style={styles.sectionSubtitle}>
            Awaiting your confirmation for auspicious Muhurat
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.secondary} style={{ marginVertical: 20 }} />
        ) : pendingRequests.length === 0 ? (
          <View style={styles.emptyRequestsCard}>
            <Ionicons name="checkmark-done-circle-outline" size={36} color={colors.secondary} />
            <Text style={styles.emptyRequestsTitle}>No Pending Requests</Text>
            <Text style={styles.emptyRequestsDesc}>
              You are all caught up! New devotee booking requests will appear here.
            </Text>
          </View>
        ) : (
          pendingRequests.map((booking) => {
            const isProcessing = actioningId === booking.id;
            return (
              <View key={booking.id} style={styles.requestCard}>
                <View style={styles.reqTopRow}>
                  <View style={styles.reqIconBg}>
                    <Ionicons name="flame" size={20} color={colors.secondary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.reqPujaTitle}>{booking.puja?.title || 'Vedic Ritual'}</Text>
                    <Text style={styles.reqDevotee}>
                      Devotee:{' '}
                      {booking.customer?.firstName
                        ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
                        : 'Devotee Family'}
                    </Text>
                  </View>
                  <View style={styles.reqPriceBadge}>
                    <Text style={styles.reqPriceText}>₹{booking.totalPrice}</Text>
                  </View>
                </View>

                <View style={styles.reqDivider} />

                <View style={styles.reqMetaRow}>
                  <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.reqMetaText}>
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Date TBD'}{' '}
                    • {booking.timeSlot || 'Morning Muhurat'}
                  </Text>
                </View>

                <View style={styles.reqMetaRow}>
                  <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.reqMetaText} numberOfLines={1}>
                    {booking.address
                      ? `${booking.address.street}, ${booking.address.city}`
                      : 'Address given upon accept'}
                  </Text>
                </View>

                {booking.includeSamagri && (
                  <View style={styles.samagriBadge}>
                    <Ionicons name="gift-outline" size={13} color="#166534" />
                    <Text style={styles.samagriBadgeText}>Devotee requested Samagri Kit</Text>
                  </View>
                )}

                {/* Accept / Decline Action Buttons */}
                <View style={styles.reqActions}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleReject(booking.id)}
                    disabled={isProcessing}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(booking.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color={colors.textWhite} />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={16} color={colors.textWhite} />
                        <Text style={styles.acceptBtnText}>Accept Puja</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Upcoming Confirmed Pujas */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.sectionTitle}>Upcoming Confirmed Pujas</Text>
            <TouchableOpacity onPress={onNavigateBookings}>
              <Text style={styles.linkText}>View All ({upcomingConfirmed.length})</Text>
            </TouchableOpacity>
          </View>
        </View>

        {upcomingConfirmed.slice(0, 3).map((booking) => (
          <View key={booking.id} style={styles.confirmedCard}>
            <View style={styles.confirmedHeader}>
              <Text style={styles.confirmedPuja}>{booking.puja?.title || 'Vedic Ritual'}</Text>
              <Badge label="CONFIRMED" variant="success" size="sm" />
            </View>
            <Text style={styles.confirmedDate}>
              📅{' '}
              {booking.bookingDate
                ? new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Date'}{' '}
              at {booking.timeSlot || 'Muhurat'}
            </Text>
            <Text style={styles.confirmedVenue} numberOfLines={1}>
              📍{' '}
              {booking.address
                ? `${booking.address.street}, ${booking.address.city}`
                : 'Venue Location'}
            </Text>
            <Text style={styles.confirmedDakshina}>Dakshina: ₹{booking.totalPrice}</Text>
          </View>
        ))}

        {/* Quick Nav Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity style={styles.shortcutBtn} onPress={onNavigateAvailability}>
            <Ionicons name="time" size={20} color={colors.secondary} />
            <Text style={styles.shortcutBtnText}>Set Availability</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shortcutBtn} onPress={onNavigateEarnings}>
            <Ionicons name="wallet" size={20} color={colors.secondary} />
            <Text style={styles.shortcutBtnText}>Dakshina Ledger</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panditGreeting: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  panditName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  availToggleContainer: {
    alignItems: 'flex-end',
  },
  availText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  availTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  verifiedBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  verifiedBannerDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  rejectedBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
  rejectedBannerDesc: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  reUploadBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  reUploadBtnText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  pendingBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  pendingBannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metricIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyRequestsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyRequestsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptyRequestsDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  reqTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reqIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqPujaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reqDevotee: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reqPriceBadge: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reqPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.secondary,
  },
  reqDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  reqMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reqMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  samagriBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  samagriBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  reqActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textWhite,
  },
  confirmedCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  confirmedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmedPuja: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  confirmedDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  confirmedVenue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  confirmedDakshina: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
    marginTop: 6,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  shortcutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
