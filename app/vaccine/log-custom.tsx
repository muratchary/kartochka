import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
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
import { newId } from '../../src/utils/id';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LogCustomVaccineScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const child = useChildrenStore(selectActiveChild);
  const addVaccination = useChildrenStore((s) => s.addVaccination);

  const [name, setName] = useState('');
  const [date, setDate] = useState(todayIso());
  const [location, setLocation] = useState('');
  const [batch, setBatch] = useState('');
  const [notes, setNotes] = useState('');

  if (!child) {
    router.back();
    return null;
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('customVaccine.nameLabel'), t('common.save'));
      return;
    }
    addVaccination({
      childId: child.id,
      vaccineCode: `custom-${newId()}`,
      doseNumber: 1,
      administeredOn: date,
      locationOfAdministration: location.trim() || undefined,
      batchNumber: batch.trim() || undefined,
      notes: notes.trim() || undefined,
      isCustom: true,
      customVaccineName: name.trim(),
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ScreenTitle
            title={t('customVaccine.title')}
            subtitle={t('customVaccine.subtitle')}
          />

          <Text style={[styles.label, { fontFamily: font(700) }]}>
            {t('customVaccine.nameLabel')} *
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('customVaccine.namePlaceholder')}
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('customVaccine.dateLabel')}
          </Text>
          <DateField value={date} onChange={setDate} maximumDate={new Date()} />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('customVaccine.locationLabel')}
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder={t('customVaccine.locationPlaceholder')}
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('customVaccine.batchLabel')}
          </Text>
          <TextInput
            value={batch}
            onChangeText={setBatch}
            placeholder={t('customVaccine.batchPlaceholder')}
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('customVaccine.notesLabel')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('customVaccine.notesPlaceholder')}
            placeholderTextColor={colors.ink3}
            multiline
            numberOfLines={3}
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
            label={t('customVaccine.saveCta')}
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
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
});
