import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import type { SupportedLanguage } from '../../src/i18n';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function GrowthScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const children = useChildrenStore((s) => s.children);
  const growthEntries = useChildrenStore((s) => s.growthEntries);
  const removeGrowthEntry = useChildrenStore((s) => s.removeGrowthEntry);
  const child = children[0];

  const entries = useMemo(() => {
    if (!child) return [];
    return growthEntries
      .filter((g) => g.childId === child.id)
      .sort((a, b) => b.measuredOn.localeCompare(a.measuredOn));
  }, [child, growthEntries]);

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
            {entries.map((entry) => (
              <Card key={entry.id} style={{ padding: spacing.lg }}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.date, { fontFamily: font(typography.h2.weight) }]}>
                    {formatDate(new Date(entry.measuredOn), lang)}
                  </Text>
                  <Pressable hitSlop={8} onPress={() => handleDelete(entry.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.ink3} />
                  </Pressable>
                </View>
                <View style={styles.metrics}>
                  {entry.weightKg != null && (
                    <Metric
                      label={t('growth.weightLabel')}
                      value={`${entry.weightKg} ${t('growth.kg')}`}
                      font={font}
                    />
                  )}
                  {entry.heightCm != null && (
                    <Metric
                      label={t('growth.heightLabel')}
                      value={`${entry.heightCm} ${t('growth.cm')}`}
                      font={font}
                    />
                  )}
                  {entry.headCircumferenceCm != null && (
                    <Metric
                      label={t('growth.headLabel')}
                      value={`${entry.headCircumferenceCm} ${t('growth.cm')}`}
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

function Metric({ label, value, font }: { label: string; value: string; font: (w: 400 | 500 | 600 | 700 | 800) => string }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, { fontFamily: font(700) }]}>{value}</Text>
    </View>
  );
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
