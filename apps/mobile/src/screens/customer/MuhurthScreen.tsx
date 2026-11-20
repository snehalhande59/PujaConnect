import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface MuhurthScreenProps {
  onOpenDrawer?: () => void;
  onOpenNotifications?: () => void;
  onSelectCity?: () => void;
  selectedCity?: string;
  onBookDate?: (dateStr: string) => void;
}

export const MuhurthScreen: React.FC<MuhurthScreenProps> = ({
  onOpenDrawer,
  onOpenNotifications,
  onSelectCity,
  selectedCity = 'Pune',
  onBookDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [monthIndex, setMonthIndex] = useState<0 | 1>(0); // 0: Nov 2026, 1: Dec 2026
  const [selectedDay, setSelectedDay] = useState<number>(19);
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  // November 2026 Calendar Data
  const novemberWeeks = [
    { weekNum: 44, days: [null, null, null, null, null, null, 1] },
    { weekNum: 45, days: [2, 3, 4, 5, 6, 7, 8] },
    { weekNum: 46, days: [9, 10, 11, 12, 13, 14, 15] },
    { weekNum: 47, days: [16, 17, 18, 19, 20, 21, 22] },
    { weekNum: 48, days: [23, 24, 25, 26, 27, 28, 29] },
    { weekNum: 49, days: [30, null, null, null, null, null, null] },
  ];

  // December 2026 Calendar Data
  const decemberWeeks = [
    { weekNum: 49, days: [null, 1, 2, 3, 4, 5, 6] },
    { weekNum: 50, days: [7, 8, 9, 10, 11, 12, 13] },
    { weekNum: 51, days: [14, 15, 16, 17, 18, 19, 20] },
    { weekNum: 52, days: [21, 22, 23, 24, 25, 26, 27] },
    { weekNum: 53, days: [28, 29, 30, 31, null, null, null] },
  ];

  const weeks = monthIndex === 0 ? novemberWeeks : decemberWeeks;

  // Auspicious Muhurat days
  const muhuratDaysNov = [5, 8, 12, 18, 19, 20, 21, 23, 24, 26, 28];
  const muhuratDaysDec = [2, 5, 9, 11, 15, 19, 23, 27, 30];
  const muhuratDays = monthIndex === 0 ? muhuratDaysNov : muhuratDaysDec;

  return (
    <View style={styles.safe}>
      {/* Top App Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={onOpenDrawer} activeOpacity={0.7}>
          <View style={styles.hamburgerContainer}>
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationSelector} onPress={onSelectCity} activeOpacity={0.7}>
          <Ionicons name="location" size={17} color={colors.primary} />
          <Text style={styles.locationText}>{selectedCity}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} onPress={onOpenNotifications} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#8C7A70" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Vastushanti Muhurth"
            placeholderTextColor="#8C7A70"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={styles.monthArrow}
            onPress={() => setMonthIndex(0)}
            activeOpacity={0.7}
          >
            <Ionicons name="caret-back" size={16} color={monthIndex === 0 ? '#C4B5A5' : colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {monthIndex === 0 ? '2026 November' : '2026 December'}
          </Text>
          <TouchableOpacity
            style={styles.monthArrow}
            onPress={() => setMonthIndex(1)}
            activeOpacity={0.7}
          >
            <Ionicons name="caret-forward" size={16} color={monthIndex === 1 ? '#C4B5A5' : colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day Names Row */}
          <View style={styles.weekdaysRow}>
            <View style={styles.weekNumCol} />
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Weeks Rows */}
          {weeks.map((week) => (
            <View key={week.weekNum} style={styles.weekRow}>
              {/* Week Number column */}
              <View style={styles.weekNumCol}>
                <Text style={styles.weekNumText}>{week.weekNum}</Text>
              </View>

              {/* Days in Week */}
              {week.days.map((day, idx) => {
                if (day === null) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }

                const isToday = monthIndex === 0 && day === 19;
                const isMuhurat = muhuratDays.includes(day);
                const isSelected = selectedDay === day;

                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                      styles.dayCell,
                      isSelected && styles.selectedDayCell,
                    ]}
                    onPress={() => {
                      setSelectedDay(day);
                      const mStr = monthIndex === 0 ? '11' : '12';
                      const dStr = day < 10 ? `0${day}` : `${day}`;
                      if (onBookDate) onBookDate(`2026-${mStr}-${dStr}`);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.todayText,
                        isMuhurat && !isToday && styles.muhuratText,
                      ]}
                    >
                      {day}
                    </Text>
                    {isMuhurat && <View style={styles.muhuratDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Auspicious Timings Card for Selected Day */}
        {selectedDay && (
          <View style={styles.shubhCard}>
            <View style={styles.shubhHeader}>
              <Ionicons name="sparkles" size={16} color={colors.gold} />
              <Text style={styles.shubhTitle}>
                {monthIndex === 0 ? 'November' : 'December'} {selectedDay}, 2026 {muhuratDays.includes(selectedDay) ? '★ Auspicious Muhurat' : 'Panchang Timings'}
              </Text>
            </View>
            <Text style={styles.shubhTime}>• Brahma Muhurat: 06:00 AM to 07:30 AM</Text>
            <Text style={styles.shubhTime}>• Shubh Choghadiya: 08:00 AM to 09:30 AM</Text>
            <Text style={styles.shubhTime}>• Amrit Kaal: 09:30 AM to 11:00 AM</Text>
            <Text style={styles.shubhTime}>• Abhijit Muhurat: 11:45 AM to 12:35 PM</Text>
            <Text style={styles.shubhTime}>• Sandhya Godhuli: 05:30 PM to 07:00 PM</Text>
            <Text style={styles.shubhTime}>• Pradosh Kaal: 07:15 PM to 08:45 PM</Text>

            {onBookDate && (
              <TouchableOpacity
                style={{
                  marginTop: 12,
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  const mStr = monthIndex === 0 ? '11' : '12';
                  const dStr = selectedDay < 10 ? `0${selectedDay}` : `${selectedDay}`;
                  onBookDate(`2026-${mStr}-${dStr}`);
                }}
              >
                <Ionicons name="calendar-outline" size={16} color="#FFF8EC" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFF8EC', fontWeight: 'bold', fontSize: 13 }}>
                  Book Puja on this Auspicious Date
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Steps for finding Muhurat */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Steps for finding Muhrat -</Text>
          <Text style={styles.stepItem}>1. Search for your desired Puja.</Text>
          <Text style={styles.stepItem}>2. Select the Puja from the search results.</Text>
          <Text style={styles.stepItem}>
            3. Look for the green-highlighted dates on the calendar; these indicate Muhurat (auspicious dates) for your selected Puja.
          </Text>
          <Text style={styles.stepItem}>
            4. If you cannot find your specific Puja through the search function, feel free to reach out to our team for assistance at +91 98220 12345 or support@devsutra.in.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8EC', // Warm cream background matching screenshot
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFF8EC',
  },
  menuBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    width: 36,
  },
  hamburgerContainer: {
    justifyContent: 'space-between',
    height: 16,
    width: 22,
  },
  hamburgerBar: {
    width: 22,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  bellBtn: {
    padding: 6,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  monthArrow: {
    padding: 6,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  calendarContainer: {
    marginBottom: 24,
  },
  weekdaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekNumCol: {
    width: 28,
    alignItems: 'center',
  },
  weekNumText: {
    fontSize: 11,
    color: '#D4C6BE',
    fontWeight: '600',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayCell: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    position: 'relative',
  },
  selectedDayCell: {
    backgroundColor: '#F3E8DB',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#382820',
  },
  todayText: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  muhuratText: {
    color: '#15803D',
    fontWeight: '700',
  },
  muhuratDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#15803D',
    position: 'absolute',
    bottom: 2,
  },
  stepsCard: {
    backgroundColor: 'transparent',
    paddingTop: 8,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  stepItem: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5C4A42',
    marginBottom: 8,
  },
  shubhCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#15803D',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shubhHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  shubhTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  shubhTime: {
    fontSize: 11,
    color: '#5C4A42',
    marginTop: 2,
  },
});
