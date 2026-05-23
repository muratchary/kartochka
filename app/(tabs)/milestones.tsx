import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../src/components/Card';
import { Celebration } from '../../src/components/Celebration';
import type { SupportedLanguage } from '../../src/i18n';
import { STANDARD_MILESTONES, groupMilestonesByAge } from '../../src/lib/milestones';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function MilestonesScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const child = useChildrenStore(selectActiveChild);
  const milestoneRecords = useChildrenStore((s) => s.milestones);
  const addMilestone = useChildrenStore((s) => s.addMilestone);
  const removeMilestone = useChildrenStore((s) => s.removeMilestone);
  const updateMilestonePhoto = useChildrenStore((s) => s.updateMilestonePhoto);

  const [celebrate, setCelebrate] = useState(false);

  const groups = useMemo(() => groupMilestonesByAge(), []);

  // Find which age group is "current" for the child
  const currentGroupAge = useMemo(() => {
    if (!child) return null;
    const ageMonths =
      (Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
    // The last group whose age <= child's age + 1 month buffer
    const match = [...groups].reverse().find((g) => g.ageMonths <= ageMonths + 1);
    return match?.ageMonths ?? groups[0].ageMonths;
  }, [child, groups]);

  const reachedForChild = useMemo(
    () => (child ? milestoneRecords.filter((m) => m.childId === child.id) : []),
    [child, milestoneRecords],
  );
  const totalCount = STANDARD_MILESTONES.length;
  const reachedCount = reachedForChild.length;
  const pct = totalCount === 0 ? 0 : Math.round((reachedCount / totalCount) * 100);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  const recordsByCode = new Map(
    milestoneRecords
      .filter((m) => m.childId === child.id)
      .map((m) => [m.milestoneCode, m]),
  );

  const handleToggle = (code: string) => {
    const existing = recordsByCode.get(code);
    if (existing) {
      Alert.alert(t('milestones.unmarkConfirm'), '', [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('milestones.unmark'),
          style: 'destructive',
          onPress: () => removeMilestone(existing.id),
        },
      ]);
      return;
    }
    addMilestone({
      childId: child.id,
      milestoneCode: code,
      achievedOn: new Date().toISOString().slice(0, 10),
    });
    setCelebrate(true);
  };

  const handlePhotoPress = (recordId: string, existingUri?: string) => {
    const options = existingUri
      ? [t('vaccines.markDone.changePhoto'), t('vaccines.markDone.removePhoto'), t('common.cancel')]
      : [t('vaccines.markDone.addPhoto'), t('common.cancel')];

    Alert.alert('', '', options.map((label, index) => ({
      text: label,
      style: index === options.length - 1 ? 'cancel' : 'default',
      onPress: async () => {
        if (label === t('vaccines.markDone.removePhoto')) {
          updateMilestonePhoto(recordId, null);
          return;
        }
        if (label === t('vaccines.markDone.addPhoto') || label === t('vaccines.markDone.changePhoto')) {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            updateMilestonePhoto(recordId, result.assets[0].uri);
          }
        }
      },
    })));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('milestones.title')}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: font(typography.body.weight) }]}>
          {t('milestones.subtitle')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.progressCard}>
          <Text style={[styles.progressEyebrow, { fontFamily: font(typography.eyebrow.weight) }]}>
            {t('milestones.progressTitle')}
          </Text>
          <Text style={[styles.progressValue, { fontFamily: font(typography.h2.weight) }]}>
            {t('milestones.progressSummary', { done: reachedCount, total: totalCount })}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </Card>

        {groups.map((group) => {
          const isCurrentGroup = group.ageMonths === currentGroupAge;
          return (
          <View key={group.ageMonths} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={[styles.groupTitle, { fontFamily: font(typography.eyebrow.weight) }]}>
                {ageLabel(group.ageMonths, t)}
              </Text>
              {isCurrentGroup && (
                <View style={styles.nowBadge}>
                  <Text style={[styles.nowBadgeText, { fontFamily: font(700) }]}>
                    {t('milestones.nowBadge')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.items}>
              {group.milestones.map((m) => {
                const record = recordsByCode.get(m.code);
                const checked = !!record;
                const description = m.description?.[lang] ?? m.description?.en;
                return (
                  <Pressable
                    key={m.code}
                    onPress={() => handleToggle(m.code)}
                    style={[styles.item, checked && styles.itemChecked]}>
                    <Ionicons
                      name={checked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={checked ? colors.success : colors.ink3}
                      style={styles.itemIcon}
                    />
                    <View style={styles.itemText}>
                      <View style={styles.itemHeaderRow}>
                        <Text
                          style={[
                            styles.itemName,
                            { fontFamily: font(checked ? 700 : 600) },
                            checked && styles.itemNameChecked,
                          ]}>
                          {m.displayName[lang] ?? m.displayName.en}
                        </Text>
                        <View style={styles.categoryPill}>
                          <Text style={[styles.categoryPillText, { fontFamily: font(700) }]}>
                            {t(`milestones.categories.${m.category}`)}
                          </Text>
                        </View>
                      </View>
                      {description ? (
                        <Text style={[styles.itemDescription, { fontFamily: font(600) }]}>
                          {description}
                        </Text>
                      ) : null}
                      {record ? (
                        <View style={styles.itemBottomRow}>
                          <Text style={[styles.itemDate, { fontFamily: font(700) }]}>
                            {t('milestones.markedOn', { date: formatDate(new Date(record.achievedOn), lang) })}
                          </Text>
                          <Pressable
                            hitSlop={8}
                            onPress={(e) => { e.stopPropagation(); handlePhotoPress(record.id, record.photoUri); }}>
                            {record.photoUri ? (
                              <Image source={{ uri: record.photoUri }} style={styles.photoThumb} />
                            ) : (
                              <Ionicons name="camera-outline" size={16} color={colors.ink3} />
                            )}
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
          );
        })}
      </ScrollView>

      <Celebration
        visible={celebrate}
        title={t('milestones.celebrationTitle')}
        body={t('milestones.celebrationBody', { name: child.name })}
        onClose={() => setCelebrate(false)}
      />
    </SafeAreaView>
  );
}

function ageLabel(months: number, t: (k: string, opts?: Record<string, unknown>) => string): string {
  if (months >= 12 && months % 12 === 0) {
    return t('milestones.ageYears', { count: months / 12 });
  }
  return t('milestones.ageMonths', { count: months });
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  progressCard: {
    backgroundColor: colors.tealSoft,
    borderColor: colors.tealLine,
    padding: spacing.lg,
  },
  progressEyebrow: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.tealDark,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
    marginBottom: spacing.xs,
  },
  progressValue: {
    fontSize: typography.h2.fontSize,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 999,
  },
  group: { gap: spacing.sm },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nowBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.amber,
  },
  nowBadgeText: {
    fontSize: 10,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupTitle: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  items: { gap: spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  itemIcon: { marginTop: 2 },
  itemChecked: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  itemText: { flex: 1, gap: 4 },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  itemName: { fontSize: 14, color: colors.ink, flex: 1 },
  itemNameChecked: { color: colors.ink },
  categoryPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.tealSoft,
  },
  categoryPillText: {
    fontSize: 10,
    color: colors.tealDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemDescription: {
    fontSize: 12,
    color: colors.ink2,
    lineHeight: 17,
  },
  itemDate: { fontSize: 11, color: colors.success, fontWeight: '700' as const, marginTop: 2 },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  photoThumb: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
  },
});
