import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { GrowthChart, type ChartPoint, type GrowthMetric } from '../../src/components/GrowthChart';
import type { SupportedLanguage } from '../../src/i18n';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import type { GrowthEntry } from '../../src/types';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH = 30.4375;
const METRICS: GrowthMetric[] = ['weight', 'height', 'head'];

export default function GrowthScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const child = useChildrenStore(selectActiveChild);
  const growthEntries = useChildrenStore((s) => s.growthEntries);
  const removeGrowthEntry = useChildrenStore((s) => s.removeGrowthEntry);

  const entries = useMemo(() => {
    if (!child) return [];
    return growthEntries
      .filter((g) => g.childId === child.id)
      .sort((a, b) => b.measuredOn.localeCompare(a.measuredOn));
  }, [child, growthEntries]);

  const chartsByMetric = useMemo(() => {
    if (!child) return [];
    const dob = new Date(child.dateOfBirth).getTime();
    return METRICS.map((metric) => {
      const points = entries
        .map((e) => {
          const value =
            metric === 'weight'
              ? e.weightKg
              : metric === 'height'
                ? e.heightCm
                : e.headCircumferenceCm;
          if (value == null) return null;
          const ageMonths =
            (new Date(e.measuredOn).getTime() - dob) / (MS_PER_DAY * DAYS_PER_MONTH);
          return { ageMonths: Math.max(0, ageMonths), value };
        })
        .filter((p): p is ChartPoint => p !== null);
      return { metric, points };
    });
  }, [child, entries]);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  const handleDelete = (id: string) => {
    Alert.alert(t('growth.deleteConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeGrowthEntry(id),
      },
    ]);
  };

  const labelFor = (m: GrowthMetric): string =>
    m === 'weight'
      ? t('growth.weightLabel')
      : m === 'height'
        ? t('growth.heightLabel')
        : t('growth.headLabel');

  const unitFor = (m: GrowthMetric): string =>
    m === 'weight' ? t('growth.kg') : t('growth.cm');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('growth.title')}
        </Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="trending-up-outline" size={48} color={colors.ink3} />
          <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
            {t('growth.empty')}
          </Text>
          <Button
            label={t('growth.addCta')}
            variant="primary"
            size="lg"
            onPress={() => router.push('/growth/add')}
          />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list}>
            {chartsByMetric.map(({ metric, points }) => (
              <View key={metric} style={styles.chartBlock}>
                <Text
                  style={[
                    styles.eyebrow,
                    { fontFamily: font(typography.eyebrow.weight) },
                  ]}>
                  {labelFor(metric)} ({unitFor(metric)})
                </Text>
                {points.length >= 2 ? (
                  <>
                    <GrowthChart
                      points={points}
                      metric={metric}
                      height={160}
                      sex={child.sex ?? 'unspecified'}
                    />
                    <Text
                      style={[
                        styles.whoCaption,
                        { fontFamily: font(typography.caption.weight) },
                      ]}>
                      {t('growth.chartWhoRef')}
                    </Text>
                  </>
                ) : (
                  <View style={styles.chartEmpty}>
                    <Text
                      style={[
                        styles.chartEmptyText,
                        { fontFamily: font(typography.body.weight) },
                      ]}>
                      {t('growth.chartNeedMore')}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <Text
              style={[
                styles.eyebrow,
                { fontFamily: font(typography.eyebrow.weight), marginTop: spacing.lg },
              ]}>
              {t('growth.title')}
            </Text>
            {entries.map((entry, idx) => (
              <Pressable
                key={entry.id}
                onPress={() =>
                  router.push({ pathname: '/growth/add', params: { id: entry.id } })
                }>
                <Card style={{ padding: spacing.lg }}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.date, { fontFamily: font(typography.h2.weight) }]}>
                      {formatDate(new Date(entry.measuredOn), lang)}
                    </Text>
                    <View style={styles.cardActions}>
                      <Ionicons name="pencil-outline" size={18} color={colors.ink3} />
                      <Pressable
                        hitSlop={8}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}>
                        <Ionicons name="trash-outline" size={18} color={colors.ink3} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.metrics}>
                    {entry.weightKg != null && (
                      <Metric
                        label={t('growth.weightLabel')}
                        value={`${entry.weightKg} ${t('growth.kg')}`}
                        delta={deltaFor(entries, idx, 'weightKg')}
                        unit={t('growth.kg')}
                        font={font}
                      />
                    )}
                    {entry.heightCm != null && (
                      <Metric
                        label={t('growth.heightLabel')}
                        value={`${entry.heightCm} ${t('growth.cm')}`}
                        delta={deltaFor(entries, idx, 'heightCm')}
                        unit={t('growth.cm')}
                        font={font}
                      />
                    )}
                    {entry.headCircumferenceCm != null && (
                      <Metric
                        label={t('growth.headLabel')}
                        value={`${entry.headCircumferenceCm} ${t('growth.cm')}`}
                        delta={deltaFor(entries, idx, 'headCircumferenceCm')}
                        unit={t('growth.cm')}
                        font={font}
                      />
                    )}
                  </View>
                  {entry.notes ? (
                    <Text style={[styles.notes, { fontFamily: font(typography.body.weight) }]}>
                      {entry.notes}
                    </Text>
                  ) : null}
                </Card>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.fab} onPress={() => router.push('/growth/add')}>
            <Ionicons name="add" size={28} color={colors.ink} />
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

function Metric({
  label,
  value,
  delta,
  unit,
  font,
}: {
  label: string;
  value: string;
  delta?: number | null;
  unit?: string;
  font: (w: 400 | 500 | 600 | 700 | 800) => string;
}) {
  const showDelta = delta != null && Math.abs(delta) >= 0.05;
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, { fontFamily: font(700) }]}>{value}</Text>
      {showDelta && (
        <Text
          style={[
            styles.metricDelta,
            { color: delta! >= 0 ? colors.success : colors.error, fontFamily: font(600) },
          ]}>
          {delta! >= 0 ? '+' : ''}
          {Math.round(delta! * 10) / 10}
          {unit ? ` ${unit}` : ''}
        </Text>
      )}
    </View>
  );
}

/** Find the delta for a metric comparing the current entry to the most recent prior entry that has that field. */
function deltaFor(
  entries: GrowthEntry[],
  index: number,
  field: 'weightKg' | 'heightCm' | 'headCircumferenceCm',
): number | null {
  const curr = entries[index][field];
  if (curr == null) return null;
  for (let i = index + 1; i < entries.length; i++) {
    const prev = entries[i][field];
    if (prev != null) return curr - prev;
  }
  return null;
}

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  empty: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 110,
    gap: spacing.md,
  },
  chartBlock: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  whoCaption: {
    fontSize: 10,
    color: colors.ink3,
    marginTop: 4,
  },
  chartEmpty: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  chartEmptyText: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  date: { fontSize: typography.h2.fontSize, color: colors.ink },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  metric: { minWidth: 80 },
  metricLabel: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  metricValue: {
    fontSize: 18,
    color: colors.ink,
    marginTop: 2,
  },
  metricDelta: {
    fontSize: 12,
    marginTop: 2,
  },
  notes: {
    marginTop: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.ink2,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    end: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
});
