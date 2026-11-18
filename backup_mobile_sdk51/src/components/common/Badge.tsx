import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

export type BadgeVariant =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'gold'
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'verified':
      case 'accepted':
      case 'completed':
      case 'success':
        return { bg: colors.successLight, text: colors.success, border: 'rgba(21, 128, 61, 0.25)' };
      case 'pending':
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning, border: 'rgba(217, 119, 6, 0.25)' };
      case 'rejected':
      case 'cancelled':
      case 'error':
        return { bg: colors.errorLight, text: colors.error, border: 'rgba(185, 28, 28, 0.25)' };
      case 'info':
        return { bg: colors.infoLight, text: colors.info, border: 'rgba(29, 78, 216, 0.25)' };
      case 'gold':
        return { bg: colors.goldLight, text: colors.goldDark, border: 'rgba(196, 154, 69, 0.3)' };
      default:
        return { bg: colors.background, text: colors.textLight, border: colors.border };
    }
  };

  const current = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: current.bg,
          borderColor: current.border,
          paddingHorizontal: size === 'sm' ? 6 : 8,
          paddingVertical: size === 'sm' ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: current.text,
            fontSize: size === 'sm' ? 10 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
