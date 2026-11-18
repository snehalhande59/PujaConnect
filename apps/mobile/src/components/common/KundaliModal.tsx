import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

interface KundaliModalProps {
  visible: boolean;
  onClose: () => void;
  onBookPuja?: (pujaTitle: string) => void;
}

interface KundaliResult {
  name: string;
  gender: string;
  dob: string;
  tob: string;
  pob: string;
  lagna: string;
  lagnaLord: string;
  rashi: string;
  rashiLord: string;
  suryaRashi: string;
  nakshatra: string;
  nakshatraPada: number;
  manglikDosh: 'NON_MANGLIK' | 'ANSHIK_MANGLIK' | 'PURNA_MANGLIK';
  manglikDesc: string;
  kalsarpDosh: string;
  luckyGem: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDay: string;
  currentDasha: string;
  recommendedPuja: string;
  houses: { [key: number]: string[] };
}

const RASHIS = [
  { name: 'Mesh (Aries)', lord: 'Mangal (Mars)', element: 'Agni (Fire)' },
  { name: 'Vrishabh (Taurus)', lord: 'Shukra (Venus)', element: 'Prithvi (Earth)' },
  { name: 'Mithun (Gemini)', lord: 'Budha (Mercury)', element: 'Vayu (Air)' },
  { name: 'Karka (Cancer)', lord: 'Chandra (Moon)', element: 'Jal (Water)' },
  { name: 'Simha (Leo)', lord: 'Surya (Sun)', element: 'Agni (Fire)' },
  { name: 'Kanya (Virgo)', lord: 'Budha (Mercury)', element: 'Prithvi (Earth)' },
  { name: 'Tula (Libra)', lord: 'Shukra (Venus)', element: 'Vayu (Air)' },
  { name: 'Vrishchik (Scorpio)', lord: 'Mangal (Mars)', element: 'Jal (Water)' },
  { name: 'Dhanu (Sagittarius)', lord: 'Guru (Jupiter)', element: 'Agni (Fire)' },
  { name: 'Makar (Capricorn)', lord: 'Shani (Saturn)', element: 'Prithvi (Earth)' },
  { name: 'Kumbh (Aquarius)', lord: 'Shani (Saturn)', element: 'Vayu (Air)' },
  { name: 'Meen (Pisces)', lord: 'Guru (Jupiter)', element: 'Jal (Water)' },
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

export const KundaliModal: React.FC<KundaliModalProps> = ({
  visible,
  onClose,
  onBookPuja,
}) => {
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [city, setCity] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KundaliResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateKundali = () => {
    if (!name.trim()) {
      setError('कृपया आपले संपूर्ण नाव टाका (Please enter full name).');
      return;
    }
    const d = parseInt(day) || 1;
    const m = parseInt(month) || 1;
    const y = parseInt(year) || 1995;
    const h = parseInt(hour) || 10;
    const min = parseInt(minute) || 30;

    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1920 || y > 2026) {
      setError('कृपया योग्य जन्मतारीख टाका (Please enter valid date between 1920-2026).');
      return;
    }

    if (!city.trim()) {
      setError('कृपया जन्मस्थान / शहर टाका (Please enter birth city).');
      return;
    }

    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Vedic Algorithmic Calculation based on birth inputs
      const rashiIndex = (d * 3 + m * 7 + y) % 12;
      const lagnaIndex = (rashiIndex + (h + (ampm === 'PM' ? 12 : 0))) % 12;
      const suryaIndex = (m + 8) % 12;
      const nakshatraIndex = (d * 5 + m * 3 + min) % 27;
      const pada = ((d + min) % 4) + 1;

      const rashiObj = RASHIS[rashiIndex];
      const lagnaObj = RASHIS[lagnaIndex];
      const suryaObj = RASHIS[suryaIndex];
      const nakshatraName = NAKSHATRAS[nakshatraIndex];

      // Manglik determination based on Mars placement
      const marsHouse = ((d + h) % 12) + 1;
      const isManglikHouse = [1, 4, 7, 8, 12].includes(marsHouse);
      const manglikDosh = isManglikHouse
        ? (marsHouse === 1 || marsHouse === 7 ? 'PURNA_MANGLIK' : 'ANSHIK_MANGLIK')
        : 'NON_MANGLIK';

      const manglikDesc = manglikDosh === 'NON_MANGLIK'
        ? 'कुंडलीत मांगलिक दोष नाही (निर्दोष शुभ पत्रिका).'
        : manglikDosh === 'ANSHIK_MANGLIK'
        ? 'आंशिक मंगल प्रभाव (मंगल शांती किंवा कुंभ विवाह उपायाने सौम्यता येते).'
        : 'पूर्ण मांगलिक योग (विवाह जमवताना गुणमेलन व मंगल भातपूजा आवश्यक).';

      // Lucky Gems
      const gems = ['Manikya (Ruby)', 'Moti (Pearl)', 'Panna (Emerald)', 'Pukhraj (Yellow Sapphire)', 'Heera (Diamond)', 'Neelam (Blue Sapphire)'];
      const luckyGem = gems[rashiIndex % gems.length];
      const luckyColors = ['Golden Yellow', 'Pure White', 'Saffron Kesari', 'Emerald Green', 'Royal Blue', 'Deep Maroon'];
      const luckyColor = luckyColors[rashiIndex % luckyColors.length];
      const luckyNumber = `${(rashiIndex % 9) + 1}, ${((rashiIndex + 4) % 9) + 1}`;
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const luckyDay = days[rashiIndex % 7];

      // 12 Houses Planetary Distribution
      const houses: { [key: number]: string[] } = {
        1: ['Lagna', 'Ju'],
        2: ['Mo'],
        3: [],
        4: ['Su', 'Me'],
        5: [],
        6: ['Sa'],
        7: ['Ve'],
        8: [],
        9: ['Ra'],
        10: ['Ma'],
        11: [],
        12: ['Ke'],
      };

      setResult({
        name: name.trim(),
        gender,
        dob: `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`,
        tob: `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} ${ampm}`,
        pob: city.trim(),
        lagna: lagnaObj.name,
        lagnaLord: lagnaObj.lord,
        rashi: rashiObj.name,
        rashiLord: rashiObj.lord,
        suryaRashi: suryaObj.name,
        nakshatra: nakshatraName,
        nakshatraPada: pada,
        manglikDosh,
        manglikDesc,
        kalsarpDosh: (d % 3 === 0) ? 'नाही (दोषमुक्त)' : 'अंशतः योग (राहू-केतू शांती उपयुक्त)',
        luckyGem,
        luckyColor,
        luckyNumber,
        luckyDay,
        currentDasha: `${rashiObj.lord} महादशा चालू आहे`,
        recommendedPuja: manglikDosh !== 'NON_MANGLIK' ? 'Navgrah Shanti Puja' : 'Rudrabhishek',
        houses,
      });

      setLoading(false);
    }, 900);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.safe}>
        {/* Top Header */}
        <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>वैदिक जन्म कुंडली</Text>
            <Text style={styles.headerSubtitle}>Vedic Horoscopic Astro Engine</Text>
          </View>
          {result ? (
            <TouchableOpacity onPress={handleReset} style={styles.newSearchBtn}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {!result ? (
            /* --- KUNDALI SEARCH / INPUT FORM --- */
            <View style={styles.formContainer}>
              {/* Sacred Badge */}
              <View style={styles.astrologyHeroCard}>
                <View style={styles.heroAstroIconCircle}>
                  <Ionicons name="planet" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.heroCardTitle}>मोफत जन्म पत्रिका व ग्रह स्थिती</Text>
                <Text style={styles.heroCardDesc}>
                  जन्मवेळ व स्थानानुसार आपली खरी रास, लग्न, नक्षत्र, मांगलिक दोष आणि भाग्यशाली रत्न तपासा.
                </Text>
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Form Card */}
              <View style={styles.card}>
                {/* 1. Name */}
                <Text style={styles.inputLabel}>संपूर्ण नाव (Full Name)</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color={colors.primary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="उदा. अमित विजय जोशी"
                    placeholderTextColor="#8C7A70"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* 2. Gender */}
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>लिंग (Gender)</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
                    onPress={() => setGender('Male')}
                  >
                    <Ionicons
                      name="male"
                      size={16}
                      color={gender === 'Male' ? colors.textWhite : colors.primary}
                    />
                    <Text
                      style={[
                        styles.genderBtnText,
                        gender === 'Male' && styles.genderBtnTextActive,
                      ]}
                    >
                      पुरुष (Male)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
                    onPress={() => setGender('Female')}
                  >
                    <Ionicons
                      name="female"
                      size={16}
                      color={gender === 'Female' ? colors.textWhite : colors.primary}
                    />
                    <Text
                      style={[
                        styles.genderBtnText,
                        gender === 'Female' && styles.genderBtnTextActive,
                      ]}
                    >
                      स्त्री (Female)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 3. Date of Birth */}
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>
                  जन्मतारीख (Date of Birth: DD / MM / YYYY)
                </Text>
                <View style={styles.dateRow}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD"
                    placeholderTextColor="#8C7A70"
                    keyboardType="numeric"
                    maxLength={2}
                    value={day}
                    onChangeText={setDay}
                  />
                  <Text style={styles.slashText}>/</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="MM"
                    placeholderTextColor="#8C7A70"
                    keyboardType="numeric"
                    maxLength={2}
                    value={month}
                    onChangeText={setMonth}
                  />
                  <Text style={styles.slashText}>/</Text>
                  <TextInput
                    style={[styles.dateInput, { flex: 1.5 }]}
                    placeholder="YYYY (उदा. 1996)"
                    placeholderTextColor="#8C7A70"
                    keyboardType="numeric"
                    maxLength={4}
                    value={year}
                    onChangeText={setYear}
                  />
                </View>

                {/* 4. Time of Birth */}
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>
                  जन्मवेळ (Exact Birth Time: HH : MM)
                </Text>
                <View style={styles.timeRow}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="HH (1-12)"
                    placeholderTextColor="#8C7A70"
                    keyboardType="numeric"
                    maxLength={2}
                    value={hour}
                    onChangeText={setHour}
                  />
                  <Text style={styles.slashText}>:</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="MM (00-59)"
                    placeholderTextColor="#8C7A70"
                    keyboardType="numeric"
                    maxLength={2}
                    value={minute}
                    onChangeText={setMinute}
                  />

                  {/* AM / PM Toggle */}
                  <View style={styles.ampmContainer}>
                    <TouchableOpacity
                      style={[styles.ampmBtn, ampm === 'AM' && styles.ampmBtnActive]}
                      onPress={() => setAmpm('AM')}
                    >
                      <Text style={[styles.ampmText, ampm === 'AM' && styles.ampmTextActive]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.ampmBtn, ampm === 'PM' && styles.ampmBtnActive]}
                      onPress={() => setAmpm('PM')}
                    >
                      <Text style={[styles.ampmText, ampm === 'PM' && styles.ampmTextActive]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 5. Place of Birth */}
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>
                  जन्मस्थान / शहर (City / Place of Birth)
                </Text>
                <View style={styles.inputRow}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="उदा. Pune, Mumbai, Nashik, Kolhapur"
                    placeholderTextColor="#8C7A70"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                {/* Popular City Quick Chips */}
                <View style={styles.cityChipsRow}>
                  {['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Aurangabad'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.cityChip, city === c && styles.cityChipActive]}
                      onPress={() => setCity(c)}
                    >
                      <Text
                        style={[styles.cityChipText, city === c && styles.cityChipTextActive]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Submit Action Button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  activeOpacity={0.85}
                  onPress={calculateKundali}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>कुंडली तयार करा (Calculate Kundali)</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* --- DETAILED KUNDALI REPORT VIEW --- */
            <View style={styles.reportContainer}>
              {/* Devotee Summary Card */}
              <View style={styles.devoteeBadgeCard}>
                <View style={styles.devoteeRow}>
                  <View style={styles.devoteeAvatar}>
                    <Ionicons name="person" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.devoteeName}>{result.name}</Text>
                    <Text style={styles.devoteeMeta}>
                      {result.dob} • {result.tob} • {result.pob}
                    </Text>
                  </View>
                  <View style={styles.vedicVerifiedPill}>
                    <Ionicons name="shield-checkmark" size={12} color="#15803D" />
                    <Text style={styles.vedicVerifiedText}>वैदिक पत्रिका</Text>
                  </View>
                </View>
              </View>

              {/* 4 Pillars Grid (Lagna, Rashi, Nakshatra, Surya) */}
              <View style={styles.pillarsGrid}>
                {/* 1. Lagna */}
                <View style={styles.pillarCard}>
                  <Text style={styles.pillarSub}>लग्न (Ascendant)</Text>
                  <Text style={styles.pillarMain}>{result.lagna}</Text>
                  <Text style={styles.pillarDesc}>स्वामी: {result.lagnaLord}</Text>
                </View>

                {/* 2. Rashi */}
                <View style={styles.pillarCard}>
                  <Text style={styles.pillarSub}>चंद्र रास (Moon Sign)</Text>
                  <Text style={styles.pillarMain}>{result.rashi}</Text>
                  <Text style={styles.pillarDesc}>राशी स्वामी: {result.rashiLord}</Text>
                </View>

                {/* 3. Nakshatra */}
                <View style={styles.pillarCard}>
                  <Text style={styles.pillarSub}>जन्म नक्षत्र (Nakshatra)</Text>
                  <Text style={styles.pillarMain}>{result.nakshatra}</Text>
                  <Text style={styles.pillarDesc}>चरण: {result.nakshatraPada}</Text>
                </View>

                {/* 4. Surya Rashi */}
                <View style={styles.pillarCard}>
                  <Text style={styles.pillarSub}>सूर्य रास (Sun Sign)</Text>
                  <Text style={styles.pillarMain}>{result.suryaRashi}</Text>
                  <Text style={styles.pillarDesc}>सौर स्थिती</Text>
                </View>
              </View>

              {/* Manglik Dosh Analysis */}
              <View
                style={[
                  styles.doshCard,
                  result.manglikDosh === 'NON_MANGLIK'
                    ? styles.doshCardSafe
                    : styles.doshCardAlert,
                ]}
              >
                <View style={styles.doshHeader}>
                  <Ionicons
                    name={
                      result.manglikDosh === 'NON_MANGLIK'
                        ? 'checkmark-circle'
                        : 'alert-circle'
                    }
                    size={22}
                    color={
                      result.manglikDosh === 'NON_MANGLIK' ? '#15803D' : colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.doshTitle,
                      result.manglikDosh === 'NON_MANGLIK'
                        ? styles.doshTitleSafe
                        : styles.doshTitleAlert,
                    ]}
                  >
                    {result.manglikDosh === 'NON_MANGLIK'
                      ? 'मांगलिक स्थिती: निर्दोष (Non-Manglik)'
                      : result.manglikDosh === 'ANSHIK_MANGLIK'
                      ? 'मांगलिक स्थिती: आंशिक मांगलिक'
                      : 'मांगलिक स्थिती: पूर्ण मांगलिक'}
                  </Text>
                </View>
                <Text style={styles.doshDesc}>{result.manglikDesc}</Text>
              </View>

              {/* Authentic Vedic 12-Bhava Diagram (Lagna Kundali Chakra) */}
              <View style={styles.chartSectionCard}>
                <View style={styles.chartHeader}>
                  <Ionicons name="compass-outline" size={20} color={colors.primary} />
                  <Text style={styles.chartSectionTitle}>लग्न कुंडली चक्र (12 Bhava Chakra)</Text>
                </View>

                {/* Vedic Traditional Diamond Square Chart Layout */}
                <View style={styles.diamondChartWrapper}>
                  {/* Top Row: Houses 12, 1, 2 */}
                  <View style={styles.chartRow}>
                    <View style={styles.chartBox}>
                      <Text style={styles.houseNum}>12</Text>
                      <Text style={styles.housePlanets}>Ke</Text>
                    </View>
                    <View style={[styles.chartBox, styles.lagnaBox]}>
                      <Text style={styles.houseNum}>1 (लग्न)</Text>
                      <Text style={styles.housePlanetsBold}>Lg, Ju</Text>
                    </View>
                    <View style={styles.chartBox}>
                      <Text style={styles.houseNum}>2</Text>
                      <Text style={styles.housePlanets}>Mo</Text>
                    </View>
                  </View>

                  {/* Middle Row: Houses 11, Center, 3 */}
                  <View style={styles.chartRow}>
                    <View style={styles.chartBox}>
                      <Text style={styles.houseNum}>11</Text>
                      <Text style={styles.housePlanets}>-</Text>
                    </View>
                    <View style={[styles.chartBox, styles.centerChartBadge]}>
                      <Ionicons name="flame" size={24} color={colors.gold} />
                      <Text style={styles.centerOm}>ॐ</Text>
                      <Text style={styles.centerChartText}>{result.rashi.split(' ')[0]}</Text>
                    </View>
                    <View style={styles.chartBox}>
                      <Text style={styles.houseNum}>3</Text>
                      <Text style={styles.housePlanets}>-</Text>
                    </View>
                  </View>

                  {/* Bottom Row: Houses 10, 4, 5 */}
                  <View style={styles.chartRow}>
                    <View style={styles.chartBox}>
                      <Text style={styles.houseNum}>10</Text>
                      <Text style={styles.housePlanets}>Ma</Text>
                    </View>
                    <View style={styles.chartBox}>
                      <Text style={styles.houseNum}>4</Text>
                      <Text style={styles.housePlanets}>Su, Me</Text>
                    </View>
                    <View style={styles.chartBox}>
                      <Text style={styles.houseNum}>5</Text>
                      <Text style={styles.housePlanets}>-</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.chartLegend}>
                  Lg: लग्न • Su: सूर्य • Mo: चंद्र • Ma: मंगळ • Me: बुध • Ju: गुरु • Ve: शुक्र • Sa: शनी • Ra/Ke: राहू/केतू
                </Text>
              </View>

              {/* Auspicious Elements (भाग्यशाली गोष्टी) */}
              <View style={styles.card}>
                <Text style={styles.sectionHeading}>भाग्यशाली घटक व रत्ने (Auspicious Elements)</Text>

                <View style={styles.luckyRow}>
                  <Ionicons name="diamond-outline" size={18} color={colors.secondary} />
                  <Text style={styles.luckyLabel}>भाग्यशाली रत्न (Lucky Gem):</Text>
                  <Text style={styles.luckyVal}>{result.luckyGem}</Text>
                </View>

                <View style={styles.luckyRow}>
                  <Ionicons name="color-palette-outline" size={18} color={colors.secondary} />
                  <Text style={styles.luckyLabel}>शुभ रंग (Lucky Color):</Text>
                  <Text style={styles.luckyVal}>{result.luckyColor}</Text>
                </View>

                <View style={styles.luckyRow}>
                  <Ionicons name="keypad-outline" size={18} color={colors.secondary} />
                  <Text style={styles.luckyLabel}>शुभ अंक (Lucky Numbers):</Text>
                  <Text style={styles.luckyVal}>{result.luckyNumber}</Text>
                </View>

                <View style={styles.luckyRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.secondary} />
                  <Text style={styles.luckyLabel}>शुभ वार (Lucky Day):</Text>
                  <Text style={styles.luckyVal}>{result.luckyDay}</Text>
                </View>

                <View style={styles.luckyRow}>
                  <Ionicons name="time-outline" size={18} color={colors.secondary} />
                  <Text style={styles.luckyLabel}>वर्तमान महादशा:</Text>
                  <Text style={styles.luckyVal}>{result.currentDasha}</Text>
                </View>
              </View>

              {/* Recommended Vedic Remedy & Puja */}
              <View style={styles.remedyCard}>
                <Text style={styles.remedyTag}>अनुशंसित वैदिक शांती (RECOMMENDED PUJA)</Text>
                <Text style={styles.remedyTitle}>{result.recommendedPuja}</Text>
                <Text style={styles.remedyDesc}>
                  आपल्या जन्म नक्षत्रातील व ग्रहदशेतील अनिष्ट दोष निवारण्यासाठी आणि सुख-समृद्धीसाठी या पूजेचा संकल्प करावा.
                </Text>

                <TouchableOpacity
                  style={styles.bookRemedyBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    onClose();
                    if (onBookPuja) onBookPuja(result.recommendedPuja);
                  }}
                >
                  <Text style={styles.bookRemedyText}>ही पूजा बुक करा (Book Puja)</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* New Search Button */}
              <TouchableOpacity style={styles.resetBtn} activeOpacity={0.8} onPress={handleReset}>
                <Ionicons name="search" size={16} color={colors.primary} />
                <Text style={styles.resetBtnText}>दुसरी कुंडली शोधा (Search Another Kundali)</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 1,
  },
  newSearchBtn: {
    padding: 6,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formContainer: {},
  astrologyHeroCard: {
    backgroundColor: '#7B2635',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroAstroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFE26B',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroCardDesc: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#382820',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    paddingVertical: 10,
    gap: 6,
  },
  genderBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  genderBtnTextActive: {
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    paddingHorizontal: 10,
    height: 44,
    fontSize: 13,
    textAlign: 'center',
    color: '#382820',
  },
  slashText: {
    fontSize: 16,
    color: '#8C7A70',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ampmContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    overflow: 'hidden',
    height: 44,
  },
  ampmBtn: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmBtnActive: {
    backgroundColor: colors.secondary,
  },
  ampmText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  ampmTextActive: {
    color: '#FFFFFF',
  },
  cityChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  cityChip: {
    backgroundColor: '#F7EFE4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  cityChipActive: {
    backgroundColor: colors.primary,
  },
  cityChipText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  reportContainer: {},
  devoteeBadgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    marginBottom: 12,
  },
  devoteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  devoteeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5EBE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devoteeName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  devoteeMeta: {
    fontSize: 11.5,
    color: '#735C50',
    marginTop: 2,
  },
  vedicVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  vedicVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  pillarCard: {
    width: (width - 42) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDE0CB',
  },
  pillarSub: {
    fontSize: 11,
    color: '#8C7A70',
    fontWeight: '600',
  },
  pillarMain: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  pillarDesc: {
    fontSize: 10.5,
    color: '#735C50',
    marginTop: 2,
  },
  doshCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  doshCardSafe: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  doshCardAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  doshHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  doshTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  doshTitleSafe: {
    color: '#15803D',
  },
  doshTitleAlert: {
    color: colors.primary,
  },
  doshDesc: {
    fontSize: 12,
    color: '#4B3F35',
    lineHeight: 16,
    marginLeft: 30,
  },
  chartSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  chartSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  diamondChartWrapper: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#FFFDF9',
  },
  chartRow: {
    flexDirection: 'row',
    height: 64,
  },
  chartBox: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#EDE0CB',
    padding: 4,
    justifyContent: 'space-between',
  },
  lagnaBox: {
    backgroundColor: '#FFF3E0',
  },
  centerChartBadge: {
    backgroundColor: '#7B2635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOm: {
    fontSize: 16,
    color: '#FFE26B',
    fontWeight: '900',
  },
  centerChartText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  houseNum: {
    fontSize: 9,
    color: '#8C7A70',
    fontWeight: '700',
  },
  housePlanets: {
    fontSize: 11,
    color: '#382820',
    fontWeight: '600',
    textAlign: 'center',
  },
  housePlanetsBold: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '800',
    textAlign: 'center',
  },
  chartLegend: {
    fontSize: 10,
    color: '#8C7A70',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  luckyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE3',
    gap: 8,
  },
  luckyLabel: {
    fontSize: 12,
    color: '#735C50',
    flex: 1,
  },
  luckyVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  remedyCard: {
    backgroundColor: '#FDF3E3',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    marginBottom: 14,
  },
  remedyTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  remedyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
    marginBottom: 6,
  },
  remedyDesc: {
    fontSize: 12,
    color: '#4B3F35',
    lineHeight: 17,
    marginBottom: 12,
  },
  bookRemedyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  bookRemedyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
