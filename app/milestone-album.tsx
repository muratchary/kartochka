/**
 * Milestone Photo Album
 * Shows all milestones that have a photo, arranged in age-grouped chapters.
 * Tapping a photo opens a full-screen swipeable viewer with share options.
 * Header has a "Then · Now" pill when ≥2 photos exist.
 * Each chapter has a "Share this chapter" button.
 */
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import type { SupportedLanguage } from '../src/i18n';
import { STANDARD_MILESTONES } from '../src/lib/milestones';
import { selectActiveChild, useChildrenStore } from '../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';
import type { MilestoneRecord } from '../src/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMB_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3;

// ─── Age period helpers ────────────────────────────────────────────────────────

interface AgePeriod {
  key: string;
  minMonths: number;
  maxMonths: number; // exclusive
}

const AGE_PERIODS: AgePeriod[] = [
  { key: 'period0', minMonths: 0, maxMonths: 3 },
  { key: 'period3', minMonths: 3, maxMonths: 6 },
  { key: 'period6', minMonths: 6, maxMonths: 9 },
  { key: 'period9', minMonths: 9, maxMonths: 12 },
  { key: 'period12', minMonths: 12, maxMonths: 18 },
  { key: 'period18', minMonths: 18, maxMonths: 24 },
  { key: 'period24', minMonths: 24, maxMonths: Infinity },
];

function ageMonthsFromDates(achievedOn: string, dateOfBirth: string): number {
  try {
    const ms = new Date(achievedOn).getTime() - new Date(dateOfBirth).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24 * 30.4375)));
  } catch {
    return 0;
  }
}

interface Chapter {
  periodKey: string;
  label: string;
  items: MilestoneRecord[];
}

