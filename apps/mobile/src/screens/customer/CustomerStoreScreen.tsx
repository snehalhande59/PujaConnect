import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
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
  'All (सर्व)',
  'संपूर्ण पूजा किट्स (Kits & Combos)',
  'पवित्र द्रव्ये (Sacred Liquids)',
  'धूप व अगरबत्ती (Incense)',
  'पूजा भांडी (Utensils)',
  'हवन व यज्ञ (Havan Samagri)',
];

const COMPLETE_PUJA_KITS: Product[] = [
  {
    id: 'kit-satyanarayan',
    name: 'सत्यनारायण महापूजा संपूर्ण किट (ताट)',
    slug: 'satyanarayan-mahapuja-complete-kit',
    category: 'Kits & Combos',
    price: 1299,
    discountPrice: 1599,
    stockQuantity: 100,
    description: 'नारळ (श्रीफळ), ताजी फुले व दुर्वा, तांब्या-पितळी दिवा, शुद्ध पूजा तेल, वाती, हळद-कुंकू, अक्षता, सुपारी (५), विड्याची पाने, जानवे, अत्तर, भीमसेनी कापूर, अगरबत्ती, धूप, गंगाजल, पंचामृत घटक, रांगोळी सहित १००% शुद्ध पूजा थाळी.',
    images: ['https://images.unsplash.com/photo-1609358905581-e5382c45162a?auto=format&fit=crop&w=600&q=80'],
    isActive: true,
  },
  {
    id: 'kit-vastu-shanti',
    name: 'गृहप्रवेश व वास्तुशांती महापूजा किट',
    slug: 'griha-pravesh-vastu-shanti-kit',
    category: 'Kits & Combos',
    price: 2499,
    discountPrice: 2999,
    stockQuantity: 50,
    description: 'श्रीफळ नारळ (३), फुले-हार, पितळी समई व दिवा, शुद्ध गायीचे तूप, तीळ तेल, वाती, हळद-कुंकू, रांगोळी, नवग्रह धान्य, नवग्रह समिधा, गुग्गुळ, लोभान, कापूर, धूप, पंचरत्न, लाल कापड, कलश, गंगाजल सहित १००% शुद्ध किट.',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'],
    isActive: true,
  },
  {
    id: 'kit-rudrabhishek',
    name: 'महा रुद्राभिषेक विधी ताट व किट',
    slug: 'rudrabhishek-sacred-thali-kit',
    category: 'Kits & Combos',
    price: 1499,
    discountPrice: 1799,
    stockQuantity: 75,
    description: 'शुद्ध बेलपत्र (१०८), भस्म, चंदन, अत्तर, शुद्ध मध, गंगाजल, गायीचे दूध व तूप घटक, कापूर, दिवा, तीळ तेल, वाती, अक्षता, काळे तीळ, दुर्वा, धूप बत्ती, पंचामृत.',
    images: ['https://images.unsplash.com/photo-1620802051782-725fa33be063?auto=format&fit=crop&w=600&q=80'],
    isActive: true,
  },
  {
    id: 'kit-ganesh-puja',
    name: 'श्री गणेश व अथर्वशीर्ष संपूर्ण पूजा थाळी',
    slug: 'shri-ganesh-puja-thali-kit',
    category: 'Kits & Combos',
    price: 899,
    discountPrice: 1099,
    stockQuantity: 120,
    description: 'नारळ, दुर्वा (२१ जुड्या), लाल फुले, अष्टगंध, शेंदूर, हळद-कुंकू, मोदक साहित्य, कापसाची वस्त्रमाळ, अगरबत्ती, कापूर, तांब्याचा दिवा, शुद्ध तेल, विड्याची पाने, सुपारी.',
    images: ['https://images.unsplash.com/photo-1567591414240-e221371e7d23?auto=format&fit=crop&w=600&q=80'],
    isActive: true,
  },
  {
    id: 'kit-daily-combo',
    name: 'दैनिक नित्य पूजा साहित्य कॉम्बो (ताट)',
    slug: 'daily-nitya-puja-combo-thali',
    category: 'Kits & Combos',
    price: 499,
    discountPrice: 649,
    stockQuantity: 200,
    description: 'शुद्ध पूजा तेल (५०० मिली), फुलवाती व लांब वाती (१०० नग), भीमसेनी कापूर, सुवासिक अगरबत्ती, हळद-कुंकू-अक्षता डबी, रांगोळी, तांब्याची छोटी वाटी व आचमनी.',
    images: ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80'],
    isActive: true,
  },
  {
    id: 'kit-havan-samidha',
    name: 'हवन व यज्ञ संपूर्ण समिधा किट',
    slug: 'sacred-havan-yagya-samidha-kit',
    category: 'Havan & Yagya',
    price: 999,
    discountPrice: 1299,
    stockQuantity: 60,
    description: 'पळस, आंबा, खैर समिधा, दशांग धूप, कापूर, १००% शुद्ध गायीचे तूप, नवग्रह लाकडे, लोभान व हविष्यान्न.',
    images: ['https://images.unsplash.com/photo-1609358905581-e5382c45162a?auto=format&fit=crop&w=600&q=80'],
    isActive: true,
  },
];

