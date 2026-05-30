import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { Card } from '../../src/components/Card';
import { Celebration } from '../../src/components/Celebration';
import { MilestoneShareCard } from '../../src/components/MilestoneShareCard';
import { PhotoActionSheet } from '../../src/components/PhotoActionSheet';
import type { SupportedLanguage } from '../../src/i18n';
import { STANDARD_MILESTONES, groupMilestonesByAge } from '../../src/lib/milestones';
import type { MilestoneRecord } from '../../src/types';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

interface ShareTarget {
  record: MilestoneRecord;
  milestoneName: string;
  categoryKey: string;
  categoryLabel: string;
  ageMonths: number;
}

export default function MilestonesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const child = useChildrenStore(selectActiveChild);
  const milestoneRecords = useChildrenStore((s) => s.milestones);
  const addMilestone = useChildrenStore((s) => s.addMilestone);
  const removeMilestone = useChildrenStore((s) => s.removeMilestone);
  const updateMilestonePhoto = useChildrenStore((s) => s.updateMilestonePhoto);

  const [celebrate, setCelebrate] = useState(false);
  const [pendingPhotoRecordId, setPendingPhotoRecordId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [sharing, setSharing] = useState(false);

  const cardRef = useRef<View>(null);

  const groups = useMemo(() => groupMilestonesByAge(), []);

  const currentGroupAge = useMemo(() => {
    if (!child) return null;
    const ageMonths =
      (Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
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

  // Child age in months at the time of milestone
  const childAgeMonths = Math.floor(
    (Date.now() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375),
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
    const record = addMilestone({
      childId: child.id,
      milestoneCode: code,
      achievedOn: new Date().toISOString().slice(0, 10),
    });
    setPendingPhotoRecordId(record.id);
    setCelebrate(true);
  };

  const [photoSheet, setPhotoSheet] = useState<{
    recordId: string;
    hasExisting: boolean;
  } | null>(null);

  const handlePhotoPress = (recordId: string, existingUri?: string) => {
    setPhotoSheet({ recordId, hasExisting: !!existingUri });
  };

  const openImagePickerFor = async (recordId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      updateMilestonePhoto(recordId, result.assets[0].uri);
    }
  };

  const handleSharePress = (
    record: MilestoneRecord,
    milestoneName: string,
    categoryKey: string,
    categoryLabel: string,
  ) => {
    setShareTarget({ record, milestoneName, categoryKey, categoryLabel, ageMonths: childAgeMonths });
  };

  const handleShareCapture = async () => {
    if (!cardRef.current || !shareTarget) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('milestones.share.shareButton') });
    } catch {
      // Fallback for Expo Go (native module not available)
      if (shareTarget.record.photoUri) {
        await Sharing.shareAsync(shareTarget.record.photoUri);
      } else {
        Alert.alert(t('milestones.share.shareButton'), t('milestones.share.requiresBuild'));
      }
    } finally {
      setSharing(false);
    }
  };

  // Build share card props
  const shareCardProps = shareTarget ? (() => {
    const ageAtMilestone = Math.floor(
      (new Date(shareTarget.record.achievedOn).getTime() - new Date(child.dateOfBirth).getTime()) /
        (1000 * 60 * 60 * 24 * 30.4375),
    );
    const ageText =
      ageAtMilestone < 12
        ? t('milestones.ageMonths', { count: ageAtMilestone })
        : t('milestones.ageYears', { count: Math.floor(ageAtMilestone / 12) });
    const dateText = formatDate(new Date(shareTarget.record.achievedOn), lang);
    return { ageText, dateText, ageAtMilestone };
  })() : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
            {t('milestones.title')}
          </Text>
          <Pressable
            onPress={() => router.push('/milestone-album')}
            hitSlop={10}
            style={styles.albumBtn}>
            <Ionicons name="images-outline" size={22} color={colors.teal} />
          </Pressable>
        </View>
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
                  const categoryLabel = t(`milestones.categories.${m.category}`);
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
                              {categoryLabel}
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
                              {t('milestones.markedOn', {
                                date: formatDate(new Date(record.achievedOn), lang),
                              })}
                            </Text>
                            <View style={styles.itemActions}>
                              {/* Camera / photo thumb */}
                              <Pressable
                                hitSlop={8}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handlePhotoPress(record.id, record.photoUri);
                                }}>
                                {record.photoUri ? (
                                  <Image source={{ uri: record.photoUri }} style={styles.photoThumb} />
                                ) : (
                                  <Ionicons name="camera-outline" size={18} color={colors.ink3} />
                                )}
                              </Pressable>
                              {/* Share button */}
                              <Pressable
                                hitSlop={8}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleSharePress(
                                    record,
                                    m.displayName[lang] ?? m.displayName.en,
                                    m.category,
                                    categoryLabel,
                                  );
                                }}
                                style={styles.shareBtn}>
                                <Ionicons name="share-outline" size={18} color={colors.teal} />
                              </Pressable>
                            </View>
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

      <PhotoActionSheet
        visible={!!photoSheet}
        onClose={() => setPhotoSheet(null)}
        cancelLabel={t('common.cancel')}
        actions={
          photoSheet?.hasExisting
            ? [
                {
                  key: 'change',
                  label: t('vaccines.markDone.changePhoto'),
                  icon: 'image-outline',
                  onPress: () => photoSheet && openImagePickerFor(photoSheet.recordId),
                },
                {
                  key: 'remove',
                  label: t('vaccines.markDone.removePhoto'),
                  icon: 'trash-outline',
                  destructive: true,
                  onPress: () => photoSheet && updateMilestonePhoto(photoSheet.recordId, null),
                },
              ]
            : [
                {
                  key: 'add',
                  label: t('vaccines.markDone.addPhoto'),
                  icon: 'image-outline',
                  onPress: () => photoSheet && openImagePickerFor(photoSheet.recordId),
                },
              ]
        }
      />

      <Celebration
        visible={celebrate}
        title={t('milestones.celebrationTitle')}
        body={t('milestones.celebrationBody', { name: child.name })}
        onClose={() => {
          setCelebrate(false);
          if (pendingPhotoRecordId) {
            const rid = pendingPhotoRecordId;
            setPendingPhotoRecordId(null);
            // Small delay so the modal fully dismisses before the picker opens
            setTimeout(() => handlePhotoPress(rid), 350);
          }
        }}
      />

      {/* ── Share modal ───────────────────────────────── */}
      <Modal
        visible={!!shareTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setShareTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={[styles.modalTitle, { fontFamily: font(700) }]}>
              {t('milestones.share.modalTitle')}
            </Text>

            {/* Card preview — this is what gets captured */}
            <View style={styles.cardWrapper}>
              <View ref={cardRef} collapsable={false}>
                {shareTarget && shareCardProps && (
                  <MilestoneShareCard
                    milestoneName={shareTarget.milestoneName}
                    categoryKey={shareTarget.categoryKey}
                    categoryLabel={shareTarget.categoryLabel}
                    ageText={shareCardProps.ageText}
                    dateText={shareCardProps.dateText}
                    childName={child.name}
                    photoUri={shareTarget.record.photoUri}
                    childPhotoUri={child.photoUri}
                    reachedLabel={t('milestones.share.reached')}
                  />
                )}
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={handleShareCapture}
                disabled={sharing}>
                {sharing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={18} color="#fff" />
                    <Text style={[styles.actionBtnText, { fontFamily: font(700) }]}>
                      {t('milestones.share.shareButton')}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            <Pressable style={styles.closeBtn} onPress={() => setShareTarget(null)}>
              <Text style={[styles.closeBtnText, { fontFamily: font(700) }]}>
                {t('common.close')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumBtn: {
    padding: 4,
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
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
  itemDate: { fontSize: 11, color: colors.success, flex: 1, marginTop: 2 },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  photoThumb: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
  },
  shareBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Modal ────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.h2.fontSize,
    color: colors.ink,
    letterSpacing: -0.3,
    alignSelf: 'flex-start',
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.pill,
  },
  actionBtnPrimary: {
    backgroundColor: colors.teal,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.teal,
  },
  actionBtnText: {
    fontSize: 15,
    color: '#fff',
  },
  actionBtnTextSecondary: {
    fontSize: 15,
    color: colors.teal,
  },
  closeBtn: {
    paddingVertical: spacing.sm,
  },
  closeBtnText: {
    fontSize: 14,
    color: colors.ink3,
  },
});