function buildChapters(
  withPhotos: MilestoneRecord[],
  dateOfBirth: string,
  t: (k: string) => string,
): Chapter[] {
  const chapters: Chapter[] = [];
  for (const period of AGE_PERIODS) {
    const items = withPhotos.filter((m) => {
      const months = ageMonthsFromDates(m.achievedOn, dateOfBirth);
      return months >= period.minMonths && months < period.maxMonths;
    });
    if (items.length === 0) continue;
    chapters.push({
      periodKey: period.key,
      label: t(`milestoneAlbum.${period.key}`),
      items,
    });
  }
  return chapters;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MilestoneAlbumScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const child = useChildrenStore(selectActiveChild);
  const milestones = useChildrenStore((s) => s.milestones);
  const updateMilestonePhoto = useChildrenStore((s) => s.updateMilestonePhoto);

  // Full-screen viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const viewerRef = useRef<FlatList>(null);

  // Then-vs-Now modal
  const [thenNowOpen, setThenNowOpen] = useState(false);
  const thenNowRef = useRef<View>(null);

  // Chapter share modal
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterModalData, setChapterModalData] = useState<Chapter | null>(null);
  const chapterCardRef = useRef<View>(null);

  // Off-screen branded card for save/share
  const brandedCardRef = useRef<View>(null);

  const defMap = new Map(STANDARD_MILESTONES.map((m) => [m.code, m]));

  // All milestones for this child, sorted by achieved date
  const childMilestones = milestones
    .filter((m) => m.childId === child?.id)
    .sort((a, b) => a.achievedOn.localeCompare(b.achievedOn));

  const withPhotos = childMilestones.filter((m) => m.photoUri);
  const withoutPhotos = childMilestones.filter((m) => !m.photoUri);

  const chapters = child ? buildChapters(withPhotos, child.dateOfBirth, t) : [];

  const handleAddPhoto = async (milestoneId: string) => {
    try {
      // Uses the Android system photo picker / iOS picker — no media-library
      // permission required.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        updateMilestonePhoto(milestoneId, result.assets[0].uri);
      }
    } catch {
      // ignore
    }
  };

  const openViewer = (globalIndex: number) => {
    setViewerIndex(globalIndex);
    setViewerOpen(true);
    setTimeout(() => {
      viewerRef.current?.scrollToIndex({ index: globalIndex, animated: false });
    }, 50);
  };

  const handleSharePhoto = async () => {
    if (!brandedCardRef.current) return;
    try {
      const uri = await captureRef(brandedCardRef, { format: 'jpg', quality: 0.92 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(uri);
    } catch {
      // ignore
    }
  };

  const handleShareThenNow = async () => {
    try {
      if (!thenNowRef.current) return;
      const uri = await captureRef(thenNowRef, { format: 'jpg', quality: 0.92 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(uri);
    } catch {
      // ignore
    }
  };

  const handleShareChapter = async () => {
    try {
      if (!chapterCardRef.current) return;
      const uri = await captureRef(chapterCardRef, { format: 'jpg', quality: 0.92 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(uri);
    } catch {
      // ignore
    }
  };

  const openChapterModal = (chapter: Chapter) => {
    setChapterModalData(chapter);
    setChapterModalOpen(true);
  };

  const formatDate = (iso: string) => {
    try {
      const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en';
      return new Date(iso).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const getAgeLabel = (iso: string) => {
    if (!child) return '';
    try {
      const ageMs = new Date(iso).getTime() - new Date(child.dateOfBirth).getTime();
      const ageMonths = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 30.4375));
      if (ageMonths < 12) {
        return t('milestones.ageMonths', { count: ageMonths });
      }
      const years = Math.floor(ageMonths / 12);
      const rem = ageMonths % 12;
      if (rem === 0) return t('milestones.ageYears', { count: years });
      return `${t('milestones.ageYears', { count: years })} ${t('milestones.ageMonths', { count: rem })}`;
    } catch {
      return '';
    }
  };

  const getMilestoneName = (m: MilestoneRecord): string => {
    const def = defMap.get(m.milestoneCode);
    return def?.displayName[lang] ?? def?.displayName.en ?? m.milestoneCode;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setViewerIndex(viewableItems[0].index);
    }
  }).current;

  if (!child) return null;

  const oldest = withPhotos[0];
  const newest = withPhotos[withPhotos.length - 1];

  // Derived values for the off-screen branded card (tracks viewerIndex)
  const currentViewerM = withPhotos[viewerIndex] ?? null;
  const currentViewerDef = currentViewerM ? defMap.get(currentViewerM.milestoneCode) : null;
  const currentViewerName = currentViewerDef?.displayName[lang] ?? currentViewerDef?.displayName.en ?? currentViewerM?.milestoneCode ?? '';
  const rawCurrentCaption = currentViewerM ? t(`milestoneAlbum.captions.${currentViewerM.milestoneCode}`) : '';
  const captionFallbackKey = `milestoneAlbum.captions.${currentViewerM?.milestoneCode}`;
  const currentViewerCaption = rawCurrentCaption === captionFallbackKey
    ? t(`milestoneAlbum.captions.${currentViewerDef?.category ?? 'social'}`)
    : rawCurrentCaption;
  const currentViewerAge = currentViewerM ? getAgeLabel(currentViewerM.achievedOn) : '';
  const currentViewerDate = currentViewerM ? formatDate(currentViewerM.achievedOn) : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('milestoneAlbum.title', { name: child.name })}
        </Text>
        {withPhotos.length >= 2 ? (
          <Pressable style={styles.thenNowPill} onPress={() => setThenNowOpen(true)}>
            <Text style={[styles.thenNowPillText, { fontFamily: font(600) }]}>
              {t('milestoneAlbum.thenNow')}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {withPhotos.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="images-outline" size={48} color={colors.ink3} />
            <Text style={[styles.emptyText, { fontFamily: font(typography.body.weight) }]}>
              {t('milestoneAlbum.noPhotos')}
            </Text>
            <Text style={[styles.emptyHint, { fontFamily: font(typography.caption.weight) }]}>
              {t('milestoneAlbum.noPhotosHint')}
            </Text>
          </View>
        ) : (
          chapters.map((chapter) => {
            const chapterStartIndex = withPhotos.findIndex((m) => m.id === chapter.items[0].id);
            return (
              <View key={chapter.periodKey} style={styles.chapterBlock}>
                {/* Chapter header */}
                <View style={styles.chapterHeader}>
                  <Text style={[styles.sectionLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
                    {chapter.label}
                  </Text>
                  <Text style={[styles.chapterCount, { fontFamily: font(400) }]}>
                    {chapter.items.length}
                  </Text>
                </View>

                {/* Photo grid */}
                <View style={styles.grid}>
                  {chapter.items.map((m, localIdx) => {
                    const globalIndex = chapterStartIndex + localIdx;
                    const name = getMilestoneName(m);
                    return (
                      <Pressable
                        key={m.id}
                        style={styles.thumb}
                        onPress={() => openViewer(globalIndex)}>
                        <Image source={{ uri: m.photoUri! }} style={styles.thumbImage} />
                        <View style={styles.thumbOverlay}>
                          <Text
                            style={[styles.thumbLabel, { fontFamily: font(600) }]}
                            numberOfLines={2}>
                            {name}
                          </Text>
                          <Text style={[styles.thumbAge, { fontFamily: font(400) }]}>
                            {getAgeLabel(m.achievedOn)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Share chapter row */}
                <Pressable style={styles.shareChapterRow} onPress={() => openChapterModal(chapter)}>
                  <Ionicons name="share-social-outline" size={18} color={colors.teal} />
                  <Text style={[styles.shareChapterText, { fontFamily: font(600) }]}>
                    {t('milestoneAlbum.shareChapter')}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}

        {/* "Missing photos" section */}
        {withoutPhotos.length > 0 && (
          <View style={styles.missingSection}>
            <Text style={[styles.sectionLabel, { fontFamily: font(typography.eyebrow.weight) }]}>
              {t('milestoneAlbum.missingSection')}
            </Text>
            {withoutPhotos.map((m) => {
              const name = getMilestoneName(m);
              return (
                <Pressable
                  key={m.id}
                  style={styles.missingRow}
                  onPress={() => handleAddPhoto(m.id)}>
                  <View style={styles.missingIconBox}>
                    <Ionicons name="camera-outline" size={18} color={colors.ink3} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.missingName, { fontFamily: font(600) }]}>
                      {name}
                    </Text>
                    <Text style={[styles.missingDate, { fontFamily: font(400) }]}>
                      {formatDate(m.achievedOn)}
                    </Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={colors.teal} />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Full-screen swipeable photo viewer ── */}
      <Modal visible={viewerOpen} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.viewerBg}>
          {/*
           * FlatList is in normal flow (flex: 1) so it doesn't create an
           * all-screen touch sink. Each slide is SCREEN_HEIGHT tall so photos
           * fill the screen visually even though the FlatList isn't absolute.
           */}
          <FlatList
            ref={viewerRef}
            data={withPhotos}
            keyExtractor={(m) => m.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerIndex}
            style={{ flex: 1 }}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            renderItem={({ item: m }) => {
              const milestoneName = getMilestoneName(m);
              const def = defMap.get(m.milestoneCode);
              const ageLabel = getAgeLabel(m.achievedOn);
              const dateLabel = formatDate(m.achievedOn);
              const captionKey = `milestoneAlbum.captions.${m.milestoneCode}`;
              const categoryKey = `milestoneAlbum.captions.${def?.category ?? 'social'}`;
              const rawCaption = t(captionKey);
              const caption = rawCaption === captionKey ? t(categoryKey) : rawCaption;
              return (
                <View style={styles.viewerSlide}>
                  <Image
                    source={{ uri: m.photoUri! }}
                    style={styles.viewerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.captionCard}>
                    <Text style={[styles.captionQuote, { fontFamily: font(500) }]} numberOfLines={2}>
                      {caption}
                    </Text>
                    <Text style={[styles.captionName, { fontFamily: font(700) }]} numberOfLines={1}>
                      {milestoneName}
                    </Text>
                    <View style={styles.captionMeta}>
                      <View style={styles.captionAgePill}>
                        <Text style={[styles.captionAge, { fontFamily: font(600) }]}>
                          {ageLabel}
                        </Text>
                      </View>
                      <Text style={[styles.captionDate, { fontFamily: font(400) }]}>
                        {dateLabel}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />

          {/*
           * Controls overlay — pointerEvents="box-none" means:
           * the overlay VIEW itself never captures touches (swipe gestures
           * fall through to the FlatList), but its children (Pressable buttons)
           * still receive taps normally. This is the only reliable way to
           * have overlaid controls above a full-screen scroll view in RN.
           */}
          <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'box-none' }]}>
            {/* Top bar */}
            <SafeAreaView edges={['top']} style={styles.viewerTopBar}>
              <Pressable onPress={() => setViewerOpen(false)} hitSlop={16} style={styles.viewerClose}>
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
              {withPhotos.length > 1 && (
                <Text style={[styles.viewerCounter, { fontFamily: font(600) }]}>
                  {viewerIndex + 1} / {withPhotos.length}
                </Text>
              )}
              <View style={{ width: 44 }} />
            </SafeAreaView>

            {/* Transparent middle — touches pass through to FlatList */}
            <View style={{ flex: 1 }} />

            {/* Bottom actions */}
            <SafeAreaView edges={['bottom']} style={styles.viewerActions}>
              {withPhotos[viewerIndex] && (
                <>
                  <Pressable
                    style={styles.viewerActionBtn}
                    onPress={handleSharePhoto}>
                    <Ionicons name="share-outline" size={22} color="#fff" />
                    <Text style={[styles.viewerActionLabel, { fontFamily: font(600) }]}>
                      {t('milestoneAlbum.share')}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.viewerActionBtn}
                    onPress={() => {
                      // Capture id before closing — state may change during dismiss
                      const id = withPhotos[viewerIndex].id;
                      setViewerOpen(false);
                      // Wait for iOS modal dismiss animation to finish before
                      // presenting ImagePicker, otherwise it is silently dropped
                      setTimeout(() => handleAddPhoto(id), 400);
                    }}>
                    <Ionicons name="camera-outline" size={22} color="#fff" />
                    <Text style={[styles.viewerActionLabel, { fontFamily: font(600) }]}>
                      {t('milestoneAlbum.replace')}
                    </Text>
                  </Pressable>
                </>
              )}
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      {/* ── Then vs. Now modal ── */}
      {oldest && newest && (
        <Modal visible={thenNowOpen} transparent animationType="fade" statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalInner}>
              {/* The shareable card */}
              <View ref={thenNowRef} style={styles.thenNowCard} collapsable={false}>
                <View style={styles.thenNowRow}>
                  {/* Then */}
                  <View style={styles.thenNowCell}>
                    <Image source={{ uri: oldest.photoUri! }} style={styles.thenNowImage} />
                    <Text style={[styles.thenNowLabel, { fontFamily: font(700) }]}>
                      {t('milestoneAlbum.thenLabel')}
                    </Text>
                    <Text style={[styles.thenNowMilestoneName, { fontFamily: font(600) }]} numberOfLines={2}>
                      {getMilestoneName(oldest)}
                    </Text>
                    <Text style={[styles.thenNowAge, { fontFamily: font(400) }]}>
                      {getAgeLabel(oldest.achievedOn)}
                    </Text>
                  </View>
                  {/* Now */}
                  <View style={styles.thenNowCell}>
                    <Image source={{ uri: newest.photoUri! }} style={styles.thenNowImage} />
                    <Text style={[styles.thenNowLabel, { fontFamily: font(700) }]}>
                      {t('milestoneAlbum.nowLabel')}
                    </Text>
                    <Text style={[styles.thenNowMilestoneName, { fontFamily: font(600) }]} numberOfLines={2}>
                      {getMilestoneName(newest)}
                    </Text>
                    <Text style={[styles.thenNowAge, { fontFamily: font(400) }]}>
                      {getAgeLabel(newest.achievedOn)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.thenNowFooter, { fontFamily: font(600) }]}>
                  {child.name} · Kartochka
                </Text>
              </View>

              {/* Actions */}
              <Pressable style={styles.modalShareBtn} onPress={handleShareThenNow}>
                <Ionicons name="share-social-outline" size={20} color="#fff" />
                <Text style={[styles.modalShareBtnText, { fontFamily: font(700) }]}>
                  {t('milestoneAlbum.share')}
                </Text>
              </Pressable>
              <Pressable style={styles.modalCloseBtn} onPress={() => setThenNowOpen(false)}>
                <Ionicons name="close" size={20} color={colors.ink2} />
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Off-screen branded card for save/share ── */}
      {viewerOpen && currentViewerM && (
        <View
          ref={brandedCardRef}
          style={styles.brandedCard}
          collapsable={false}>
          <Image
            source={{ uri: currentViewerM.photoUri! }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.brandedOverlay}>
            <Text style={[styles.brandedQuote, { fontFamily: font(500) }]} numberOfLines={2}>
              {currentViewerCaption}
            </Text>
            <View style={styles.brandedBottom}>
              <Text style={[styles.brandedName, { fontFamily: font(700) }]} numberOfLines={1}>
                {currentViewerName}
              </Text>
              <View style={styles.brandedMetaRow}>
                <View style={styles.brandedAgePill}>
                  <Text style={[styles.brandedAge, { fontFamily: font(600) }]}>
                    {currentViewerAge}
                  </Text>
                </View>
                <Text style={[styles.brandedDate, { fontFamily: font(400) }]}>
                  {currentViewerDate}
                </Text>
                <View style={styles.brandedWatermarkWrap}>
                  <Text style={[styles.brandedWatermark, { fontFamily: font(800) }]}>
                    Kartochka
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ── Chapter share modal ── */}
      {chapterModalData && (
        <Modal visible={chapterModalOpen} transparent animationType="fade" statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalInner}>
              {/* The shareable card */}
              <View ref={chapterCardRef} style={styles.chapterCard} collapsable={false}>
                <Text style={[styles.chapterCardTitle, { fontFamily: font(800) }]}>
                  {chapterModalData.label}
                </Text>
                <Text style={[styles.chapterCardName, { fontFamily: font(600) }]}>
                  {t('milestoneAlbum.chapterTitle', { name: child.name, period: chapterModalData.label })}
                </Text>
                {/* 2×2 grid of up to 4 photos */}
                <View style={styles.chapterCardGrid}>
                  {chapterModalData.items.slice(0, 4).map((m) => (
                    <Image key={m.id} source={{ uri: m.photoUri! }} style={styles.chapterCardThumb} />
                  ))}
                </View>
                <Text style={[styles.chapterCardWatermark, { fontFamily: font(700) }]}>
                  Kartochka
                </Text>
              </View>

              {/* Actions */}
              <Pressable style={styles.modalShareBtn} onPress={handleShareChapter}>
                <Ionicons name="share-social-outline" size={20} color="#fff" />
                <Text style={[styles.modalShareBtnText, { fontFamily: font(700) }]}>
                  {t('milestoneAlbum.shareChapter')}
                </Text>
              </Pressable>
              <Pressable style={styles.modalCloseBtn} onPress={() => setChapterModalOpen(false)}>
                <Ionicons name="close" size={20} color={colors.ink2} />
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const THEN_NOW_IMG = (SCREEN_WIDTH - spacing.lg * 4 - spacing.md) / 2;
const CHAPTER_THUMB = (SCREEN_WIDTH - spacing.lg * 4 - spacing.sm) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  thenNowPill: {
    backgroundColor: colors.teal + '22',
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.teal + '55',
  },
  thenNowPillText: {
    fontSize: 11,
    color: colors.teal,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
    textAlign: 'center',
  },
  // Chapter
  chapterBlock: {
    marginTop: spacing.lg,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  chapterCount: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
    padding: 6,
  },
  thumbLabel: {
    fontSize: 10,
    color: '#fff',
    lineHeight: 13,
  },
  thumbAge: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  shareChapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  shareChapterText: {
    fontSize: typography.body.fontSize,
    color: colors.teal,
  },
  // Missing section
  missingSection: {
    marginTop: spacing.lg,
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  missingIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingName: {
    fontSize: typography.body.fontSize,
    color: colors.ink,
  },
  missingDate: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
    marginTop: 2,
  },

  // ── Full-screen viewer ──
  viewerBg: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  viewerClose: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCounter: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  viewerSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  viewerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  captionCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 96,
    gap: spacing.xs + 2,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  captionQuote: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  captionName: {
    fontSize: 17,
    color: '#fff',
    lineHeight: 22,
  },
  captionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  captionAgePill: {
    backgroundColor: colors.teal,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  captionAge: {
    fontSize: 11,
    color: '#fff',
  },
  captionDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  viewerActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  viewerActionBtn: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  viewerActionLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },

  // ── Shared modal styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalInner: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.teal,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  modalShareBtnText: {
    fontSize: typography.body.fontSize,
    color: '#fff',
  },
  modalCloseBtn: {
    padding: spacing.sm,
  },

  // ── Then vs. Now card ──
  thenNowCard: {
    backgroundColor: '#fff',
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '100%',
    gap: spacing.md,
  },
  thenNowRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thenNowCell: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  thenNowImage: {
    width: THEN_NOW_IMG,
    height: THEN_NOW_IMG,
    borderRadius: radii.md,
  },
  thenNowLabel: {
    fontSize: 13,
    color: colors.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thenNowMilestoneName: {
    fontSize: 13,
    color: colors.ink,
    textAlign: 'center',
  },
  thenNowAge: {
    fontSize: 11,
    color: colors.ink3,
  },
  thenNowFooter: {
    fontSize: 12,
    color: colors.ink2,
    textAlign: 'center',
  },

  // ── Chapter share card ──
  chapterCard: {
    backgroundColor: '#fff',
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  chapterCardTitle: {
    fontSize: 20,
    color: colors.ink,
  },
  chapterCardName: {
    fontSize: 13,
    color: colors.ink2,
  },
  chapterCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  chapterCardThumb: {
    width: CHAPTER_THUMB,
    height: CHAPTER_THUMB,
    borderRadius: radii.md,
  },
  chapterCardWatermark: {
    fontSize: 12,
    color: colors.ink3,
    letterSpacing: 0.5,
  },

  // ── Off-screen branded share card ──
  // Positioned above the visible viewport so it's rendered but invisible
  brandedCard: {
    position: 'absolute',
    top: -(SCREEN_WIDTH + 100),
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH, // square 1:1 for universal sharing
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  brandedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  brandedBottom: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  brandedQuote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  brandedName: {
    fontSize: 18,
    color: '#fff',
  },
  brandedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  brandedAgePill: {
    backgroundColor: colors.teal,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  brandedAge: {
    fontSize: 11,
    color: '#fff',
  },
  brandedDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
  brandedWatermarkWrap: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  brandedWatermark: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },
});
