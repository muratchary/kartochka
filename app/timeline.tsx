import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SupportedLanguage } from '../src/i18n';
import { getSchedule } from '../src/lib/schedules';
import { selectActiveChild, useChildrenStore } from '../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';
import type { DoctorVisit, GrowthEntry, MilestoneRecord, VaccinationRecord } from '../src/types';
import { STANDARD_MILESTONES } from '../src/lib/milestones';

type TimelineItem =
  | { kind: 'vaccine'; date: string; record: VaccinationRecord; label: string }
  | { kind: 'growth'; date: string; record: GrowthEntry }
  | { kind: 'milestone'; date: string; record: MilestoneRecord; label: string }
  | { kind: 'visit'; date: string; record: DoctorVisit };

const KIND_COLORS = {
  vaccine: { bg: '#EFF6FF', icon: '#3B82F6', dot: '#3B82F6' },
  growth: { bg: colors.tealSoft, icon: colors.teal, dot: colors.teal },
  milestone: { bg: colors.successSoft, icon: colors.success, dot: colors.success },
  visit: { bg: '#F5F3FF', icon: '#8B5CF6', dot: '#8B5CF6' },
};

const KIND_ICONS = {
  vaccine: 'medkit-outline' as const,
  growth: 'trending-up-outline' as const,
  milestone: 'star-outline' as const,
  visit: 'person-outline' as const,
};

export default function TimelineScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const child = useChildrenStore(selectActiveChild);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const growthEntries = useChildrenStore((s) => s.growthEntries);
  const milestones = useChildrenStore((s) => s.milestones);
  const doctorVisits = useChildrenStore((s) => s.doctorVisits);

  const items = useMemo<TimelineItem[]>(() => {
    if (!child) return [];
    const schedule = getSchedule(child.countryCode);

    const result: TimelineItem[] = [];

    vaccinations
      .filter((v) => v.childId === child.id)
      .forEach((v) => {
        const label = v.isCustom && v.customVaccineName
          ? v.customVaccineName
          : schedule?.vaccines.find((sv) => sv.code === v.vaccineCode)?.displayName[lang]
            ?? schedule?.vaccines.find((sv) => sv.code === v.vaccineCode)?.displayName.en
            ?? v.vaccineCode;
        result.push({ kind: 'vaccine', date: v.administeredOn, record: v, label });
      });

    growthEntries
      .filter((g) => g.childId === child.id)
      .forEach((g) => result.push({ kind: 'growth', date: g.measuredOn, record: g }));

    milestones
      .filter((m) => m.childId === child.id)
      .forEach((m) => {
        const def = STANDARD_MILESTONES.find((s) => s.code === m.milestoneCode);
        const label = def ? (def.displayName[lang] ?? def.displayName.en) : m.milestoneCode;
        result.push({ kind: 'milestone', date: m.achievedOn, record: m, label });
      });

    doctorVisits
      .filter((d) => d.childId === child.id)
      .forEach((d) => result.push({ kind: 'visit', date: d.visitedOn, record: d }));

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [child, vaccinations, growthEntries, milestones, doctorVisits, lang]);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.screenTitle, { fontFamily: font(typography.title.weight) }]}>
          {t('timeline.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={colors.ink3} />
          <Text style={[styles.emptyText, { fontFamily: font(typography.body.weight) }]}>
            {t('timeline.empty')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {items.map((item, idx) => (
            <View key={`${item.kind}-${item.record.id}`} style={styles.row}>
              {/* Vertical line */}
              <View style={styles.lineCol}>
                <View style={[styles.dot, { backgroundColor: KIND_COLORS[item.kind].dot }]} />
                {idx < items.length - 1 && <View style={styles.line} />}
              </View>
              {/* Card */}
              <View style={[styles.card, { backgroundColor: KIND_COLORS[item.kind].bg }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconBubble, { backgroundColor: KIND_COLORS[item.kind].dot + '22' }]}>
                    <Ionicons name={KIND_ICONS[item.kind]} size={16} color={KIND_COLORS[item.kind].icon} />
                  </View>
                  <Text style={[styles.kindLabel, { fontFamily: font(600), color: KIND_COLORS[item.kind].icon }]}>
                    {t(`timeline.kind${item.kind.charAt(0).toUpperCase() + item.kind.slice(1)}`)}
                  </Text>
                  <Text style={[styles.dateLabel, { fontFamily: font(600) }]}>
                    {formatDate(new Date(item.date), lang)}
                  </Text>
                </View>
                <TimelineCardBody item={item} font={font} t={t} lang={lang} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );

  function TimelineCardBody({
    item,
    font: f,
    t: tr,
    lang: l,
  }: {
    item: TimelineItem;
    font: (w: 400 | 500 | 600 | 700 | 800) => string;
    t: (k: string, opts?: Record<string, unknown>) => string;
    lang: SupportedLanguage;
  }) {
    if (item.kind === 'vaccine') {
      return (
        <Text style={[styles.cardTitle, { fontFamily: f(700) }]}>
          {item.label}
          {item.record.doseNumber > 1 ? ` · ${tr('home.nextVaccine.doseLabel', { number: item.record.doseNumber, total: item.record.doseNumber })}` : ''}
        </Text>
      );
    }
    if (item.kind === 'growth') {
      const parts: string[] = [];
      if (item.record.weightKg != null) parts.push(`${item.record.weightKg} ${tr('growth.kg')}`);
      if (item.record.heightCm != null) parts.push(`${item.record.heightCm} ${tr('growth.cm')}`);
      if (item.record.headCircumferenceCm != null) parts.push(`${item.record.headCircumferenceCm} ${tr('growth.cm')}`);
      return (
        <Text style={[styles.cardTitle, { fontFamily: f(700) }]}>{parts.join(' · ')}</Text>
      );
    }
    if (item.kind === 'milestone') {
      return (
        <Text style={[styles.cardTitle, { fontFamily: f(700) }]}>{item.label}</Text>
      );
    }
    if (item.kind === 'visit') {
      const lines = [item.record.doctorName, item.record.clinicName, item.record.reason]
        .filter(Boolean)
        .join(' · ');
      return (
        <>
          {lines ? (
            <Text style={[styles.cardTitle, { fontFamily: f(700) }]}>{lines}</Text>
          ) : null}
          {item.record.notes ? (
            <Text style={[styles.cardMeta, { fontFamily: f(600) }]}>{item.record.notes}</Text>
          ) : null}
        </>
      );
    }
    return null;
  }
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screenTitle: {
    flex: 1,
    fontSize: typography.title.fontSize,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: typography.title.letterSpacing,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.ink3,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  lineCol: {
    alignItems: 'center',
    width: 16,
    paddingTop: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border2,
    marginTop: 4,
  },
  card: {
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.ink3,
  },
  cardTitle: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
    marginTop: 2,
  },
  cardMeta: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
  },
});
