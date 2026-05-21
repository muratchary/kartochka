import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenTitle } from '../../src/components/ScreenTitle';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, setLanguage } from '../../src/i18n';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const handleChange = async (lang: SupportedLanguage) => {
    if (lang === i18n.language) return;
    const { rtlChanged } = await setLanguage(lang);
    if (rtlChanged) {
      Alert.alert(t('more.title'), t('more.restartRequired'), [{ text: t('more.ok') }]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <ScreenTitle
          title={t('more.languageScreen.title')}
          subtitle={t('more.languageScreen.subtitle')}
        />
        <View style={styles.list}>
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
                {active && <Text style={[styles.check, { fontFamily: font(700) }]}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topRow: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
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
});
