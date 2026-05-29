import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { Segmented } from '../../src/components/Segmented';
import { StepDots } from '../../src/components/StepDots';
import type { SupportedLanguage } from '../../src/i18n';
import { ensureNotificationPermission } from '../../src/lib/notifications';
import { useRescheduleReminders } from '../../src/lib/useReminders';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';
import type { Sex } from '../../src/types';

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export default function AddChildScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const country = useOnboardingStore((s) => s.country);
  const name = useOnboardingStore((s) => s.name);
  const dateOfBirth = useOnboardingStore((s) => s.dateOfBirth);
  const sex = useOnboardingStore((s) => s.sex);
  const setName = useOnboardingStore((s) => s.setName);
  const setDateOfBirth = useOnboardingStore((s) => s.setDateOfBirth);
  const setSex = useOnboardingStore((s) => s.setSex);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  const addChild = useChildrenStore((s) => s.addChild);
  const rescheduleReminders = useRescheduleReminders();

  const [pickerOpen, setPickerOpen] = useState(false);
  const dobDate = dateOfBirth ? new Date(dateOfBirth) : null;
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const sexOptions: Array<{ value: Sex; label: string }> = [
    { value: 'male', label: t('onboarding.addChild.sexBoy') },
    { value: 'female', label: t('onboarding.addChild.sexGirl') },
    { value: 'unspecified', label: t('onboarding.addChild.sexUnspecified') },
  ];

  const canSave =
    name.trim().length > 0 &&
    dateOfBirth !== null &&
    sex !== null &&
    country !== null;

  const handleSave = async () => {
    if (!canSave || !country || !sex || !dateOfBirth) return;
    // Reject future birthdays
    const todayIso = new Date().toISOString().slice(0, 10);
    if (dateOfBirth > todayIso) {
      Alert.alert(t('onboarding.addChild.futureDobTitle'), t('onboarding.addChild.futureDobBody'));
      return;
    }
    const child = addChild({
      name: name.trim(),
      dateOfBirth,
      sex,
      countryCode: country,
    });
    resetOnboarding();
    // Request notification permission now — the system prompt is more
    // meaningful here ("Reminder for {child.name}'s vaccines") than buried
    // in a Settings screen later. If denied, reminders just won't fire;
    // user can still re-enable from system Settings.
    await ensureNotificationPermission();
    await rescheduleReminders(child);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.stepRow}>
        <StepDots step={4} total={4} />
        <Text style={[styles.stepLabel, { fontFamily: font(700) }]}>
          {t('onboarding.addChild.stepLabel')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled">
        <ScreenTitle
          title={t('onboarding.addChild.title')}
          subtitle={t('onboarding.addChild.subtitle')}
        />

        <Text style={[styles.label, { fontFamily: font(700) }]}>
          {t('onboarding.addChild.nameLabel')}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('onboarding.addChild.namePlaceholder')}
          placeholderTextColor={colors.ink3}
          style={[styles.input, { fontFamily: font(600) }]}
        />

        <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
          {t('onboarding.addChild.dobLabel')}
        </Text>
        <Pressable onPress={() => setPickerOpen(true)} style={styles.input}>
          <Text
            style={{
              fontFamily: font(600),
              color: dobDate ? colors.ink : colors.ink3,
              fontSize: typography.body.fontSize,
            }}>
            {dobDate ? formatDate(dobDate, lang) : t('onboarding.addChild.dobPick')}
          </Text>
        </Pressable>
        {pickerOpen && (
          <DateTimePicker
            value={dobDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(_, selected) => {
              if (Platform.OS !== 'ios') setPickerOpen(false);
              if (selected) {
                setDateOfBirth(selected.toISOString().slice(0, 10));
              }
            }}
          />
        )}
        {pickerOpen && Platform.OS === 'ios' && (
          <Button
            label={t('more.ok')}
            variant="ghost"
            size="sm"
            onPress={() => setPickerOpen(false)}
          />
        )}

        <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
          {t('onboarding.addChild.sexLabel')}
        </Text>
        <Segmented
          options={sexOptions}
          value={sex ?? 'unspecified'}
          onChange={setSex}
        />
        <Text style={[styles.help, { fontFamily: font(typography.caption.weight) }]}>
          {t('onboarding.addChild.sexHelp')}
        </Text>

        <View style={styles.countryStrip}>
          <Text
            style={[
              styles.countryStripLabel,
              { fontFamily: font(typography.caption.weight) },
            ]}>
            {t('onboarding.addChild.countryStripPrefix')}{' '}
            <Text style={{ color: colors.ink, fontFamily: font(700) }}>
              {country ? t(`countries.${country}`) : ''}
            </Text>
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.countryStripLink, { fontFamily: font(700) }]}>
              {t('common.change')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Button
        label={t('onboarding.addChild.saveCta')}
        variant="primary"
        size="lg"
        full
        disabled={!canSave}
        onPress={handleSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepLabel: { fontSize: typography.caption.fontSize, color: colors.ink2 },
  label: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontSize: typography.body.fontSize,
    color: colors.ink,
  },
  help: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
    marginTop: spacing.sm,
  },
  countryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.tealSoft,
    borderWidth: 1,
    borderColor: colors.tealLine,
  },
  countryStripLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.ink2,
    flex: 1,
  },
  countryStripLink: {
    color: colors.teal,
    fontSize: typography.caption.fontSize,
  },
});
