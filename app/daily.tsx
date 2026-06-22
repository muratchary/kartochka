import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SupportedLanguage } from '../src/i18n';
import { selectActiveChild, useChildrenStore } from '../src/stores/childrenStore';
import { formatChildAge } from '../src/lib/childAge';
import type { CareLog, DiaperType, FeedType } from '../src/types';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

const localeFor = (lang: SupportedLanguage): string =>
  lang === 'ru' ? 'ru-RU' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr-TR' : 'en-US';

const isToday = (iso: string): boolean => {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
};

export default function DailyScreen() {
  const { t, i18n } = useTranslation();
  const font = useFont();
  const router = useRouter();
  const lang = (i18n.language || 'en') as SupportedLanguage;
  const locale = localeFor(lang);

  const child = useChildrenStore(selectActiveChild);
  const careLogs = useChildrenStore((s) => s.careLogs);
  const addCareLog = useChildrenStore((s) => s.addCareLog);
  const updateCareLog = useChildrenStore((s) => s.updateCareLog);
  const removeCareLog = useChildrenStore((s) => s.removeCareLog);

  const [modal, setModal] = useState<'feed' | 'diaper' | null>(null);
  const [feedType, setFeedType] = useState<FeedType>('breast');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const childLogs = useMemo(
    () =>
      child
        ? careLogs
            .filter((l) => l.childId === child.id)
            .sort((a, b) => b.startAt.localeCompare(a.startAt))
        : [],
    [child, careLogs],
  );
  const todayLogs = useMemo(() => childLogs.filter((l) => isToday(l.startAt)), [childLogs]);
  const activeSleep = useMemo(
    () => childLogs.find((l) => l.type === 'sleep' && !l.endAt),
    [childLogs],
  );
  const lastOf = (type: CareLog['type']) => childLogs.find((l) => l.type === type);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  // ── helpers ────────────────────────────────────────────────────────────────
  const timeStr = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  const agoStr = (iso: string) => {
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return t('care.justNow');
    if (min < 60) return t('care.agoMin', { n: min });
    return t('care.agoHr', { n: Math.floor(min / 60) });
  };

  const durStr = (startAt: string, endAt: string) => {
    const min = Math.max(0, Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000));
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${t('care.durH', { n: h })} ${t('care.durM', { n: m })}` : t('care.durM', { n: m });
  };

  const entryLabel = (l: CareLog): string => {
    if (l.type === 'feed') {
      if (l.feedType === 'bottle')
        return l.amountMl
          ? `${t('care.bottle')} · ${l.amountMl} ${t('care.ml')}`
          : t('care.bottle');
      return l.feedType === 'solids' ? t('care.solids') : t('care.breast');
    }
    if (l.type === 'sleep') {
      return l.endAt
        ? `${t('care.sleep')} · ${durStr(l.startAt, l.endAt)}`
        : `${t('care.sleep')} · ${t('care.inProgress')}`;
    }
    return `${t('care.diaper')} · ${t(`care.${l.diaperType ?? 'wet'}`)}`;
  };

  const entryIcon = (type: CareLog['type']) =>
    type === 'feed' ? 'cafe-outline' : type === 'sleep' ? 'moon-outline' : 'water-outline';

  // ── actions ──────────────────────────────────────────────────────────────
  const toggleSleep = () => {
    if (activeSleep) {
      updateCareLog(activeSleep.id, { endAt: new Date().toISOString() });
    } else {
      addCareLog({ childId: child.id, type: 'sleep', startAt: new Date().toISOString() });
    }
  };

  const openFeed = () => {
    setFeedType('breast');
    setAmount('');
    setNote('');
    setModal('feed');
  };

  const saveFeed = () => {
    addCareLog({
      childId: child.id,
      type: 'feed',
      startAt: new Date().toISOString(),
      feedType,
      amountMl: feedType === 'bottle' && amount ? Number(amount) : undefined,
      note: note.trim() || undefined,
    });
    setModal(null);
  };

  const saveDiaper = (diaperType: DiaperType) => {
    addCareLog({ childId: child.id, type: 'diaper', startAt: new Date().toISOString(), diaperType });
    setModal(null);
  };

  const confirmDelete = (id: string) =>
    Alert.alert(t('care.deleteConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeCareLog(id) },
    ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons
            name={I18nManager.isRTL ? 'chevron-forward' : 'chevron-back'}
            size={26}
            color={colors.ink}
          />
        </Pressable>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('care.title')}
        </Text>
        <Text style={[styles.age, { fontFamily: font(500) }]}>
          {child.name} · {formatChildAge(child.dateOfBirth, t)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Active sleep banner */}
        {activeSleep && (
          <View style={styles.sleepBanner}>
            <Ionicons name="moon" size={18} color={colors.teal} />
            <Text style={[styles.sleepBannerText, { fontFamily: font(600) }]}>
              {t('care.sleepingSince', { time: timeStr(activeSleep.startAt) })}
            </Text>
            <Pressable style={styles.wakeBtn} onPress={toggleSleep}>
              <Text style={[styles.wakeBtnText, { fontFamily: font(700) }]}>{t('care.wake')}</Text>
            </Pressable>
          </View>
        )}

        {/* Quick-add */}
        <View style={styles.quickRow}>
          <QuickBtn icon="cafe-outline" label={t('care.feed')} onPress={openFeed} font={font} />
          <QuickBtn
            icon="moon-outline"
            label={activeSleep ? t('care.wake') : t('care.sleep')}
            active={!!activeSleep}
            onPress={toggleSleep}
            font={font}
          />
          <QuickBtn icon="water-outline" label={t('care.diaper')} onPress={() => setModal('diaper')} font={font} />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <SummaryRow label={t('care.summaryFeed')} value={lastOf('feed') ? agoStr(lastOf('feed')!.startAt) : t('care.none')} font={font} />
          <SummaryRow label={t('care.summarySleep')} value={activeSleep ? t('care.inProgress') : lastOf('sleep') ? agoStr(lastOf('sleep')!.endAt ?? lastOf('sleep')!.startAt) : t('care.none')} font={font} />
          <SummaryRow label={t('care.summaryDiaper')} value={lastOf('diaper') ? agoStr(lastOf('diaper')!.startAt) : t('care.none')} font={font} last />
        </View>

        {/* Today's timeline */}
        <Text style={[styles.eyebrow, { fontFamily: font(typography.eyebrow.weight) }]}>
          {t('care.today')}
        </Text>
        {todayLogs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={40} color={colors.ink3} />
            <Text style={[styles.emptyText, { fontFamily: font(500) }]}>{t('care.emptyToday')}</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {todayLogs.map((l, i) => (
              <Pressable
                key={l.id}
                onLongPress={() => confirmDelete(l.id)}
                style={[styles.row, i !== todayLogs.length - 1 && styles.rowDivider]}>
                <View style={styles.rowIcon}>
                  <Ionicons name={entryIcon(l.type)} size={18} color={colors.teal} />
                </View>
                <Text style={[styles.rowLabel, { fontFamily: font(600) }]}>{entryLabel(l)}</Text>
                <Text style={[styles.rowTime, { fontFamily: font(500) }]}>{timeStr(l.startAt)}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Text style={[styles.hint, { fontFamily: font(500) }]}>{t('care.longPressHint')}</Text>
      </ScrollView>

      {/* Feed modal */}
      <Modal visible={modal === 'feed'} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <Pressable style={styles.backdrop} onPress={() => setModal(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { fontFamily: font(800) }]}>{t('care.feed')}</Text>
            <View style={styles.chipRow}>
              {(['breast', 'bottle', 'solids'] as FeedType[]).map((ft) => (
                <Pressable
                  key={ft}
                  onPress={() => setFeedType(ft)}
                  style={[styles.chip, feedType === ft && styles.chipActive]}>
                  <Text style={[styles.chipText, { fontFamily: font(600) }, feedType === ft && styles.chipTextActive]}>
                    {t(`care.${ft}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
            {feedType === 'bottle' && (
              <TextInput
                style={[styles.input, { fontFamily: font(600) }]}
                value={amount}
                onChangeText={setAmount}
                placeholder={t('care.amountMl')}
                placeholderTextColor={colors.ink3}
                keyboardType="number-pad"
              />
            )}
            <TextInput
              style={[styles.input, { fontFamily: font(600) }]}
              value={note}
              onChangeText={setNote}
              placeholder={t('care.notePlaceholder')}
              placeholderTextColor={colors.ink3}
            />
            <Pressable style={styles.saveBtn} onPress={saveFeed}>
              <Text style={[styles.saveBtnText, { fontFamily: font(700) }]}>{t('common.save')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Diaper modal */}
      <Modal visible={modal === 'diaper'} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <Pressable style={styles.backdrop} onPress={() => setModal(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { fontFamily: font(800) }]}>{t('care.diaper')}</Text>
            <View style={styles.chipRow}>
              {(['wet', 'dirty', 'both'] as DiaperType[]).map((dt) => (
                <Pressable key={dt} onPress={() => saveDiaper(dt)} style={styles.bigChip}>
                  <Text style={[styles.chipText, { fontFamily: font(700) }]}>{t(`care.${dt}`)}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function QuickBtn({
  icon,
  label,
  onPress,
  active,
  font,
}: {
  icon: ComponentIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
  font: (w: 400 | 500 | 600 | 700 | 800) => string;
}) {
  return (
    <Pressable style={[styles.quickBtn, active && styles.quickBtnActive]} onPress={onPress}>
      <Ionicons name={icon} size={26} color={active ? colors.surface : colors.teal} />
      <Text style={[styles.quickLabel, { fontFamily: font(700) }, active && { color: colors.surface }]}>
        {label}
      </Text>
    </Pressable>
  );
}

type ComponentIcon = ComponentProps<typeof Ionicons>['name'];

function SummaryRow({
  label,
  value,
  last,
  font,
}: {
  label: string;
  value: string;
  last?: boolean;
  font: (w: 400 | 500 | 600 | 700 | 800) => string;
}) {
  return (
    <View style={[styles.summaryRow, !last && styles.summaryRowDivider]}>
      <Text style={[styles.summaryLabel, { fontFamily: font(500) }]}>{label}</Text>
      <Text style={[styles.summaryValue, { fontFamily: font(700) }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  backBtn: { marginStart: -spacing.xs, marginBottom: spacing.xs, alignSelf: 'flex-start' },
  title: { fontSize: typography.title.fontSize, letterSpacing: typography.title.letterSpacing, color: colors.ink },
  age: { fontSize: 13, color: colors.ink2, marginTop: 2 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },

  sleepBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.tealSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  sleepBannerText: { flex: 1, fontSize: 14, color: colors.tealDark },
  wakeBtn: { backgroundColor: colors.teal, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs + 2 },
  wakeBtnText: { color: colors.surface, fontSize: 13 },

  quickRow: { flexDirection: 'row', gap: spacing.md },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickBtnActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  quickLabel: { fontSize: 13, color: colors.ink },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  summaryRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border2 },
  summaryLabel: { fontSize: 14, color: colors.ink2 },
  summaryValue: { fontSize: 14, color: colors.ink },

  eyebrow: { fontSize: typography.eyebrow.fontSize, color: colors.ink2, textTransform: 'uppercase', letterSpacing: typography.eyebrow.letterSpacing },
  timeline: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border2 },
  rowIcon: { width: 32, height: 32, borderRadius: radii.md, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: colors.ink },
  rowTime: { fontSize: 13, color: colors.ink3 },

  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyText: { fontSize: 14, color: colors.ink2, textAlign: 'center', paddingHorizontal: spacing.lg, lineHeight: 20 },
  hint: { fontSize: 12, color: colors.ink3, textAlign: 'center' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, padding: spacing.xl, gap: spacing.md },
  sheetTitle: { fontSize: 20, color: colors.ink },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  chipActive: { backgroundColor: colors.tealSoft, borderColor: colors.teal },
  bigChip: { flex: 1, paddingVertical: spacing.lg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.tealLine, backgroundColor: colors.tealSoft, alignItems: 'center' },
  chipText: { fontSize: 14, color: colors.ink2 },
  chipTextActive: { color: colors.tealDark },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.ink,
  },
  saveBtn: { backgroundColor: colors.teal, borderRadius: radii.lg, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.xs },
  saveBtnText: { color: colors.surface, fontSize: 16 },
});