export const CustomerStoreScreen: React.FC<CustomerStoreScreenProps> = ({ onBack, onNavigateCart }) => {
  const { cart, itemCount, addToCart } = useCart();
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const [products, setProducts] = useState<Product[]>(COMPLETE_PUJA_KITS);
  const [selectedCategory, setSelectedCategory] = useState('All (सर्व)');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory.includes('Kits')
        ? 'Kits & Combos'
        : selectedCategory.includes('Liquids')
        ? 'Sacred Liquids'
        : selectedCategory.includes('Incense')
        ? 'Incense & Dhoop'
        : selectedCategory.includes('Utensils')
        ? 'Puja Utensils'
        : selectedCategory.includes('Havan')
        ? 'Havan & Yagya'
        : undefined;

      const res = await api.getProducts({
        search: searchQuery.trim() || undefined,
        category: categoryParam,
      }).catch(() => []);

      if (Array.isArray(res) && res.length > 0) {
        setProducts(res);
      } else {
        // Filter preset complete kits
        let filtered = [...COMPLETE_PUJA_KITS];
        if (categoryParam) {
          filtered = filtered.filter((p) => p.category === categoryParam);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
          );
        }
        setProducts(filtered);
      }
    } catch (e) {
      console.warn('Error fetching products:', e);
      setProducts(COMPLETE_PUJA_KITS);
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
      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <View style={styles.headerRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>संपूर्ण पूजा किट व सामग्री स्टोअर</Text>
            <Text style={styles.headerSubtitle}>Pure & Consecrated Puja Thalis</Text>
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
            placeholder="नारळ, फुले, दिवा, तेल, वाती, संपूर्ण पूजा ताट शोधा..."
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

      {/* Products Grid */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading sacred puja kits...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, itemCount > 0 && { paddingBottom: 100 }]}
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
              <Text style={styles.emptyTitle}>कोणतेही किट आढळले नाही</Text>
              <Text style={styles.emptySubtitle}>कृपया इतर सामग्री नाव शोधून पहा.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isAdding = addingId === item.id;
            const hasDiscount = item.discountPrice && Number(item.discountPrice) > Number(item.price);
            const savingsPercent = hasDiscount
              ? Math.round(((Number(item.discountPrice) - Number(item.price)) / Number(item.discountPrice)) * 100)
              : 0;

            return (
              <View style={styles.productCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.productImgContainer}>
                    {item.images && item.images.length > 0 ? (
                      <Image source={{ uri: item.images[0] }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                      <Ionicons name="sparkles" size={32} color={colors.secondary} />
                    )}
                    <View style={styles.pureBadge}>
                      <Text style={styles.pureText}>🚩 १००% शुद्ध</Text>
                    </View>
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {/* Key Ingredients Pill List */}
                    <View style={styles.ingredientsPillRow}>
                      <Text style={styles.ingredientsPill}>🥥 नारळ</Text>
                      <Text style={styles.ingredientsPill}>🪔 दिवा व तेल</Text>
                      <Text style={styles.ingredientsPill}>🌸 फुले व वाती</Text>
                      <Text style={styles.ingredientsPill}>✨ हळद-कुंकू</Text>
                    </View>

                    <Text style={styles.productDesc} numberOfLines={3}>
                      {item.description || 'पूजा, अभिषेक व यज्ञासाठी संपूर्ण शुद्ध वैदिक साहित्य.'}
                    </Text>

                    {/* Price and Add Button */}
                    <View style={styles.cardFooter}>
                      <View>
                        <View style={styles.priceRow}>
                          <Text style={styles.productPrice}>₹{item.price}</Text>
                          {hasDiscount && (
                            <Text style={styles.originalPrice}>₹{item.discountPrice}</Text>
                          )}
                        </View>
                        {savingsPercent > 0 && (
                          <Text style={styles.savingTag}>{savingsPercent}% बचत (Vedic Discount)</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddToCart(item)}
                        disabled={isAdding}
                        activeOpacity={0.8}
                      >
                        {isAdding ? (
                          <ActivityIndicator size="small" color={colors.textWhite} />
                        ) : (
                          <>
                            <Ionicons name="bag-add" size={16} color={colors.textWhite} />
                            <Text style={styles.addBtnText}>किट बुक करा</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
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
              {itemCount} {itemCount === 1 ? 'पूजा किट' : 'पूजा किट्स'} पवित्र कार्टमध्ये
            </Text>
            <Text style={styles.floatingCartTotal}>एकूण: ₹{cartSubtotal}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={onNavigateCart} activeOpacity={0.85}>
            <Text style={styles.checkoutBtnText}>कार्ट पहा व ऑर्डर करा</Text>
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
    backgroundColor: '#FFF8EC',
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E5D1',
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#832812',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
  },
  cartIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#1E293B',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#832812',
    borderColor: '#832812',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1E5D1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 14,
  },
  productImgContainer: {
    width: 100,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  pureBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(131, 40, 18, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  pureText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 20,
  },
  ingredientsPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 4,
  },
  ingredientsPill: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  productDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#832812',
  },
  originalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  savingTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#832812',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  floatingCartCount: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  floatingCartTotal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FEF3C7',
    marginTop: 2,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  checkoutBtnText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '800',
  },
});
