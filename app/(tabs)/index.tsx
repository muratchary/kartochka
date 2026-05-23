import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ChildHeader } from '../../src/components/ChildHeader';
import { Pill, type PillTone } from '../../src/components/Pill';
import { Tutorial } from '../../src/components/Tutorial';
import type { SupportedLanguage } from '../../src/i18n';
import { STANDARD_MILESTONES } from '../../src/lib/milestones';
import { exportChildPdf } from '../../src/lib/pdfExport';
import { getSchedule } from '../../src/lib/schedules';
import {
  dueDateForDose,
  nextDueVaccine,
  statusFromDays,
  type DueStatus,
} from '../../src/lib/vaccinationStatus';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, spacing, typography } from '../../src/theme';
import type { MilestoneDefinition } from '../../src/types';
import { useFont } from '../../src/theme/useFont';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const children = useChildrenStore((s) => s.children);
  const child = useChildrenStore(selectActiveChild);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const growthEntries = useChildrenStore((s) => s.growthEntries);
  const milestones = useChildrenStore((s) => s.milestones);
  const tutorialSeen = useChildrenStore((s) => s.tutorialSeen);
  const markTutorialSeen = useChildrenStore((s) => s.markTutorialSeen);

  const handleExportPdf = async () => {
    if (!child) return;
    try {
      await exportChildPdf({
        child,
        vaccinations,
        growthEntries,
        milestones,
        lang,
        t,
      });
    } catch {
      Alert.alert(t('home.pdf.errorTitle'), t('home.pdf.errorBody'));
    }
  };

  const nextDue = useMemo(() => {
    if (!child) return null;
    const schedule = getSchedule(child.countryCode);
    if (!schedule) return null;
    return nextDueVaccine(child, schedule, vaccinations);
  }, [child, vaccinations]);

  const latestGrowth = useMemo(() => {
    if (!child) return null;
    return (
      growthEntries
        .filter((g) => g.childId === child.id)
        .sort((a, b) => b.measuredOn.localeCompare(a.measuredOn))[0] ?? null
    );
  }, [child, growthEntries]);

  const milestonesForChild = useMemo(() => {
    if (!child) return [];
    return milestones.filter((m) => m.childId === child.id);
  }, [child, milestones]);

  const nextMilestone = useMemo(() => {
    if (!child) return null;
    const reachedCodes = new Set(milestonesForChild.map((m) => m.milestoneCode));
    return (
      [...STANDARD_MILESTONES]
        .sort((a, b) => a.recommendedAgeMonths - b.recommendedAgeMonths)
        .find((m) => !reachedCodes.has(m.code)) ?? null
    );
  }, [child, milestonesForChild]);

  const childAgeLabel = useMemo(() => {
    if (!child) return '';
    const totalMonths = Math.floor(
      (Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375),
    );
    if (totalMonths <= 0) return t('home.pdf.ageDays', { count: 1 });
    if (totalMonths < 24) return t('home.pdf.ageMonths', { count: totalMonths });
    const years = Math.floor(totalMonths / 12);
    const rem = totalMonths % 12;
    if (rem === 0) return t('home.pdf.ageYears', { count: years });
    return `${t('home.pdf.ageYears', { count: years })} ${t('home.pdf.ageMonths', { count: rem })}`;
  }, [child, t]);

  const monthDigest = useMemo(() => {
    if (!child) {
      return { vaccinesDue: 0, vaccinesOverdue: 0, growthThisMonth: 0, milestonesThisMonth: 0 };
    }
    const schedule = getSchedule(child.countryCode);
    const childRecords = vaccinations.filter((v) => v.childId === child.id);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartIso = monthStart.toISOString().slice(0, 10);
    let vaccinesDue = 0;
    let vaccinesOverdue = 0;
    if (schedule) {
      const msNow = now.getTime();
      for (const v of schedule.vaccines) {
        for (const dose of v.doses) {
          const done = childRecords.some(
            (r) => r.vaccineCode === v.code && r.doseNumber === dose.doseNumber,
          );
          if (done) continue;
          const dueDate = dueDateForDose(child.dateOfBirth, dose.recommendedAgeMonths);
          const days = Math.round((dueDate.getTime() - msNow) / (1000 * 60 * 60 * 24));
          const status = statusFromDays(days);
          if (status === 'overdue') vaccinesOverdue += 1;
          else if (days <= 30) vaccinesDue += 1;
        }
      }
    }
    const growthThisMonth = growthEntries.filter(
      (g) => g.childId === child.id && g.measuredOn >= monthStartIso,
    ).length;
    const milestonesThisMonth = milestones.filter(
      (m) => m.childId === child.id && m.achievedOn >= monthStartIso,
    ).length;
    return { vaccinesDue, vaccinesOverdue, growthThisMonth, milestonesThisMonth };
  }, [child, vaccinations, growthEntries, milestones]);

  if (!child) {
    return <Redirect href="/onboarding/welcome" />;
  }

  const greeting = t(`home.greeting.${greetingSlot()}`);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ChildHeader
          name={child.name}
          greeting={greeting}
          ageLabel={childAgeLabel}
          photoUri={child.photoUri}
          hasMultipleChildren={children.length > 1}
          onSwitchChild={() => router.push('/switch-child')}
          onBellPress={() => router.push('/notifications')}
        />

        <View style={styles.cards}>
          <MonthDigestCard digest={monthDigest} />
          <NextVaccineCard nextDue={nextDue} lang={lang} />
          <GrowthCard latest={latestGrowth} lang={lang} />
          <MilestonesCard reachedCount={milestonesForChild.length} nextMilestone={nextMilestone} />
          <PdfCtaCard />
        </View>
      </ScrollView>
      <Tutorial visible={!tutorialSeen} onFinish={markTutorialSeen} />
    </SafeAreaView>
  );

  function MonthDigestCard({
    digest,
  }: {
    digest: {
      vaccinesDue: number;
      vaccinesOverdue: number;
      growthThisMonth: number;
      milestonesThisMonth: number;
    };
  }) {
    const lines: Array<{ key: string; text: string; tone: 'ink' | 'error' }> = [];
    if (digest.vaccinesOverdue > 0) {
      lines.push({
        key: 'overdue',
        text: t('home.monthDigest.vaccinesOverdue', { count: digest.vaccinesOverdue }),
        tone: 'error',
      });
    }
    if (digest.vaccinesDue > 0) {
      lines.push({
        key: 'due',
        text: t('home.monthDigest.vaccinesDue', { count: digest.vaccinesDue }),
        tone: 'ink',
      });
    }
    if (digest.growthThisMonth > 0) {
      lines.push({
        key: 'growth',
        text: t('home.monthDigest.growthThisMonth', { count: digest.growthThisMonth }),
        tone: 'ink',
      });
    }
    if (digest.milestonesThisMonth > 0) {
      lines.push({
        key: 'milestones',
        text: t('home.monthDigest.milestonesThisMonth', { count: digest.milestonesThisMonth }),
        tone: 'ink',
      });
    }
    return (
      <Card style={styles.digestCard}>
        <Text style={[styles.digestEyebrow, { fontFamily: font(typography.eyebrow.weight) }]}>
          {t('home.monthDigest.title')}
        </Text>
        {lines.length === 0 ? (
          <Text style={[styles.digestAllCaughtUp, { fontFamily: font(700) }]}>
            {t('home.monthDigest.allCaughtUp')}
          </Text>
        ) : (
          <View style={styles.digestLines}>
            {lines.map((l) => (
              <View key={l.key} style={styles.digestLine}>
                <View
                  style={[
                    styles.digestDot,
                    { backgroundColor: l.tone === 'error' ? colors.error : colors.teal },
                  ]}
                />
                <Text
                  style={[
                    styles.digestText,
                    { fontFamily: font(700), color: l.tone === 'error' ? colors.error : colors.ink },
                  ]}>
                  {l.text}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  }

  function NextVaccineCard({
    nextDue,
    lang,
  }: {
    nextDue: ReturnType<typeof nextDueVaccine>;
    lang: SupportedLanguage;
  }) {
    if (!nextDue) {
      return (
        <Card>
          <Text style={[styles.cardLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
            {t('home.nextVaccine.label')}
          </Text>
          <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
            {t('home.nextVaccine.empty')}
          </Text>
        </Card>
      );
    }

    const { vaccine, dose, dueDate, status, daysFromNow } = nextDue;
    const tone = pillToneFor(status);
    const statusLabel = t(
      status === 'overdue'
        ? 'home.nextVaccine.statusOverdue'
        : status === 'due-soon'
          ? 'home.nextVaccine.statusDueSoon'
          : 'home.nextVaccine.statusUpcoming',
    );
    const vaccineName = vaccine.displayName[lang] ?? vaccine.displayName.en;
    const dueText =
      status === 'overdue'
        ? t('home.nextVaccine.overdueDays', { count: Math.abs(daysFromNow) })
        : daysFromNow === 0
          ? t('home.nextVaccine.dueToday')
          : t('home.nextVaccine.dueInDays', { count: daysFromNow });

    return (
      <Card>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
            {t('home.nextVaccine.label')}
          </Text>
          <Pill label={statusLabel} tone={tone} />
        </View>
        <Text style={[styles.vaccineName, { fontFamily: font(typography.h2.weight) }]}>
          {vaccineName}
        </Text>
        <Text style={[styles.cardMeta, { fontFamily: font(typography.body.weight) }]}>
          {t('home.nextVaccine.doseLabel', { number: dose.doseNumber, total: vaccine.doses.length })} ·{' '}
          {formatDate(dueDate, lang)}
        </Text>
        <Text
          style={[
            styles.cardDue,
            { fontFamily: font(typography.body.weight), color: tonePalette(tone).fg },
          ]}>
          {dueText}
        </Text>
        <View style={styles.cardActions}>
          <Button
            label={t('home.nextVaccine.viewSchedule')}
            variant="ghost"
            size="sm"
            onPress={() => router.push('/vaccines')}
          />
          <Button
            label={t('home.nextVaccine.markDone')}
            variant="primary"
            size="sm"
            onPress={() =>
              router.push({
                pathname: '/vaccine/mark-done',
                params: { code: vaccine.code, dose: String(dose.doseNumber) },
              })
            }
          />
        </View>
      </Card>
    );
  }

  function GrowthCard({
    latest,
    lang,
  }: {
    latest: ReturnType<typeof useMemo<typeof latestGrowth>> | null;
    lang: SupportedLanguage;
  }) {
    return (
      <Card>
        <Text style={[styles.cardLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
          {t('home.growth.label')}
        </Text>
        {latest ? (
          <>
            <Text style={[styles.cardValue, { fontFamily: font(typography.h2.weight) }]}>
              {summarizeGrowth(latest, t)}
            </Text>
            <Text style={[styles.cardMeta, { fontFamily: font(typography.body.weight) }]}>
              {t('home.growth.label')
                ? t('home.growthOn', { date: formatDate(new Date(latest.measuredOn), lang) })
                : ''}
            </Text>
          </>
        ) : (
          <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
            {t('home.growth.empty')}
          </Text>
        )}
        <View style={[styles.cardActions, { marginTop: spacing.sm }]}>
          <Button
            label={latest ? t('home.nextVaccine.viewSchedule') : t('home.growth.addCta')}
            variant="ghost"
            size="sm"
            onPress={() => router.push(latest ? '/growth' : '/growth/add')}
          />
        </View>
      </Card>
    );
  }

  function MilestonesCard({
    reachedCount,
    nextMilestone: next,
  }: {
    reachedCount: number;
    nextMilestone: MilestoneDefinition | null;
  }) {
    const total = STANDARD_MILESTONES.length;
    const pct = total === 0 ? 0 : Math.round((reachedCount / total) * 100);

    const nextAgeLabel = next
      ? next.recommendedAgeMonths < 12
        ? t('milestones.ageMonths', { count: next.recommendedAgeMonths })
        : next.recommendedAgeMonths % 12 === 0
          ? t('milestones.ageYears', { count: next.recommendedAgeMonths / 12 })
          : `${t('milestones.ageYears', { count: Math.floor(next.recommendedAgeMonths / 12) })} ${t('milestones.ageMonths', { count: next.recommendedAgeMonths % 12 })}`
      : null;

    const nextName = next
      ? (next.displayName[lang] ?? next.displayName.en)
      : null;

    return (
      <Card>
        <Text style={[styles.cardLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
          {t('home.milestones.label')}
        </Text>
        {reachedCount > 0 ? (
          <>
            <Text style={[styles.cardValue, { fontFamily: font(typography.h2.weight) }]}>
              {t('home.milestonesProgress', { done: reachedCount, total })}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
          </>
        ) : (
          <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
            {t('home.milestones.empty')}
          </Text>
        )}
        {next && nextName && nextAgeLabel ? (
          <Text style={[styles.nextMilestone, { fontFamily: font(typography.caption.weight) }]}>
            {t('home.milestones.nextUp')}: {nextName} ({nextAgeLabel})
          </Text>
        ) : null}
        <View style={[styles.cardActions, { marginTop: spacing.sm }]}>
          <Button
            label={t('home.milestones.viewAll')}
            variant="ghost"
            size="sm"
            onPress={() => router.push('/milestones')}
          />
        </View>
      </Card>
    );
  }

  function PdfCtaCard() {
    return (
      <View style={styles.pdfCard}>
        <View style={styles.pdfText}>
          <View style={styles.pdfIcon}>
            <Ionicons name="document-text-outline" size={22} color={colors.amberDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pdfTitle, { fontFamily: font(typography.h2.weight) }]}>
              {t('home.pdf.title')}
            </Text>
            <Text style={[styles.pdfDescription, { fontFamily: font(typography.body.weight) }]}>
              {t('home.pdf.description')}
            </Text>
          </View>
        </View>
        <Button
          label={t('home.pdf.cta')}
          variant="amber"
          size="md"
          onPress={handleExportPdf}
        />
      </View>
    );
  }
}

function summarizeGrowth(
  entry: { weightKg?: number; heightCm?: number; headCircumferenceCm?: number },
  t: (k: string, opts?: Record<string, unknown>) => string,
): string {
  const parts: string[] = [];
  if (entry.weightKg != null) parts.push(`${entry.weightKg} ${t('growth.kg')}`);
  if (entry.heightCm != null) parts.push(`${entry.heightCm} ${t('growth.cm')}`);
  if (entry.headCircumferenceCm != null && parts.length < 2) {
    parts.push(`${entry.headCircumferenceCm} ${t('growth.cm')}`);
  }
  return parts.join(' · ');
}

function greetingSlot(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h < 5) return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 22) return 'evening';
  return 'night';
}

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function pillToneFor(status: DueStatus): PillTone {
  switch (status) {
    case 'overdue':
      return 'error';
    case 'due-soon':
      return 'warning';
    case 'upcoming':
    case 'far-future':
    default:
      return 'success';
  }
}

function tonePalette(tone: PillTone) {
  switch (tone) {
    case 'error':
      return { fg: colors.error };
    case 'warning':
      return { fg: colors.warning };
    case 'success':
      return { fg: colors.success };
    case 'amber':
      return { fg: colors.amberDark };
    case 'ghost':
      return { fg: colors.ink2 };
    case 'neutral':
    default:
      return { fg: colors.tealDark };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  cards: { gap: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  cardValue: {
    fontSize: typography.h2.fontSize,
    color: colors.ink,
    marginTop: 2,
    marginBottom: 2,
  },
  vaccineName: {
    fontSize: typography.h2.fontSize,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    marginBottom: spacing.sm,
  },
  cardDue: {
    fontSize: typography.body.fontSize,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  empty: {
    fontSize: typography.body.fontSize,
    color: colors.ink3,
    marginTop: spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border2,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 999,
  },
  nextMilestone: {
    marginTop: spacing.sm,
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
  },
  digestCard: {
    backgroundColor: colors.tealSoft,
    borderColor: colors.tealLine,
    padding: spacing.lg,
  },
  digestEyebrow: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.tealDark,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
    marginBottom: spacing.sm,
  },
  digestAllCaughtUp: {
    fontSize: typography.body.fontSize,
    color: colors.tealDark,
  },
  digestLines: { gap: spacing.xs },
  digestLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  digestDot: { width: 6, height: 6, borderRadius: 3 },
  digestText: { fontSize: typography.body.fontSize, flex: 1 },
  pdfCard: {
    backgroundColor: colors.amberSoft,
    borderColor: colors.amber,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pdfText: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  pdfIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfTitle: {
    fontSize: typography.h2.fontSize,
    color: colors.ink,
    marginBottom: 2,
  },
  pdfDescription: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
  },
});
