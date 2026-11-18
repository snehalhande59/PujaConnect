import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { api } from '../../api/client';
import { Address } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface CartScreenProps {
  onBack: () => void;
  onNavigateOrders: () => void;
  onContinueShopping: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onBack,
  onNavigateOrders,
  onContinueShopping,
}) => {
  const { cart, itemCount, updateQuantity, removeItem, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Quick Address Creation Modal/Form if devotee has no address
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Pune');
  const [pincode, setPincode] = useState('411001');

  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.getAddresses();
      setAddresses(res || []);
      if (res && res.length > 0) {
        setSelectedAddressId(res[0].id);
      } else {
        setShowAddressForm(true);
      }
    } catch (e) {
      console.warn('Error fetching addresses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSaveAddress = async () => {
    if (!addressLine.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Required Fields', 'Please complete address line, city and postal pincode.');
      return;
    }
    try {
      setLoading(true);
      const newAddr = await api.addAddress({
        fullName: fullName.trim() || 'Devotee',
        phoneNumber: phone.trim() || '9876543210',
        addressLine1: addressLine.trim(),
        city: city.trim(),
        state: 'Maharashtra',
        pincode: pincode.trim(),
        isDefault: true,
      });
      setAddresses([newAddr, ...addresses]);
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
    } catch (e: any) {
      Alert.alert('Address Error', e.message || 'Failed to save address.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      Alert.alert('Delivery Address Required', 'Please select or add a delivery address.');
      setShowAddressForm(true);
      return;
    }

    try {
      setCheckingOut(true);
      setError(null);
      await api.createOrder(selectedAddressId);
      await clearCart();
      Alert.alert(
        'Order Placed Successfully! 🙏',
        'Your sacred samagri kit order has been dispatched for preparation.',
        [{ text: 'View My Orders', onPress: onNavigateOrders }]
      );
    } catch (e: any) {
      setError(e.message || 'Failed to process checkout. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (parseFloat(String(item.product?.price || 0)) || 0) * item.quantity,
    0
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Sacred Samagri Cart</Text>
        <View style={{ width: 36 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Ionicons name="cart-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your Sacred Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Add pure havan samagri, holy water, diya kits or puja ingredients to proceed.
          </Text>
          <TouchableOpacity style={styles.shopBtn} onPress={onContinueShopping}>
            <Text style={styles.shopBtnText}>Explore Samagri Bhandar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Cart Item Cards */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Items in Cart ({itemCount})</Text>

            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="gift-outline" size={20} color={colors.secondary} />
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product?.name || 'Samagri Item'}
                  </Text>
                  <Text style={styles.itemPrice}>₹{item.product?.price || 0}</Text>
                </View>

                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.id, item.quantity - 1);
                      } else {
                        removeItem(item.id);
                      }
                    }}
                  >
                    <Ionicons
                      name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                      size={14}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Delivery Address Section */}
          <View style={styles.card}>
            <View style={styles.headerBetween}>
              <Text style={styles.cardHeading}>Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressForm(!showAddressForm)}>
                <Text style={styles.linkText}>
                  {showAddressForm ? 'Cancel' : '+ Add Address'}
                </Text>
              </TouchableOpacity>
            </View>

            {showAddressForm ? (
              <View style={styles.addressForm}>
                <Input
                  label="Recipient Name"
                  placeholder="e.g. Ramesh Kulkarni"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <Input
                  label="Contact Phone"
                  placeholder="9876543210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <Input
                  label="Street Address / Society"
                  placeholder="Flat 402, Shiv Shanti Apts"
                  value={addressLine}
                  onChangeText={setAddressLine}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Input label="City" placeholder="Pune" value={city} onChangeText={setCity} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Pincode"
                      placeholder="411001"
                      value={pincode}
                      onChangeText={setPincode}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <Button
                  title="Save Delivery Address"
                  variant="primary"
                  size="sm"
                  onPress={handleSaveAddress}
                  style={{ marginTop: 8 }}
                />
              </View>
            ) : addresses.length === 0 ? (
              <Text style={styles.subtext}>No saved addresses found. Add an address to proceed.</Text>
            ) : (
              addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.addrItem, isSelected && styles.addrItemActive]}
                    onPress={() => setSelectedAddressId(addr.id)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.addrName}>{addr.fullName}</Text>
                      <Text style={styles.addrLine}>
                        {addr.addressLine1}, {addr.city} - {addr.pincode}
                      </Text>
                      <Text style={styles.addrPhone}>Phone: {addr.phoneNumber}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Pricing Ledger */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Price Details</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Items Subtotal</Text>
              <Text style={styles.priceValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Sacred Sanctification & Packaging</Text>
              <Text style={[styles.priceValue, { color: '#166534' }]}>FREE</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Standard Doorstep Delivery</Text>
              <Text style={[styles.priceValue, { color: '#166534' }]}>FREE</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalAmount}>₹{subtotal}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Sticky Checkout Bar */}
      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalBottomLabel}>Total Amount</Text>
            <Text style={styles.totalBottomPrice}>₹{subtotal}</Text>
          </View>
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <>
                <Text style={styles.orderBtnText}>Place Sacred Order</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textWhite} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 18,
  },
  shopBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 90,
    gap: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 8,
    flex: 1,
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
    marginBottom: 12,
  },
  headerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemPrice: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.backgroundDark,
    borderRadius: 6,
    padding: 4,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressForm: {
    marginTop: 8,
  },
  subtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addrItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  addrItemActive: {
    backgroundColor: colors.backgroundLight,
    borderColor: colors.primary,
  },
  addrName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addrLine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addrPhone: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  totalBottomLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  totalBottomPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  orderBtnText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
