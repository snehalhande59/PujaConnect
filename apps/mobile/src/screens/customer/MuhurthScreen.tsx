import React, { useState, useMemo } from 'react';
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
import {
  generateMonthWeeks,
  getAuspiciousDaysForMonth,
  getPanchangDetails,
  getRolling30DaysMuhurath,
  PanchangInfo,
} from '../../utils/muhurathUtils';

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
  const insets = useSafeAreaInsets();
  const headerPaddingTop =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight || 28) + 8
      : Math.max(insets.top, 20) + 6;

  // Real-time Dynamic Reference (Today)
  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonthIndex = today.getMonth();
  const todayDate = today.getDate();

  // Active view: Calendar or 30-Day Shubh Muhurath List
  const [activeTab, setActiveTab] = useState<'CALENDAR' | '30DAYS'>('CALENDAR');

  // Dynamic Calendar Navigation State
  const [currentYear, setCurrentYear] = useState<number>(todayYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(todayMonthIndex);
  const [selectedDay, setSelectedDay] = useState<number>(todayDate);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically generated weeks for current month
  const weeks = useMemo(
    () => generateMonthWeeks(currentYear, currentMonthIndex),
    [currentYear, currentMonthIndex]
  );

  // Dynamically calculated auspicious days for current month
  const auspiciousDays = useMemo(
    () => getAuspiciousDaysForMonth(currentYear, currentMonthIndex),
    [currentYear, currentMonthIndex]
  );

  // Selected Date Panchang Details
  const selectedPanchang: PanchangInfo = useMemo(() => {
    const validDay = Math.min(
      selectedDay,
      new Date(currentYear, currentMonthIndex + 1, 0).getDate()
    );
    return getPanchangDetails(new Date(currentYear, currentMonthIndex, validDay));
  }, [currentYear, currentMonthIndex, selectedDay]);

  // Rolling 30 Days Shubh Muhurats (Live & Updated Daily)
  const rolling30Days = useMemo(() => getRolling30DaysMuhurath(today), [today]);

  // Filter 30 Days by Search Query
  const filtered30Days = useMemo(() => {
    if (!searchQuery.trim()) return rolling30Days;
    const q = searchQuery.toLowerCase().trim();
    return rolling30Days.filter((item) => {
      return (
        item.tithi.toLowerCase().includes(q) ||
        item.nakshatra.toLowerCase().includes(q) ||
        item.dayNameMr.toLowerCase().includes(q) ||
        item.monthNameEn.toLowerCase().includes(q) ||
        item.suitablePujas.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [rolling30Days, searchQuery]);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
    setSelectedDay(1);
  };

  const handleJumpToToday = () => {
    setCurrentYear(todayYear);
    setCurrentMonthIndex(todayMonthIndex);
    setSelectedDay(todayDate);
  };

  const isCurrentMonthToday =
    currentYear === todayYear && currentMonthIndex === todayMonthIndex;

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
            placeholder="Search Vastushanti, Satyanarayan, Vivah..."
            placeholderTextColor="#8C7A70"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#8C7A70" />
            </TouchableOpacity>
          )}
        </View>

        {/* View Switcher: Calendar View vs 30-Day Muhurth List */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'CALENDAR' && styles.tabButtonActive]}
            onPress={() => setActiveTab('CALENDAR')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar"
              size={15}
              color={activeTab === 'CALENDAR' ? '#FFFFFF' : colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === 'CALENDAR' && styles.tabTextActive]}>
              कॅलेंडर (Calendar)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === '30DAYS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('30DAYS')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="sparkles"
              size={15}
              color={activeTab === '30DAYS' ? '#FFFFFF' : colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabText, activeTab === '30DAYS' && styles.tabTextActive]}>
              ३० दिवसांचे शुभ मुहूर्त
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* VIEW 1: DYNAMIC MONTH CALENDAR                                 */}
        {/* ============================================================== */}
        {activeTab === 'CALENDAR' && (
          <>
            {/* Month Navigation Bar */}
            <View style={styles.monthHeader}>
              <TouchableOpacity
                style={styles.monthArrow}
                onPress={handlePrevMonth}
                activeOpacity={0.7}
              >
                <Ionicons name="caret-back" size={18} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.monthTitleWrapper}>
                <Text style={styles.monthTitle}>
                  {selectedPanchang.monthNameEn} {currentYear}
                </Text>
                <Text style={styles.monthSubTitle}>
                  {selectedPanchang.monthNameMr} • पंचांग
                </Text>
              </View>

              <TouchableOpacity
                style={styles.monthArrow}
                onPress={handleNextMonth}
                activeOpacity={0.7}
              >
                <Ionicons name="caret-forward" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Jump to Today Button */}
            {!isCurrentMonthToday && (
              <TouchableOpacity
                style={styles.todayPill}
                onPress={handleJumpToToday}
                activeOpacity={0.8}
              >
                <Ionicons name="today-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.todayPillText}>आजच्या तारखेवर जा (Jump to Today: {todayDate} {today.toLocaleDateString('en-US', { month: 'short' })})</Text>
              </TouchableOpacity>
            )}

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

              {/* Dynamic Weeks Rows */}
              {weeks.map((week, wIdx) => (
                <View key={`week-${week.weekNum}-${wIdx}`} style={styles.weekRow}>
                  {/* Week Number column */}
                  <View style={styles.weekNumCol}>
                    <Text style={styles.weekNumText}>{week.weekNum}</Text>
                  </View>

                  {/* Days in Week */}
                  {week.days.map((day, idx) => {
                    if (day === null) {
                      return <View key={`empty-${wIdx}-${idx}`} style={styles.dayCell} />;
                    }

                    const isToday = isCurrentMonthToday && day === todayDate;
                    const isMuhurat = auspiciousDays.includes(day);
                    const isSelected = selectedDay === day;

                    return (
                      <TouchableOpacity
                        key={`day-${day}`}
                        style={[
                          styles.dayCell,
                          isSelected && styles.selectedDayCell,
                          isToday && !isSelected && styles.todayDayCell,
                        ]}
                        onPress={() => {
                          setSelectedDay(day);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isToday && styles.todayText,
                            isSelected && styles.selectedDayText,
                            isMuhurat && !isToday && !isSelected && styles.muhuratText,
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
                  <Ionicons name="sparkles" size={18} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shubhTitle}>
                      {selectedPanchang.monthNameEn} {selectedDay}, {currentYear} ({selectedPanchang.dayNameMr})
                    </Text>
                    <Text style={styles.shubhTithiText}>
                      {selectedPanchang.tithi} • {selectedPanchang.nakshatra}
                    </Text>
                  </View>
                  {isCurrentMonthToday && selectedDay === todayDate && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>आज (TODAY)</Text>
                    </View>
                  )}
                </View>

                {/* Yoga Banner */}
                <View style={styles.yogaBanner}>
                  <Ionicons name="sunny" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.yogaText}>{selectedPanchang.yoga}</Text>
                </View>

                {/* Timings List */}
                <View style={styles.timingsGrid}>
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>• ब्रह्म मुहूर्त (Brahma Muhurat):</Text>
                    <Text style={styles.timingValue}>{selectedPanchang.brahmaMuhurat}</Text>
                  </View>
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>• शुभ चौघडिया (Shubh Choghadiya):</Text>
                    <Text style={styles.timingValue}>{selectedPanchang.shubhChoghadiya}</Text>
                  </View>
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>• अमृत काळ (Amrit Kaal):</Text>
                    <Text style={styles.timingValue}>{selectedPanchang.amritKaal}</Text>
                  </View>
                  <View style={[styles.timingRow, styles.highlightTimingRow]}>
                    <Text style={[styles.timingLabel, { color: '#15803D', fontWeight: '700' }]}>
                      ★ अभिजित मुहूर्त (Abhijit Window):
                    </Text>
                    <Text style={[styles.timingValue, { color: '#15803D', fontWeight: '700' }]}>
                      {selectedPanchang.abhijitMuhurat}
                    </Text>
                  </View>
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>• गोधुली वेळ (Evening Godhuli):</Text>
                    <Text style={styles.timingValue}>{selectedPanchang.godhuliKaal}</Text>
                  </View>
                  <View style={styles.timingRow}>
                    <Text style={styles.timingLabel}>• प्रदोष काळ (Pradosh Kaal):</Text>
                    <Text style={styles.timingValue}>{selectedPanchang.pradoshKaal}</Text>
                  </View>
                  <View style={styles.timingRow}>
                    <Text style={[styles.timingLabel, { color: '#B91C1C' }]}>• राहुकाळ (वर्ज्य / Avoid):</Text>
                    <Text style={[styles.timingValue, { color: '#B91C1C' }]}>{selectedPanchang.rahuKaal}</Text>
                  </View>
                </View>

                {/* Book Puja Button */}
                {onBookDate && (
                  <TouchableOpacity
                    style={styles.bookDateBtn}
                    onPress={() => onBookDate(selectedPanchang.dateStr)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar" size={17} color="#FFF8EC" style={{ marginRight: 8 }} />
                    <Text style={styles.bookDateBtnText}>
                      या शुभ मुहूर्तावर पूजा बुक करा ({selectedDay} {selectedPanchang.monthNameEn})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: ROLLING 30-DAY SHUBH MUHURTH LIST                      */}
        {/* ============================================================== */}
        {activeTab === '30DAYS' && (
          <View style={styles.listContainer}>
            <View style={styles.listHeaderCard}>
              <Ionicons name="sparkles" size={18} color={colors.gold} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.listHeaderTitle}>पुढील ३० दिवसांचे दैनिक शुभ मुहूर्त</Text>
                <Text style={styles.listHeaderSubtitle}>
                  आजपासून ({todayDate} {today.toLocaleDateString('en-US', { month: 'short' })}) पुढील ३० दिवसांचे लाइव्ह पंचांग
                </Text>
              </View>
            </View>

            {filtered30Days.map((item, idx) => {
              const isToday = idx === 0;

              return (
                <View
                  key={item.dateStr}
                  style={[
                    styles.dayCard,
                    isToday && styles.todayDayCard,
                    item.isMuhurat && styles.muhuratDayCard,
                  ]}
                >
                  <View style={styles.dayCardHeader}>
                    <View style={styles.dateBlock}>
                      <Text style={styles.dateBlockDay}>{item.dayNumber}</Text>
                      <Text style={styles.dateBlockMonth}>{item.monthNameEn.slice(0, 3)}</Text>
                    </View>

                    <View style={styles.dayInfoCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.dayInfoTitle}>
                          {item.dayNameMr} ({item.dayNameEn})
                        </Text>
                        {isToday && (
                          <View style={styles.todayBadge}>
                            <Text style={styles.todayBadgeText}>आज (TODAY)</Text>
                          </View>
                        )}
                        {item.isMuhurat && (
                          <View style={styles.muhuratBadge}>
                            <Text style={styles.muhuratBadgeText}>★ शुभ मुहूर्त</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.dayInfoTithi}>{item.tithi}</Text>
                      <Text style={styles.dayInfoNakshatra}>नक्षत्र: {item.nakshatra}</Text>
                    </View>
                  </View>

                  <View style={styles.dayCardDivider} />

                  {/* Best Windows */}
                  <View style={styles.dayCardTimings}>
                    <View style={styles.timingBadgeItem}>
                      <Ionicons name="time-outline" size={13} color="#15803D" style={{ marginRight: 4 }} />
                      <Text style={styles.timingBadgeText}>अभिजित: {item.abhijitMuhurat}</Text>
                    </View>
                    <View style={styles.timingBadgeItem}>
                      <Ionicons name="sunny-outline" size={13} color="#D97706" style={{ marginRight: 4 }} />
                      <Text style={styles.timingBadgeText}>अमृत काळ: {item.amritKaal}</Text>
                    </View>
                  </View>

                  {/* Book Button */}
                  {onBookDate && (
                    <TouchableOpacity
                      style={styles.cardBookBtn}
                      onPress={() => onBookDate(item.dateStr)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cardBookBtnText}>पूजा बुक करा</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
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
    backgroundColor: '#FFF8EC',
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0E2CE',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EFE2CE',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  tabTextActive: {
    color: '#FFF8EC',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  monthArrow: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE2CE',
  },
  monthTitleWrapper: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  monthSubTitle: {
    fontSize: 11,
    color: '#8C7A70',
    fontWeight: '600',
    marginTop: 2,
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFF2DF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6D0BA',
  },
  todayPillText: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '700',
  },
  calendarContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE2CE',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  weekdaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE3',
  },
  weekNumCol: {
    width: 24,
    alignItems: 'center',
  },
  weekNumText: {
    fontSize: 10,
    color: '#D4C6BE',
    fontWeight: '600',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    position: 'relative',
  },
  todayDayCell: {
    borderWidth: 1.5,
    borderColor: '#B91C1C',
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#382820',
  },
  selectedDayText: {
    color: '#FFF8EC',
    fontWeight: '800',
  },
  todayText: {
    color: '#B91C1C',
    fontWeight: '800',
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
    bottom: 3,
  },
  shubhCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#15803D',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFE2CE',
    marginBottom: 20,
  },
  shubhHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  shubhTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  shubhTithiText: {
    fontSize: 12,
    color: '#6E5C53',
    fontWeight: '600',
    marginTop: 2,
  },
  todayBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B91C1C',
  },
  yogaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
  yogaText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.primary,
  },
  timingsGrid: {
    gap: 5,
    marginBottom: 12,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  highlightTimingRow: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timingLabel: {
    fontSize: 11.5,
    color: '#5C4A42',
    fontWeight: '500',
  },
  timingValue: {
    fontSize: 11.5,
    color: '#382820',
    fontWeight: '600',
  },
  bookDateBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bookDateBtnText: {
    color: '#FFF8EC',
    fontWeight: '800',
    fontSize: 13,
  },
  listContainer: {
    gap: 10,
    marginBottom: 20,
  },
  listHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE2CE',
  },
  listHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primary,
  },
  listHeaderSubtitle: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 2,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE2CE',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  todayDayCard: {
    borderColor: '#B91C1C',
    borderWidth: 1.5,
    backgroundColor: '#FFFDFD',
  },
  muhuratDayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#15803D',
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBlock: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFF2DF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6D0BA',
  },
  dateBlockDay: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  dateBlockMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C7A70',
    textTransform: 'uppercase',
  },
  dayInfoCol: {
    flex: 1,
  },
  dayInfoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dayInfoTithi: {
    fontSize: 11.5,
    color: '#5C4A42',
    marginTop: 2,
    fontWeight: '600',
  },
  dayInfoNakshatra: {
    fontSize: 10.5,
    color: '#8C7A70',
    marginTop: 1,
  },
  muhuratBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  muhuratBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  dayCardDivider: {
    height: 1,
    backgroundColor: '#F5ECE3',
    marginVertical: 10,
  },
  dayCardTimings: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  timingBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timingBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#382820',
  },
  cardBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF2DF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6D0BA',
  },
  cardBookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
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
});
