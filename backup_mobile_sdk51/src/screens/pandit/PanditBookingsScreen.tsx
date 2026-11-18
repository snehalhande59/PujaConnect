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

export const PanditBookingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'UPCOMING' | 'COMPLETED'>('REQUESTS');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getMyPanditBookings();
      setBookings(res || []);
    } catch (e) {
      console.warn('Error fetching pandit bookings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      setActioningId(id);
      await api.acceptBooking(id);
      Alert.alert('Booking Accepted 🙏', 'You have confirmed this sacred puja booking.');
      fetchBookings();
    } catch (e: any) {
      Alert.alert('Acceptance Error', e.message || 'Could not accept booking.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = (id: string) => {
    Alert.alert('Decline Request', 'Are you sure you want to decline this puja request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          try {
            setActioningId(id);
            await api.rejectBooking(id, 'Pandit unavailable for this Muhurat slot');
            fetchBookings();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not decline booking.');
          } finally {
            setActioningId(null);
          }
        },
      },
    ]);
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'REQUESTS') return b.status === 'PENDING';
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ritual Bookings</Text>
        <Text style={styles.subtitle}>Manage requested, confirmed & completed pujas</Text>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'REQUESTS' && styles.tabItemActive]}
            onPress={() => setActiveTab('REQUESTS')}
          >
            <Text
              style={[styles.tabLabel, activeTab === 'REQUESTS' && styles.tabLabelActive]}
            >
              Requests ({bookings.filter((b) => b.status === 'PENDING').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'UPCOMING' && styles.tabItemActive]}
            onPress={() => setActiveTab('UPCOMING')}
          >
            <Text
              style={[styles.tabLabel, activeTab === 'UPCOMING' && styles.tabLabelActive]}
            >
              Upcoming ({bookings.filter((b) => b.status === 'CONFIRMED').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'COMPLETED' && styles.tabItemActive]}
            onPress={() => setActiveTab('COMPLETED')}
          >
            <Text
              style={[styles.tabLabel, activeTab === 'COMPLETED' && styles.tabLabelActive]}
            >
              Completed ({bookings.filter((b) => b.status === 'COMPLETED').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Fetching ritual records...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              colors={[colors.secondary]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={44} color={colors.borderDark} />
              <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} bookings</Text>
              <Text style={styles.emptySubtitle}>
                No rituals found matching this status filter.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isProcessing = actioningId === item.id;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="flame" size={20} color={colors.secondary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.pujaTitle}>{item.puja?.title || 'Vedic Ritual'}</Text>
                    <Text style={styles.devoteeName}>
                      Devotee:{' '}
                      {item.customer?.firstName
                        ? `${item.customer.firstName} ${item.customer.lastName || ''}`.trim()
                        : 'Devotee Family'}
                    </Text>
                  </View>
                  <View style={styles.dakshinaBadge}>
                    <Text style={styles.dakshinaText}>₹{item.totalPrice}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.metaText}>
                    {item.bookingDate
                      ? new Date(item.bookingDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Date TBD'}{' '}
                    • {item.timeSlot || 'Morning Muhurat'}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.metaText} numberOfLines={2}>
                    {item.address
                      ? `${item.address.street}, ${item.address.city}`
                      : 'Venue location'}
                  </Text>
                </View>

                {item.includeSamagri && (
                  <View style={styles.samagriPill}>
                    <Ionicons name="gift-outline" size={13} color="#166534" />
                    <Text style={styles.samagriPillText}>
                      Bring Pure DevSutra Samagri Kit (+₹1,500 included)
                    </Text>
                  </View>
                )}

                {/* If Request: Show Accept/Decline Buttons */}
                {item.status === 'PENDING' && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() => handleReject(item.id)}
                      disabled={isProcessing}
                    >
                      <Text style={styles.declineBtnText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(item.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color={colors.textWhite} />
                      ) : (
                        <Text style={styles.acceptBtnText}>Accept Puja</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'CONFIRMED' && (
                  <View style={styles.statusRow}>
                    <Badge label="Awaiting Ritual Date" variant="info" size="sm" />
                  </View>
                )}
              </View>
            );
          }}
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
    paddingTop: 12,
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
    marginBottom: 10,
  },
  tabBar: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.secondary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.secondary,
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
    gap: 12,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pujaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  devoteeName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dakshinaBadge: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dakshinaText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
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
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  samagriPillText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  statusRow: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
