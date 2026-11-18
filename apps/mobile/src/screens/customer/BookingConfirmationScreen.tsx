import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Booking } from '../../types';
import { Button } from '../../components/common/Button';

interface BookingConfirmationScreenProps {
  booking: Booking;
  onNavigateMyBookings: () => void;
  onNavigateHome: () => void;
}

export const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  booking,
  onNavigateMyBookings,
  onNavigateHome,
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sacred Celebration Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={54} color={colors.secondary} />
        </View>

        <Text style={styles.title}>Shubh Sankalpa!</Text>
        <Text style={styles.subtitle}>Your sacred puja booking has been successfully placed.</Text>

        {/* Auspicious Booking Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.badgeRow}>
            <View style={styles.refBadge}>
              <Text style={styles.refBadgeText}>
                REF #{booking?.id ? booking.id.slice(0, 8).toUpperCase() : 'DEVSUTRA'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {booking?.status || 'PENDING CONFIRMATION'}
              </Text>
            </View>
          </View>

          <Text style={styles.pujaName}>{booking?.puja?.title || 'Vedic Ritual Puja'}</Text>
          <Text style={styles.panditName}>
            Purohit: Pt.{' '}
            {booking?.pandit?.user?.firstName
              ? `${booking.pandit.user.firstName} ${booking.pandit.user.lastName || ''}`.trim()
              : 'Assigned Vedic Scholar'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {booking?.bookingDate
                ? new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Selected Date'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{booking?.timeSlot || 'Morning Muhurat'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Venue:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {booking?.address
                ? `${booking.address.street}, ${booking.address.city}`
                : 'Devotee Specified Venue'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Dakshina:</Text>
            <Text style={[styles.infoValue, { color: colors.primary, fontWeight: '800' }]}>
              ₹{booking?.totalPrice || 2500}
            </Text>
          </View>
        </View>

        {/* What Happens Next Guidance */}
        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceTitle}>What Happens Next?</Text>
          <View style={styles.guidanceStep}>
            <Ionicons name="call-outline" size={18} color={colors.secondary} />
            <Text style={styles.guidanceStepText}>
              Our Purohit will contact you 24 hours prior to align on the exact Muhurat & puja preparation.
            </Text>
          </View>
          <View style={styles.guidanceStep}>
            <Ionicons name="leaf-outline" size={18} color={colors.secondary} />
            <Text style={styles.guidanceStepText}>
              If Samagri was selected, the Purohit will bring the authentic 100% pure ingredients directly to your venue.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="View My Bookings"
            variant="primary"
            size="lg"
            onPress={onNavigateMyBookings}
            icon={<Ionicons name="calendar" size={18} color={colors.textWhite} />}
          />

          <TouchableOpacity style={styles.homeBtn} onPress={onNavigateHome}>
            <Text style={styles.homeBtnText}>Return to Home Dashboard</Text>
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
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refBadge: {
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  refBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  pujaName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  panditName: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 70,
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  guidanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  guidanceStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  guidanceStepText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  actions: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  homeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
