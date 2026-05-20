import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { useFont } from '../theme/useFont';

export type PillTone = 'neutral' | 'success' | 'warning' | 'error' | 'ghost' | 'amber';

interface Props {
  label: string;
  tone?: PillTone;
  style?: ViewStyle;
}

export function Pill({ label, tone = 'neutral', style }: Props) {
  const font = useFont();
  const palette = tonePalette(tone);

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
      <Text
        style={{
          fontFamily: font(700),
          fontSize: 11,
          color: palette.fg,
          letterSpacing: 0.2,
        }}>
        {label}
      </Text>
    </View>
  );
}

function tonePalette(tone: PillTone) {
  switch (tone) {
    case 'success':
      return { bg: colors.successSoft, fg: colors.success };
    case 'warning':
      return { bg: colors.warningSoft, fg: colors.warning };
    case 'error':
      return { bg: colors.errorSoft, fg: colors.error };
    case 'ghost':
      return { bg: 'transparent', fg: colors.ink2 };
    case 'amber':
      return { bg: colors.amberSoft, fg: colors.amberDark };
    case 'neutral':
    default:
      return { bg: colors.tealSoft, fg: colors.tealDark };
  }
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
});
