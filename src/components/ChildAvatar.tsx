import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { useFont } from '../theme/useFont';

interface Props {
  name: string;
  photoUri?: string | null;
  size?: number;
  /** Stable key (e.g. child.id) used to pick a deterministic tint. Falls back to name. */
  colorSeed?: string;
}

// Brand-safe palette — soft fills paired with darker letter color so siblings
// render in visibly different tints but always feel on-brand.
const AVATAR_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: colors.tealSoft, fg: colors.tealDark },
  { bg: colors.amberSoft, fg: colors.amberDark },
  { bg: '#EADBF5', fg: '#6E3FA1' },
  { bg: '#FBDDDD', fg: '#B53C3C' },
  { bg: '#DCEFE0', fg: '#2F7A45' },
  { bg: '#DDEAF7', fg: '#2F5DA1' },
];

function paletteFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

export function ChildAvatar({ name, photoUri, size = 48, colorSeed }: Props) {
  const font = useFont();
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  const radius = size / 2;

  if (photoUri) {
    return (
      <Image
        source={{ uri: photoUri }}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  const palette = paletteFor(colorSeed || name);

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: radius, backgroundColor: palette.bg },
      ]}>
      <Text
        style={[
          styles.letter,
          { fontSize: Math.round(size * 0.42), fontFamily: font(800), color: palette.fg },
        ]}>
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {},
});
