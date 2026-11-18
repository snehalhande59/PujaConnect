import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
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

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top App Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={onOpenDrawer}>
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
          <View style={styles.hamburgerBar} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationSelector} onPress={onSelectCity}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.locationText}>{selectedCity}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
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
                <View style={styles.playButtonCircle}>
                  <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
                </View>
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>Spiritual Satsang</Text>
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
    </SafeAreaView>
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
    paddingVertical: 10,
    backgroundColor: '#FFF8EC',
  },
  menuBtn: {
    padding: 6,
    justifyContent: 'space-between',
    height: 22,
    width: 26,
  },
  hamburgerBar: {
    width: 20,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  bellBtn: {
    padding: 6,
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
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButtonCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(123, 38, 53, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C49A45',
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoBadgeText: {
    color: '#EDE0CB',
    fontSize: 10,
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
