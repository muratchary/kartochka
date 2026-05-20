import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import { useFont } from '../theme/useFont';

interface Props {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function ScreenTitle({ title, subtitle, align = 'left' }: Props) {
  const font = useFont();
  const textAlign = align;

  return (
    <View style={[styles.container, align === 'center' && styles.centered]}>
      <Text
        style={{
          fontFamily: font(typography.display.weight),
          fontSize: typography.display.fontSize,
          letterSpacing: typography.display.letterSpacing,
          color: colors.ink,
          textAlign,
        }}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: font(typography.body.weight),
            fontSize: typography.body.fontSize,
            color: colors.ink2,
            textAlign,
            marginTop: spacing.sm,
          }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.xl },
  centered: { alignItems: 'center' },
});
