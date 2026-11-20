import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { APP_IMAGES } from '../../theme/culturalAssets';
import { useAuth } from '../../context/AuthContext';
import { DevSutraLogo } from './DevSutraLogo';

const { width, height } = Dimensions.get('window');

interface DrawerMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateWallet: () => void;
  onNavigateProfile: () => void;
  onNavigateOrders: () => void;
  onNavigateAddresses: () => void;
  onNavigateHelp: () => void;
  onNavigatePlus: () => void;
  onNavigateKundali?: () => void;
  onNavigateLanguage?: () => void;
}

export const DrawerMenuModal: React.FC<DrawerMenuModalProps> = ({
  visible,
  onClose,
  onNavigateWallet,
  onNavigateProfile,
  onNavigateOrders,
  onNavigateAddresses,
  onNavigateHelp,
  onNavigatePlus,
  onNavigateKundali,
  onNavigateLanguage,
}) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const displayName = user?.firstName
    ? `Hello, ${user.firstName}`
    : 'Hello, User';

  const displayPhone = user?.phoneNumber || '+91 8459369260';

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const openSocial = (url: string) => {
    Linking.openURL(url).catch((err) => console.warn('Could not open URL:', err));
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.safe}>
        <View style={styles.container}>
          {/* Top Header: Hello User, Phone & Close Button */}
          <View style={[styles.headerRow, { paddingTop: headerPaddingTop }]}>
            <View style={styles.userInfoCol}>
              <View style={{ marginBottom: 4 }}>
                <DevSutraLogo variant="horizontal" size="sm" showTagline={false} />
              </View>
              <Text style={styles.userNameText}>{displayName}</Text>
              <Text style={styles.userPhoneText}>{displayPhone}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={26} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.thickDivider} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Puja Mudra Item */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onNavigateWallet();
              }}
            >
              <View style={styles.itemLeftGroup}>
                <Image
                  source={APP_IMAGES.devsutraMudra}
                  style={styles.mudraIcon}
                  resizeMode="contain"
                />
                <View style={styles.mudraTextCol}>
                  <Text style={styles.mudraTitle}>Puja Mudra (पूजा मुद्रा)</Text>
                  <Text style={styles.mudraValue}>300</Text>
                </View>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* 2. Plus Membership Item */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onNavigatePlus();
              }}
            >
              <View style={styles.itemLeftGroup}>
                <View style={styles.plusBadgeBox}>
                  <Text style={styles.plusLogoText}>pujaconnect</Text>
                  <View style={styles.plusPill}>
                    <Text style={styles.plusPillText}>Plus</Text>
                  </View>
                </View>

                <Text style={styles.plusMembershipTitle}>Plus Membership</Text>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.thickDivider} />

            {/* 2.5 Janam Kundali Item */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                if (onNavigateKundali) onNavigateKundali();
              }}
            >
              <View style={styles.itemLeftGroup}>
                <Ionicons name="planet-outline" size={24} color={colors.primary} />
                <View>
                  <Text style={styles.standardItemTitle}>Janam Kundali (जन्म पत्रिका)</Text>
                  <Text style={{ fontSize: 11, color: '#8C7A70', marginTop: 1 }}>
                    Free Vedic Lagna, Rashi & Dosh Analysis
                  </Text>
                </View>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.thickDivider} />

            {/* 3. My Profile Item with Completion Bar */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onNavigateProfile();
              }}
            >
              <View style={styles.itemLeftGroup}>
                <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.standardItemTitle}>My Profile</Text>
              </View>

              <View style={styles.profileProgressGroup}>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: '10%' }]} />
                </View>
                <Text style={styles.progressPercentText}>10% Completed</Text>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* 4. Puja History Item */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onNavigateOrders();
              }}
            >
              <View style={styles.itemLeftGroup}>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
                <Text style={styles.standardItemTitle}>Puja History (माझ्या पूजा)</Text>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* 5. My Address Item */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onNavigateAddresses();
              }}
            >
              <View style={styles.itemLeftGroup}>
                <Ionicons name="location-outline" size={24} color={colors.primary} />
                <Text style={styles.standardItemTitle}>My Address (माझे पत्ते)</Text>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* 5.5 Language Selection Item */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                if (onNavigateLanguage) onNavigateLanguage();
              }}
            >
              <View style={styles.itemLeftGroup}>
                <Ionicons name="language-outline" size={24} color={colors.primary} />
                <Text style={styles.standardItemTitle}>Language / भाषा निवडा</Text>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* 6. Help Item */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onNavigateHelp();
              }}
            >
              <View style={styles.itemLeftGroup}>
                <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.standardItemTitle}>Help & Support (मदत व संपर्क)</Text>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* 7. Logout Item */}
            <TouchableOpacity
              style={styles.menuItemRow}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <View style={styles.itemLeftGroup}>
                <Ionicons name="power-outline" size={24} color={colors.primary} />
                <Text style={styles.standardItemTitle}>Logout (बाहेर पडा)</Text>
              </View>

              <Ionicons name="play" size={14} color={colors.primary} style={styles.arrowIcon} />
            </TouchableOpacity>

            <View style={styles.thickDivider} />

            {/* Follow Us On Row */}
            <View style={styles.socialFollowRow}>
              <Text style={styles.followTitle}>Follow Us On</Text>

              <View style={styles.socialIconsGroup}>
                {/* Twitter */}
                <TouchableOpacity
                  style={[styles.socialCircle, { backgroundColor: '#1DA1F2' }]}
                  onPress={() => openSocial('https://twitter.com')}
                >
                  <Ionicons name="logo-twitter" size={14} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  style={[styles.socialCircle, { backgroundColor: '#1877F2' }]}
                  onPress={() => openSocial('https://facebook.com')}
                >
                  <Ionicons name="logo-facebook" size={14} color="#FFFFFF" />
                </TouchableOpacity>

                {/* YouTube */}
                <TouchableOpacity
                  style={[styles.socialCircle, { backgroundColor: '#FF0000' }]}
                  onPress={() => openSocial('https://youtube.com')}
                >
                  <Ionicons name="logo-youtube" size={14} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Instagram */}
                <TouchableOpacity
                  style={[styles.socialCircle, { backgroundColor: '#E4405F' }]}
                  onPress={() => openSocial('https://instagram.com')}
                >
                  <Ionicons name="logo-instagram" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFDF7',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  userInfoCol: {
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  userPhoneText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#382820',
  },
  closeBtn: {
    padding: 6,
  },
  thickDivider: {
    height: 8,
    backgroundColor: '#FFF8EC',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDE0CB',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#EDE0CB',
    marginLeft: 20,
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
  },
  itemLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  mudraIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  mudraTextCol: {
    justifyContent: 'center',
  },
  mudraTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  mudraValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  plusBadgeBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusLogoText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  plusPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  plusPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  plusMembershipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  standardItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#382820',
  },
  profileProgressGroup: {
    marginRight: 12,
    alignItems: 'flex-end',
  },
  progressBarTrack: {
    width: 100,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F7D6CF',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B91C1C',
    borderRadius: 2,
  },
  progressPercentText: {
    fontSize: 10,
    color: '#735C50',
    fontWeight: '500',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  socialFollowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  followTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#382820',
  },
  socialIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
