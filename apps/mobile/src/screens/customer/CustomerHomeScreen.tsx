import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../api/client';
import { Puja, PanditProfile, Booking } from '../../types';
import {
  APP_IMAGES,
  SPEEDY_PUJA_CATALOG,
  CatalogPujaItem,
  NEXT_30_DAYS_PANCHANG,
  POPULAR_SERVICES,
  PILGRIMAGE_CITIES,
  PanchangMuhuratItem,
} from '../../theme/culturalAssets';
import { KundaliModal } from '../../components/common/KundaliModal';
import { ReviewRatingModal } from '../../components/common/ReviewRatingModal';
import { DevSutraLogo } from '../../components/common/DevSutraLogo';
import { formatStandardDate, formatStandardTime } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

interface CustomerHomeScreenProps {
  onNavigatePujaDetail: (puja: Puja) => void;
  onNavigatePanditDetail: (pandit: PanditProfile) => void;
  onNavigateFindPandits?: () => void;
  onNavigateCategory: (categoryName: string) => void;
  onNavigateStore: () => void;
  onNavigateCart: () => void;
  onNavigateExplore: () => void;
  onNavigateNotifications?: () => void;
  onNavigateWallet?: () => void;
  onNavigateBookings?: () => void;
  onOpenDrawer?: () => void;
  onSelectCity: () => void;
  selectedCity?: string;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onNavigatePujaDetail,
  onNavigatePanditDetail,
  onNavigateFindPandits,
  onNavigateCategory,
  onNavigateStore,
  onNavigateCart,
  onNavigateExplore,
  onNavigateNotifications,
  onNavigateWallet,
  onNavigateBookings,
  onOpenDrawer,
  onSelectCity,
  selectedCity = 'Pune',
}) => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const [featuredPandits, setFeaturedPandits] = useState<PanditProfile[]>([]);
  const [panditsLoading, setPanditsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showKundaliModal, setShowKundaliModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);

  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1',
      name: 'राहुल देशमुख',
      city: 'कोथरूड, पुणे',
      rating: 5,
      date: '१६ नोव्हेंबर २०२६',
      puja: 'गृहप्रवेश व वास्तु शांती',
      comment: 'गृहप्रवेश व वास्तु शांती अतिशय शास्त्रोक्त पद्धतीने झाली. गुरुजी वेळेवर आले व सर्व पूजा सामग्री १००% शुद्ध होती.',
    },
    {
      id: 'rev-2',
      name: 'स्नेहा कुलकर्णी',
      city: 'ठाणे, मुंबई',
      rating: 5,
      date: '१२ नोव्हेंबर २०२६',
      puja: 'सत्यनारायण महापूजा',
      comment: 'सत्यनारायण पूजेची कथा व अभिषेक खूप प्रसन्न वातावरणात पार पडला. शीरा महाप्रसाद व मांडणी अतिशय सुंदर होती.',
    },
    {
      id: 'rev-3',
      name: 'महेश जोशी',
      city: 'गंगापूर रोड, नाशिक',
      rating: 5,
      date: '०८ नोव्हेंबर २०२६',
      puja: 'रुद्राभिषेक व महामृत्युंजय',
      comment: 'रुद्राभिषेक विधी खूप भक्तिमय झाला. गुरुजींचे संस्कृत मंत्रोच्चार अतिशय स्पष्ट व प्रभावी होते. DevSutra ची सेवा उत्तम आहे.',
    },
  ]);

  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setPanditsLoading(true);
      // Fetch all verified Pandits directly from PostgreSQL
      const allPandits = await api.getPandits().catch(() => []);
      if (Array.isArray(allPandits) && allPandits.length > 0) {
        // Sort matching city first so devotees see local pandits first while accessing the full directory
        const sorted = [...allPandits].sort((a, b) => {
          if (selectedCity && selectedCity !== 'All Cities') {
            const aMatch = a.city?.toLowerCase().includes(selectedCity.toLowerCase());
            const bMatch = b.city?.toLowerCase().includes(selectedCity.toLowerCase());
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
          }
          return 0;
        });
        setFeaturedPandits(sorted);
      }

      const myBookings = await api.getMyBookings();
      if (myBookings && myBookings.length > 0) {
        const active = myBookings.find(
          (b) => b.status === 'CONFIRMED' || b.status === 'PENDING'
        );
        setUpcomingBooking(active || myBookings[0]);
      }

      // Fetch dynamic active promotional coupons from Admin
      const couponsRes = await api.getActiveCoupons().catch(() => []);
      if (Array.isArray(couponsRes) && couponsRes.length > 0) {
        setActiveCoupons(couponsRes);
      }

      // Fetch dynamic verified devotee reviews from PostgreSQL
      const pubReviews = await api.getPublicReviews().catch(() => []);
      if (Array.isArray(pubReviews) && pubReviews.length > 0) {
        setReviewsList(
          pubReviews.map((r: any) => ({
            id: r.id,
            name: r.customer?.customerProfile
              ? `${r.customer.customerProfile.firstName} ${r.customer.customerProfile.lastName || ''}`.trim()
              : (r.customer?.email?.split('@')[0] || 'Devotee'),
            city: r.panditProfile?.fullName ? `Purohit: ${r.panditProfile.fullName}` : 'Verified Devotee',
            rating: r.rating || 5,
            date: new Date(r.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            puja: r.booking?.puja?.title || 'Vedic Puja Ceremony',
            comment: r.comment || 'Sacred ceremony performed with complete Vedic rituals.',
          }))
        );
      }
    } catch (e) {
      console.warn('Error loading data:', e);
    } finally {
      setPanditsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCity]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePujaCardPress = (item: CatalogPujaItem) => {
    const puja: Puja = {
      id: item.id,
      categoryId: item.category,
      title: item.name,
      slug: item.id,
      description: item.description,
      basePrice: item.price,
      durationMinutes: parseInt(item.duration) || 120,
    };
    onNavigatePujaDetail(puja);
  };

  const [bookingService, setBookingService] = useState('Satyanarayan Puja');
  const [bookingDate, setBookingDate] = useState('19 Nov 2026');

  const openWhatsAppCoordinator = () => {
    const msg = encodeURIComponent(`नमस्कार! मला ${selectedCity} मध्ये ${bookingService} साठी पुरोहित बुक करायचे आहेत.`);
    Linking.openURL(`https://wa.me/919822012345?text=${msg}`).catch(() => {
      Alert.alert('WhatsApp', 'कृपया थेट संपर्क साधा: +91 98220 12345');
    });
  };

  const handleBookIn30Min = () => {
    Alert.alert(
      '⚡ Book in 30 Min (तातडीने पुरोहित सेवा)',
      `${selectedCity} मधील जवळचे प्रमाणित वैदिक पुरोहित ३० मिनिटांत आपल्या पत्त्यावर पोहोचू शकतात. त्वरित पूजा सुरू करा?`,
      [
        { text: 'रद्द करा', style: 'cancel' },
        { text: 'तातडीने बुक करा', onPress: onNavigateExplore },
      ]
    );
  };

  const handlePanchangItemPress = (item: PanchangMuhuratItem) => {
    const matched = SPEEDY_PUJA_CATALOG.find((p) => p.id === item.pujaId) || SPEEDY_PUJA_CATALOG[0];
    handlePujaCardPress(matched);
  };

  return (
    <View style={styles.safe}>
      {/* Top Auspicious Ribbon (Matching Web) */}
      <View style={[styles.topAuspiciousRibbon, { paddingTop: Math.max(headerPaddingTop - 28, 4) }]}>
        <Ionicons name="sparkles" size={11} color="#FFE26B" style={{ marginRight: 4 }} />
        <Text style={styles.topAuspiciousRibbonText} numberOfLines={1}>
          Vedic Tradition • 100% Verified Gurukul Pandits • Pure Samagri
        </Text>
      </View>

      {/* Top Header with DevSutra Logo & Quick Controls */}
      <View style={styles.topHeader}>
        {/* Left Hamburger Drawer Menu */}
        <TouchableOpacity style={styles.menuBtn} onPress={onOpenDrawer} activeOpacity={0.7}>
          <View style={styles.hamburgerContainer}>
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
          </View>
        </TouchableOpacity>

        {/* Center DevSutra Logo */}
        <View style={styles.headerLogoCenter}>
          <DevSutraLogo variant="horizontal" size="sm" showTagline={false} />
        </View>

        {/* Right Controls: City Selector + Cart + Notifications */}
        <View style={styles.headerRightControls}>
          {/* City Selector */}
          <TouchableOpacity style={styles.citySelector} onPress={onSelectCity} activeOpacity={0.7}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text style={styles.cityText} numberOfLines={1}>{selectedCity}</Text>
            <Ionicons name="chevron-down" size={11} color={colors.primary} />
          </TouchableOpacity>

          {/* Cart Icon with Dynamic Badge */}
          <TouchableOpacity style={styles.cartBtn} onPress={onNavigateCart} activeOpacity={0.7}>
            <Ionicons name="bag-handle-outline" size={22} color={colors.primary} />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity style={styles.bellBtn} onPress={onNavigateNotifications} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar Prompt */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={onNavigateFindPandits || onNavigateExplore}
        >
          <Ionicons name="search" size={18} color="#8C7A70" style={{ marginRight: 8 }} />
          <Text style={styles.searchPlaceholder}>Search Puja / पूजेचा शोध घ्या...</Text>
        </TouchableOpacity>

        {/* Authentic Indian Vedic Ritual Hero Banner */}
        <View style={styles.heroBannerContainer}>
          <View style={styles.heroBannerCard}>
            <Image
              source={APP_IMAGES.familyBanner}
              style={styles.heroBackgroundImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />

            <View style={styles.heroContentBlock}>
              <View style={styles.heroPill}>
                <Ionicons name="sparkles" size={12} color="#FFE26B" />
                <Text style={styles.heroPillText}>वैदिक संकल्प व अनुष्ठान</Text>
              </View>

              <Text style={styles.heroTitleMain}>घर बसल्या अनुभवा</Text>
              <Text style={styles.heroTitleSub}>पवित्र पूजा व शांती विधी</Text>

              <Text style={styles.heroFeaturePoints}>
                • गुरुकुल प्रमाणित पुरोहित  • १००% शुद्ध पूजा सामग्री
              </Text>

              {/* Action Buttons Row matching website */}
              <View style={styles.heroActionBtnsRow}>
                <TouchableOpacity
                  style={styles.heroCtaBtn}
                  activeOpacity={0.85}
                  onPress={onNavigateExplore}
                >
                  <Ionicons name="calendar-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.heroCtaBtnText}>Book Puja</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.heroExploreBtn}
                  activeOpacity={0.85}
                  onPress={() => onNavigateCategory('Regular Puja')}
                >
                  <Ionicons name="flame-outline" size={14} color="#FFF8EC" style={{ marginRight: 4 }} />
                  <Text style={styles.heroExploreBtnText}>Explore Services</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Trust Highlights Strip (Matching Website Exactly) */}
        <View style={styles.trustHighlightsStrip}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={18} color="#C49A45" />
            <View style={styles.trustItemTextCol}>
              <Text style={styles.trustItemTitle}>Gurukul Verified</Text>
              <Text style={styles.trustItemSub}>100% Checked</Text>
            </View>
          </View>

          <View style={styles.trustItem}>
            <Ionicons name="flame" size={18} color={colors.secondary} />
            <View style={styles.trustItemTextCol}>
              <Text style={styles.trustItemTitle}>Pure Vedic Vidhi</Text>
              <Text style={styles.trustItemSub}>Shastric Mantras</Text>
            </View>
          </View>

          <View style={styles.trustItem}>
            <Ionicons name="bag-check" size={18} color="#C49A45" />
            <View style={styles.trustItemTextCol}>
              <Text style={styles.trustItemTitle}>Temple Samagri</Text>
              <Text style={styles.trustItemSub}>100% Pure</Text>
            </View>
          </View>

          <View style={styles.trustItem}>
            <Ionicons name="heart-circle" size={18} color={colors.secondary} />
            <View style={styles.trustItemTextCol}>
              <Text style={styles.trustItemTitle}>Clear Dakshina</Text>
              <Text style={styles.trustItemSub}>No Hidden Fees</Text>
            </View>
          </View>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* EXACT REFERENCE IMAGE 2: SMART LOCATION & BOOKING BAR */}
        {/* ------------------------------------------------------------- */}
        <View style={styles.smartBookingBox}>
          {/* Top 3 Input Selectors */}
          <View style={styles.smartInputsGrid}>
            {/* 1. Location Selector */}
            <TouchableOpacity
              style={styles.smartInputCol}
              activeOpacity={0.8}
              onPress={onSelectCity}
            >
              <View style={styles.smartInputHeader}>
                <Ionicons name="location" size={13} color="#EA580C" />
                <Text style={styles.smartInputLabel}>Location</Text>
              </View>
              <View style={styles.smartInputBody}>
                <Ionicons name="navigate-outline" size={15} color="#9A3412" style={{ marginRight: 4 }} />
                <Text style={styles.smartInputVal} numberOfLines={1}>{selectedCity}, MH</Text>
              </View>
              <Text style={styles.smartInputHelper}>📍 Use Current Location</Text>
            </TouchableOpacity>

            {/* 2. Service Selector */}
            <TouchableOpacity
              style={styles.smartInputCol}
              activeOpacity={0.8}
              onPress={onNavigateExplore}
            >
              <View style={styles.smartInputHeader}>
                <Ionicons name="flame" size={13} color="#EA580C" />
                <Text style={styles.smartInputLabel}>Service</Text>
              </View>
              <View style={styles.smartInputBody}>
                <Text style={styles.smartInputVal} numberOfLines={1}>{bookingService}</Text>
                <Ionicons name="chevron-down" size={12} color="#9A3412" style={{ marginLeft: 2 }} />
              </View>
              <Text style={styles.smartInputHelper}>Choose a service</Text>
            </TouchableOpacity>

            {/* 3. Date Selector */}
            <TouchableOpacity
              style={styles.smartInputCol}
              activeOpacity={0.8}
              onPress={() => onNavigateCategory('Regular Puja')}
            >
              <View style={styles.smartInputHeader}>
                <Ionicons name="calendar" size={13} color="#EA580C" />
                <Text style={styles.smartInputLabel}>Date</Text>
              </View>
              <View style={styles.smartInputBody}>
                <Ionicons name="calendar-outline" size={14} color="#9A3412" style={{ marginRight: 4 }} />
                <Text style={styles.smartInputVal} numberOfLines={1}>{bookingDate}</Text>
              </View>
              <Text style={styles.smartInputHelper}>Choose your date</Text>
            </TouchableOpacity>
          </View>

          {/* 3 Action Buttons Row: Find Pandits | Book in 30 Min | Book via WhatsApp */}
          <View style={styles.smartActionsRow}>
            {/* Action 1: Find Pandits (Primary Orange) */}
            <TouchableOpacity
              style={styles.findPanditsBtn}
              activeOpacity={0.85}
              onPress={onNavigateFindPandits || onNavigateExplore}
            >
              <Ionicons name="search" size={15} color="#FFFFFF" />
              <Text style={styles.findPanditsBtnText}>Find Pandits</Text>
            </TouchableOpacity>

            {/* Action 2: Book in 30 Min */}
            <TouchableOpacity
              style={styles.bookIn30Btn}
              activeOpacity={0.85}
              onPress={handleBookIn30Min}
            >
              <Ionicons name="flash" size={14} color="#EA580C" />
              <Text style={styles.bookIn30BtnText}>Book in 30 Min</Text>
            </TouchableOpacity>

            {/* Action 3: Book via WhatsApp */}
            <TouchableOpacity
              style={styles.bookWhatsAppBtn}
              activeOpacity={0.85}
              onPress={openWhatsAppCoordinator}
            >
              <Ionicons name="logo-whatsapp" size={15} color="#16A34A" />
              <Text style={styles.bookWhatsAppBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Special Festive Offers & Coupons (Live from Admin Dashboard) */}
        {activeCoupons.length > 0 && (
          <View style={styles.offersSection}>
            <View style={styles.offersHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="gift" size={16} color="#D97706" />
                <Text style={styles.offersSectionTitle}>Festive Offers & Coupons (विशेष सवलत)</Text>
              </View>
              <Text style={styles.offersCountBadge}>{activeCoupons.length} Active</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersScrollContent}>
              {activeCoupons.map((c) => (
                <TouchableOpacity
                  key={c.id || c.code}
                  style={styles.offerCard}
                  activeOpacity={0.85}
                  onPress={onNavigateExplore}
                >
                  <View style={styles.offerCardTop}>
                    <View style={styles.offerCodeBadge}>
                      <Ionicons name="pricetag" size={10} color="#FFFFFF" />
                      <Text style={styles.offerCodeBadgeText}>{c.code}</Text>
                    </View>
                    <Text style={styles.offerValue}>
                      {c.discountAmount ? `₹${c.discountAmount} OFF` : `${c.discountPct}% OFF`}
                    </Text>
                  </View>
                  <Text style={styles.offerSubtitle} numberOfLines={1}>
                    {c.minSpend ? `On bookings above ₹${c.minSpend}` : 'Valid on all sacred rituals'}
                  </Text>
                  <View style={styles.offerCtaRow}>
                    <Text style={styles.offerCtaText}>Apply at checkout</Text>
                    <Ionicons name="arrow-forward" size={11} color="#B45309" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ------------------------------------------------------------- */}
        {/* EXACT REFERENCE IMAGE 2: POPULAR SERVICES & CITIES */}
        {/* ------------------------------------------------------------- */}
        <View style={styles.popularServicesContainer}>
          <View style={styles.popularTitleBadgeWrapper}>
            <Text style={styles.popularTitleBadge}>✦ Popular Services / लोकप्रिय पूजा सेवा ✦</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularServicesScroll}
          >
            {POPULAR_SERVICES.map((srv) => (
              <TouchableOpacity
                key={srv.id}
                style={styles.popularServiceItem}
                activeOpacity={0.8}
                onPress={() => onNavigateCategory(srv.category)}
              >
                <View style={styles.popularIconCircle}>
                  <Ionicons name={srv.iconName as any} size={24} color="#D97706" />
                </View>
                <Text style={styles.popularServiceName} numberOfLines={1}>{srv.name}</Text>
                <Text style={styles.popularServiceDevanagari}>{srv.devanagariName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Pills Row: Pooja Packages & View All Services */}
          <View style={styles.servicePillsRow}>
            <TouchableOpacity
              style={[styles.packagePill, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}
              activeOpacity={0.8}
              onPress={onNavigateStore}
            >
              <Ionicons name="basket" size={14} color="#B45309" />
              <Text style={[styles.packagePillText, { color: '#92400E', fontWeight: '800' }]}>
                Samagri Store (पूजा सामग्री)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewAllPill}
              activeOpacity={0.8}
              onPress={onNavigateExplore}
            >
              <Text style={styles.viewAllPillText}>View All Services</Text>
              <Ionicons name="chevron-forward" size={13} color="#9A3412" />
            </TouchableOpacity>
          </View>

          {/* Popular Cities Quick Scroll */}
          <View style={styles.citiesScrollWrapper}>
            <View style={styles.citiesBadgeLabel}>
              <Text style={styles.citiesBadgeText}>Cities</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesScroll}>
              {PILGRIMAGE_CITIES.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.cityChip, c === selectedCity && styles.cityChipActive]}
                  onPress={onSelectCity}
                >
                  <Text style={[styles.cityChipText, c === selectedCity && styles.cityChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* EXACT REFERENCE IMAGE 1: NEXT 30 DAYS PANCHANG & MUHURAT */}
        {/* ------------------------------------------------------------- */}
        <View style={styles.panchangSection}>
          <Text style={styles.panchangSubtitle}>
            Personalized recommendations based on today&apos;s Panchang.
          </Text>
          <View style={styles.panchangHeaderRow}>
            <View>
              <Text style={styles.panchangTitle}>पुढील ३० दिवसांचे शुभ मुहूर्त व पंचांग</Text>
              <Text style={styles.panchangEnTitle}>Upcoming 30 Days Sacred Muhurats & Pujas</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigateCategory('Regular Puja')}>
              <Text style={styles.panchangViewAll}>सर्व पहा &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Panchang Cards with Exact Circular Action Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.panchangScroll}
          >
            {NEXT_30_DAYS_PANCHANG.map((item) => {
              const isRecommended = item.badgeType === 'recommended';
              const isToday = item.badgeType === 'today';
              const isTomorrow = item.badgeType === 'tomorrow';

              return (
                <View key={item.id} style={styles.panchangCard}>
                  {/* Top Circular Sacred Icon */}
                  <View style={styles.panchangIconCircle}>
                    {item.icon === 'kalash' && <Ionicons name="wine" size={28} color="#D97706" />}
                    {item.icon === 'diya' && <Ionicons name="flame" size={28} color="#EA580C" />}
                    {item.icon === 'calendar' && <Ionicons name="calendar" size={26} color="#B45309" />}
                    {item.icon === 'lotus' && <Ionicons name="flower" size={28} color="#DB2777" />}
                    {item.icon === 'ganesh' && <Ionicons name="sparkles" size={28} color="#EAB308" />}
                  </View>

                  {/* Card Title & Devanagari */}
                  <Text style={styles.panchangCardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.panchangCardDevanagari}>{item.devanagariName}</Text>

                  {/* Description */}
                  <Text style={styles.panchangCardDesc} numberOfLines={2}>{item.description}</Text>

                  {/* Bottom Auspicious Badge */}
                  <View
                    style={[
                      styles.panchangBadge,
                      isRecommended && styles.panchangBadgeRecommended,
                      isToday && styles.panchangBadgeToday,
                      isTomorrow && styles.panchangBadgeTomorrow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.panchangBadgeText,
                        isRecommended && styles.panchangBadgeTextRecommended,
                        isToday && styles.panchangBadgeTextToday,
                        isTomorrow && styles.panchangBadgeTextTomorrow,
                      ]}
                    >
                      {item.badge}
                    </Text>
                  </View>

                  {/* Circular Orange Arrow Action Button as in Screenshot 1 */}
                  <TouchableOpacity
                    style={styles.panchangCircleBtn}
                    activeOpacity={0.85}
                    onPress={() => handlePanchangItemPress(item)}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* EXACT REFERENCE IMAGE: BHAGAVAD GITA SACRED SHLOKA BANNER */}
        {/* ------------------------------------------------------------- */}
        <View style={styles.gitaShlokaBanner}>
          <Text style={styles.gitaShlokaText}>
            पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति।
          </Text>
          <Text style={styles.gitaShlokaTranslation}>
            &ldquo;The Divine accepts even the simplest offering when it is made with true devotion.&rdquo;
          </Text>
          <Text style={styles.gitaShlokaAuthor}>— Bhagavad Gita (9.26)</Text>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* SAMAGRAN-INSPIRED INNOVATION: ALL-IN-ONE PUJA KITS & E-PUJA */}
        {/* ------------------------------------------------------------- */}
        <View style={styles.samagranSection}>
          <View style={styles.samagranHeader}>
            <View>
              <Text style={styles.samagranBadge}>✦ Samagran Vedic Excellence ✦</Text>
              <Text style={styles.samagranTitle}>पवित्र पूजा किट्स आणि थेट ई-पूजा</Text>
              <Text style={styles.samagranSubtitle}>Curated 100% Sattvic Kits &amp; Live Video Sankalp</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.samagranScroll}>
            {/* Kit 1 */}
            <TouchableOpacity style={styles.samagranCard} activeOpacity={0.85} onPress={onNavigateExplore}>
              <View style={[styles.samagranIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="basket-outline" size={24} color="#D97706" />
              </View>
              <Text style={styles.samagranCardTitle}>संपूर्ण पूजा किट पेटी</Text>
              <Text style={styles.samagranCardSub}>Satyanarayan 54-Item Box</Text>
              <Text style={styles.samagranCardDesc}>शुद्ध देशी गायीचे तूप, अक्षता, गंगाजळ, धूप व समिधा पेटी</Text>
              <View style={styles.samagranCardAction}>
                <Text style={styles.samagranActionText}>ऑर्डर करा &gt;</Text>
              </View>
            </TouchableOpacity>

            {/* Kit 2 */}
            <TouchableOpacity style={styles.samagranCard} activeOpacity={0.85} onPress={() => handlePujaCardPress(SPEEDY_PUJA_CATALOG[0])}>
              <View style={[styles.samagranIconBox, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="videocam-outline" size={24} color="#EA580C" />
              </View>
              <Text style={styles.samagranCardTitle}>थेट व्हिडिओ ई-पूजा</Text>
              <Text style={styles.samagranCardSub}>Live NRI &amp; Outstation Sankalp</Text>
              <Text style={styles.samagranCardDesc}>घरबसल्या HD लाईव्ह व्हिडिओवर वैयक्तिक गोत्र संकल्प व प्रसाद</Text>
              <View style={styles.samagranCardAction}>
                <Text style={styles.samagranActionText}>बुक करा &gt;</Text>
              </View>
            </TouchableOpacity>

            {/* Kit 3 */}
            <TouchableOpacity style={styles.samagranCard} activeOpacity={0.85} onPress={openWhatsAppCoordinator}>
              <View style={[styles.samagranIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="document-text-outline" size={24} color="#16A34A" />
              </View>
              <Text style={styles.samagranCardTitle}>सामग्री यादी (Checklist)</Text>
              <Text style={styles.samagranCardSub}>Free WhatsApp PDF List</Text>
              <Text style={styles.samagranCardDesc}>गुरुजी काय आणणार आणि यजमानांनी काय तयार ठेवायचे</Text>
              <View style={styles.samagranCardAction}>
                <Text style={styles.samagranActionText}>यादी मिळवा &gt;</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Compact Upcoming Booking Card (Below Main Panchang & Services) */}
        {upcomingBooking && (
          <TouchableOpacity
            style={styles.compactUpcomingCard}
            activeOpacity={0.88}
            onPress={onNavigateBookings}
          >
            <View style={styles.compactUpcomingRow}>
              <View style={styles.compactUpcomingIcon}>
                <Ionicons name="flame" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <View style={styles.compactUpcomingBadge}>
                    <Ionicons name="checkmark-circle" size={11} color="#15803D" />
                    <Text style={styles.compactUpcomingBadgeText}>Upcoming Ritual</Text>
                  </View>
                  <Text style={styles.compactUpcomingRef}>
                    #{upcomingBooking.id.slice(0, 8).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.compactUpcomingTitle} numberOfLines={1}>
                  {upcomingBooking.puja?.title || 'पवित्र वैदिक पूजा'}
                </Text>
                <Text style={styles.compactUpcomingDateTime} numberOfLines={1}>
                  📅 {formatStandardDate(upcomingBooking.pujaDate || upcomingBooking.bookingDate)} • ⏰ {formatStandardTime(upcomingBooking.pujaTimeSlot || upcomingBooking.timeSlot)}
                </Text>
              </View>
              <View style={styles.compactUpcomingAction}>
                <Text style={styles.compactUpcomingActionText}>View</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* 3 Quick Category Chips - Speedy Pandit Style */}
        <View style={styles.categoryChipsRow}>
          {/* 1. Regular Puja */}
          <TouchableOpacity
            style={styles.categoryChip}
            activeOpacity={0.8}
            onPress={() => onNavigateCategory('Regular Puja')}
          >
            <Ionicons name="home-outline" size={22} color={colors.primary} />
            <Text style={styles.categoryChipText}>Regular Puja</Text>
          </TouchableOpacity>

          {/* 2. Festive Puja */}
          <TouchableOpacity
            style={styles.categoryChip}
            activeOpacity={0.8}
            onPress={() => onNavigateCategory('Festive Puja')}
          >
            <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
            <Text style={styles.categoryChipText}>Festive Puja</Text>
          </TouchableOpacity>

          {/* 3. All Hawan */}
          <TouchableOpacity
            style={styles.categoryChip}
            activeOpacity={0.8}
            onPress={() => onNavigateCategory('All Hawan')}
          >
            <Ionicons name="flame-outline" size={22} color={colors.primary} />
            <Text style={styles.categoryChipText}>All Hawan</Text>
          </TouchableOpacity>
        </View>

        {/* This Month's Trending Pujas */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>This Month’s Trending Pujas</Text>
          <TouchableOpacity onPress={onNavigateExplore}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Trending Pujas Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScroll}
        >
          {SPEEDY_PUJA_CATALOG.slice(0, 5).map((puja) => (
            <TouchableOpacity
              key={puja.id}
              style={styles.trendingCard}
              activeOpacity={0.85}
              onPress={() => handlePujaCardPress(puja)}
            >
              <View style={styles.trendingImageContainer}>
                <Image source={puja.image} style={styles.trendingImage} resizeMode="cover" />
                {puja.discount && (
                  <View style={styles.trendingDiscountBadge}>
                    <Text style={styles.trendingDiscountText}>{puja.discount}</Text>
                  </View>
                )}
              </View>

              <View style={styles.trendingCardContent}>
                <Text style={styles.trendingCategory}>{puja.category}</Text>
                <Text style={styles.trendingTitle} numberOfLines={1}>
                  {puja.name}
                </Text>
                <View style={styles.trendingPriceRow}>
                  <Text style={styles.trendingCurrentPrice}>{puja.price}/-</Text>
                  {puja.originalPrice > puja.price && (
                    <Text style={styles.trendingOriginalPrice}>{puja.originalPrice}/-</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Puja Mudra Balance Reminder Banner */}
        <TouchableOpacity
          style={styles.mudraBanner}
          activeOpacity={0.85}
          onPress={onNavigateWallet}
        >
          <Image
            source={APP_IMAGES.devsutraMudra}
            style={styles.mudraBannerIcon}
            resizeMode="contain"
          />
          <View style={styles.mudraBannerTextCol}>
            <Text style={styles.mudraBannerTitle}>Puja Mudra Wallet (पूजा मुद्रा)</Text>
            <Text style={styles.mudraBannerDesc}>
              You have 300 Puja Mudras (₹300) available to redeem.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

        {/* Vedic Janam Kundali Card - Interactive Kundali Search */}
        <View style={styles.kundaliCardContainer}>
          <View style={styles.kundaliCard}>
            <View style={styles.kundaliContent}>
              <View style={styles.kundaliBadgeRow}>
                <Ionicons name="sparkles" size={13} color="#FFE26B" />
                <Text style={styles.kundaliBadgeText}>Vedic Jyotish Shastra</Text>
              </View>
              <Text style={styles.kundaliTitle}>आपली जन्म कुंडली तपासा</Text>
              <Text style={styles.kundaliDesc}>
                रास, लग्न, नक्षत्र, मांगलिक दोष आणि भाग्यशाली रत्न शोधा — संपूर्ण मोफत!
              </Text>
              <TouchableOpacity
                style={styles.kundaliCtaBtn}
                activeOpacity={0.85}
                onPress={() => setShowKundaliModal(true)}
              >
                <Ionicons name="planet" size={16} color={colors.primary} />
                <Text style={styles.kundaliCtaText}>मोफत कुंडली पहा (Get Kundali)</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.kundaliIconWrapper}>
              <View style={styles.kundaliCircleIcon}>
                <Text style={styles.kundaliOm}>ॐ</Text>
                <Text style={styles.kundaliSubIconText}>कुंडली</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Verified Vedic Pandits in Your City */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <View>
            <Text style={styles.sectionHeaderTitle}>Verified Vedic Pandits</Text>
            <Text style={styles.sectionHeaderSubtitle}>Available Purohits in {selectedCity}</Text>
          </View>
          <TouchableOpacity onPress={onNavigateFindPandits || onNavigateExplore}>
            <Text style={styles.viewAllText}>View All Pandits</Text>
          </TouchableOpacity>
        </View>

        {panditsLoading ? (
          <View style={styles.panditsLoadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.panditsLoadingText}>Connecting verified scholars...</Text>
          </View>
        ) : featuredPandits.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.panditsScroll}
          >
            {featuredPandits.map((pandit) => (
              <TouchableOpacity
                key={pandit.id}
                style={styles.panditCard}
                activeOpacity={0.85}
                onPress={() => onNavigatePanditDetail(pandit)}
              >
                <Image
                  source={pandit.avatarUrl ? { uri: pandit.avatarUrl } : APP_IMAGES.panditRameshwar}
                  style={styles.panditAvatar}
                  resizeMode="cover"
                />
                <View style={styles.panditBadgeRow}>
                  <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                  <Text style={styles.panditVerifiedText}>Vedic Certified</Text>
                </View>
                <Text style={styles.panditName} numberOfLines={1}>
                  {pandit.fullName}
                </Text>
                <Text style={styles.panditExp} numberOfLines={1}>
                  📍 {pandit.city || 'Maharashtra'} • {pandit.experienceYears || 15}+ Yrs
                </Text>
                <Text style={styles.panditPrice}>₹{pandit.basePrice || 2100} Dakshina</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyPanditsCard}>
            <Ionicons name="school-outline" size={32} color={colors.goldDark} />
            <Text style={styles.emptyPanditsTitle}>Verified Vedic Scholars</Text>
            <Text style={styles.emptyPanditsSubtitle}>
              Browse certified Vedic scholars and Purohits for your family rituals.
            </Text>
            <TouchableOpacity
              style={styles.browseAllPanditsBtn}
              onPress={onNavigateFindPandits || onNavigateExplore}
            >
              <Text style={styles.browseAllPanditsBtnText}>Browse Available Pandits</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Sampurna Puja Kit & Thali Banner */}
        <TouchableOpacity
          style={styles.storeCtaBanner}
          activeOpacity={0.85}
          onPress={onNavigateStore}
        >
          <View style={styles.storeCtaContent}>
            <Text style={styles.storeCtaTag}>🚩 १००% शुद्ध व संकल्पित वैदिक साहित्य</Text>
            <Text style={styles.storeCtaTitle}>संपूर्ण पूजा किट्स व पूजा ताट</Text>
            <Text style={styles.storeCtaDesc}>
              नारळ, ताजी फुले, पितळी दिवा, शुद्ध पूजा तेल, वाती, हळद-कुंकू, कापूर, अगरबत्ती सहित संपूर्ण पूजा ताट उपलब्ध.
            </Text>
            <View style={styles.storeCtaBtn}>
              <Text style={styles.storeCtaBtnText}>पूजेचे ताट निवडा व बुक करा</Text>
              <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Image
            source={APP_IMAGES.brassThali}
            style={styles.storeCtaImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Customer Reviews & Devotee Testimonials */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeaderRow}>
            <View>
              <Text style={styles.reviewsTitle}>भक्तांचे अनुभव व रेटिंग्ज</Text>
              <Text style={styles.reviewsSubtitle}>Verified Customer Reviews & Feedback</Text>
            </View>
            <View style={styles.ratingBadgePill}>
              <Ionicons name="star" size={13} color="#FFFFFF" />
              <Text style={styles.ratingBadgePillText}>४.९ ★ (१०k+)</Text>
            </View>
          </View>

          {/* Rate Experience Button */}
          <TouchableOpacity
            style={styles.giveRatingBtn}
            activeOpacity={0.85}
            onPress={() => setShowReviewModal(true)}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.giveRatingBtnText}>आपला पूजेचा अनुभव शेअर करा (Rate Puja)</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>

          {/* Horizontal Review Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}
          >
            {reviewsList.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewCardTop}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitial}>{rev.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.reviewerName}>{rev.name}</Text>
                    <Text style={styles.reviewerCity}>{rev.city}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={12} color="#EAB308" />
                    ))}
                  </View>
                </View>

                <View style={styles.reviewPujaTag}>
                  <Ionicons name="checkmark-done" size={11} color="#15803D" />
                  <Text style={styles.reviewPujaText}>{rev.puja}</Text>
                </View>

                <Text style={styles.reviewComment} numberOfLines={3}>
                  "{rev.comment}"
                </Text>
                <Text style={styles.reviewDate}>{rev.date}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Authentic Devotional Trust Footer */}
        <View style={styles.trustFooter}>
          <View style={{ marginBottom: 10 }}>
            <DevSutraLogo variant="vertical" size="md" />
          </View>
          <Text style={styles.footerTagline}>अस्सल भारतीय वैदिक परंपरा • आपल्या दारी</Text>

          {/* 3 Pillars */}
          <View style={styles.footerPillars}>
            <View style={styles.pillarItem}>
              <View style={styles.pillarIcon}>
                <Ionicons name="school" size={20} color={colors.gold} />
              </View>
              <Text style={styles.pillarTitle}>गुरुकुल प्रमाणित</Text>
              <Text style={styles.pillarDesc}>वेदाभ्यासी पुरोहित</Text>
            </View>

            <View style={styles.pillarItem}>
              <View style={styles.pillarIcon}>
                <Ionicons name="sparkles" size={20} color={colors.gold} />
              </View>
              <Text style={styles.pillarTitle}>१००% शुद्ध सामग्री</Text>
              <Text style={styles.pillarDesc}>पवित्र होम-हवन किट</Text>
            </View>

            <View style={styles.pillarItem}>
              <View style={styles.pillarIcon}>
                <Ionicons name="time" size={20} color={colors.gold} />
              </View>
              <Text style={styles.pillarTitle}>वेळेवर सेवा</Text>
              <Text style={styles.pillarDesc}>मुहूर्तावर आगमन</Text>
            </View>
          </View>

          {/* Support Line */}
          <View style={styles.footerContactRow}>
            <Ionicons name="call-outline" size={15} color="#D4A373" />
            <Text style={styles.footerContactText}>भक्त हेल्पलाइन: +91 98220 12345 (24x7 Seva)</Text>
          </View>

          <Text style={styles.copyrightText}>
            © 2026 DevSutra Technologies Pvt. Ltd. सर्व हक्क सुरक्षित.
          </Text>
        </View>
      </ScrollView>

      {/* Kundali Search & Calculator Modal */}
      <KundaliModal
        visible={showKundaliModal}
        onClose={() => setShowKundaliModal(false)}
        onBookPuja={() => onNavigateCategory('Regular Puja')}
      />

      {/* Review & Rating Modal */}
      <ReviewRatingModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitSuccess={(newRev) => {
          loadData();
          setReviewsList((prev) => [
            {
              id: 'rev-' + Date.now(),
              name: newRev.authorName,
              city: 'पुणे',
              rating: newRev.rating,
              date: 'आज',
              puja: 'पूजा विधी',
              comment: newRev.comment,
            },
            ...prev,
          ]);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8EC', // Warm cream background
  },
  topAuspiciousRibbon: {
    backgroundColor: '#7B2635',
    paddingBottom: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 154, 69, 0.35)',
  },
  topAuspiciousRibbonText: {
    color: '#FFF8EC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFF8EC',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0CB',
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
  headerLogoCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#FDF3E3',
    borderWidth: 1,
    borderColor: '#EDE0CB',
    maxWidth: 90,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  cartBtn: {
    padding: 4,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.secondary,
    borderRadius: 9,
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  bellBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: '#8C7A70',
  },
  heroBannerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  heroBannerCard: {
    position: 'relative',
    height: 165,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#7B2635',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(70, 18, 28, 0.76)',
  },
  heroContentBlock: {
    position: 'relative',
    zIndex: 2,
    padding: 16,
    height: '100%',
    justifyContent: 'space-between',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  heroPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFE26B',
  },
  heroTitleMain: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5EBD7',
  },
  heroTitleSub: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  heroFeaturePoints: {
    fontSize: 11,
    color: '#FFE9D4',
    fontWeight: '500',
  },
  heroActionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE26B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 4,
  },
  heroCtaBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primary,
  },
  heroExploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 248, 236, 0.15)',
    borderWidth: 1,
    borderColor: '#C49A45',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 4,
  },
  heroExploreBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFF8EC',
  },
  trustHighlightsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    shadowColor: '#382820',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  trustItemTextCol: {
    alignItems: 'center',
  },
  trustItemTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  trustItemSub: {
    fontSize: 8,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 1,
  },
  categoryChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  categoryChip: {
    flex: 1,
    backgroundColor: '#F5EBE1', // Soft beige matching screenshot
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionHeaderSubtitle: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  trendingScroll: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  trendingCard: {
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendingDiscountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  trendingCardContent: {
    padding: 10,
  },
  trendingCategory: {
    fontSize: 10,
    color: '#8C7A70',
    marginBottom: 2,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  trendingPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendingCurrentPrice: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  trendingOriginalPrice: {
    fontSize: 11,
    color: '#8C7A70',
    textDecorationLine: 'line-through',
  },
  mudraBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDE0CB',
    gap: 12,
  },
  mudraBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  mudraBannerTextCol: {
    flex: 1,
  },
  mudraBannerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  mudraBannerDesc: {
    fontSize: 11,
    color: '#735C50',
    marginTop: 2,
  },
  kundaliCardContainer: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  kundaliCard: {
    flexDirection: 'row',
    backgroundColor: '#7B2635',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  kundaliContent: {
    flex: 1,
    paddingRight: 10,
  },
  kundaliBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  kundaliBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFE26B',
  },
  kundaliTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  kundaliDesc: {
    fontSize: 11,
    color: '#F5EBD7',
    lineHeight: 15,
    marginBottom: 10,
  },
  kundaliCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE26B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  kundaliCtaText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primary,
  },
  kundaliIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  kundaliCircleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: '#FFE26B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kundaliOm: {
    fontSize: 22,
    color: '#FFE26B',
    fontWeight: '900',
  },
  kundaliSubIconText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  panditsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  fallbackPanditsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  panditCard: {
    width: 135,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  panditAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  panditBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  panditVerifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  panditName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  panditExp: {
    fontSize: 10,
    color: '#8C7A70',
    marginBottom: 4,
  },
  panditPrice: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.primary,
  },
  storeCtaBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#382820',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },
  storeCtaContent: {
    flex: 1.3,
    padding: 14,
  },
  storeCtaTag: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  storeCtaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  storeCtaDesc: {
    fontSize: 10.5,
    color: '#EDE0CB',
    lineHeight: 14,
    marginBottom: 8,
  },
  storeCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  storeCtaBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeCtaImage: {
    flex: 1,
    height: 120,
  },
  // Compact Upcoming Booking Card Styles (Non-Intrusive, Below Main Section)
  compactUpcomingCard: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  compactUpcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactUpcomingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactUpcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compactUpcomingBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  compactUpcomingRef: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textLight,
  },
  compactUpcomingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  compactUpcomingDateTime: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 2,
  },
  compactUpcomingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compactUpcomingActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  panditsLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  panditsLoadingText: {
    fontSize: 12,
    color: colors.textLight,
  },
  emptyPanditsCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyPanditsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  emptyPanditsSubtitle: {
    fontSize: 11.5,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
    maxWidth: 280,
  },
  browseAllPanditsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  browseAllPanditsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  // Upcoming Booking Card Styles
  upcomingBookingCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0FDF4',
    paddingBottom: 6,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  upcomingRef: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  upcomingBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  upcomingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8EC',
    borderWidth: 1,
    borderColor: '#EFE2CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingTextCol: {
    flex: 1,
  },
  upcomingPujaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  upcomingPanditName: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 3,
  },
  upcomingDateTime: {
    fontSize: 11.5,
    color: '#1E293B',
    fontWeight: '700',
  },
  upcomingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  upcomingActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  // Reviews Section
  reviewsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  reviewsSubtitle: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 1,
  },
  ratingBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B45309',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingBadgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  giveRatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0D9',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  giveRatingBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  reviewsScroll: {
    paddingRight: 16,
    gap: 12,
  },
  reviewCard: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE2CE',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7B2635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    color: '#FFE26B',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  reviewerCity: {
    fontSize: 10,
    color: '#64748B',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewPujaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
    marginBottom: 6,
  },
  reviewPujaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  reviewComment: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  // Trust Footer Styles
  trustFooter: {
    marginTop: 30,
    backgroundColor: '#2A1A14',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFE26B',
    marginBottom: 2,
  },
  footerTagline: {
    fontSize: 11,
    color: '#E2D5C3',
    marginBottom: 18,
  },
  footerPillars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 16,
  },
  pillarItem: {
    alignItems: 'center',
    flex: 1,
  },
  pillarIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pillarTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  pillarDesc: {
    fontSize: 9.5,
    color: '#D4A373',
    textAlign: 'center',
  },
  footerContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  footerContactText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFE26B',
  },
  copyrightText: {
    fontSize: 10,
    color: '#9E8E84',
    textAlign: 'center',
    marginTop: 4,
  },
  // -------------------------------------------------------------
  // SMART BOOKING BOX (IMAGE 2)
  // -------------------------------------------------------------
  smartBookingBox: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  smartInputsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  smartInputCol: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 10,
    padding: 8,
  },
  smartInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  smartInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9A3412',
  },
  smartInputBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  smartInputVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#431407',
    flex: 1,
  },
  smartInputHelper: {
    fontSize: 9,
    color: '#C2410C',
    fontWeight: '600',
  },
  smartActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  findPanditsBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#EA580C',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  findPanditsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bookIn30Btn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },
  bookIn30BtnText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '800',
  },
  bookWhatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  bookWhatsAppBtnText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },

  // -------------------------------------------------------------
  // POPULAR SERVICES (IMAGE 2)
  // -------------------------------------------------------------
  popularServicesContainer: {
    marginTop: 14,
    marginHorizontal: 14,
  },
  popularTitleBadgeWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  popularTitleBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.5,
  },
  popularServicesScroll: {
    paddingRight: 10,
    gap: 10,
  },
  popularServiceItem: {
    width: 108,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  popularIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  popularServiceName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 1,
  },
  popularServiceDevanagari: {
    fontSize: 9.5,
    color: '#9A3412',
    textAlign: 'center',
  },
  servicePillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  packagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  packagePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  viewAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 3,
  },
  viewAllPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
  },

  // Cities Quick Scroll
  citiesScrollWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  citiesBadgeLabel: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  citiesBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  citiesScroll: {
    gap: 6,
  },
  cityChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cityChipActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  cityChipText: {
    fontSize: 10.5,
    color: '#7C2D12',
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // -------------------------------------------------------------
  // NEXT 30 DAYS PANCHANG (IMAGE 1)
  // -------------------------------------------------------------
  panchangSection: {
    marginTop: 20,
    marginHorizontal: 14,
  },
  panchangSubtitle: {
    fontSize: 11,
    color: '#9A3412',
    fontWeight: '600',
    marginBottom: 4,
  },
  panchangHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  panchangTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  panchangEnTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  panchangViewAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  panchangScroll: {
    paddingRight: 10,
    gap: 12,
    paddingBottom: 6,
  },
  panchangCard: {
    width: 154,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  panchangIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  panchangCardTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 2,
  },
  panchangCardDevanagari: {
    fontSize: 10,
    color: '#9A3412',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  panchangCardDesc: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 10,
    minHeight: 28,
  },
  panchangBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  panchangBadgeRecommended: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  panchangBadgeToday: {
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  panchangBadgeTomorrow: {
    backgroundColor: '#FFEDD5',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  panchangBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  panchangBadgeTextRecommended: {
    color: '#D97706',
  },
  panchangBadgeTextToday: {
    color: '#EA580C',
  },
  panchangBadgeTextTomorrow: {
    color: '#EA580C',
  },
  panchangCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  gitaShlokaBanner: {
    backgroundColor: '#2B0F13',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    shadowColor: '#2B0F13',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  gitaShlokaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF8E7',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  gitaShlokaTranslation: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#FEF3C7',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  gitaShlokaAuthor: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FBBF24',
    letterSpacing: 1,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  samagranSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  samagranHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  samagranBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  samagranTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  samagranSubtitle: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 1,
  },
  samagranScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 12,
  },
  samagranCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3E8E2',
    shadowColor: '#5C4A42',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'space-between',
  },
  samagranIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  samagranCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  samagranCardSub: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 1,
  },
  samagranCardDesc: {
    fontSize: 10,
    color: '#5C4A42',
    lineHeight: 14,
    marginTop: 4,
  },
  samagranCardAction: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5ECE5',
    alignItems: 'flex-end',
  },
  samagranActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  offersSection: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  offersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  offersSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  offersCountBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  offersScrollContent: {
    gap: 10,
  },
  offerCard: {
    width: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  offerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offerCodeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  offerValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  offerSubtitle: {
    fontSize: 10,
    color: '#78716C',
    marginTop: 6,
  },
  offerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  offerCtaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
});
