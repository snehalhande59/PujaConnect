import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface CitySelectorModalProps {
  visible: boolean;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
}

const POPULAR_CITIES = [
  { name: 'Pune', state: 'Maharashtra', isPopular: true },
  { name: 'Mumbai', state: 'Maharashtra', isPopular: true },
  { name: 'Thane', state: 'Maharashtra', isPopular: true },
  { name: 'Navi Mumbai', state: 'Maharashtra', isPopular: true },
  { name: 'Nashik', state: 'Maharashtra', isPopular: true },
  { name: 'Nagpur', state: 'Maharashtra', isPopular: false },
  { name: 'Bengaluru', state: 'Karnataka', isPopular: false },
  { name: 'Delhi NCR', state: 'Delhi', isPopular: false },
  { name: 'Varanasi', state: 'Uttar Pradesh', isPopular: false },
];

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  visible,
  selectedCity,
  onSelectCity,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Select Your City</Text>
              <Text style={styles.headerSubtitle}>Find certified Vedic Pandits in your location</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
            {POPULAR_CITIES.map((item) => {
              const isSelected = selectedCity.toLowerCase() === item.name.toLowerCase();

              return (
                <TouchableOpacity
                  key={item.name}
                  style={[styles.cityRow, isSelected && styles.cityRowSelected]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelectCity(item.name);
                    onClose();
                  }}
                >
                  <View style={styles.cityInfo}>
                    <Ionicons
                      name="location"
                      size={18}
                      color={isSelected ? colors.primary : '#8C7A70'}
                      style={{ marginRight: 10 }}
                    />
                    <View>
                      <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                        {item.name}
                      </Text>
                      <Text style={styles.stateName}>{item.state}</Text>
                    </View>
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(56, 40, 32, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0CB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#735C50',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  cityList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE3',
  },
  cityRowSelected: {
    backgroundColor: '#FFF8EC',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#382820',
  },
  cityNameSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  stateName: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 1,
  },
});
