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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { api } from '../../api/client';
import { Booking } from '../../types';
import { Badge } from '../../components/common/Badge';

interface CustomerBookingsScreenProps {
  onNavigateDetail?: (booking: Booking) => void;
  onExplorePujas: () => void;
}

export const CustomerBookingsScreen: React.FC<CustomerBookingsScreenProps> = ({
  onNavigateDetail,
  onExplorePujas,
}) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
              fetchBookings();
            } catch (e: any) {
              Alert.alert('Cancellation Error', e.message || 'Failed to cancel booking.');
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
        <Text style={styles.title}>My Sacred Bookings</Text>
        <Text style={styles.subtitle}>Track upcoming rituals, pandit assignments & status</Text>

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
                <Text style={styles.panditLabel}>Pandit:</Text>
                <Text style={styles.panditVal}>
                  {item.pandit?.user
                    ? `Pt. ${item.pandit.user.firstName} ${item.pandit.user.lastName || ''}`.trim()
                    : 'Matching Certified Scholar...'}
                </Text>
              </View>

              {/* Date & Time Slot */}
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {item.bookingDate ? new Date(item.bookingDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }) : 'Date TBD'}{' '}
                  • {item.timeSlot || 'Morning Muhurat'}
                </Text>
              </View>

              {/* Venue Address */}
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.address
                    ? `${item.address.street}, ${item.address.city}`
                    : 'Venue specified during booking'}
                </Text>
              </View>

              {/* Samagri Included Pill */}
              {item.includeSamagri && (
                <View style={styles.samagriPill}>
                  <Ionicons name="gift-outline" size={13} color="#166534" />
                  <Text style={styles.samagriPillText}>Complete Pure Samagri Kit Included</Text>
                </View>
              )}

              {/* Bottom Price & Action */}
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.priceLabel}>Total Dakshina</Text>
                  <Text style={styles.priceVal}>₹{item.totalPrice}</Text>
                </View>

                {item.status === 'PENDING' || item.status === 'CONFIRMED' ? (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancelBooking(item.id)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
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
