import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../src/components/Card';
import { ScreenTitle } from '../src/components/ScreenTitle';
import type { SupportedLanguage } from '../src/i18n';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

interface Item {
  identifier: string;
  vaccineName?: string;
  body: string;
  fireAt: Date | null;
  childId?: string;
  vaccineCode?: string;
  doseNumber?: number;
}

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const [items, setItems] = useState<Item[]>([]);
  const [granted, setGranted] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    let status: Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>;
    try {
      status = await Notifications.getPermissionsAsync();
    } catch {
      // Native module unavailable (e.g. web) — render empty, no crash
      setGranted(false);
      setItems([]);
      return;
    }
    setGranted(status.granted);
    let scheduled: Awaited<ReturnType<typeof Notifications.getAllScheduledNotificationsAsync>>;
    try {
      scheduled = await Notifications.getAllScheduledNotificationsAsync();
    } catch {
      setItems([]);
      return;
    }
    const parsed: Item[] = scheduled.map((n) => {
      const data = (n.content.data ?? {}) as {
        childId?: string;
        vaccineCode?: string;
        doseNumber?: number;
      };
      const trigger = n.trigger as { date?: number | string | Date } | null;
      const rawDate = trigger?.date;
      let fireAt: Date | null = null;
      if (rawDate != null) {
        const d = new Date(rawDate as string | number | Date);
        fireAt = Number.isFinite(d.getTime()) ? d : null;
      }
      return {
        identifier: n.identifier,
        body: n.content.body ?? '',
        fireAt,
        childId: data.childId,
        vaccineCode: data.vaccineCode,
        doseNumber: data.doseNumber,
      };
    });
    parsed.sort((a, b) => {
      if (!a.fireAt) return 1;
      if (!b.fireAt) return -1;
      return a.fireAt.getTime() - b.fireAt.getTime();
    });
    setItems(parsed);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTap = (it: Item) => {
    if (it.vaccineCode && it.doseNumber != null) {
      router.push({
        pathname: '/vaccine/[id]',
        params: { id: `${it.vaccineCode}_${it.doseNumber}` },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <ScreenTitle
          title={t('more.notificationsList.title')}
          subtitle={t('more.notificationsList.subtitle')}
        />

        {granted === false && (
          <Card style={styles.notice}>
            <Text style={[styles.noticeText, { fontFamily: font(typography.body.weight) }]}>
              {t('more.notificationsList.enablePrompt')}
            </Text>
          </Card>
        )}

        {items.length === 0 ? (
          <Text style={[styles.empty, { fontFamily: font(typography.body.weight) }]}>
            {t('more.notificationsList.empty')}
          </Text>
        ) : (
          <View style={styles.list}>
            {items.map((it) => (
              <Pressable key={it.identifier} onPress={() => handleTap(it)}>
                <Card style={{ padding: spacing.lg }}>
                  <View style={styles.row}>
                    <View style={styles.iconWrap}>
                      <Ionicons name="medkit-outline" size={20} color={colors.teal} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.bodyText, { fontFamily: font(700) }]}
                        numberOfLines={2}>
                        {it.body}
                      </Text>
                      {it.fireAt && (
                        <Text style={[styles.meta, { fontFamily: font(600) }]}>
                          {t('more.notificationsList.willFire', {
                            date: formatDateTime(it.fireAt, lang),
                          })}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDateTime(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en';
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topRow: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  notice: { padding: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.warningSoft, borderColor: colors.warning },
  noticeText: { fontSize: typography.body.fontSize, color: colors.ink2 },
  empty: {
    fontSize: typography.body.fontSize,
    color: colors.ink3,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyText: { fontSize: 14, color: colors.ink },
  meta: { fontSize: typography.caption.fontSize, color: colors.ink2, marginTop: 2 },
});
