import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { api } from '../../api/client';
import { PanditProfile, Puja } from '../../types';
import { Badge } from '../../components/common/Badge';

interface CustomerExploreScreenProps {
  onNavigatePanditDetail: (pandit: PanditProfile) => void;
  onNavigatePujaDetail: (puja: Puja) => void;
  onBack?: () => void;
  initialQuery?: string;
  initialTab?: 'PANDITS' | 'PUJAS';
}

const CITIES = ['All Cities', 'Pune', 'Mumbai', 'Nashik', 'Varanasi', 'Bengaluru'];

export const CustomerExploreScreen: React.FC<CustomerExploreScreenProps> = ({
  onNavigatePanditDetail,
  onNavigatePujaDetail,
  onBack,
  initialQuery = '',
  initialTab = 'PANDITS',
}) => {
  const [activeTab, setActiveTab] = useState<'PANDITS' | 'PUJAS'>(initialTab);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const [pandits, setPandits] = useState<PanditProfile[]>([]);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      if (activeTab === 'PANDITS') {
        const cityParam = selectedCity === 'All Cities' ? undefined : selectedCity;
        const res = await api.getPandits({
          city: cityParam,
          search: searchQuery.trim() || undefined,
        });
        setPandits(res || []);
      } else {
        const res = await api.getPujas({
          search: searchQuery.trim() || undefined,
        });
        setPujas(res || []);
      }
    } catch (e) {
      console.warn('Error fetching explore results:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [activeTab, selectedCity]);

  const handleSearchSubmit = () => {
    fetchResults();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Search Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>
            {activeTab === 'PANDITS' ? 'Find Certified Pandits' : 'Discover Sacred Pujas'}
          </Text>
          {onBack && <View style={{ width: 36 }} />}
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'PANDITS'
                ? 'Search pandits by name, language, gotra...'
                : 'Search pujas, havans, rituals...'
            }
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchResults();
              }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Toggle: Pandits vs Pujas */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'PANDITS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('PANDITS')}
          >
            <Ionicons
              name="school-outline"
              size={16}
              color={activeTab === 'PANDITS' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'PANDITS' && styles.tabTextActive]}>
              Verified Pandits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'PUJAS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('PUJAS')}
          >
            <Ionicons
              name="flame-outline"
              size={16}
              color={activeTab === 'PUJAS' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'PUJAS' && styles.tabTextActive]}>
              Sacred Pujas
            </Text>
          </TouchableOpacity>
        </View>

        {/* City Filter Chips (especially for Pandits) */}
        {activeTab === 'PANDITS' && (
          <View style={styles.citiesScrollWrapper}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectedCity === item;
                return (
                  <TouchableOpacity
                    style={[styles.cityChip, isSelected && styles.cityChipActive]}
                    onPress={() => setSelectedCity(item)}
                  >
                    <Text style={[styles.cityChipText, isSelected && styles.cityChipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.citiesContent}
            />
          </View>
        )}
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching certified scholars & rituals...</Text>
        </View>
      ) : activeTab === 'PANDITS' ? (
        <FlatList
          data={pandits}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchResults();
              }}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.borderDark} />
              <Text style={styles.emptyTitle}>No Pandits Found</Text>
              <Text style={styles.emptySubtitle}>
                No verified scholars match your current search in {selectedCity}. Try changing the
                city or filter.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.panditCard}
              onPress={() => onNavigatePanditDetail(item)}
            >
              <View style={styles.panditRow}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={28} color={colors.secondary} />
                </View>

                <View style={styles.panditInfo}>
                  <View style={styles.nameHeader}>
                    <Text style={styles.panditName}>
                      {item.user
                        ? `Pt. ${item.user.firstName} ${item.user.lastName || ''}`.trim()
                        : 'Pt. Vedic Shastri'}
                    </Text>
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#166534" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>

                  <Text style={styles.expText}>
                    {item.experienceYears || 10}+ Years Vedic Vidhi • {item.city}, {item.state}
                  </Text>

                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#D97724" />
                    <Text style={styles.ratingValue}>{item.rating || '4.9'}</Text>
                    <Text style={styles.reviewCount}>({item.totalReviews || 12}+ reviews)</Text>
                  </View>
                </View>
              </View>

              {/* Languages & Specializations */}
              <View style={styles.tagsContainer}>
                {(item.languages || ['Hindi', 'Sanskrit']).map((lang, idx) => (
                  <View key={idx} style={styles.langTag}>
                    <Text style={styles.langTagText}>{lang}</Text>
                  </View>
                ))}
                {(item.specializations || []).slice(0, 2).map((spec, idx) => (
                  <View key={idx} style={styles.specTag}>
                    <Text style={styles.specTagText}>{spec}</Text>
                  </View>
                ))}
              </View>

              {/* Bottom Price & Action */}
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.dakshinaLabel}>Dakshina from</Text>
                  <Text style={styles.dakshinaVal}>₹{item.basePrice || 2100}</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => onNavigatePanditDetail(item)}
                >
                  <Text style={styles.bookBtnText}>Book Pandit</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.textWhite} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={pujas}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchResults();
              }}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="flame-outline" size={48} color={colors.borderDark} />
              <Text style={styles.emptyTitle}>No Pujas Found</Text>
              <Text style={styles.emptySubtitle}>Try searching with a different ritual term.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.pujaCard} onPress={() => onNavigatePujaDetail(item)}>
              <View style={styles.pujaCardHeader}>
                <View style={styles.pujaIconBg}>
                  <Ionicons name="flame" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.pujaTitleText}>{item.title}</Text>
                  <Text style={styles.pujaCategoryText}>
                    {item.category?.name || 'Vedic Ritual'} • {item.durationMinutes || 120} Mins
                  </Text>
                </View>
              </View>

              <Text style={styles.pujaDescription} numberOfLines={3}>
                {item.description || 'Authentic Vedic rituals performed with pure Vedic chanting.'}
              </Text>

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.dakshinaLabel}>Starting Fee</Text>
                  <Text style={styles.dakshinaVal}>₹{item.basePrice}</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => onNavigatePujaDetail(item)}
                >
                  <Text style={styles.bookBtnText}>View Vidhi</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.textWhite} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: 3,
    marginTop: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  citiesScrollWrapper: {
    marginTop: 10,
    marginBottom: 4,
  },
  citiesContent: {
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: colors.backgroundDark,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cityChipActive: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  cityChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cityChipTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  panditCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  panditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panditInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panditName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  expText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  langTag: {
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  langTagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  specTag: {
    backgroundColor: colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  specTagText: {
    fontSize: 11,
    color: colors.goldDark,
    fontWeight: '600',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  dakshinaLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  dakshinaVal: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  pujaCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pujaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pujaIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pujaTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pujaCategoryText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  pujaDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
