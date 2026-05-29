import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ChildHeader } from '../../src/components/ChildHeader';
import { Pill, type PillTone } from '../../src/components/Pill';
import { Tutorial } from '../../src/components/Tutorial';
import type { SupportedLanguage } from '../../src/i18n';
import { getTipsForAge } from '../../src/data/monthlyTips';
import { STANDARD_MILESTONES } from '../../src/lib/milestones';
import { exportChildPdf } from '../../src/lib/pdfExport';
import { getSchedule } from '../../src/lib/schedules';
import { usePurchasesStore } from '../../src/stores/purchasesStore';
import {
  dueDateForDose,
  nextDueVaccine,
  statusFromDays,
  type DueStatus,
} from '../../src/lib/vaccinationStatus';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import type { MilestoneDefinition, MilestoneRecord } from '../../src/types';
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
  const doctorVisits = useChildrenStore((s) => s.doctorVisits);
  const isPremium = usePurchasesStore((s) => s.isPremium);

  const updateChild = useChildrenStore((s) => s.updateChild);

  const [birthdayDismissed, setBirthdayDismissed] = useState(false);

  const handleAvatarPress = async () => {
    if (!child) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('', t('common.permissionDenied'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateChild(child.id, { photoUri: result.assets[0].uri });
    }
  };

  const handleExportPdf = async () => {
    if (!child) return;
    if (!isPremium) {
      router.push('/paywall');
      return;
    }
    try {
      // Build base64 photo array for milestone photo gallery page
      const withPhotos = milestonesForChild.filter((m) => !!m.photoUri);
      const milestonePhotos: Array<{ name: string; ageLabel: string; base64: string }> = [];
      for (const m of withPhotos) {
        try {
          const base64 = await FileSystem.readAsStringAsync(m.photoUri!, {
            encoding: 'base64',
          });
          const def = STANDARD_MILESTONES.find((d) => d.code === m.milestoneCode);
          const name = def?.displayName[lang] ?? def?.displayName.en ?? m.milestoneCode;
          const ageLabel = milestoneAgeLabel(m.achievedOn, child.dateOfBirth, t);
          milestonePhotos.push({ name, ageLabel, base64 });
        } catch {
          // skip photos that can't be read (e.g. file deleted from device)
        }
      }
      await exportChildPdf({
        child,
        vaccinations,
        growthEntries,
        milestones,
        lang,
        t,
        isPremium,
        milestonePhotos: milestonePhotos.length > 0 ? milestonePhotos : undefined,
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

  const childAgeMonths = useMemo(() => {
    if (!child) return 0;
    return Math.max(
      0,
      Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375)),
    );
  }, [child]);

  const childTips = useMemo(() => getTipsForAge(childAgeMonths), [childAgeMonths]);

  const nextMilestone = useMemo(() => {
    if (!child) return null;
    const reachedCodes = new Set(milestonesForChild.map((m) => m.milestoneCode));
    const sorted = [...STANDARD_MILESTONES].sort(
      (a, b) => a.recommendedAgeMonths - b.recommendedAgeMonths,
    );
    // Prefer the next *future* unreached milestone (>= child's current age).
    const future = sorted.find(
      (m) => !reachedCodes.has(m.code) && m.recommendedAgeMonths >= childAgeMonths,
    );
    if (future) return future;
    // Fallback: any older unreached milestone the parent hasn't ticked off yet.
    return sorted.find((m) => !reachedCodes.has(m.code)) ?? null;
  }, [child, milestonesForChild, childAgeMonths]);

  const { isBirthday, birthdayAgeYears } = useMemo(() => {
    if (!child) return { isBirthday: false, birthdayAgeYears: 0 };
    const today = new Date();
    const dob = new Date(child.dateOfBirth);
    const sameDay = today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth();
    const years = today.getFullYear() - dob.getFullYear();
    return { isBirthday: sameDay && years > 0, birthdayAgeYears: years };
  }, [child]);

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
          colorSeed={child.id}
          hasMultipleChildren={children.length > 1}
          onSwitchChild={() => router.push('/switch-child')}
          onBellPress={() => router.push('/notifications')}
          onAvatarPress={handleAvatarPress}
        />

        <View style={styles.quickStrips}>
          <Pressable style={[styles.strip, styles.stripTeal]} onPress={() => router.push('/doctor-card')}>
            <Ionicons name="medkit-outline" size={15} color={colors.teal} />
            <Text style={[styles.stripText, { fontFamily: font(600), color: colors.teal }]}>
              {t('home.doctorVisit')}
            </Text>
            <Ionicons name="chevron-forward" size={13} color={colors.teal} style={{ marginStart: 'auto' }} />
          </Pressable>
          <Pressable style={[styles.strip, styles.stripPurple]} onPress={() => router.push('/timeline')}>
            <Ionicons name="time-outline" size={15} color="#8B5CF6" />
            <Text style={[styles.stripText, { fontFamily: font(600), color: '#8B5CF6' }]}>
              {t('timeline.title')}
            </Text>
            <Ionicons name="chevron-forward" size={13} color="#8B5CF6" style={{ marginStart: 'auto' }} />
          </Pressable>
          <Pressable style={[styles.strip, styles.stripRed]} onPress={() => router.push('/emergency-card')}>
            <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
            <Text style={[styles.stripText, { fontFamily: font(600), color: '#DC2626' }]}>
              {t('emergencyCard.title')}
            </Text>
            <Ionicons name="chevron-forward" size={13} color="#DC2626" style={{ marginStart: 'auto' }} />
          </Pressable>
        </View>

        <View style={styles.cards}>
          {isBirthday && !birthdayDismissed && child ? (
            <BirthdayBanner
              name={child.name}
              ageYears={birthdayAgeYears}
              dateOfBirth={child.dateOfBirth}
              onDismiss={() => setBirthdayDismissed(true)}
              font={font}
              milestones={milestonesForChild}
            />
          ) : null}
          <MonthDigestCard digest={monthDigest} />
          <NextVaccineCard nextDue={nextDue} lang={lang} />
          <GrowthCard latest={latestGrowth} lang={lang} />
          <MilestonesCard reachedCount={milestonesForChild.length} nextMilestone={nextMilestone} />
          <DoctorVisitSummaryCard />
          {(child?.allergyNotes || child?.medicationNotes) && <AllergyMedicationCard />}
          {childTips && <MonthlyTipsCard tips={childTips} ageMonths={childAgeMonths} />}
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
    const lines: Array<{ key: string; text: string; tone: 'ink' | 'error' | 'amber'; subtitle?: string }> = [];
    // Soften the overdue alarm for the first 14 days after a child is added.
    // A parent who just added a 14-month-old hasn't had a chance to log past doses,
    // so we say "typically due by now" in amber instead of red "overdue".
    const justAddedMs = 14 * 24 * 60 * 60 * 1000;
    const justAdded = !!child?.createdAt && Date.now() - new Date(child.createdAt).getTime() < justAddedMs;
    if (digest.vaccinesOverdue > 0) {
      lines.push({
        key: 'overdue',
        text: justAdded
          ? t('home.monthDigest.vaccinesTypicallyDue', { count: digest.vaccinesOverdue })
          : t('home.monthDigest.vaccinesOverdue', { count: digest.vaccinesOverdue }),
        tone: justAdded ? 'amber' : 'error',
        subtitle: justAdded ? t('home.monthDigest.vaccinesTypicallyDueHint') : undefined,
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
            {lines.map((l) => {
              const dotColor =
                l.tone === 'error' ? colors.error : l.tone === 'amber' ? colors.amber : colors.teal;
              const textColor =
                l.tone === 'error' ? colors.error : l.tone === 'amber' ? colors.amberDark : colors.ink;
              return (
                <View key={l.key} style={styles.digestLine}>
                  <View style={[styles.digestDot, { backgroundColor: dotColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.digestText, { fontFamily: font(700), color: textColor }]}>
                      {l.text}
                    </Text>
                    {l.subtitle && (
                      <Text
                        style={[
                          styles.digestText,
                          { fontFamily: font(typography.caption.weight), color: colors.ink2, marginTop: 2 },
                        ]}>
                        {l.subtitle}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
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
            label={latest ? t('home.growth.viewCta') : t('home.growth.addCta')}
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

  function MonthlyTipsCard({
    tips,
    ageMonths,
  }: {
    tips: NonNullable<ReturnType<typeof getTipsForAge>>;
    ageMonths: number;
  }) {
    const [tipIndex, setTipIndex] = useState(0);
    const tip = tips.tips[tipIndex];
    const ageLabel =
      ageMonths < 12
        ? t('monthlyTips.ageLabel', { count: ageMonths })
        : t('monthlyTips.ageLabel_years', { count: Math.floor(ageMonths / 12) });

    return (
      <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb-outline" size={16} color={colors.success} />
          <Text style={[styles.tipsEyebrow, { fontFamily: font(typography.eyebrow.weight) }]}>
            {t('monthlyTips.title')} · {ageLabel}
          </Text>
          {tips.tips.length > 1 && (
            <Pressable
              hitSlop={8}
              onPress={() => setTipIndex((tipIndex + 1) % tips.tips.length)}
              style={styles.tipsNext}>
              <Ionicons name="chevron-forward" size={14} color={colors.success} />
            </Pressable>
          )}
        </View>
        <Text style={[styles.tipsText, { fontFamily: font(typography.body.weight) }]}>
          {tip[lang as keyof typeof tip] ?? tip.en}
        </Text>
        {tips.tips.length > 1 && (
          <Text style={[styles.tipsPager, { fontFamily: font(400) }]}>
            {tipIndex + 1} / {tips.tips.length}
          </Text>
        )}
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

  // ── Doctor Visit Summary Card ───────────────────────────────────────────────
  function DoctorVisitSummaryCard() {
    const childVisits = doctorVisits
      .filter((v) => v.childId === child?.id)
      .sort((a, b) => b.visitedOn.localeCompare(a.visitedOn));
    const lastVisit = childVisits[0] ?? null;

    return (
      <Card>
        <Text style={[styles.cardLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
          {t('home.doctorVisits.label')}
        </Text>
        {lastVisit ? (
          <>
            <Text style={[styles.cardValue, { fontFamily: font(typography.h2.weight) }]}>
              {lastVisit.doctorName ?? t('home.doctorVisits.unknownDoctor')}
            </Text>
            <Text style={[styles.cardMeta, { fontFamily: font(typography.body.weight) }]}>
              {formatDate(new Date(lastVisit.visitedOn), lang)}
              {lastVisit.clinicName ? ` · ${lastVisit.clinicName}` : ''}
            </Text>
            {lastVisit.reason ? (
              <Text style={[styles.cardMeta, { fontFamily: font(typography.body.weight) }]}>
                {lastVisit.reason}
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
            {t('home.doctorVisits.empty')}
          </Text>
        )}
        <View style={[styles.cardActions, { marginTop: spacing.sm }]}>
          <Button
            label={t('home.doctorVisits.logCta')}
            variant="ghost"
            size="sm"
            onPress={() => router.push('/doctor-visits/add')}
          />
        </View>
      </Card>
    );
  }

  // ── Allergy & Medication Card ───────────────────────────────────────────────
  function AllergyMedicationCard() {
    if (!child) return null;
    return (
      <Card style={{ borderColor: '#FECACA', borderWidth: 1 }}>
        <View style={styles.allergyHeader}>
          <Ionicons name="warning-outline" size={16} color="#DC2626" />
          <Text style={[styles.cardLabel, { fontFamily: font(typography.eyebrow.weight), color: '#DC2626' }]}>
            {t('home.allergyCard.label')}
          </Text>
        </View>
        {child.allergyNotes ? (
          <View style={styles.allergyRow}>
            <Text style={[styles.allergyRowLabel, { fontFamily: font(700) }]}>
              {t('home.allergyCard.allergies')}
            </Text>
            <Text style={[styles.allergyRowText, { fontFamily: font(600) }]}>
              {child.allergyNotes}
            </Text>
          </View>
        ) : null}
        {child.medicationNotes ? (
          <View style={styles.allergyRow}>
            <Text style={[styles.allergyRowLabel, { fontFamily: font(700) }]}>
              {t('home.allergyCard.medications')}
            </Text>
            <Text style={[styles.allergyRowText, { fontFamily: font(600) }]}>
              {child.medicationNotes}
            </Text>
          </View>
        ) : null}
        <View style={[styles.cardActions, { marginTop: spacing.sm }]}>
          <Button
            label={t('home.allergyCard.editCta')}
            variant="ghost"
            size="sm"
            onPress={() => router.push('/more/medical-profile')}
          />
        </View>
      </Card>
    );
  }

  function BirthdayBanner({
    name,
    ageYears,
    dateOfBirth,
    onDismiss,
    font: f,
    milestones: allMilestones,
  }: {
    name: string;
    ageYears: number;
    dateOfBirth: string;
    onDismiss: () => void;
    font: (w: 400 | 500 | 600 | 700 | 800) => string;
    milestones: MilestoneRecord[];
  }) {
    const [yearReviewOpen, setYearReviewOpen] = useState(false);
    const yearReviewRef = useRef<View>(null);

    // First-year milestones: achieved within 12 months of DoB and have a photo
    const firstYearPhotos = useMemo(() => {
      const dobMs = new Date(dateOfBirth).getTime();
      const cutoff = dobMs + 12 * 30.4375 * 24 * 60 * 60 * 1000;
      return allMilestones.filter(
        (m) => m.photoUri && new Date(m.achievedOn).getTime() <= cutoff,
      );
    }, [allMilestones, dateOfBirth]);

    const handleShareYearReview = async () => {
      try {
        if (!yearReviewRef.current) return;
        const uri = await captureRef(yearReviewRef, { format: 'jpg', quality: 0.92 });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) await Sharing.shareAsync(uri);
      } catch {
        // ignore
      }
    };

    const isFirstBirthday = ageYears === 1;

    return (
      <>
        <View style={styles.birthdayCard}>
          <Text style={styles.birthdayEmoji}>🎂</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.birthdayTitle, { fontFamily: f(800) }]}>
              {t('birthday.title', { name })}
            </Text>
            <Text style={[styles.birthdayBody, { fontFamily: f(600) }]}>
              {t('birthday.body', { name, age: ageYears })}
            </Text>
            {isFirstBirthday && firstYearPhotos.length > 0 && (
              <>
                <Text style={[styles.birthdayGrowthText, { fontFamily: f(600) }]}>
                  {t('milestoneAlbum.lookHowYouveGrown')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.birthdayPhotoStrip}
                  contentContainerStyle={styles.birthdayPhotoStripContent}>
                  {firstYearPhotos.slice(0, 6).map((m) => (
                    <Image
                      key={m.id}
                      source={{ uri: m.photoUri! }}
                      style={styles.birthdayPhotoCircle}
                    />
                  ))}
                </ScrollView>
                <Pressable
                  style={styles.birthdayShareBtn}
                  onPress={() => setYearReviewOpen(true)}>
                  <Ionicons name="share-social-outline" size={15} color={colors.teal} />
                  <Text style={[styles.birthdayShareText, { fontFamily: f(600) }]}>
                    {t('birthday.shareReview')}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
          <Pressable onPress={onDismiss} hitSlop={12} style={styles.birthdayClose}>
            <Ionicons name="close" size={18} color={colors.ink2} />
          </Pressable>
        </View>

        {/* Year in Review modal */}
        <Modal visible={yearReviewOpen} transparent animationType="fade" statusBarTranslucent>
          <View style={styles.yearReviewOverlay}>
            <View style={styles.yearReviewInner}>
              {/* Shareable card */}
              <View ref={yearReviewRef} style={styles.yearReviewCard} collapsable={false}>
                <Text style={[styles.yearReviewCardTitle, { fontFamily: f(800) }]}>
                  {name}
                </Text>
                <Text style={[styles.yearReviewCardSubtitle, { fontFamily: f(600) }]}>
                  {t('milestoneAlbum.yearInReview')} · Kartochka
                </Text>
                <View style={styles.yearReviewGrid}>
                  {firstYearPhotos.slice(0, 9).map((m) => (
                    <Image
                      key={m.id}
                      source={{ uri: m.photoUri! }}
                      style={styles.yearReviewThumb}
                    />
                  ))}
                </View>
              </View>

              <Pressable style={styles.yearReviewShareBtn} onPress={handleShareYearReview}>
                <Ionicons name="share-social-outline" size={20} color="#fff" />
                <Text style={[styles.yearReviewShareBtnText, { fontFamily: f(700) }]}>
                  {t('birthday.shareReview')}
                </Text>
              </Pressable>
              <Pressable style={styles.yearReviewCloseBtn} onPress={() => setYearReviewOpen(false)}>
                <Ionicons name="close" size={20} color={colors.ink2} />
              </Pressable>
            </View>
          </View>
        </Modal>
      </>
    );
  }
}

type TFn = (key: string, opts?: Record<string, unknown>) => string;

function milestoneAgeLabel(achievedOn: string, dateOfBirth: string, t: TFn): string {
  const ms = new Date(achievedOn).getTime() - new Date(dateOfBirth).getTime();
  const totalDays = Math.floor(ms / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30.4375);
  if (months < 1) return t('home.pdf.ageDays', { count: Math.max(totalDays, 0) });
  if (months < 24) return t('home.pdf.ageMonths', { count: months });
  return t('home.pdf.ageYears', { count: Math.floor(months / 12) });
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
  quickStrips: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
  },
  stripTeal: { backgroundColor: colors.tealSoft, borderColor: colors.tealLine },
  stripPurple: { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' },
  stripRed: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  stripText: {
    fontSize: typography.caption.fontSize,
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
  tipsCard: {
    backgroundColor: colors.successSoft,
    borderColor: '#D0E5D8',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipsEyebrow: {
    flex: 1,
    fontSize: typography.eyebrow.fontSize,
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  tipsNext: { padding: 4 },
  tipsText: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
    lineHeight: 22,
  },
  tipsPager: {
    fontSize: 11,
    color: colors.ink3,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  birthdayCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: '#FFF7ED',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  birthdayEmoji: { fontSize: 28 },
  birthdayTitle: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
  },
  birthdayBody: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
    marginTop: 2,
  },
  birthdayGrowthText: {
    fontSize: typography.caption.fontSize,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  birthdayPhotoStrip: {
    marginTop: spacing.sm,
    marginHorizontal: -4,
  },
  birthdayPhotoStripContent: {
    gap: spacing.xs,
    paddingHorizontal: 4,
  },
  birthdayPhotoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  birthdayShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  birthdayShareText: {
    fontSize: typography.caption.fontSize,
    color: colors.teal,
  },
  birthdayClose: {
    padding: 4,
  },
  // Year in Review modal
  yearReviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  yearReviewInner: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  yearReviewCard: {
    backgroundColor: '#fff',
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  yearReviewCardTitle: {
    fontSize: 22,
    color: colors.ink,
  },
  yearReviewCardSubtitle: {
    fontSize: 13,
    color: colors.ink2,
  },
  yearReviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  yearReviewThumb: {
    width: 80,
    height: 80,
    borderRadius: radii.sm,
  },
  yearReviewShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.teal,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  yearReviewShareBtnText: {
    fontSize: typography.body.fontSize,
    color: '#fff',
  },
  yearReviewCloseBtn: {
    padding: spacing.sm,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  allergyRow: {
    marginBottom: spacing.xs,
  },
  allergyRowLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  allergyRowText: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
  },
});
