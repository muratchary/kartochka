import { Ionicons, type Ionicons as IoniconsType } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

type IoniconName = ComponentProps<typeof IoniconsType>['name'];

interface RowDef {
  icon: IoniconName;
  labelKey: string;
  onPress: () => void;
}

export default function MoreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const childrenSection: RowDef[] = [
    {
      icon: 'people-outline',
      labelKey: 'more.items.manageChildren',
      onPress: () => router.push('/more/children'),
    },
  ];

  const appSection: RowDef[] = [
    {
      icon: 'language-outline',
      labelKey: 'more.items.language',
      onPress: () => router.push('/more/language'),
    },
    {
      icon: 'notifications-outline',
      labelKey: 'more.items.notifications',
      onPress: () => router.push('/more/notifications'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('more.title')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title={t('more.sections.children')} font={font} rows={childrenSection} t={t} />
        <Section title={t('more.sections.app')} font={font} rows={appSection} t={t} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  rows,
  font,
  t,
}: {
  title: string;
  rows: RowDef[];
  font: (w: 400 | 500 | 600 | 700 | 800) => string;
  t: (k: string) => string;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontFamily: font(typography.eyebrow.weight) }]}>
        {title}
      </Text>
      <View style={styles.sectionRows}>
        {rows.map((row, i) => (
          <Pressable
            key={row.labelKey}
            onPress={row.onPress}
            style={[
              styles.row,
              i === 0 && styles.rowFirst,
              i === rows.length - 1 && styles.rowLast,
              i !== rows.length - 1 && styles.rowDivider,
            ]}>
            <Ionicons name={row.icon} size={22} color={colors.ink2} />
            <Text style={[styles.rowLabel, { fontFamily: font(600) }]}>
              {t(row.labelKey)}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  sectionRows: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: spacing.md,
  },
  rowFirst: { borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg },
  rowLast: { borderBottomLeftRadius: radii.lg, borderBottomRightRadius: radii.lg },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border2 },
  rowLabel: { flex: 1, fontSize: typography.body.fontSize, color: colors.ink },
});
