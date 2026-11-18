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
import { Order } from '../../types';
import { Badge } from '../../components/common/Badge';

interface OrderHistoryScreenProps {
  onBack: () => void;
  onExploreStore: () => void;
}

export const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({
  onBack,
  onExploreStore,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getMyOrders();
      setOrders(res || []);
    } catch (e) {
      console.warn('Error fetching orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrderStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Samagri Orders</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your samagri kit orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchOrders();
              }}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="bag-handle-outline" size={38} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
              <Text style={styles.emptySubtitle}>
                You haven&apos;t ordered any puja samagri kits or sacred items yet.
              </Text>
              <TouchableOpacity style={styles.shopBtn} onPress={onExploreStore}>
                <Text style={styles.shopBtnText}>Browse Sacred Samagri</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>
                    Order #{item.id ? item.id.slice(0, 8).toUpperCase() : ''}
                  </Text>
                  <Text style={styles.orderDate}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recently placed'}
                  </Text>
                </View>
                <Badge
                  label={item.status}
                  variant={getOrderStatusVariant(item.status) as any}
                  size="sm"
                />
              </View>

              {/* Items Summary */}
              <View style={styles.itemsBox}>
                {(item.items || []).map((orderItem) => (
                  <View key={orderItem.id} style={styles.orderItemRow}>
                    <Text style={styles.orderItemName} numberOfLines={1}>
                      {orderItem.quantity}x {orderItem.product?.name || 'Samagri Item'}
                    </Text>
                    <Text style={styles.orderItemPrice}>
                      ₹{(orderItem.price || 0) * orderItem.quantity}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>₹{item.totalAmount}</Text>
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
  topBar: {
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
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
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
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemsBox: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderItemName: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
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
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 18,
  },
  shopBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
});
