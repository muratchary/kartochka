import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SupportedLanguage } from '../../src/i18n';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';
import type { DoctorVisit } from '../../src/types';

export default function DoctorVisitsScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const child = useChildrenStore(selectActiveChild);
  const doctorVisits = useChildrenStore((s) => s.doctorVisits);
  const removeDoctorVisit = useChildrenStore((s) => s.removeDoctorVisit);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  const visits = doctorVisits
    .filter((d) => d.childId === child.id)
    .sort((a, b) => b.visitedOn.localeCompare(a.visitedOn));

  const handleDelete = (visit: DoctorVisit) => {
    Alert.alert(t('doctorVisits.deleteConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('doctorVisits.delete'),
        style: 'destructive',
        onPress: () => removeDoctorVisit(visit.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.screenTitle, { fontFamily: font(typography.title.weight) }]}>
          {t('doctorVisits.title')}
        </Text>
        <Pressable
          onPress={() => router.push('/doctor-visits/add')}
          hitSlop={10}
          style={styles.addBtn}>
          <Ionicons name="add" size={26} color={colors.teal} />
        </Pressable>
      </View>

      {visits.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="person-outline" size={48} color={colors.ink3} />
          <Text style={[styles.emptyText, { fontFamily: font(typography.body.weight) }]}>
            {t('doctorVisits.empty')}
          </Text>
          <Pressable style={styles.addCta} onPress={() => router.push('/doctor-visits/add')}>
            <Text style={[styles.addCtaText, { fontFamily: font(700) }]}>
              {t('doctorVisits.addCta')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {visits.map((visit) => (
            <View key={visit.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.visitDate, { fontFamily: font(700) }]}>
                    {formatDate(new Date(visit.visitedOn), lang)}
                  </Text>
                  {(visit.doctorName || visit.clinicName) ? (
                    <Text style={[styles.visitWho, { fontFamily: font(600) }]}>
                      {[visit.doctorName, visit.clinicName].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={() => router.push({ pathname: '/doctor-visits/add', params: { id: visit.id } })}>
                  <Ionicons name="create-outline" size={20} color={colors.ink3} />
                </Pressable>
                <Pressable hitSlop={8} onPress={() => handleDelete(visit)}>
                  <Ionicons name="trash-outline" size={20} color={colors.ink3} />
                </Pressable>
              </View>
              {visit.reason ? (
                <View style={styles.reasonRow}>
                  <Ionicons name="information-circle-outline" size={14} color={colors.ink3} />
                  <Text style={[styles.reasonText, { fontFamily: font(600) }]}>{visit.reason}</Text>
                </View>
              ) : null}
              {visit.notes ? (
                <Text style={[styles.notes, { fontFamily: font(typography.body.weight) }]}>
                  {visit.notes}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
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
    gap: spacing.md,
  },
  empty: {
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
  addCta: {
    backgroundColor: colors.teal,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  addCtaText: {
    fontSize: typography.body.fontSize,
    color: colors.surface,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  visitDate: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
  },
  visitWho: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
    marginTop: 2,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reasonText: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
    flex: 1,
  },
  notes: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
    lineHeight: 22,
  },
});
