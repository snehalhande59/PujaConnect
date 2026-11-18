import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { APP_IMAGES, FEED_POSTS, FeedPost } from '../../theme/culturalAssets';

interface FeedScreenProps {
  onOpenDrawer?: () => void;
  onOpenNotifications?: () => void;
  onSelectCity?: () => void;
  selectedCity?: string;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({
  onOpenDrawer,
  onOpenNotifications,
  onSelectCity,
  selectedCity = 'Pune',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<FeedPost[]>(FEED_POSTS);
  const [likedPosts, setLikedPosts] = useState<{ [id: string]: boolean }>({});
  const insets = useSafeAreaInsets();
  const headerPaddingTop = Platform.OS === 'android'
    ? (StatusBar.currentHeight || 28) + 8
    : Math.max(insets.top, 20) + 6;

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.safe}>
      {/* Top App Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={onOpenDrawer} activeOpacity={0.7}>
          <View style={styles.hamburgerContainer}>
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationSelector} onPress={onSelectCity} activeOpacity={0.7}>
          <Ionicons name="location" size={17} color={colors.primary} />
          <Text style={styles.locationText}>{selectedCity}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} onPress={onOpenNotifications} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar with Filter Sliders Icon */}
        <View style={styles.searchRow}>
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
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Feed Posts */}
        {filteredPosts.map((post) => {
          const isLiked = !!likedPosts[post.id];
          const likeCount = post.likes + (isLiked ? 1 : 0);

          return (
            <View key={post.id} style={styles.postCard}>
              {/* Header: Pandit Avatar, Title, Date */}
              <View style={styles.postHeader}>
                <Image
                  source={APP_IMAGES.panditAvatar}
                  style={styles.panditIcon}
                  resizeMode="contain"
                />
                <View style={styles.headerTextCol}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postDate}>{post.date}</Text>
                </View>
              </View>

              {/* Video Player Container */}
              <TouchableOpacity style={styles.videoPlayerBox} activeOpacity={0.9}>
                <Image source={post.thumbnail} style={styles.videoThumbnail} resizeMode="cover" />
                <View style={styles.videoDarkOverlay} />
                <View style={styles.playButtonCircle}>
                  <Ionicons name="play" size={26} color="#FFFFFF" style={{ marginLeft: 3 }} />
                </View>
                <View style={styles.videoBadge}>
                  <Ionicons name="sparkles" size={11} color="#FFE26B" style={{ marginRight: 4 }} />
                  <Text style={styles.videoBadgeText}>{post.category}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                  <Text style={styles.durationBadgeText}>{post.duration}</Text>
                </View>
              </TouchableOpacity>

              {/* Action Stats Footer */}
              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={styles.statAction}
                  onPress={() => toggleLike(post.id)}
                >
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={isLiked ? '#B91C1C' : '#382820'}
                  />
                  <Text style={styles.statNumber}>{likeCount}</Text>
                </TouchableOpacity>

                <View style={styles.statAction}>
                  <Ionicons name="eye-outline" size={22} color="#382820" />
                  <Text style={styles.statNumber}>{post.views}</Text>
                </View>

                <TouchableOpacity style={[styles.statAction, { marginLeft: 'auto' }]}>
                  <Ionicons name="share-social-outline" size={20} color="#382820" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
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
    paddingBottom: 10,
    backgroundColor: '#FFF8EC',
  },
  menuBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    width: 36,
  },
  hamburgerContainer: {
    justifyContent: 'space-between',
    height: 16,
    width: 22,
  },
  hamburgerBar: {
    width: 22,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  bellBtn: {
    padding: 6,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  filterBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  postCard: {
    backgroundColor: '#FFF8EC',
    marginBottom: 16,
    paddingVertical: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  panditIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 2,
  },
  headerTextCol: {
    flex: 1,
  },
  postTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 18,
    marginBottom: 4,
  },
  postDate: {
    fontSize: 11,
    color: '#8C7A70',
  },
  videoPlayerBox: {
    width: '100%',
    height: 215,
    backgroundColor: '#1E1410',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  videoThumbnail: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  videoDarkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26, 12, 16, 0.40)',
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(123, 38, 53, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C49A45',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(123, 38, 53, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoBadgeText: {
    color: '#FFF8EC',
    fontSize: 10,
    fontWeight: '700',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 24,
  },
  statAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#382820',
  },
});
