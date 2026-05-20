import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function VaccinesScreen() {
  const { t } = useTranslation();
  const font = useFont();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
        {t('vaccines.title')}
      </Text>
      <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
        {t('vaccines.empty')}
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
    marginBottom: spacing.md,
  },
  empty: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    textAlign: 'center',
  },
});
