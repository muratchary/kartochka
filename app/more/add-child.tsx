import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
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
import { ChildAvatar } from '../../src/components/ChildAvatar';
import { DateField } from '../../src/components/DateField';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { Segmented } from '../../src/components/Segmented';
import { ensureNotificationPermission } from '../../src/lib/notifications';
import { useRescheduleReminders } from '../../src/lib/useReminders';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';
import type { Child, Sex } from '../../src/types';

const COUNTRIES: Array<{ code: string; flag: string }> = [
  { code: 'RU', flag: '🇷🇺' },
  { code: 'KZ', flag: '🇰🇿' },
  { code: 'UZ', flag: '🇺🇿' },
  { code: 'AE', flag: '🇦🇪' },
  { code: 'SA', flag: '🇸🇦' },
  { code: 'TR', flag: '🇹🇷' },
];

export default function AddOrEditChildScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const params = useLocalSearchParams<{ id?: string }>();

  const children = useChildrenStore((s) => s.children);
  const addChild = useChildrenStore((s) => s.addChild);
  const updateChild = useChildrenStore((s) => s.updateChild);
  const rescheduleReminders = useRescheduleReminders();

  const existing = useMemo(
    () => (params.id ? children.find((c) => c.id === params.id) : undefined),
    [params.id, children],
  );
  const isEdit = !!existing;

  const defaultCountry = existing?.countryCode ?? children[0]?.countryCode ?? 'RU';

  const [name, setName] = useState(existing?.name ?? '');
  const [dob, setDob] = useState<string | null>(existing?.dateOfBirth ?? null);
  const [sex, setSex] = useState<Sex | null>(existing?.sex ?? null);
  const [country, setCountry] = useState<string>(defaultCountry);
  const [photoUri, setPhotoUri] = useState<string | null>(existing?.photoUri ?? null);

  const handlePickPhoto = () => {
    const options: string[] = [t('vaccines.markDone.addPhoto')];
    if (photoUri) options.push(t('vaccines.markDone.removePhoto'));
    options.push(t('common.cancel'));
    Alert.alert('', '', options.map((label, index) => ({
      text: label,
      style: index === options.length - 1 ? 'cancel' : 'default',
      onPress: async () => {
        if (index === 0) {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
          }
        } else if (photoUri && index === 1) {
          setPhotoUri(null);
        }
      },
    })));
  };

  const sexOptions: Array<{ value: Sex; label: string }> = [
    { value: 'male', label: t('onboarding.addChild.sexBoy') },
    { value: 'female', label: t('onboarding.addChild.sexGirl') },
    { value: 'unspecified', label: t('onboarding.addChild.sexUnspecified') },
  ];

  const canSave = name.trim().length > 0 && !!dob && !!sex && !!country;

  const handleSave = async () => {
    if (!canSave || !dob || !sex) return;
    // Reject future birthdays — they're never valid.
    // Compare as YYYY-MM-DD to ignore time-of-day and timezone drift.
    const todayIso = new Date().toISOString().slice(0, 10);
    if (dob > todayIso) {
      Alert.alert(t('onboarding.addChild.futureDobTitle'), t('onboarding.addChild.futureDobBody'));
      return;
    }
    if (isEdit && existing) {
      updateChild(existing.id, {
        name: name.trim(),
        dateOfBirth: dob,
        sex,
        countryCode: country,
        photoUri: photoUri ?? undefined,
      });
      const updated: Child = {
        ...existing,
        name: name.trim(),
        dateOfBirth: dob,
        sex,
        countryCode: country,
        photoUri: photoUri ?? undefined,
        updatedAt: new Date().toISOString(),
      };
      await rescheduleReminders(updated);
    } else {
      const child = addChild({
        name: name.trim(),
        dateOfBirth: dob,
        sex,
        countryCode: country,
        photoUri: photoUri ?? undefined,
      });
      // Same logic as the onboarding add-child: request permission once
      // a child exists so reminders are meaningful.
      await ensureNotificationPermission();
      await rescheduleReminders(child);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <ScreenTitle
            title={
              isEdit
                ? t('more.childrenScreen.editCta')
                : t('more.childrenScreen.addCta')
            }
            subtitle={t('onboarding.addChild.subtitle')}
          />

          <Pressable onPress={handlePickPhoto} style={styles.avatarPicker}>
            <ChildAvatar name={name || '?'} photoUri={photoUri} size={72} />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={14} color={colors.surface} />
            </View>
          </Pressable>

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
          <DateField
            value={dob}
            onChange={setDob}
            placeholder={t('onboarding.addChild.dobPick')}
            maximumDate={new Date()}
          />

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

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('onboarding.country.title')}
          </Text>
          <View style={styles.countryGrid}>
            {COUNTRIES.map((c) => {
              const active = c.code === country;
              return (
                <Pressable
                  key={c.code}
                  onPress={() => setCountry(c.code)}
                  style={[styles.countryRow, active && styles.countryRowActive]}>
                  <Text style={styles.flag}>{c.flag}</Text>
                  <Text
                    style={[
                      styles.countryName,
                      { fontFamily: font(active ? 700 : 600) },
                      active && { color: colors.tealDark },
                    ]}>
                    {t(`countries.${c.code}`)}
                  </Text>
                  {active && <Text style={[styles.check, { fontFamily: font(700) }]}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={t('common.save')}
            variant="primary"
            size="lg"
            full
            disabled={!canSave}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topRow: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  avatarPicker: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    end: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
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
  countryGrid: { gap: spacing.sm },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  countryRowActive: {
    backgroundColor: colors.tealSoft,
    borderColor: colors.tealLine,
  },
  flag: { fontSize: 22 },
  countryName: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.ink,
  },
  check: { fontSize: 16, color: colors.teal },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
});
