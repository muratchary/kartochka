import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { SUPPORTED_LANGUAGES, type SupportedLanguage, setLanguage } from '../../src/i18n';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function MoreScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();

  const handleChange = async (lang: SupportedLanguage) => {
    if (lang === i18n.language) return;
    const { rtlChanged } = await setLanguage(lang);
    if (rtlChanged) {
      Alert.alert(t('more.title'), t('more.restartRequired'), [{ text: t('more.ok') }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.section,
          { fontFamily: font(typography.eyebrow.weight) },
        ]}>
        {t('more.languageSection')}
      </Text>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = i18n.language === lang;
        return (
          <Pressable
            key={lang}
            onPress={() => handleChange(lang)}
            style={[styles.row, active && styles.rowActive]}>
            <Text
              style={[
                styles.rowText,
                { fontFamily: font(active ? 700 : 600) },
                active && styles.rowTextActive,
              ]}>
              {t(`languages.${lang}`)}
            </Text>
            {active && (
              <Text style={[styles.check, { fontFamily: font(700) }]}>✓</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.bg,
  },
  section: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowActive: {
    backgroundColor: colors.tealSoft,
    borderColor: colors.tealLine,
  },
  rowText: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
  },
  rowTextActive: {
    color: colors.tealDark,
  },
  check: {
    fontSize: 18,
    color: colors.teal,
  },
});
