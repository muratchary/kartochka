import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import { useFont } from '../theme/useFont';
import { ChildAvatar } from './ChildAvatar';

interface Props {
  name: string;
  greeting: string;
  ageLabel?: string;
  photoUri?: string | null;
  colorSeed?: string;
  onBellPress?: () => void;
  onSwitchChild?: () => void;
  onAvatarPress?: () => void;
  hasMultipleChildren?: boolean;
}

export function ChildHeader({
  name,
  greeting,
  ageLabel,
  photoUri,
  colorSeed,
  onBellPress,
  onSwitchChild,
  onAvatarPress,
  hasMultipleChildren = false,
}: Props) {
  const font = useFont();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={hasMultipleChildren ? onSwitchChild : undefined}
        style={styles.identity}
        hitSlop={6}>
        <Pressable onPress={onAvatarPress} hitSlop={8} style={styles.avatarWrap}>
          <ChildAvatar name={name} photoUri={photoUri} size={48} colorSeed={colorSeed} />
          {!photoUri && (
            <View style={styles.cameraHint}>
              <Ionicons name="camera" size={10} color="#fff" />
            </View>
          )}
        </Pressable>
        <View style={styles.text}>
          <Text style={[styles.greeting, { fontFamily: font(typography.caption.weight) }]}>
            {greeting}
          </Text>
          <View style={styles.nameRow}>
            <Text
              numberOfLines={1}
              style={[styles.name, { fontFamily: font(typography.title.weight) }]}>
              {name}
            </Text>
            {hasMultipleChildren && (
              <Ionicons name="chevron-down" size={18} color={colors.ink2} style={styles.chevron} />
            )}
          </View>
          {ageLabel ? (
            <Text style={[styles.age, { fontFamily: font(typography.caption.weight) }]}>
              {ageLabel}
            </Text>
          ) : null}
        </View>
      </Pressable>
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
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  cameraHint: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  text: { flex: 1 },
  greeting: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.title.fontSize,
    color: colors.ink,
    letterSpacing: typography.title.letterSpacing,
    flexShrink: 1,
  },
  chevron: {
    marginStart: spacing.xs,
  },
  age: {
    fontSize: typography.caption.fontSize,
    color: colors.teal,
    marginTop: 1,
  },
  bell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
