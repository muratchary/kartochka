import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function HomeScreen() {
  const { t } = useTranslation();
  const font = useFont();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
        {t('brand.name')}
      </Text>
      <Text style={[styles.subtitle, { fontFamily: font(typography.body.weight) }]}>
        {t('brand.tagline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    textAlign: 'center',
  },
});
