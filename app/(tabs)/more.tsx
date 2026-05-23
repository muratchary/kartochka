import { Ionicons, type Ionicons as IoniconsType } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelAllReminders } from '../../src/lib/notifications';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

type IoniconName = ComponentProps<typeof IoniconsType>['name'];

interface RowDef {
  icon: IoniconName;
  labelKey: string;
  onPress: () => void;
  destructive?: boolean;
}

export default function MoreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const seedDemoData = useChildrenStore((s) => s.seedDemoData);
  const clearAll = useChildrenStore((s) => s.clearAll);

  const childrenSection: RowDef[] = [
    {
      icon: 'people-outline',
      labelKey: 'more.items.manageChildren',
      onPress: () => router.push('/more/children'),
    },
    {
      icon: 'medkit-outline',
      labelKey: 'more.items.medicalProfile',
      onPress: () => router.push('/more/medical-profile'),
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

  const handleLoadDemo = () => {
    Alert.alert(t('more.loadDemoConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('more.loadDemoCta'),
        onPress: async () => {
          await cancelAllReminders();
          seedDemoData();
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(t('more.clearAllConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await cancelAllReminders();
          clearAll();
        },
      },
    ]);
  };

  const devSection: RowDef[] = [
    {
      icon: 'sparkles-outline',
      labelKey: 'more.items.loadDemo',
      onPress: handleLoadDemo,
    },
    {
      icon: 'trash-outline',
      labelKey: 'more.items.clearAll',
      onPress: handleClearAll,
      destructive: true,
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
        <Section title={t('more.sections.developer')} font={font} rows={devSection} t={t} />
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
            <Ionicons
              name={row.icon}
              size={22}
              color={row.destructive ? colors.error : colors.ink2}
            />
            <Text
              style={[
                styles.rowLabel,
                { fontFamily: font(600) },
                row.destructive && { color: colors.error },
              ]}>
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
