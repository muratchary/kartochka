import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { getSchedule } from '../../src/lib/schedules';
import { ensureNotificationPermission, scheduleVaccineReminders } from '../../src/lib/notifications';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function NotificationsSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const children = useChildrenStore((s) => s.children);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const child = children[0];

  const [granted, setGranted] = useState<boolean | null>(null);

  const refresh = async () => {
    const status = await Notifications.getPermissionsAsync();
    setGranted(status.granted);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleEnable = async () => {
    const ok = await ensureNotificationPermission();
    setGranted(ok);
    if (!ok) {
      Alert.alert('', t('more.notificationsScreen.openSettings'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.continue'), onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    if (child) {
      const schedule = getSchedule(child.countryCode);
      if (schedule) {
        await scheduleVaccineReminders(
          child,
          schedule,
          vaccinations,
          (name, n, total) =>
            t('vaccines.notification.body', { vaccine: name, number: n, total }),
          t('vaccines.notification.title'),
        );
      }
    }
  };

  const handleReschedule = async () => {
    if (!child) return;
    const schedule = getSchedule(child.countryCode);
    if (!schedule) return;
    await scheduleVaccineReminders(
      child,
      schedule,
      vaccinations,
      (name, n, total) =>
        t('vaccines.notification.body', { vaccine: name, number: n, total }),
      t('vaccines.notification.title'),
    );
    Alert.alert(t('more.notificationsScreen.title'), '', [{ text: t('more.ok') }]);
  };

  const stateLabel = granted
    ? t('more.notificationsScreen.stateOn')
    : t('more.notificationsScreen.stateOff');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <ScreenTitle
          title={t('more.notificationsScreen.title')}
          subtitle={t('more.notificationsScreen.subtitle')}
        />

        <Card style={{ padding: spacing.lg }}>
          <Text
            style={[
              styles.eyebrow,
              { fontFamily: font(typography.eyebrow.weight) },
            ]}>
            {t('more.notificationsScreen.title')}
          </Text>
          <Text style={[styles.statusText, { fontFamily: font(700) }]}>
            {t('more.notificationsScreen.status', { state: stateLabel })}
          </Text>
        </Card>

        <View style={styles.actions}>
          {granted ? (
            <Button
              label={t('more.notificationsScreen.rescheduleCta')}
              variant="secondary"
              size="lg"
              full
              onPress={handleReschedule}
            />
          ) : (
            <Button
              label={t('more.notificationsScreen.enableCta')}
              variant="primary"
              size="lg"
              full
              onPress={handleEnable}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topRow: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },
  eyebrow: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
    marginBottom: spacing.sm,
  },
  statusText: { fontSize: 18, color: colors.ink },
  actions: { marginTop: spacing.md },
});
