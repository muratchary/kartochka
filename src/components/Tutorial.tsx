import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { colors, radii, spacing, typography } from '../theme';
import { useFont } from '../theme/useFont';

interface Props {
  visible: boolean;
  onFinish: () => void;
}

interface Step {
  icon: 'sparkles' | 'medkit' | 'notifications';
  titleKey: string;
  bodyKey: string;
}

const STEPS: Step[] = [
  { icon: 'sparkles', titleKey: 'tutorial.step1Title', bodyKey: 'tutorial.step1Body' },
  { icon: 'medkit', titleKey: 'tutorial.step2Title', bodyKey: 'tutorial.step2Body' },
  { icon: 'notifications', titleKey: 'tutorial.step3Title', bodyKey: 'tutorial.step3Body' },
];

export function Tutorial({ visible, onFinish }: Props) {
  const { t } = useTranslation();
  const font = useFont();
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setStepIndex(0);
      onFinish();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleSkip = () => {
    setStepIndex(0);
    onFinish();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleSkip}>
      <View style={styles.scrim}>
        <View style={styles.sheet}>
          <View style={styles.iconBubble}>
            <Ionicons name={`${step.icon}-outline`} size={28} color={colors.teal} />
          </View>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === stepIndex ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
          <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
            {t(step.titleKey)}
          </Text>
          <Text style={[styles.body, { fontFamily: font(typography.body.weight) }]}>
            {t(step.bodyKey)}
          </Text>
          <View style={styles.actions}>
            <Pressable hitSlop={6} onPress={handleSkip}>
              <Text style={[styles.skip, { fontFamily: font(700) }]}>
                {t('common.close')}
              </Text>
            </Pressable>
            <Button
              label={isLast ? t('tutorial.gotIt') : t('tutorial.next')}
              variant="primary"
              size="md"
              onPress={handleNext}
            />
          </View>
        </View>
      </View>
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
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  dot: { height: 6, borderRadius: 999 },
  dotActive: { width: 22, backgroundColor: colors.teal },
  dotInactive: { width: 6, backgroundColor: colors.border },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
