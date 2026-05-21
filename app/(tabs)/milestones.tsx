import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SupportedLanguage } from '../../src/i18n';
import { groupMilestonesByAge } from '../../src/lib/milestones';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function MilestonesScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const children = useChildrenStore((s) => s.children);
  const milestoneRecords = useChildrenStore((s) => s.milestones);
  const addMilestone = useChildrenStore((s) => s.addMilestone);
  const removeMilestone = useChildrenStore((s) => s.removeMilestone);
  const child = children[0];

  const groups = useMemo(() => groupMilestonesByAge(), []);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  const recordsByCode = new Map(
    milestoneRecords
      .filter((m) => m.childId === child.id)
      .map((m) => [m.milestoneCode, m]),
  );

  const handleToggle = (code: string) => {
    const existing = recordsByCode.get(code);
    if (existing) {
      Alert.alert('', t('milestones.unmark'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => removeMilestone(existing.id),
        },
      ]);
      return;
    }
    addMilestone({
      childId: child.id,
      milestoneCode: code,
      achievedOn: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('milestones.title')}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: font(typography.body.weight) }]}>
          {t('milestones.subtitle')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {groups.map((group) => (
          <View key={group.ageMonths} style={styles.group}>
            <Text style={[styles.groupTitle, { fontFamily: font(typography.eyebrow.weight) }]}>
              {ageLabel(group.ageMonths, t)}
            </Text>
            <View style={styles.items}>
              {group.milestones.map((m) => {
                const record = recordsByCode.get(m.code);
                const checked = !!record;
                const description = m.description?.[lang] ?? m.description?.en;
                return (
                  <Pressable
                    key={m.code}
                    onPress={() => handleToggle(m.code)}
                    style={[styles.item, checked && styles.itemChecked]}>
                    <Ionicons
                      name={checked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={checked ? colors.success : colors.ink3}
                      style={styles.itemIcon}
                    />
                    <View style={styles.itemText}>
                      <View style={styles.itemHeaderRow}>
                        <Text
                          style={[
                            styles.itemName,
                            { fontFamily: font(checked ? 700 : 600) },
                            checked && styles.itemNameChecked,
                          ]}>
                          {m.displayName[lang] ?? m.displayName.en}
                        </Text>
                        <View style={styles.categoryPill}>
                          <Text style={[styles.categoryPillText, { fontFamily: font(700) }]}>
                            {t(`milestones.categories.${m.category}`)}
                          </Text>
                        </View>
                      </View>
                      {description ? (
                        <Text style={[styles.itemDescription, { fontFamily: font(600) }]}>
                          {description}
                        </Text>
                      ) : null}
                      {record ? (
                        <Text style={[styles.itemDate, { fontFamily: font(700) }]}>
                          {t('milestones.markedOn', { date: formatDate(new Date(record.achievedOn), lang) })}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ageLabel(months: number, t: (k: string, opts?: Record<string, unknown>) => string): string {
  if (months >= 12 && months % 12 === 0) {
    return t('milestones.ageYears', { count: months / 12 });
  }
  return t('milestones.ageMonths', { count: months });
}

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  group: { gap: spacing.sm },
  groupTitle: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  items: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  itemIcon: { marginTop: 2 },
  itemChecked: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  itemText: { flex: 1, gap: 4 },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemName: { fontSize: 14, color: colors.ink, flex: 1 },
  itemNameChecked: { color: colors.ink },
  categoryPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.tealSoft,
  },
  categoryPillText: {
    fontSize: 10,
    color: colors.tealDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemDescription: {
    fontSize: 12,
    color: colors.ink2,
    lineHeight: 17,
  },
  itemDate: { fontSize: 11, color: colors.success, fontWeight: '700' as const, marginTop: 2 },
});
