import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { SeedlingMark } from './brand/SeedlingMark';
import { colors, radii, spacing, typography } from '../theme';
import { useFont } from '../theme/useFont';

interface Props {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}

export function Celebration({ visible, title, body, onClose }: Props) {
  const font = useFont();
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.4);
      opacity.setValue(0);
      ringScale.setValue(0.6);
      ringOpacity.setValue(0.6);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 2.2,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      const t = setTimeout(onClose, 1800);
      return () => clearTimeout(t);
    }
  }, [visible, scale, opacity, ringScale, ringOpacity, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.markWrap}>
            <Animated.View
              style={[
                styles.ring,
                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <SeedlingMark size={84} />
          </View>
          <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
            {title}
          </Text>
          <Text style={[styles.body, { fontFamily: font(typography.body.weight) }]}>
            {body}
          </Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(26, 46, 46, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.sheet,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  markWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  ring: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.amberSoft,
    borderWidth: 2,
    borderColor: colors.amber,
  },
  title: {
    fontSize: typography.title.fontSize,
    color: colors.ink,
    letterSpacing: typography.title.letterSpacing,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  body: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    textAlign: 'center',
  },
});
