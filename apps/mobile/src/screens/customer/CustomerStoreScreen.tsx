import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { api } from '../../api/client';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface CustomerStoreScreenProps {
  onBack?: () => void;
  onNavigateCart: () => void;
}

const STORE_CATEGORIES = [
  'All',
  'Kits & Combos',
  'Sacred Liquids',
  'Incense & Dhoop',
  'Puja Utensils',
  'Havan & Yagya',
];

export const CustomerStoreScreen: React.FC<CustomerStoreScreenProps> = ({ onBack, onNavigateCart }) => {
  const { cart, itemCount, addToCart } = useCart();
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({
        search: searchQuery.trim() || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      });
      setProducts(res || []);
    } catch (e) {
      console.warn('Error fetching products:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingId(product.id);
      await addToCart(product.id, 1);
    } catch (e) {
      console.warn('Error adding to cart:', e);
    } finally {
      setAddingId(null);
    }
  };

  // Compute total cart value
  const cartSubtotal = (cart?.items || []).reduce(
    (sum, item) => sum + (parseFloat(String(item.product?.price || 0)) || 0) * item.quantity,
    0
  );

  return (
    <View style={styles.safe}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <View style={styles.headerRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>DevSutra Samagri Bhandar</Text>
            <Text style={styles.subtitle}>100% Pure, Sanctified Ritual Kits & Ingredients</Text>
          </View>
          <TouchableOpacity style={styles.cartIconBtn} onPress={onNavigateCart} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={22} color={colors.primary} />
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search havan samagri, dhoop, camphor, thali..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchProducts}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchProducts();
              }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {STORE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching sanctified samagri items...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[styles.listContent, itemCount > 0 && { paddingBottom: 90 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchProducts();
              }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="gift-outline" size={48} color={colors.borderDark} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>Try searching for another samagri kit name.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isAdding = addingId === item.id;
            return (
              <View style={styles.productCard}>
                <View style={styles.productImgPlaceholder}>
                  {item.images && item.images.length > 0 ? (
                    <Image source={{ uri: item.images[0] }} style={styles.productImage} resizeMode="cover" />
                  ) : (
                    <Ionicons name="sparkles" size={28} color={colors.secondary} />
                  )}
                  <View style={styles.pureBadge}>
                    <Text style={styles.pureText}>100% PURE</Text>
                  </View>
                </View>

                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>

                <Text style={styles.productDesc} numberOfLines={2}>
                  {item.description || 'Pure ritual ingredients sanctified for Vedic vidhi.'}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>

                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddToCart(item)}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <ActivityIndicator size="small" color={colors.textWhite} />
                    ) : (
                      <>
                        <Ionicons name="add" size={16} color={colors.textWhite} />
                        <Text style={styles.addBtnText}>Add</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <View style={styles.floatingCartBar}>
          <View>
            <Text style={styles.floatingCartCount}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in Sacred Cart
            </Text>
            <Text style={styles.floatingCartTotal}>Total: ₹{cartSubtotal}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={onNavigateCart}>
            <Text style={styles.checkoutBtnText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cartIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: 9,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: colors.textPrimary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  productImgPlaceholder: {
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  categoryScroll: {
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: colors.textWhite,
    fontWeight: '700',
  },
  pureBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pureText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#166534',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    minHeight: 34,
  },
  productDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    minHeight: 28,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 2,
  },
  addBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  floatingCartCount: {
    fontSize: 12,
    color: colors.goldLight,
    fontWeight: '600',
  },
  floatingCartTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textWhite,
    marginTop: 2,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  checkoutBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
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
    marginTop: 4,
  },
});
