import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { useFont } from '../theme/useFont';

interface Props {
  name: string;
  photoUri?: string | null;
  size?: number;
}

export function ChildAvatar({ name, photoUri, size = 48 }: Props) {
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

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.42), fontFamily: font(800) }]}>
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: colors.tealDark,
  },
});
