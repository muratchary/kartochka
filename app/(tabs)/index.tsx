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
import type { SupportedLanguage } from '../../src/i18n';
import { getSchedule } from '../../src/lib/schedules';
import { nextDueVaccine, type DueStatus } from '../../src/lib/vaccinationStatus';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const children = useChildrenStore((s) => s.children);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const growthEntries = useChildrenStore((s) => s.growthEntries);
  const milestones = useChildrenStore((s) => s.milestones);

  const child = children[0];

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

  if (!child) {
    return <Redirect href="/onboarding/welcome" />;
  }

  const greeting = t(`home.greeting.${greetingSlot()}`);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ChildHeader name={child.name} greeting={greeting} />

        <View style={styles.cards}>
          <NextVaccineCard nextDue={nextDue} lang={lang} />
          <GrowthCard hasData={!!latestGrowth} />
          <MilestonesCard count={milestonesForChild.length} />
          <PdfCtaCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function NextVaccineCard({ nextDue, lang }: { nextDue: ReturnType<typeof nextDueVaccine>; lang: SupportedLanguage }) {
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
        <Text style={[styles.cardDue, { fontFamily: font(typography.body.weight), color: tonePalette(tone).fg }]}>
          {dueText}
        </Text>
        <View style={styles.cardActions}>
          <Button
            label={t('home.nextVaccine.details')}
            variant="ghost"
            size="sm"
            onPress={() =>
              router.push({
                pathname: '/vaccine/[id]',
                params: { id: `${vaccine.code}_${dose.doseNumber}` },
              })
            }
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

  function GrowthCard({ hasData }: { hasData: boolean }) {
    return (
      <Card>
        <Text style={[styles.cardLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
          {t('home.growth.label')}
        </Text>
        {hasData ? (
          <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
            {t('home.growth.label')}
          </Text>
        ) : (
          <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
            {t('home.growth.empty')}
          </Text>
        )}
      </Card>
    );
  }

  function MilestonesCard({ count }: { count: number }) {
    return (
      <Card>
        <Text style={[styles.cardLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
          {t('home.milestones.label')}
        </Text>
        <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
          {count > 0 ? `${count}` : t('home.milestones.empty')}
        </Text>
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
          onPress={() => Alert.alert(t('home.pdf.title'), t('home.pdf.comingSoon'))}
        />
      </View>
    );
  }
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
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : 'en';
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
