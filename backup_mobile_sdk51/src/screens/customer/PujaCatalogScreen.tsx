import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { SPEEDY_PUJA_CATALOG, CatalogPujaItem } from '../../theme/culturalAssets';
import { Puja } from '../../types';

interface PujaCatalogScreenProps {
  onOpenDrawer?: () => void;
  onOpenNotifications?: () => void;
  onSelectCity?: () => void;
  selectedCity?: string;
  onSelectPuja: (puja: Puja) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

export const PujaCatalogScreen: React.FC<PujaCatalogScreenProps> = ({
  onOpenDrawer,
  onOpenNotifications,
  onSelectCity,
  selectedCity = 'Pune',
  onSelectPuja,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Puja');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterCategories = ['All Puja', 'Regular Puja', 'Festive Puja', 'All Hawan'];

  const filteredPujas = SPEEDY_PUJA_CATALOG.filter((item) => {
    const categoryMatch =
      selectedCategory === 'All Puja' || item.category === selectedCategory;
    const searchMatch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.devanagariName.includes(searchQuery);
    return categoryMatch && searchMatch;
  });

  const handlePujaPress = (item: CatalogPujaItem) => {
    // Map catalog item to Puja type
    const puja: Puja = {
      id: item.id,
      categoryId: item.category,
      title: item.name,
      slug: item.id,
      description: item.description,
      basePrice: item.price,
      durationMinutes: parseInt(item.duration) || 120,
    };
    onSelectPuja(puja);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top App Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={onOpenDrawer}>
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationSelector} onPress={onSelectCity}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.locationText}>{selectedCity}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#8C7A70" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Puja"
            placeholderTextColor="#8C7A70"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Dropdown Pill */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Text style={styles.dropdownText}>{selectedCategory}</Text>
            <Ionicons
              name={showFilterDropdown ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Dropdown Options List */}
        {showFilterDropdown && (
          <View style={styles.dropdownMenu}>
            {filterCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.dropdownOption,
                  selectedCategory === cat && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setShowFilterDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedCategory === cat && styles.dropdownOptionTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 2-Column Grid of Puja Cards (matching screenshot) */}
        <View style={styles.gridContainer}>
          {filteredPujas.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handlePujaPress(item)}
            >
              {/* Photo with Discount Badge */}
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.pujaImage} resizeMode="cover" />
                {item.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                  </View>
                )}
              </View>

              {/* Title & Pricing */}
              <View style={styles.cardInfo}>
                <Text style={styles.pujaName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>{item.price}/-</Text>
                  {item.originalPrice > item.price && (
                    <Text style={styles.originalPrice}>{item.originalPrice}/-</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  bellBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 14,
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
    marginBottom: 10,
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
  filterRow: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropdownOptionActive: {
    backgroundColor: '#FFF8EC',
  },
  dropdownOptionText: {
    fontSize: 12,
    color: '#382820',
  },
  dropdownOptionTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    position: 'relative',
  },
  pujaImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  cardInfo: {
    padding: 10,
    alignItems: 'center',
  },
  pujaName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentPrice: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 11,
    color: '#8C7A70',
    textDecorationLine: 'line-through',
  },
});
