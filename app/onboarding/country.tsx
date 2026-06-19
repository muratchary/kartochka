import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { StepDots } from '../../src/components/StepDots';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

const COUNTRIES: Array<{ code: string; flag: string }> = [
  { code: 'RU', flag: '🇷🇺' },
  { code: 'KZ', flag: '🇰🇿' },
  { code: 'UZ', flag: '🇺🇿' },
  { code: 'AE', flag: '🇦🇪' },
  { code: 'SA', flag: '🇸🇦' },
  { code: 'TR', flag: '🇹🇷' },
];

export default function CountryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const selected = useOnboardingStore((s) => s.country);
  const setCountry = useOnboardingStore((s) => s.setCountry);

  const defaultCountry = useMemo(() => {
    const lang = i18n.language;
    if (lang.startsWith('ru')) return 'RU';
    if (lang.startsWith('ar')) return 'AE';
    if (lang.startsWith('tr')) return 'TR';
    return 'RU';
  }, [i18n.language]);

  useEffect(() => {
    if (!selected) setCountry(defaultCountry);
  }, [selected, defaultCountry, setCountry]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.stepRow}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons
            name={I18nManager.isRTL ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color={colors.ink}
          />
        </Pressable>
        <StepDots step={2} total={4} />
        <Text style={[styles.stepLabel, { fontFamily: font(700) }]}>
          {t('onboarding.country.stepLabel')}
        </Text>
      </View>

      <ScreenTitle
        title={t('onboarding.country.title')}
        subtitle={t('onboarding.country.subtitle')}
      />

      <ScrollView style={styles.list} contentContainerStyle={{ gap: spacing.sm }}>
        {COUNTRIES.map((c) => {
          const active = c.code === selected;
          return (
            <Pressable
              key={c.code}
              onPress={() => setCountry(c.code)}
              style={[styles.row, active && styles.rowActive]}>
              <Text style={styles.flag}>{c.flag}</Text>
              <Text
                style={[
                  styles.rowText,
                  { fontFamily: font(active ? 700 : 600) },
                  active && styles.rowTextActive,
                ]}>
                {t(`countries.${c.code}`)}
              </Text>
              {active && <Text style={[styles.check, { fontFamily: font(700) }]}>✓</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <Button
        label={t('common.continue')}
        variant="primary"
        size="lg"
        full
        disabled={!selected}
        onPress={() => router.push('/onboarding/language')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: { marginStart: -spacing.xs },
  stepLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
  },
  list: { flex: 1, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  rowActive: {
    borderColor: colors.tealLine,
    backgroundColor: colors.tealSoft,
  },
  flag: { fontSize: 28 },
  rowText: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
    flex: 1,
  },
  rowTextActive: { color: colors.tealDark },
  check: { fontSize: 18, color: colors.teal },
});
