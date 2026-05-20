import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { useFont } from '../theme/useFont';

export type ButtonVariant = 'primary' | 'amber' | 'ghost' | 'secondary' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
}: Props) {
  const font = useFont();
  const palette = variantPalette(variant, disabled);
  const sizing = sizePalette(size);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizing.container,
        { backgroundColor: palette.bg, borderColor: palette.border },
        full && styles.full,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text
        style={{
          fontFamily: font(700),
          fontSize: sizing.fontSize,
          color: palette.fg,
          letterSpacing: 0.1,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

function variantPalette(variant: ButtonVariant, disabled: boolean) {
  if (disabled) {
    return { bg: colors.border2, fg: colors.ink3, border: colors.border };
  }
  switch (variant) {
    case 'primary':
      return { bg: colors.teal, fg: colors.surface, border: colors.teal };
    case 'amber':
      return { bg: colors.amber, fg: colors.ink, border: colors.amber };
    case 'ghost':
      return { bg: 'transparent', fg: colors.teal, border: 'transparent' };
    case 'secondary':
      return { bg: colors.surface, fg: colors.ink, border: colors.border };
    case 'danger':
      return { bg: colors.error, fg: colors.surface, border: colors.error };
  }
}

function sizePalette(size: ButtonSize): { container: ViewStyle; fontSize: number } {
  switch (size) {
    case 'lg':
      return {
        container: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
        fontSize: 16,
      };
    case 'md':
      return {
        container: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg },
        fontSize: 15,
      };
    case 'sm':
      return {
        container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
        fontSize: 13,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  full: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
