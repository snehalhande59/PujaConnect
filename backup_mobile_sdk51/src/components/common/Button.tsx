import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getVariantContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.secondary, borderColor: colors.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 1.5 };
      case 'danger':
        return { backgroundColor: colors.error, borderColor: colors.error };
      case 'ghost':
        return { backgroundColor: 'transparent', borderColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary, borderColor: colors.gold, borderWidth: 1 };
    }
  };

  const getVariantTextStyle = () => {
    switch (variant) {
      case 'outline':
        return { color: colors.primary };
      case 'ghost':
        return { color: colors.textLight };
      default:
        return { color: colors.textWhite };
    }
  };

  const getSizeContainerStyle = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16 };
      default:
        return { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 14 };
    }
  };

  const getSizeTextStyle = () => {
    switch (size) {
      case 'sm':
        return { fontSize: 12 };
      case 'lg':
        return { fontSize: 16, fontWeight: '700' as const };
      default:
        return { fontSize: 14, fontWeight: '700' as const };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        getVariantContainerStyle(),
        getSizeContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.primary : colors.textWhite} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, getVariantTextStyle(), getSizeTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
