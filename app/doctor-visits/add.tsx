import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { DateField } from '../../src/components/DateField';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddDoctorVisitScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const child = useChildrenStore(selectActiveChild);
  const doctorVisits = useChildrenStore((s) => s.doctorVisits);
  const addDoctorVisit = useChildrenStore((s) => s.addDoctorVisit);
  const updateDoctorVisit = useChildrenStore((s) => s.updateDoctorVisit);

  const existing = useMemo(
    () => (id ? doctorVisits.find((d) => d.id === id) : undefined),
    [id, doctorVisits],
  );
  const isEdit = !!existing;

  const [date, setDate] = useState(existing?.visitedOn ?? todayIso());
  const [doctor, setDoctor] = useState(existing?.doctorName ?? '');
  const [clinic, setClinic] = useState(existing?.clinicName ?? '');
  const [reason, setReason] = useState(existing?.reason ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  if (!child) {
    router.back();
    return null;
  }

  const handleSave = () => {
    const patch = {
      visitedOn: date,
      doctorName: doctor.trim() || undefined,
      clinicName: clinic.trim() || undefined,
      reason: reason.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    if (isEdit && existing) {
      updateDoctorVisit(existing.id, patch);
    } else {
      addDoctorVisit({ childId: child.id, ...patch });
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ScreenTitle
            title={isEdit ? t('doctorVisits.add.editTitle') : t('doctorVisits.add.title')}
            subtitle={t('doctorVisits.add.subtitle')}
          />

          <Text style={[styles.label, { fontFamily: font(700) }]}>
            {t('doctorVisits.add.dateLabel')}
          </Text>
          <DateField value={date} onChange={setDate} maximumDate={new Date()} />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('doctorVisits.add.doctorLabel')}
          </Text>
          <TextInput
            value={doctor}
            onChangeText={setDoctor}
            placeholder={t('doctorVisits.add.doctorPlaceholder')}
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('doctorVisits.add.clinicLabel')}
          </Text>
          <TextInput
            value={clinic}
            onChangeText={setClinic}
            placeholder={t('doctorVisits.add.clinicPlaceholder')}
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('doctorVisits.add.reasonLabel')}
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder={t('doctorVisits.add.reasonPlaceholder')}
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('doctorVisits.add.notesLabel')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('doctorVisits.add.notesPlaceholder')}
            placeholderTextColor={colors.ink3}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.multiline, { fontFamily: font(600) }]}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={t('common.cancel')}
            variant="ghost"
            size="lg"
            onPress={() => router.back()}
          />
          <Button
            label={isEdit ? t('common.save') : t('doctorVisits.add.saveCta')}
            variant="primary"
            size="lg"
            full
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
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
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
});
