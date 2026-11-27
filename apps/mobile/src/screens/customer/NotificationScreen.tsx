import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { APP_IMAGES } from '../../theme/culturalAssets';
import { api } from '../../api/client';
import { Booking } from '../../types';
import { formatStandardDate } from '../../utils/dateUtils';
import { getPanchangDetails } from '../../utils/muhurathUtils';

interface NotificationScreenProps {
  onBack: () => void;
  onNotificationPress?: (bookingId?: string) => void;
}

interface NotificationItem {
  id: string;
  bookingId?: string;
  type: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'PANCHANG' | 'WELCOME';
  title: string;
  message: string;
  dateStr: string;
  badgeText: string;
  badgeColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isImportant?: boolean;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  onBack,
  onNotificationPress,
}) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight || 28) + 8
      : Math.max(insets.top, 20) + 6;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Today's Panchang for live auspicious notification
  const todayPanchang = useMemo(() => getPanchangDetails(new Date()), []);

  const fetchCustomerBookings = useCallback(async () => {
    try {
      const myBookings = await api.getMyBookings();
      setBookings(myBookings || []);
    } catch (e) {
      console.warn('Error fetching customer bookings for notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerBookings();
  }, [fetchCustomerBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomerBookings();
  };

  // Convert real bookings into live actionable customer notifications
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    // 1. Process customer bookings
    bookings.forEach((b) => {
      const pujaTitle = b.puja?.title || 'पूजा';
      const panditName =
        b.panditProfile?.fullName ||
        (b.pandit && (b.pandit as any).user
          ? `${(b.pandit as any).user.firstName || ''} ${(b.pandit as any).user.lastName || ''}`.trim()
          : 'वैदिक गुरुजी');

      const formattedDate = formatStandardDate(b.pujaDate, true);
      const timeSlot = b.pujaTimeSlot || 'सकाळी';

      if (b.status === 'CONFIRMED' || b.status === 'ACCEPTED') {
        list.push({
          id: `booking-${b.id}-confirmed`,
          bookingId: b.id,
          type: 'CONFIRMED',
          title: 'बुकिंग निश्चित झाली! (Booking Confirmed) 🎉',
          message: `आपली "${pujaTitle}" निश्चित झाली आहे. पं. ${panditName} यांची नियुक्ती करण्यात आली आहे.\n📅 तारीख: ${formattedDate} • वेळ: ${timeSlot}`,
          dateStr: formatStandardDate(b.createdAt || b.pujaDate),
          badgeText: 'पंडित नियुक्त (Confirmed)',
          badgeColor: '#15803D',
          iconName: 'checkmark-circle',
          isImportant: true,
        });
      } else if (b.status === 'PENDING') {
        list.push({
          id: `booking-${b.id}-pending`,
          bookingId: b.id,
          type: 'PENDING',
          title: 'बुकिंग नोंदवली गेली (Booking Placed) ⏳',
          message: `आपली "${pujaTitle}" बुकिंग सिस्टीममध्ये यशस्वीपणे नोंदवली गेली आहे. वैदिक पंडित वाटप प्रक्रिया सुरू आहे.\n📅 तारीख: ${formattedDate}`,
          dateStr: formatStandardDate(b.createdAt || b.pujaDate),
          badgeText: 'प्रतीक्षेत (Pending)',
          badgeColor: '#D97706',
          iconName: 'time-outline',
          isImportant: true,
        });
      } else if (b.status === 'COMPLETED') {
        list.push({
          id: `booking-${b.id}-completed`,
          bookingId: b.id,
          type: 'COMPLETED',
          title: 'पूजा संपन्न झाली (Puja Completed) 🙏',
          message: `आपली "${pujaTitle}" वैदिक गुरुकुल परंपरेनुसार यशस्वीरीत्या संपन्न झाली. आपल्या परिवारावर देवकृपा राहो!`,
          dateStr: formatStandardDate(b.createdAt || b.pujaDate),
          badgeText: 'संपन्न (Completed)',
          badgeColor: '#2563EB',
          iconName: 'ribbon-outline',
        });
      } else if (b.status === 'CANCELLED' || b.status === 'REJECTED') {
        list.push({
          id: `booking-${b.id}-cancelled`,
          bookingId: b.id,
          type: 'CANCELLED',
          title: 'बुकिंग रद्द झाली (Booking Cancelled) ❌',
          message: `आपली "${pujaTitle}" बुकिंग रद्द करण्यात आली आहे.`,
          dateStr: formatStandardDate(b.createdAt || b.pujaDate),
          badgeText: 'रद्द (Cancelled)',
          badgeColor: '#B91C1C',
          iconName: 'close-circle-outline',
        });
      }
    });

    // 2. Add Live Daily Panchang Alert
    list.push({
      id: `panchang-${todayPanchang.dateStr}`,
      type: 'PANCHANG',
      title: '✨ आजचे शुभ मुहूर्त व पंचांग (Live Panchang)',
      message: `आज ${todayPanchang.dayNameMr}: ${todayPanchang.tithi} • नक्षत्र: ${todayPanchang.nakshatra}।\n★ सर्वोत्तम अभिजित मुहूर्त: ${todayPanchang.abhijitMuhurat}।`,
      dateStr: 'आज (Today)',
      badgeText: 'शुभ मुहूर्त',
      badgeColor: '#B45309',
      iconName: 'sunny-outline',
    });

    // 3. Add Cultural Welcome
    list.push({
      id: 'welcome-notification',
      type: 'WELCOME',
      title: '🚩 देवसूत्र परिवारात आपले सहर्ष स्वागत!',
      message: 'प्रमाणित वैदिक गुरुजी, १००% शुद्ध पूजा साहित्य व प्रामाणिक मंत्रोच्चार विधी.',
      dateStr: 'DevSutra',
      badgeText: 'स्वागत',
      badgeColor: colors.primary,
      iconName: 'flame-outline',
    });

    return list;
  }, [bookings, todayPanchang]);

  return (
    <View style={styles.safe}>
      {/* Top Header with Back Button */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>सूचना (Notifications)</Text>
          <Text style={styles.headerSub}>लाइव्ह बुकिंग अपडेट्स व पंचांग</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="reload" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>बुकिंग अपडेट्स लोड होत आहेत...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notifItem,
                item.isImportant && styles.notifItemImportant,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (onNotificationPress) {
                  onNotificationPress(item.bookingId);
                }
              }}
            >
              {/* Icon / Avatar */}
              <View style={styles.iconContainer}>
                {item.type === 'CONFIRMED' || item.type === 'COMPLETED' ? (
                  <Image
                    source={APP_IMAGES.panditAvatar}
                    style={styles.panditIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: `${item.badgeColor}15` },
                    ]}
                  >
                    <Ionicons name={item.iconName} size={22} color={item.badgeColor} />
                  </View>
                )}
              </View>

              {/* Notification Content */}
              <View style={styles.contentCol}>
                <View style={styles.topRow}>
                  <Text style={styles.notifTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${item.badgeColor}18` },
                    ]}
                  >
                    <Text
                      style={[styles.statusBadgeText, { color: item.badgeColor }]}
                    >
                      {item.badgeText}
                    </Text>
                  </View>
                </View>

                <Text style={styles.notifMessage}>{item.message}</Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.notifDate}>
                    <Ionicons name="time-outline" size={11} color="#8C7A70" /> {item.dateStr}
                  </Text>
                  {item.bookingId && (
                    <View style={styles.tapToViewPill}>
                      <Text style={styles.tapToViewText}>तपशील पहा (View)</Text>
                      <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
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
    height: 38,
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSub: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 1,
  },
  refreshBtn: {
    padding: 6,
    height: 38,
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: '#8C7A70',
    marginTop: 10,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE2CE',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  notifItemImportant: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    marginTop: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panditIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  contentCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#382820',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  notifMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5C4A42',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifDate: {
    fontSize: 11,
    color: '#8C7A70',
    fontWeight: '500',
  },
  tapToViewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tapToViewText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});
