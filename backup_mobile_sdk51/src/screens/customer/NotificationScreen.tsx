import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { APP_IMAGES, NOTIFICATIONS } from '../../theme/culturalAssets';

interface NotificationScreenProps {
  onBack: () => void;
  onNotificationPress?: (id: string) => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  onBack,
  onNotificationPress,
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.notifItem}
            activeOpacity={0.7}
            onPress={() => onNotificationPress && onNotificationPress(item.id)}
          >
            {/* Pandit Avatar Icon */}
            <Image
              source={APP_IMAGES.panditAvatar}
              style={styles.panditIcon}
              resizeMode="contain"
            />

            {/* Notification Content */}
            <View style={styles.contentCol}>
              <Text style={styles.notifTitle} numberOfLines={3}>
                {item.title}
              </Text>
              <Text style={styles.notifDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF8EC',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE0CB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE3',
    gap: 12,
  },
  panditIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#382820',
    lineHeight: 18,
    marginBottom: 6,
  },
  notifDate: {
    fontSize: 11,
    color: '#8C7A70',
    alignSelf: 'flex-end',
  },
});
