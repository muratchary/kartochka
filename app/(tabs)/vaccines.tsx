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
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

type Filter = 'all' | 'upcoming' | 'done' | 'overdue';
type RowStatus = 'overdue' | 'due-soon' | 'upcoming' | 'done';

interface DoseRow {
  vaccineCode: string;
  vaccineName: string;
  doseNumber: number;
  totalDoses: number;
  recommendedAgeMonths: number;
  dueDate: Date;
  status: RowStatus;
  daysFromNow: number;
}

interface Group {
  status: RowStatus;
  rows: DoseRow[];
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const GROUP_ORDER: RowStatus[] = ['overdue', 'due-soon', 'upcoming', 'done'];

export default function VaccinesScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const child = useChildrenStore(selectActiveChild);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const [filter, setFilter] = useState<Filter>('all');

  const customVaccinations = useMemo(
    () => vaccinations.filter((v) => v.childId === child?.id && v.isCustom),
    [vaccinations, child],
  );

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
        const status: RowStatus = done ? 'done' : normalizeStatus(statusFromDays(daysFromNow));
        result.push({
          vaccineCode: v.code,
          vaccineName: v.displayName[lang] ?? v.displayName.en,
          doseNumber: dose.doseNumber,
          totalDoses: v.doses.length,
          recommendedAgeMonths: dose.recommendedAgeMonths,
          dueDate,
          status,
          daysFromNow,
        });
      }
    }
    return result;
  }, [child, vaccinations, lang]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'done') return rows.filter((r) => r.status === 'done');
    if (filter === 'overdue') return rows.filter((r) => r.status === 'overdue');
    if (filter === 'upcoming') {
      return rows.filter((r) => r.status === 'due-soon' || r.status === 'upcoming');
    }
    return rows;
  }, [rows, filter]);

  const groups = useMemo<Group[]>(() => {
    const map: Record<RowStatus, DoseRow[]> = {
      overdue: [],
      'due-soon': [],
      upcoming: [],
      done: [],
    };
    for (const r of filtered) map[r.status].push(r);
    // Within each group: due-soon/upcoming/overdue sort ascending by date; done sort descending (most recent first)
    for (const s of GROUP_ORDER) {
      map[s].sort((a, b) =>
        s === 'done' ? b.dueDate.getTime() - a.dueDate.getTime() : a.dueDate.getTime() - b.dueDate.getTime(),
      );
    }
    return GROUP_ORDER.map((status) => ({ status, rows: map[status] })).filter(
      (g) => g.rows.length > 0,
    );
  }, [filtered]);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('vaccines.title')}
        </Text>
        <Pressable
          onPress={() => router.push('/vaccine/log-custom')}
          hitSlop={10}
          style={styles.addBtn}>
          <Ionicons name="add" size={26} color={colors.teal} />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'upcoming', 'done', 'overdue'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: font(700),
                fontSize: 13,
                color: filter === f ? colors.surface : colors.ink2,
              }}>
              {t(`vaccines.filters.${f}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {groups.length === 0 && customVaccinations.length === 0 ? (
        <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
          {t('vaccines.empty')}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {groups.map((group) => (
            <View key={group.status} style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: dotColorFor(group.status) }]} />
                <Text style={[styles.groupTitle, { fontFamily: font(700) }]}>
                  {t(groupTitleKey(group.status))}
                </Text>
                <Text style={[styles.groupCount, { fontFamily: font(typography.caption.weight) }]}>
                  {t('vaccines.groupCount', { count: group.rows.length })}
                </Text>
              </View>
              <View style={styles.groupRows}>
                {group.rows.map((row) => (
                  <Pressable
                    key={`${row.vaccineCode}-${row.doseNumber}`}
                    onPress={() =>
                      router.push({
                        pathname: '/vaccine/[id]',
                        params: { id: `${row.vaccineCode}_${row.doseNumber}` },
                      })
                    }
                    style={[styles.row, rowStyleFor(row.status)]}>
                    <View
                      style={[styles.rowIcon, { backgroundColor: iconBgFor(row.status) }]}>
                      <Ionicons
                        name={iconFor(row.status)}
                        size={18}
                        color={iconFgFor(row.status)}
                      />
                    </View>
                    <View style={styles.rowText}>
                      <Text
                        style={[
                          styles.rowName,
                          { fontFamily: font(700), color: rowTextColorFor(row.status) },
                        ]}
                        numberOfLines={1}>
                        {row.vaccineName}
                      </Text>
                      <Text
                        style={[
                          styles.rowMeta,
                          { fontFamily: font(600), color: rowMetaColorFor(row.status) },
                        ]}>
                        {t('vaccines.detail.doseLabel', {
                          number: row.doseNumber,
                          total: row.totalDoses,
                        })}{' '}
                        · {formatDate(row.dueDate, lang)}
                      </Text>
                    </View>
                    <Pill label={shortLabelFor(row.status, t)} tone={toneFor(row.status)} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* Custom / additional vaccines */}
          {customVaccinations.length > 0 && (
            <View style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={[styles.groupTitle, { fontFamily: font(700) }]}>
                  {t('customVaccine.sectionTitle')}
                </Text>
                <Text style={[styles.groupCount, { fontFamily: font(typography.caption.weight) }]}>
                  {t('vaccines.groupCount', { count: customVaccinations.length })}
                </Text>
              </View>
              <View style={styles.groupRows}>
                {customVaccinations.map((v) => (
                  <View
                    key={v.id}
                    style={[styles.row, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
                    <View style={[styles.rowIcon, { backgroundColor: '#EDE9FE' }]}>
                      <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={[styles.rowName, { fontFamily: font(700) }]} numberOfLines={1}>
                        {v.customVaccineName ?? v.vaccineCode}
                      </Text>
                      <Text style={[styles.rowMeta, { fontFamily: font(600), color: colors.ink2 }]}>
                        {formatDate(new Date(v.administeredOn), lang)}
                        {v.locationOfAdministration ? ` · ${v.locationOfAdministration}` : ''}
                      </Text>
                    </View>
                    <Pill label={t('vaccines.filters.done')} tone="success" />
                  </View>
                ))}
              </View>
            </View>
          )}

          <Pressable
            style={styles.logCustomCta}
            onPress={() => router.push('/vaccine/log-custom')}>
            <Ionicons name="add-circle-outline" size={18} color="#8B5CF6" />
            <Text style={[styles.logCustomCtaText, { fontFamily: font(600) }]}>
              {t('customVaccine.title')}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function normalizeStatus(s: DueStatus): RowStatus {
  if (s === 'overdue') return 'overdue';
  if (s === 'due-soon') return 'due-soon';
  return 'upcoming';
}

function groupTitleKey(s: RowStatus): string {
  switch (s) {
    case 'overdue':
      return 'vaccines.groupOverdue';
    case 'due-soon':
      return 'vaccines.groupDueSoon';
    case 'upcoming':
      return 'vaccines.groupUpcoming';
    case 'done':
      return 'vaccines.groupDone';
  }
}

function shortLabelFor(s: RowStatus, t: (k: string) => string): string {
  switch (s) {
    case 'overdue':
      return t('home.nextVaccine.statusOverdue');
    case 'due-soon':
      return t('home.nextVaccine.statusDueSoon');
    case 'upcoming':
      return t('home.nextVaccine.statusUpcoming');
    case 'done':
      return t('vaccines.filters.done');
  }
}

function toneFor(status: RowStatus): PillTone {
  switch (status) {
    case 'done':
      return 'success';
    case 'overdue':
      return 'error';
    case 'due-soon':
      return 'warning';
    case 'upcoming':
      return 'neutral';
  }
}

function iconFor(status: RowStatus) {
  if (status === 'done') return 'checkmark-circle' as const;
  if (status === 'overdue') return 'alert-circle' as const;
  if (status === 'due-soon') return 'time' as const;
  return 'ellipse-outline' as const;
}

function dotColorFor(status: RowStatus): string {
  if (status === 'done') return colors.success;
  if (status === 'overdue') return colors.error;
  if (status === 'due-soon') return colors.warning;
  return colors.teal;
}

function iconBgFor(status: RowStatus): string {
  if (status === 'done') return colors.successSoft;
  if (status === 'overdue') return colors.errorSoft;
  if (status === 'due-soon') return colors.warningSoft;
  return colors.tealSoft;
}

function iconFgFor(status: RowStatus): string {
  if (status === 'done') return colors.success;
  if (status === 'overdue') return colors.error;
  if (status === 'due-soon') return colors.warning;
  return colors.teal;
}

function rowStyleFor(status: RowStatus) {
  switch (status) {
    case 'overdue':
      return { backgroundColor: colors.errorSoft, borderColor: '#E9C9C9' };
    case 'due-soon':
      return { backgroundColor: colors.warningSoft, borderColor: '#EBD3A8' };
    case 'done':
      return { backgroundColor: colors.successSoft, borderColor: '#D0E5D8' };
    case 'upcoming':
      return { backgroundColor: colors.surface, borderColor: colors.border };
  }
}

function rowTextColorFor(status: RowStatus): string {
  if (status === 'done') return colors.ink2;
  return colors.ink;
}

function rowMetaColorFor(status: RowStatus): string {
  if (status === 'done') return colors.ink3;
  return colors.ink2;
}

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  addBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm - 2,
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
    gap: spacing.lg,
  },
  empty: {
    fontSize: typography.body.fontSize,
    color: colors.ink3,
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  group: { gap: spacing.sm },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: {
    fontSize: 13,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  groupCount: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
  },
  groupRows: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowName: { fontSize: 15 },
  rowMeta: { fontSize: 12, marginTop: 2 },
  logCustomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
  },
  logCustomCtaText: {
    fontSize: typography.body.fontSize,
    color: '#8B5CF6',
  },
});
