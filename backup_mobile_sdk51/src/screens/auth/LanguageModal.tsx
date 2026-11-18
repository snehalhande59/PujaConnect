import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

interface LanguageModalProps {
  visible: boolean;
  selectedLanguage: string;
  onSelectLanguage: (lang: LanguageOption) => void;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  selectedLanguage,
  onSelectLanguage,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Select Your Sacred Language</Text>
                <Text style={styles.subtitle}>अपनी भाषा चुनें / तुमची भाषा निवडा</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isSelected =
                  selectedLanguage.toLowerCase() === item.name.toLowerCase() ||
                  selectedLanguage.toLowerCase() === item.code.toLowerCase();
                return (
                  <TouchableOpacity
                    style={[styles.langItem, isSelected && styles.langItemSelected]}
                    onPress={() => {
                      onSelectLanguage(item);
                      onClose();
                    }}
                  >
                    <View style={styles.langTexts}>
                      <Text style={[styles.nativeText, isSelected && styles.textSelected]}>
                        {item.nativeName}
                      </Text>
                      <Text style={[styles.englishText, isSelected && styles.subtextSelected]}>
                        {item.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  safeContainer: {
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  langItemSelected: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  langTexts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nativeText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  englishText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  textSelected: {
    color: colors.primary,
  },
  subtextSelected: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 8,
  },
});
