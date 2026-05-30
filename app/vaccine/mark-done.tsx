import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
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
import { Celebration } from '../../src/components/Celebration';
import { DateField } from '../../src/components/DateField';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { useRescheduleReminders } from '../../src/lib/useReminders';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function MarkDoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const params = useLocalSearchParams<{ code?: string; dose?: string }>();

  const child = useChildrenStore(selectActiveChild);
  const addVaccination = useChildrenStore((s) => s.addVaccination);
  const rescheduleReminders = useRescheduleReminders();

  const [date, setDate] = useState<string>(todayIso());
  const [location, setLocation] = useState('');
  const [batch, setBatch] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert(t('vaccines.markDone.photoPickFailed'));
    }
  };

  const code = params.code;
  const doseStr = params.dose;
  const doseNumber = doseStr ? parseInt(doseStr, 10) : NaN;

  const canSave = !!child && !!code && Number.isFinite(doseNumber) && !!date;

  const handleSave = async () => {
    if (!canSave || !child || !code) return;
    addVaccination({
      childId: child.id,
      vaccineCode: code,
      doseNumber,
      administeredOn: date,
      locationOfAdministration: location.trim() || undefined,
      batchNumber: batch.trim() || undefined,
      notes: notes.trim() || undefined,
      photoUri: photoUri ?? undefined,
    });
    await rescheduleReminders(child);
    setCelebrate(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <ScreenTitle
            title={t('vaccines.markDone.title')}
            subtitle={t('vaccines.markDone.subtitle')}
          />

          <Text style={[styles.label, { fontFamily: font(700) }]}>
            {t('vaccines.markDone.dateLabel')}
          </Text>
          <DateField value={date} onChange={setDate} maximumDate={new Date()} />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('vaccines.markDone.locationLabel')}
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder={t('vaccines.markDone.locationPlaceholder')}
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('vaccines.markDone.batchLabel')}
          </Text>
          <TextInput
            value={batch}
            onChangeText={setBatch}
            placeholder={t('vaccines.markDone.batchPlaceholder')}
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('vaccines.markDone.notesLabel')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('vaccines.markDone.notesPlaceholder')}
            placeholderTextColor={colors.ink3}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.multiline, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('vaccines.markDone.photoLabel')}
          </Text>
          {photoUri ? (
            <View style={styles.photoBox}>
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
              <View style={styles.photoActions}>
                <Pressable onPress={handlePickPhoto} hitSlop={6}>
                  <Text style={[styles.photoAction, { fontFamily: font(700) }]}>
                    {t('vaccines.markDone.changePhoto')}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setPhotoUri(null)} hitSlop={6}>
                  <Text
                    style={[
                      styles.photoAction,
                      { fontFamily: font(700), color: colors.error },
                    ]}>
                    {t('vaccines.markDone.removePhoto')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={handlePickPhoto} style={styles.photoPicker}>
              <Ionicons name="camera-outline" size={22} color={colors.ink2} />
              <Text style={[styles.photoPickerText, { fontFamily: font(700) }]}>
                {t('vaccines.markDone.addPhoto')}
              </Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={t('vaccines.markDone.cancelCta')}
            variant="ghost"
            size="lg"
            onPress={() => router.back()}
          />
          <Button
            label={t('vaccines.markDone.saveCta')}
            variant="primary"
            size="lg"
            full
            disabled={!canSave}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
      <Celebration
        visible={celebrate}
        title={t('vaccines.celebrationTitle')}
        body={t('vaccines.celebrationBody', { name: child?.name ?? '' })}
        onClose={() => {
          setCelebrate(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
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
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  photoPickerText: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
  },
  photoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  photoAction: {
    fontSize: typography.body.fontSize,
    color: colors.teal,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
