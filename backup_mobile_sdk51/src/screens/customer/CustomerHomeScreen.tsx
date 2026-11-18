import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../api/client';
import { Puja, PanditProfile } from '../../types';
import {
  APP_IMAGES,
  SPEEDY_PUJA_CATALOG,
  CatalogPujaItem,
} from '../../theme/culturalAssets';

const { width } = Dimensions.get('window');

interface CustomerHomeScreenProps {
  onNavigatePujaDetail: (puja: Puja) => void;
  onNavigatePanditDetail: (pandit: PanditProfile) => void;
  onNavigateCategory: (categoryName: string) => void;
  onNavigateStore: () => void;
  onNavigateCart: () => void;
  onNavigateExplore: () => void;
  onNavigateNotifications?: () => void;
  onNavigateWallet?: () => void;
  onOpenDrawer?: () => void;
  onSelectCity: () => void;
  selectedCity?: string;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onNavigatePujaDetail,
  onNavigatePanditDetail,
  onNavigateCategory,
  onNavigateStore,
  onNavigateCart,
  onNavigateExplore,
  onNavigateNotifications,
  onNavigateWallet,
  onOpenDrawer,
  onSelectCity,
  selectedCity = 'Pune',
}) => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  const [featuredPandits, setFeaturedPandits] = useState<PanditProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const panditsRes = await api.getPandits({ city: selectedCity });
      if (panditsRes && panditsRes.length > 0) {
        setFeaturedPandits(panditsRes.slice(0, 5));
      }
    } catch (e) {
      console.warn('Error loading pandits:', e);
    } finally {
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

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header - Exact Speedy Pandit Style */}
      <View style={styles.topHeader}>
        {/* Left Hamburger Drawer Menu */}
        <TouchableOpacity style={styles.menuBtn} onPress={onOpenDrawer}>
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
        </TouchableOpacity>

        {/* Center City Selector with Red Location Pin */}
        <TouchableOpacity style={styles.citySelector} onPress={onSelectCity}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.cityText}>{selectedCity}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>

        {/* Right Notification Bell */}
        <TouchableOpacity style={styles.bellBtn} onPress={onNavigateNotifications}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar Prompt */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.9} onPress={onNavigateExplore}>
          <Ionicons name="search" size={18} color="#8C7A70" style={{ marginRight: 8 }} />
          <Text style={styles.searchPlaceholder}>Search Puja</Text>
        </TouchableOpacity>

        {/* Hero Promotional Banner - Exact Speedy Pandit Style */}
        <View style={styles.heroBannerContainer}>
          <View style={styles.heroBannerCard}>
            {/* Left Red Block with Hindi Callout */}
            <View style={styles.heroLeftBlock}>
              <Text style={styles.heroHindiSmall}>पूजा के लिये</Text>
              <Text style={styles.heroEnglishBold}>PANDITJI</Text>
              <Text style={styles.heroHindiSmall}>और सामग्री</Text>
              <Text style={styles.heroHindiBold}>Book करनी है ?</Text>

              <View style={styles.heroHashtagBox}>
                <Text style={styles.heroBrandText}>DevSutra hai</Text>
                <Text style={styles.heroHashtagText}>#HoJayega</Text>
              </View>
            </View>

            {/* Right Photo with Family & Panditji */}
            <View style={styles.heroImageWrapper}>
              <Image
                source={APP_IMAGES.heroBanner}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

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

        {/* DevSutra Mudra Balance Reminder Banner */}
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
            <Text style={styles.mudraBannerTitle}>DevSutra Mudra Wallet</Text>
            <Text style={styles.mudraBannerDesc}>
              You have 300 DevSutra Mudras (₹300) available to redeem.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>

        {/* Verified Vedic Pandits in Your City */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <View>
            <Text style={styles.sectionHeaderTitle}>Verified Vedic Pandits</Text>
            <Text style={styles.sectionHeaderSubtitle}>Available Purohits in {selectedCity}</Text>
          </View>
          <TouchableOpacity onPress={onNavigateExplore}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.panditsScroll}
        >
          {featuredPandits.length > 0 ? (
            featuredPandits.map((pandit) => (
              <TouchableOpacity
                key={pandit.id}
                style={styles.panditCard}
                activeOpacity={0.85}
                onPress={() => onNavigatePanditDetail(pandit)}
              >
                <Image
                  source={APP_IMAGES.panditRameshwar}
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
                <Text style={styles.panditExp}>{pandit.experienceYears || 15}+ Yrs Exp</Text>
                <Text style={styles.panditPrice}>₹{pandit.basePrice || 2100} Dakshina</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.fallbackPanditsRow}>
              {[
                { name: 'Pt. Rameshwar Shastri', exp: '22+ Yrs', img: APP_IMAGES.panditRameshwar },
                { name: 'Pt. Vidyadhar Joshi', exp: '18+ Yrs', img: APP_IMAGES.panditVidyadhar },
                { name: 'Acharya Anant Dixit', exp: '25+ Yrs', img: APP_IMAGES.panditAnant },
              ].map((p, idx) => (
                <View key={idx} style={styles.panditCard}>
                  <Image source={p.img} style={styles.panditAvatar} resizeMode="cover" />
                  <View style={styles.panditBadgeRow}>
                    <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                    <Text style={styles.panditVerifiedText}>Vedic Certified</Text>
                  </View>
                  <Text style={styles.panditName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.panditExp}>{p.exp} Experience</Text>
                  <Text style={styles.panditPrice}>Verified Purohit</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Puja Samagri Store Banner */}
        <TouchableOpacity
          style={styles.storeCtaBanner}
          activeOpacity={0.85}
          onPress={onNavigateStore}
        >
          <View style={styles.storeCtaContent}>
            <Text style={styles.storeCtaTag}>100% PURE & CONSECRATED</Text>
            <Text style={styles.storeCtaTitle}>Complete Puja Samagri Kits</Text>
            <Text style={styles.storeCtaDesc}>
              Pure Cow Ghee, Brass Kalash, Havan Samidha, and Consecrated Kits.
            </Text>
            <View style={styles.storeCtaBtn}>
              <Text style={styles.storeCtaBtnText}>Explore Samagri Store</Text>
              <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Image
            source={APP_IMAGES.brassThali}
            style={styles.storeCtaImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8EC', // Warm cream background
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF8EC',
  },
  menuBtn: {
    padding: 6,
    justifyContent: 'space-between',
    height: 22,
    width: 26,
  },
  hamburgerBar: {
    width: 20,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  bellBtn: {
    padding: 6,
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
    flexDirection: 'row',
    backgroundColor: '#B91C1C', // Rich red background matching reference image
    borderRadius: 12,
    overflow: 'hidden',
    height: 145,
  },
  heroLeftBlock: {
    flex: 1.25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  heroHindiSmall: {
    fontSize: 12,
    color: '#FFE26B',
    fontWeight: '700',
    lineHeight: 16,
  },
  heroEnglishBold: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  heroHindiBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroHashtagBox: {
    marginTop: 2,
  },
  heroBrandText: {
    fontSize: 10.5,
    color: '#FFE26B',
    fontWeight: '700',
  },
  heroHashtagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  heroImageWrapper: {
    flex: 1.15,
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
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
});
