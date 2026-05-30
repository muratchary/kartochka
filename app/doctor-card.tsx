import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChildAvatar } from '../src/components/ChildAvatar';
import { computeWHOPercentile } from '../src/data/whoGrowthStandards';
import type { SupportedLanguage } from '../src/i18n';
import { formatChildAge } from '../src/lib/childAge';
import { getSchedule } from '../src/lib/schedules';
import { nextDueVaccine } from '../src/lib/vaccinationStatus';
import { selectActiveChild, useChildrenStore } from '../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH = 30.4375;

export default function DoctorCardScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const child = useChildrenStore(selectActiveChild);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const growthEntries = useChildrenStore((s) => s.growthEntries);

  const latestGrowth = useMemo(() => {
    if (!child) return null;
    const entries = growthEntries
      .filter((g) => g.childId === child.id)
      .sort((a, b) => b.measuredOn.localeCompare(a.measuredOn));
    return entries[0] ?? null;
  }, [child, growthEntries]);

  const ageLabel = useMemo(
    () => (child ? formatChildAge(child.dateOfBirth, t) : ''),
    [child, t],
  );

  const nextDue = useMemo(() => {
    if (!child) return null;
    const schedule = getSchedule(child.countryCode);
    if (!schedule) return null;
    return nextDueVaccine(child, schedule, vaccinations);
  }, [child, vaccinations]);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  const whoSex: 'boys' | 'girls' | null =
    child.sex === 'male' ? 'boys' : child.sex === 'female' ? 'girls' : null;

  function percentileFor(
    value: number | undefined,
    whoMetric: 'weight' | 'length' | 'headcirc',
  ): number | null {
    if (value == null || !latestGrowth) return null;
    const ageMonths =
      (new Date(latestGrowth.measuredOn).getTime() - new Date(child!.dateOfBirth).getTime()) /
      (MS_PER_DAY * DAYS_PER_MONTH);
    if (whoSex) return computeWHOPercentile(value, ageMonths, whoMetric, whoSex);
    const b = computeWHOPercentile(value, ageMonths, whoMetric, 'boys');
    const g = computeWHOPercentile(value, ageMonths, whoMetric, 'girls');
    return b != null && g != null ? Math.round((b + g) / 2) : null;
  }

  const weightPct = percentileFor(latestGrowth?.weightKg, 'weight');
  const heightPct = percentileFor(latestGrowth?.heightCm, 'length');
  const headPct   = percentileFor(latestGrowth?.headCircumferenceCm, 'headcirc');

  const nextVaccineName = nextDue
    ? (nextDue.vaccine.displayName[lang] ?? nextDue.vaccine.displayName.en)
    : null;
  const nextVaccineDays = nextDue?.daysFromNow ?? null;

  const handleShare = async () => {
    const lines: string[] = [child.name, ageLabel, ''];
    if (latestGrowth) {
      if (latestGrowth.weightKg != null)
        lines.push(`${t('growth.weightLabel')}: ${latestGrowth.weightKg} ${t('growth.kg')}${weightPct != null ? ` · ${t('growth.percentile', { value: weightPct })}` : ''}`);
      if (latestGrowth.heightCm != null)
        lines.push(`${t('growth.heightLabel')}: ${latestGrowth.heightCm} ${t('growth.cm')}${heightPct != null ? ` · ${t('growth.percentile', { value: heightPct })}` : ''}`);
      if (latestGrowth.headCircumferenceCm != null)
        lines.push(`${t('growth.headLabel')}: ${latestGrowth.headCircumferenceCm} ${t('growth.cm')}${headPct != null ? ` · ${t('growth.percentile', { value: headPct })}` : ''}`);
      lines.push('');
    }
    lines.push(
      nextVaccineName
        ? `${t('doctorCard.nextVaccine')}: ${nextVaccineName}${nextVaccineDays != null ? ` (${nextVaccineDays < 0 ? t('home.nextVaccine.statusOverdue') : nextVaccineDays === 0 ? t('home.nextVaccine.dueToday') : t('home.nextVaccine.dueInDays', { count: nextVaccineDays })})` : ''}`
        : t('doctorCard.allUpToDate'),
    );
    lines.push('');
    lines.push(t('doctorCard.preparedWith'));
    await Share.share({ message: lines.join('\n') });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.screenTitle, { fontFamily: font(typography.title.weight) }]}>
          {t('doctorCard.title')}
        </Text>
        <Pressable onPress={handleShare} hitSlop={10} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={colors.teal} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Child identity block */}
        <View style={styles.identity}>
          <ChildAvatar name={child.name} photoUri={child.photoUri} size={80} colorSeed={child.id} />
          <Text style={[styles.childName, { fontFamily: font(800) }]}>{child.name}</Text>
          <Text style={[styles.childAge, { fontFamily: font(typography.body.weight) }]}>
            {ageLabel}
          </Text>
        </View>

        {/* Growth stats */}
        <View style={styles.section}>
          {latestGrowth ? (
            <>
              {latestGrowth.weightKg != null && (
                <StatRow
                  label={t('growth.weightLabel')}
                  value={`${latestGrowth.weightKg} ${t('growth.kg')}`}
                  percentile={weightPct}
                  percentileLabel={weightPct != null ? t('growth.percentile', { value: weightPct }) : null}
                  font={font}
                />
              )}
              {latestGrowth.heightCm != null && (
                <StatRow
                  label={t('growth.heightLabel')}
                  value={`${latestGrowth.heightCm} ${t('growth.cm')}`}
                  percentile={heightPct}
                  percentileLabel={heightPct != null ? t('growth.percentile', { value: heightPct }) : null}
                  font={font}
                />
              )}
              {latestGrowth.headCircumferenceCm != null && (
                <StatRow
                  label={t('growth.headLabel')}
                  value={`${latestGrowth.headCircumferenceCm} ${t('growth.cm')}`}
                  percentile={headPct}
                  percentileLabel={headPct != null ? t('growth.percentile', { value: headPct }) : null}
                  font={font}
                />
              )}
            </>
          ) : (
            <Text style={[styles.noData, { fontFamily: font(typography.body.weight) }]}>
              {t('home.growth.empty')}
            </Text>
          )}
        </View>

        {/* Next vaccine */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
            {t('doctorCard.nextVaccine')}
          </Text>
          {nextDue ? (
            <View style={styles.vaccineRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.vaccineName, { fontFamily: font(700) }]}>
                  {nextVaccineName}
                </Text>
                <Text style={[styles.vaccineDose, { fontFamily: font(600) }]}>
                  {t('vaccines.detail.doseLabel', {
                    number: nextDue.dose.doseNumber,
                    total: nextDue.vaccine.doses.length,
                  })}
                </Text>
              </View>
              <View style={[styles.duePill, { backgroundColor: nextVaccineDays! < 0 ? '#FEE2E2' : colors.tealSoft }]}>
                <Text style={[styles.duePillText, { color: nextVaccineDays! < 0 ? '#DC2626' : colors.teal, fontFamily: font(700) }]}>
                  {nextVaccineDays! < 0
                    ? t('home.nextVaccine.overdueDays', { count: Math.abs(nextVaccineDays!) })
                    : nextVaccineDays === 0
                      ? t('home.nextVaccine.dueToday')
                      : t('home.nextVaccine.dueInDays', { count: nextVaccineDays! })}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.noData, { fontFamily: font(typography.body.weight) }]}>
              {t('doctorCard.allUpToDate')}
            </Text>
          )}
        </View>

        <Text style={[styles.footer, { fontFamily: font(typography.caption.weight) }]}>
          {t('doctorCard.preparedWith')}
        </Text>
      </ScrollView>

      <View style={styles.shareBar}>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color={colors.surface} />
          <Text style={[styles.shareButtonText, { fontFamily: font(700) }]}>
            {t('doctorCard.share')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function StatRow({
  label,
  value,
  percentile,
  percentileLabel,
  font,
}: {
  label: string;
  value: string;
  percentile: number | null;
  percentileLabel: string | null;
  font: (w: 400 | 500 | 600 | 700 | 800) => string;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
        {label}
      </Text>
      <View style={styles.statRight}>
        <Text style={[styles.statValue, { fontFamily: font(700) }]}>{value}</Text>
        {percentileLabel && (
          <View style={styles.pctBadge}>
            <Text style={[styles.pctText, { fontFamily: font(600) }]}>{percentileLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
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
  shareBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screenTitle: {
    flex: 1,
    fontSize: typography.title.fontSize,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: typography.title.letterSpacing,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  childName: {
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  childAge: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
    marginBottom: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border2,
  },
  statLabel: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  statRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statValue: {
    fontSize: 18,
    color: colors.ink,
  },
  pctBadge: {
    backgroundColor: colors.tealSoft,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pctText: {
    fontSize: 11,
    color: colors.teal,
  },
  noData: {
    fontSize: typography.body.fontSize,
    color: colors.ink3,
  },
  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vaccineName: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
  },
  vaccineDose: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
    marginTop: 2,
  },
  duePill: {
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  duePillText: {
    fontSize: 12,
  },
  footer: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  shareBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.teal,
    borderRadius: radii.lg,
    paddingVertical: spacing.md + 2,
  },
  shareButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.surface,
  },
});
