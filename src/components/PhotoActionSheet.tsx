import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '../theme';
import { useFont } from '../theme/useFont';

interface Action {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  actions: Action[];
  cancelLabel: string;
}

/**
 * A styled bottom-sheet action sheet — replaces the ugly native Alert.alert
 * the Android system renders when used as a chooser (see real-device QA).
 *
 * Each action is a row with an icon and label; destructive actions render in
 * the error color. Tapping any action calls onClose then onPress.
 */
export function PhotoActionSheet({ visible, onClose, actions, cancelLabel }: Props) {
  const font = useFont();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: spacing.md + insets.bottom }]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          {actions.map((a, i) => (
            <Pressable
              key={a.key}
              style={[styles.row, i === 0 && styles.rowFirst]}
              onPress={() => {
                onClose();
                // defer to next tick so the modal dismiss animation can start
                setTimeout(() => a.onPress(), 0);
              }}>
              <Ionicons
                name={a.icon}
                size={22}
                color={a.destructive ? colors.error : colors.teal}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { fontFamily: font(600) },
                  a.destructive && { color: colors.error },
                ]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={[styles.row, styles.cancel]} onPress={onClose}>
            <Text style={[styles.cancelLabel, { fontFamily: font(700) }]}>{cancelLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(26, 46, 46, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border2,
  },
  rowFirst: { borderTopWidth: 0 },
  rowLabel: { fontSize: typography.body.fontSize, color: colors.ink, flex: 1 },
  cancel: {
    marginTop: spacing.sm,
    justifyContent: 'center',
    borderTopWidth: 0,
  },
  cancelLabel: { fontSize: typography.body.fontSize, color: colors.ink2 },
});
