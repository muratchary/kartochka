import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../theme';
import { useFont } from '../theme/useFont';

interface Props {
  name: string;
  greeting: string;
  onBellPress?: () => void;
}

export function ChildHeader({ name, greeting, onBellPress }: Props) {
  const font = useFont();
  const letter = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={[styles.avatarLetter, { fontFamily: font(800) }]}>{letter}</Text>
      </View>
      <View style={styles.text}>
        <Text style={[styles.greeting, { fontFamily: font(typography.caption.weight) }]}>
          {greeting}
        </Text>
        <Text style={[styles.name, { fontFamily: font(typography.title.weight) }]}>
          {name}
        </Text>
      </View>
      <Pressable onPress={onBellPress} hitSlop={10} style={styles.bell}>
        <Ionicons name="notifications-outline" size={22} color={colors.ink2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 20,
    color: colors.tealDark,
  },
  text: { flex: 1 },
  greeting: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
  },
  name: {
    fontSize: typography.title.fontSize,
    color: colors.ink,
    letterSpacing: typography.title.letterSpacing,
  },
  bell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
