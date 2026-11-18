import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { api } from '../../api/client';
import { Booking } from '../../types';

interface PanditEarningsScreenProps {
  onBack?: () => void;
}

export const PanditEarningsScreen: React.FC<PanditEarningsScreenProps> = ({ onBack }) => {
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await api.getMyPanditBookings();
      const completed = (res || []).filter((b) => b.status === 'COMPLETED');
      setCompletedBookings(completed);
    } catch (e) {
      console.warn('Error fetching earnings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const totalDakshina = completedBookings.reduce(
    (sum, b) => sum + (parseFloat(String(b.totalPrice)) || 0),
    0
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Dakshina Ledger & Payouts</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={completedBookings}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchEarnings();
            }}
            colors={[colors.secondary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Total Balance Card */}
            <View style={styles.earningsHero}>
              <Text style={styles.heroSub}>Total Sacred Dakshina Received</Text>
              <Text style={styles.heroAmount}>₹{totalDakshina}</Text>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{completedBookings.length}</Text>
                  <Text style={styles.heroStatLabel}>Pujas Completed</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>100%</Text>
                  <Text style={styles.heroStatLabel}>Payout Direct to Bank</Text>
                </View>
              </View>
            </View>

            {/* Bank Account Details Card */}
            <View style={styles.bankCard}>
              <View style={styles.bankIconBg}>
                <Ionicons name="business-outline" size={20} color={colors.secondary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.bankTitle}>Verified Bank Account Connected</Text>
                <Text style={styles.bankSubtitle}>HDFC Bank ••••••4091 (Active)</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Verified</Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>Completed Ritual Transactions</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 30 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={44} color={colors.borderDark} />
              <Text style={styles.emptyTitle}>No Completed Rituals Yet</Text>
              <Text style={styles.emptySubtitle}>
                When you accept and complete puja bookings for devotees, your dakshina will be
                logged here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.txCard}>
            <View style={styles.txIconBg}>
              <Ionicons name="arrow-down" size={16} color="#166534" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.txTitle}>{item.puja?.title || 'Vedic Ceremony'}</Text>
              <Text style={styles.txDevotee}>
                Devotee:{' '}
                {item.customer?.firstName
                  ? `${item.customer.firstName} ${item.customer.lastName || ''}`.trim()
                  : 'Devotee Family'}
              </Text>
              <Text style={styles.txDate}>
                {item.bookingDate
                  ? new Date(item.bookingDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Date'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.txAmount}>+ ₹{item.totalPrice}</Text>
              <Text style={styles.txStatus}>Settled</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  headerContainer: {
    marginBottom: 8,
  },
  earningsHero: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  heroSub: {
    fontSize: 12,
    color: colors.goldLight,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textWhite,
    marginVertical: 6,
  },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-around',
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textWhite,
  },
  heroStatLabel: {
    fontSize: 10,
    color: colors.backgroundLight,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  bankIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bankSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  txIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  txDevotee: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txDate: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
  txStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
