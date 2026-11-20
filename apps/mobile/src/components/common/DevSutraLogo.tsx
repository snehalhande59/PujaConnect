import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export type LogoVariant = 'horizontal' | 'vertical' | 'icon' | 'dark' | 'light';

interface DevSutraLogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const DevSutraLogo: React.FC<DevSutraLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 32,
    md: 44,
    lg: 58,
    xl: 72,
  };

  const currentSize = iconSizes[size];

  // Emblem with Sacred Lotus & Diya Flame
  const Emblem = (
    <View
      style={[
        styles.emblemContainer,
        {
          width: currentSize,
          height: currentSize,
          borderRadius: currentSize / 2,
        },
      ]}
    >
      {/* Outer Sacred Sutra Circle (Gold Gradient Border) */}
      <LinearGradient
        colors={['#DFBC6C', '#C49A45', '#8F671E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.outerCircle,
          {
            width: currentSize,
            height: currentSize,
            borderRadius: currentSize / 2,
          },
        ]}
      >
        {/* Inner Ivory/Maroon Core */}
        <View
          style={[
            styles.innerCore,
            {
              width: currentSize - 6,
              height: currentSize - 6,
              borderRadius: (currentSize - 6) / 2,
              backgroundColor: isDark ? '#551822' : '#FFF8EC',
            },
          ]}
        >
          {/* Flame Icon with Saffron Gradient */}
          <Ionicons
            name="flame"
            size={currentSize * 0.52}
            color={colors.secondary}
          />
        </View>
      </LinearGradient>
    </View>
  );

  if (variant === 'icon') {
    return Emblem;
  }

  const isVertical = variant === 'vertical';

  const titleFontSize = {
    sm: 15,
    md: 20,
    lg: 24,
    xl: 30,
  }[size];

  const taglineFontSize = {
    sm: 8.5,
    md: 9.5,
    lg: 11,
    xl: 12.5,
  }[size];

  return (
    <View style={[styles.container, isVertical && styles.verticalContainer]}>
      {Emblem}

      <View style={[styles.textCol, isVertical && styles.verticalTextCol]}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.brandTitle,
              {
                fontSize: titleFontSize,
                color: isDark ? '#FFF8EC' : colors.primary,
              },
            ]}
          >
            Puja<Text style={{ color: colors.gold }}>Connect</Text>
          </Text>
        </View>

        {showTagline && (
          <Text
            style={[
              styles.tagline,
              {
                fontSize: taglineFontSize,
                color: isDark ? '#EDE0CB' : colors.textLight,
              },
            ]}
          >
            Vedic Pujas & Gurukul Pandits
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  emblemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C49A45',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  outerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  innerCore: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE0CB',
  },
  textCol: {
    justifyContent: 'center',
  },
  verticalTextCol: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tagline: {
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 1,
  },
});
