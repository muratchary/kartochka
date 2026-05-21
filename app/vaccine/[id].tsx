import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Pill, type PillTone } from '../../src/components/Pill';
import type { SupportedLanguage } from '../../src/i18n';
import { getSchedule } from '../../src/lib/schedules';
import { useRescheduleReminders } from '../../src/lib/useReminders';
import { dueDateForDose, statusFromDays } from '../../src/lib/vaccinationStatus';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function VaccineDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const children = useChildrenStore((s) => s.children);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const removeVaccination = useChildrenStore((s) => s.removeVaccination);
  const rescheduleReminders = useRescheduleReminders();
  const child = children[0];

  const parsed = useMemo(() => {
    if (!id) return null;
    const [code, doseStr] = id.split('_');
    const doseNumber = parseInt(doseStr, 10);
    if (!code || !Number.isFinite(doseNumber)) return null;
    return { code, doseNumber };
  }, [id]);

  type Status = 'done' | 'overdue' | 'due-soon' | 'upcoming' | 'far-future';
  const data = useMemo(() => {
    if (!child || !parsed) return null;
    const schedule = getSchedule(child.countryCode);
    if (!schedule) return null;
    const vaccine = schedule.vaccines.find((v) => v.code === parsed.code);
    if (!vaccine) return null;
    const dose = vaccine.doses.find((d) => d.doseNumber === parsed.doseNumber);
    if (!dose) return null;
    const record = vaccinations.find(
      (r) => r.childId === child.id && r.vaccineCode === parsed.code && r.doseNumber === parsed.doseNumber,
    );
    const dueDate = dueDateForDose(child.dateOfBirth, dose.recommendedAgeMonths);
    const now = Date.now();
    const daysFromNow = Math.round((dueDate.getTime() - now) / (1000 * 60 * 60 * 24));
    const status: Status = record ? 'done' : statusFromDays(daysFromNow);
    return { vaccine, dose, record, dueDate, status, daysFromNow };
  }, [child, parsed, vaccinations]);

  if (!child) return <Redirect href="/onboarding/welcome" />;
  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.notFound, { fontFamily: font(600) }]}>
          {t('vaccines.empty')}
        </Text>
      </SafeAreaView>
    );
  }

  const { vaccine, dose, record, dueDate, status } = data;
  const vaccineName = vaccine.displayName[lang] ?? vaccine.displayName.en;
  const description = vaccine.description?.[lang] ?? vaccine.description?.en ?? null;

  const handleUnmark = () => {
    if (!record) return;
    Alert.alert(t('vaccines.detail.unMarkDone'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          removeVaccination(record.id);
          await rescheduleReminders(child);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroIcon}>
          <Ionicons name="medkit" size={28} color={colors.teal} />
        </View>
        <Pill label={t(statusLabelKey(status))} tone={toneFor(status)} />
        <Text style={[styles.name, { fontFamily: font(typography.display.weight) }]}>
          {vaccineName}
        </Text>
        <Text style={[styles.subname, { fontFamily: font(typography.body.weight) }]}>
          {t('vaccines.detail.doseLabel', {
            number: dose.doseNumber,
            total: vaccine.doses.length,
          })}
        </Text>

        {description ? (
          <Card style={styles.descCard}>
            <Text
              style={[
                styles.eyebrow,
                { fontFamily: font(typography.eyebrow.weight) },
              ]}>
              {t('vaccines.detail.protectsAgainst')}
            </Text>
            <Text style={[styles.bodyText, { fontFamily: font(typography.body.weight) }]}>
              {description}
            </Text>
          </Card>
        ) : null}

        <Card style={styles.descCard}>
          <Text
            style={[
              styles.eyebrow,
              { fontFamily: font(typography.eyebrow.weight) },
            ]}>
            {t('vaccines.detail.scheduleSection')}
          </Text>
          {record ? (
            <View style={{ gap: 4 }}>
              <Text style={[styles.bodyText, { fontFamily: font(700) }]}>
                {t('vaccines.detail.given', { date: formatDate(new Date(record.administeredOn), lang) })}
              </Text>
              {record.locationOfAdministration ? (
                <Text style={[styles.bodyMeta, { fontFamily: font(600) }]}>
                  {t('vaccines.detail.givenAt', { location: record.locationOfAdministration })}
                </Text>
              ) : null}
              {record.batchNumber ? (
                <Text style={[styles.bodyMeta, { fontFamily: font(600) }]}>
                  {t('vaccines.detail.givenBatch', { batch: record.batchNumber })}
                </Text>
              ) : null}
              {record.notes ? (
                <Text style={[styles.bodyMeta, { fontFamily: font(600), marginTop: spacing.sm }]}>
                  {record.notes}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.bodyText, { fontFamily: font(typography.body.weight) }]}>
              {t('vaccines.detail.scheduledFor', { date: formatDate(dueDate, lang) })}
            </Text>
          )}
        </Card>

        {!record ? (
          <Card style={[styles.descCard, styles.reassureCard]}>
            <Text style={[styles.bodyText, { fontFamily: font(typography.body.weight) }]}>
              {t('vaccines.detail.postVaccinationCard')}
            </Text>
          </Card>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {record ? (
          <Button
            label={t('vaccines.detail.unMarkDone')}
            variant="ghost"
            size="lg"
            full
            onPress={handleUnmark}
          />
        ) : (
          <Button
            label={t('vaccines.detail.markDone')}
            variant="amber"
            size="lg"
            full
            onPress={() =>
              router.push({
                pathname: '/vaccine/mark-done',
                params: { code: vaccine.code, dose: String(dose.doseNumber) },
              })
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function statusLabelKey(status: 'done' | 'overdue' | 'due-soon' | 'upcoming' | 'far-future'): string {
  if (status === 'done') return 'vaccines.filters.done';
  if (status === 'overdue') return 'home.nextVaccine.statusOverdue';
  if (status === 'due-soon') return 'home.nextVaccine.statusDueSoon';
  return 'home.nextVaccine.statusUpcoming';
}

function toneFor(status: 'done' | 'overdue' | 'due-soon' | 'upcoming' | 'far-future'): PillTone {
  if (status === 'done') return 'success';
  if (status === 'overdue') return 'error';
  if (status === 'due-soon') return 'warning';
  return 'neutral';
}

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topRow: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.display.fontSize,
    letterSpacing: typography.display.letterSpacing,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  subname: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    marginBottom: spacing.md,
  },
  descCard: { padding: spacing.lg },
  reassureCard: { backgroundColor: colors.tealSoft, borderColor: colors.tealLine },
  eyebrow: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
    lineHeight: 22,
  },
  bodyMeta: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
  },
  notFound: {
    flex: 1,
    textAlign: 'center',
    marginTop: spacing.xxxl,
    color: colors.ink3,
  },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
});
