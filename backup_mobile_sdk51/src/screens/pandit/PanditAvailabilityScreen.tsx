import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface PanditAvailabilityScreenProps {
  onBack?: () => void;
}

const DAYS_OF_WEEK = [
  'Monday (Somvar)',
  'Tuesday (Mangalvar)',
  'Wednesday (Budhvar)',
  'Thursday (Guruvar)',
  'Friday (Shukravar)',
  'Saturday (Shanivar)',
  'Sunday (Ravivar)',
];

const MUHURAT_WINDOWS = [
  { id: 'PRATAH', label: 'Pratah Kaal (06:00 AM - 09:30 AM)', desc: 'Surya Pujan, Abhishek & Morning Havans' },
  { id: 'MADHYAHAN', label: 'Madhyahan Kaal (10:30 AM - 01:30 PM)', desc: 'Griha Pravesh & Auspicious Sanskars' },
  { id: 'SANDHYA', label: 'Sandhya Kaal (04:30 PM - 07:30 PM)', desc: 'Satyanarayan Katha & Evening Aartis' },
  { id: 'RATRI', label: 'Ratri Kaal (08:00 PM - 10:30 PM)', desc: 'Special Jagran, Jaap & Anushthan' },
];

export const PanditAvailabilityScreen: React.FC<PanditAvailabilityScreenProps> = ({ onBack }) => {
  const [city, setCity] = useState('Pune');
  const [travelRadius, setTravelRadius] = useState('25');
  const [availableDays, setAvailableDays] = useState<string[]>(DAYS_OF_WEEK);
  const [availableSlots, setAvailableSlots] = useState<string[]>(['PRATAH', 'MADHYAHAN', 'SANDHYA']);
  const [isOnline, setIsOnline] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      if (availableDays.length > 1) {
        setAvailableDays(availableDays.filter((d) => d !== day));
      }
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const toggleSlot = (slotId: string) => {
    if (availableSlots.includes(slotId)) {
      if (availableSlots.length > 1) {
        setAvailableSlots(availableSlots.filter((s) => s !== slotId));
      }
    } else {
      setAvailableSlots([...availableSlots, slotId]);
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Availability Saved 🙏', 'Your operational schedule has been updated.');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </TouchableOpacity>
        )}
        <Text style={styles.topBarTitle}>Manage Availability</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Live Accepting Status Card */}
        <View style={styles.statusCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>
              {isOnline ? 'Currently Taking Bookings' : 'Temporarily Unavailable'}
            </Text>
            <Text style={styles.statusDesc}>
              {isOnline
                ? 'Devotees can discover and request pujas in your city.'
                : 'Your profile is hidden from active searches until re-enabled.'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: colors.borderLight, true: colors.secondaryLight }}
            thumbColor={isOnline ? colors.secondary : colors.borderDark}
          />
        </View>

        {/* Operational Region & Radius */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Operational Territory</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 2 }}>
              <Input
                label="Base City"
                placeholder="e.g. Pune"
                value={city}
                onChangeText={setCity}
                leftIcon="location-outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Radius (KM)"
                placeholder="25"
                value={travelRadius}
                onChangeText={setTravelRadius}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Working Days */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Available Days</Text>
          <Text style={styles.cardSubheading}>Select the days of the week you perform rituals</Text>

          <View style={styles.daysList}>
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = availableDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayItem, isSelected && styles.dayItemActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{day}</Text>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={isSelected ? colors.secondary : colors.borderDark}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Muhurat Windows */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Preferred Muhurat Windows</Text>
          <Text style={styles.cardSubheading}>Time slots available for booking requests</Text>

          <View style={styles.slotsList}>
            {MUHURAT_WINDOWS.map((slot) => {
              const isSelected = availableSlots.includes(slot.id);
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.slotItem, isSelected && styles.slotItemActive]}
                  onPress={() => toggleSlot(slot.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slotTitle, isSelected && styles.slotTitleActive]}>
                      {slot.label}
                    </Text>
                    <Text style={styles.slotDesc}>{slot.desc}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isSelected ? colors.secondary : colors.borderDark}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button
          title={saving ? 'Updating Schedule...' : 'Save Schedule & Availability'}
          variant="secondary"
          size="lg"
          onPress={handleSave}
          loading={saving}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
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
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary,
  },
  statusDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
    paddingRight: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubheading: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  daysList: {
    gap: 6,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dayItemActive: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  dayText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  dayTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  slotsList: {
    gap: 8,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  slotItemActive: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  slotTitleActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  slotDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
