import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { SUPPORTED_LANGUAGES, type SupportedLanguage, setLanguage } from '../../src/i18n';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  const handleChange = async (lang: SupportedLanguage) => {
    if (lang === i18n.language) return;
    const { rtlChanged } = await setLanguage(lang);
    if (rtlChanged) {
      Alert.alert(t('settings.title'), t('settings.restartRequired'), [{ text: t('settings.ok') }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.section}>{t('settings.languageSection')}</Text>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = i18n.language === lang;
        return (
          <Pressable
            key={lang}
            onPress={() => handleChange(lang)}
            style={[styles.row, active && styles.rowActive]}>
            <Text style={[styles.rowText, active && styles.rowTextActive]}>
              {t(`languages.${lang}`)}
            </Text>
            {active && <Text style={styles.check}>✓</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24, backgroundColor: '#fff' },
  section: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  rowActive: { backgroundColor: '#eff6ff' },
  rowText: { fontSize: 16, color: '#0f172a' },
  rowTextActive: { fontWeight: '600', color: '#1d4ed8' },
  check: { fontSize: 18, color: '#1d4ed8', fontWeight: '700' },
});
