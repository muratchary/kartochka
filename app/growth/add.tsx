import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseNum(s: string): number | undefined {
  const cleaned = s.replace(',', '.').trim();
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function toStr(n: number | undefined): string {
  return n == null ? '' : String(n);
}

export default function AddOrEditGrowthScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const params = useLocalSearchParams<{ id?: string }>();

  const children = useChildrenStore((s) => s.children);
  const growthEntries = useChildrenStore((s) => s.growthEntries);
  const addGrowthEntry = useChildrenStore((s) => s.addGrowthEntry);
  const updateGrowthEntry = useChildrenStore((s) => s.updateGrowthEntry);
  const child = children[0];

  const existing = useMemo(
    () => (params.id ? growthEntries.find((g) => g.id === params.id) : undefined),
    [params.id, growthEntries],
  );
  const isEdit = !!existing;

  const [date, setDate] = useState<string>(existing?.measuredOn ?? todayIso());
  const [weight, setWeight] = useState(toStr(existing?.weightKg));
  const [height, setHeight] = useState(toStr(existing?.heightCm));
  const [head, setHead] = useState(toStr(existing?.headCircumferenceCm));
  const [notes, setNotes] = useState(existing?.notes ?? '');

  if (!child) {
    router.back();
    return null;
  }

  const handleSave = () => {
    const weightKg = parseNum(weight);
    const heightCm = parseNum(height);
    const headCircumferenceCm = parseNum(head);
    if (weightKg == null && heightCm == null && headCircumferenceCm == null) {
      Alert.alert(t('growth.add.atLeastOne'));
      return;
    }
    if (isEdit && existing) {
      updateGrowthEntry(existing.id, {
        measuredOn: date,
        weightKg,
        heightCm,
        headCircumferenceCm,
        notes: notes.trim() || undefined,
      });
    } else {
      addGrowthEntry({
        childId: child.id,
        measuredOn: date,
        weightKg,
        heightCm,
        headCircumferenceCm,
        notes: notes.trim() || undefined,
      });
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
            title={t('growth.add.title')}
            subtitle={t('growth.add.subtitle')}
          />

          <Text style={[styles.label, { fontFamily: font(700) }]}>
            {t('growth.add.dateLabel')}
          </Text>
          <DateField value={date} onChange={setDate} maximumDate={new Date()} />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('growth.add.weightLabel')}
          </Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('growth.add.heightLabel')}
          </Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('growth.add.headLabel')}
          </Text>
          <TextInput
            value={head}
            onChangeText={setHead}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.ink3}
            style={[styles.input, { fontFamily: font(600) }]}
          />

          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.lg }]}>
            {t('growth.add.notesLabel')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('growth.add.notesPlaceholder')}
            placeholderTextColor={colors.ink3}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.multiline, { fontFamily: font(600) }]}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={t('growth.add.cancelCta')}
            variant="ghost"
            size="lg"
            onPress={() => router.back()}
          />
          <Button
            label={isEdit ? t('common.save') : t('growth.add.saveCta')}
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
