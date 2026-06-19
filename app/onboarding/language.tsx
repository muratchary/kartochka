import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { StepDots } from '../../src/components/StepDots';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, setLanguage } from '../../src/i18n';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const selected = useOnboardingStore((s) => s.language);
  const setOnboardingLanguage = useOnboardingStore((s) => s.setLanguage);

  useEffect(() => {
    if (!selected) {
      const current = (i18n.language as SupportedLanguage) ?? 'en';
      setOnboardingLanguage(current);
    }
  }, [selected, i18n.language, setOnboardingLanguage]);

  const handleSelect = async (lang: SupportedLanguage) => {
    setOnboardingLanguage(lang);
    if (lang !== i18n.language) {
      const { rtlChanged } = await setLanguage(lang);
      if (rtlChanged) {
        Alert.alert(t('more.title'), t('more.restartRequired'), [{ text: t('more.ok') }]);
      }
    }
  };

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
        <StepDots step={3} total={4} />
        <Text style={[styles.stepLabel, { fontFamily: font(700) }]}>
          {t('onboarding.language.stepLabel')}
        </Text>
      </View>

      <ScreenTitle
        title={t('onboarding.language.title')}
        subtitle={t('onboarding.language.subtitle')}
      />

      <View style={styles.list}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = lang === selected;
          return (
            <Pressable
              key={lang}
              onPress={() => handleSelect(lang)}
              style={[styles.row, active && styles.rowActive]}>
              <Text
                style={[
                  styles.rowText,
                  { fontFamily: font(active ? 700 : 600) },
                  active && styles.rowTextActive,
                ]}>
                {t(`languages.${lang}`)}
              </Text>
              {active && <Text style={[styles.check, { fontFamily: font(700) }]}>✓</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />

      <Button
        label={t('common.continue')}
        variant="primary"
        size="lg"
        full
        disabled={!selected}
        onPress={() => router.push('/onboarding/add-child')}
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
  stepLabel: { fontSize: typography.caption.fontSize, color: colors.ink2 },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowActive: { borderColor: colors.tealLine, backgroundColor: colors.tealSoft },
  rowText: { fontSize: typography.body.fontSize, color: colors.ink },
  rowTextActive: { color: colors.tealDark },
  check: { fontSize: 18, color: colors.teal },
  spacer: { flex: 1 },
});
