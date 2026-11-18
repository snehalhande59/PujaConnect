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
import { api } from '../../api/client';
import { Address } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

interface AddressManagementScreenProps {
  onBack: () => void;
}

export const AddressManagementScreen: React.FC<AddressManagementScreenProps> = ({ onBack }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('411001');

  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.getAddresses();
      setAddresses(res || []);
    } catch (e) {
      console.warn('Error fetching addresses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreateAddress = async () => {
    if (!addressLine1.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Required Fields', 'Please complete address line, city and postal pincode.');
      return;
    }

    try {
      setSaving(true);
      await api.addAddress({
        fullName: fullName.trim() || 'Devotee',
        phoneNumber: phone.trim() || '9876543210',
        addressLine1: addressLine1.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault: addresses.length === 0,
      });

      setShowAddForm(false);
      setAddressLine1('');
      setLandmark('');
      fetchAddresses();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteAddress(id);
            setAddresses(addresses.filter((a) => a.id !== id));
          } catch (e: any) {
            Alert.alert('Delete Failed', e.message || 'Could not delete address.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Saved Puja Venues</Text>
        <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)} style={styles.addIconBtn}>
          <Ionicons name={showAddForm ? 'close' : 'add'} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Venue Address</Text>

            <Input
              label="Recipient / Devotee Name"
              placeholder="e.g. Ramesh Kulkarni"
              value={fullName}
              onChangeText={setFullName}
            />

            <Input
              label="Contact Mobile"
              placeholder="9876543210"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Input
              label="Address Line (Flat, Street, Society)"
              placeholder="e.g. Flat 402, Shiv Shanti Apts"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />

            <Input
              label="Nearby Landmark"
              placeholder="e.g. Near Ganpati Temple"
              value={landmark}
              onChangeText={setLandmark}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input label="City" placeholder="Pune" value={city} onChangeText={setCity} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="State" placeholder="Maharashtra" value={state} onChangeText={setState} />
              </View>
            </View>

            <Input
              label="Postal Pincode"
              placeholder="411001"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
            />

            <Button
              title={saving ? 'Saving Venue...' : 'Save Venue Address'}
              variant="primary"
              size="md"
              onPress={handleCreateAddress}
              loading={saving}
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color={colors.borderDark} />
            <Text style={styles.emptyTitle}>No Saved Venues Found</Text>
            <Text style={styles.emptySubtitle}>
              Save your home or temple venue for fast, seamless puja bookings.
            </Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(true)}>
              <Ionicons name="add" size={18} color={colors.textWhite} />
              <Text style={styles.addBtnText}>Add First Venue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {addresses.map((addr) => (
              <View key={addr.id} style={styles.addrCard}>
                <View style={styles.addrHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="home-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.addrName}>{addr.fullName}</Text>
                    {addr.isDefault && <Text style={styles.defaultPill}>Default Venue</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteAddress(addr.id)}
                    style={styles.delBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.addrLineText}>{addr.addressLine1}</Text>
                {addr.landmark && (
                  <Text style={styles.landmarkText}>Landmark: {addr.landmark}</Text>
                )}
                <Text style={styles.addrCityText}>
                  {addr.city}, {addr.state} - {addr.pincode}
                </Text>
                <Text style={styles.addrPhoneText}>Phone: {addr.phoneNumber}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  addIconBtn: {
    padding: 6,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
    marginTop: 4,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 18,
  },
  addBtnText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  addrCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  addrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  defaultPill: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 1,
  },
  delBtn: {
    padding: 4,
  },
  addrLineText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  landmarkText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addrCityText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addrPhoneText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});
