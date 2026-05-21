import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pill, type PillTone } from '../../src/components/Pill';
import type { SupportedLanguage } from '../../src/i18n';
import { getSchedule } from '../../src/lib/schedules';
import { dueDateForDose, statusFromDays, type DueStatus } from '../../src/lib/vaccinationStatus';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

type Filter = 'all' | 'upcoming' | 'done' | 'overdue';

interface DoseRow {
  vaccineCode: string;
  vaccineName: string;
  doseNumber: number;
  totalDoses: number;
  recommendedAgeMonths: number;
  dueDate: Date;
  status: DueStatus | 'done';
  daysFromNow: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default function VaccinesScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const children = useChildrenStore((s) => s.children);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const [filter, setFilter] = useState<Filter>('all');
  const child = children[0];

  const rows = useMemo<DoseRow[]>(() => {
    if (!child) return [];
    const schedule = getSchedule(child.countryCode);
    if (!schedule) return [];
    const records = vaccinations.filter((v) => v.childId === child.id);
    const now = Date.now();

    const result: DoseRow[] = [];
    for (const v of schedule.vaccines) {
      for (const dose of v.doses) {
        const dueDate = dueDateForDose(child.dateOfBirth, dose.recommendedAgeMonths);
        const daysFromNow = Math.round((dueDate.getTime() - now) / MS_PER_DAY);
        const done = records.some((r) => r.vaccineCode === v.code && r.doseNumber === dose.doseNumber);
        result.push({
          vaccineCode: v.code,
          vaccineName: v.displayName[lang] ?? v.displayName.en,
          doseNumber: dose.doseNumber,
          totalDoses: v.doses.length,
          recommendedAgeMonths: dose.recommendedAgeMonths,
          dueDate,
          status: done ? 'done' : statusFromDays(daysFromNow),
          daysFromNow,
        });
      }
    }
    result.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return result;
  }, [child, vaccinations, lang]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'done') return rows.filter((r) => r.status === 'done');
    if (filter === 'overdue') return rows.filter((r) => r.status === 'overdue');
    if (filter === 'upcoming') {
      return rows.filter((r) => r.status === 'due-soon' || r.status === 'upcoming' || r.status === 'far-future');
    }
    return rows;
  }, [rows, filter]);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('vaccines.title')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {(['all', 'upcoming', 'done', 'overdue'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}>
            <Text
              style={{
                fontFamily: font(700),
                fontSize: 13,
                color: filter === f ? colors.surface : colors.ink2,
              }}>
              {t(`vaccines.filters.${f}`)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
          {t('vaccines.empty')}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filtered.map((row) => (
            <Pressable
              key={`${row.vaccineCode}-${row.doseNumber}`}
              onPress={() =>
                router.push({
                  pathname: '/vaccine/[id]',
                  params: { id: `${row.vaccineCode}_${row.doseNumber}` },
                })
              }
              style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name={iconFor(row.status)} size={20} color={colorFor(row.status)} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowName, { fontFamily: font(700) }]} numberOfLines={1}>
                  {row.vaccineName}
                </Text>
                <Text style={[styles.rowMeta, { fontFamily: font(600) }]}>
                  {t('vaccines.detail.doseLabel', {
                    number: row.doseNumber,
                    total: row.totalDoses,
                  })}{' '}
                  · {formatDate(row.dueDate, lang)}
                </Text>
              </View>
              <Pill label={t(statusLabelKey(row.status))} tone={toneFor(row.status)} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function statusLabelKey(status: DoseRow['status']): string {
  if (status === 'done') return 'vaccines.filters.done';
  if (status === 'overdue') return 'home.nextVaccine.statusOverdue';
  if (status === 'due-soon') return 'home.nextVaccine.statusDueSoon';
  return 'home.nextVaccine.statusUpcoming';
}

function toneFor(status: DoseRow['status']): PillTone {
  if (status === 'done') return 'success';
  if (status === 'overdue') return 'error';
  if (status === 'due-soon') return 'warning';
  return 'neutral';
}

function iconFor(status: DoseRow['status']) {
  if (status === 'done') return 'checkmark-circle' as const;
  if (status === 'overdue') return 'alert-circle-outline' as const;
  if (status === 'due-soon') return 'time-outline' as const;
  return 'ellipse-outline' as const;
}

function colorFor(status: DoseRow['status']): string {
  if (status === 'done') return colors.success;
  if (status === 'overdue') return colors.error;
  if (status === 'due-soon') return colors.warning;
  return colors.ink3;
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
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  empty: {
    fontSize: typography.body.fontSize,
    color: colors.ink3,
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowName: { fontSize: 15, color: colors.ink },
  rowMeta: { fontSize: 12, color: colors.ink2, marginTop: 2 },
});
