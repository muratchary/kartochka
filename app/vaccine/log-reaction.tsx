import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
import { ScreenTitle } from '../../src/components/ScreenTitle';
import { selectActiveChild, useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';
import type { VaccineReactions } from '../../src/types';

export default function LogReactionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();

  const child = useChildrenStore(selectActiveChild);
  const vaccinations = useChildrenStore((s) => s.vaccinations);
  const updateVaccination = useChildrenStore((s) => s.updateVaccination);

  const record = useMemo(
    () => (recordId ? vaccinations.find((v) => v.id === recordId) : undefined),
    [recordId, vaccinations],
  );

  const existing = record?.reactions;

  const [fever, setFever] = useState(existing?.fever ?? false);
  const [fussiness, setFussiness] = useState(existing?.fussiness ?? false);
  const [redness, setRedness] = useState(existing?.redness ?? false);
  const [drowsiness, setDrowsiness] = useState(existing?.drowsiness ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? '');

  if (!child || !record) {
    router.back();
    return null;
  }

  const handleSave = () => {
    const reactions: VaccineReactions = {
      fever: fever || undefined,
      fussiness: fussiness || undefined,
      redness: redness || undefined,
      drowsiness: drowsiness || undefined,
      notes: notes.trim() || undefined,
    };
    // Only save if at least one thing is ticked or notes exist
    const hasAny = fever || fussiness || redness || drowsiness || notes.trim();
    updateVaccination(record.id, { reactions: hasAny ? reactions : undefined });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ScreenTitle
            title={t('reactions.title')}
            subtitle={t('reactions.subtitle', { name: child.name })}
          />

          <View style={styles.checkGroup}>
            {(
              [
                { key: 'fever', value: fever, set: setFever },
                { key: 'fussiness', value: fussiness, set: setFussiness },
                { key: 'redness', value: redness, set: setRedness },
                { key: 'drowsiness', value: drowsiness, set: setDrowsiness },
              ] as const
            ).map(({ key, value, set }) => (
              <Pressable
                key={key}
                onPress={() => set(!value)}
                style={[styles.checkRow, value && styles.checkRowActive]}>
                <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                  {value && <Ionicons name="checkmark" size={14} color={colors.surface} />}
                </View>
                <Text
                  style={[
                    styles.checkLabel,
                    { fontFamily: font(value ? 700 : 600) },
                    value && { color: colors.ink },
                  ]}>
                  {t(`reactions.${key}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('reactions.notesLabel')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('reactions.notesPlaceholder')}
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
            label={t('reactions.saveCta')}
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
  checkGroup: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  checkRowActive: {
    backgroundColor: colors.tealSoft,
    borderColor: colors.tealLine,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.ink3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  checkLabel: {
    fontSize: typography.body.fontSize,
    color: colors.ink2,
    flex: 1,
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
