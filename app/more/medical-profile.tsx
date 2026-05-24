import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export default function MedicalProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const child = useChildrenStore(selectActiveChild);
  const updateChild = useChildrenStore((s) => s.updateChild);

  const [bloodType, setBloodType] = useState<string>(child?.bloodType ?? '');
  const [allergies, setAllergies] = useState(child?.allergyNotes ?? '');
  const [medications, setMedications] = useState(child?.medicationNotes ?? '');
  const [emergencyContact, setEmergencyContact] = useState(child?.emergencyContact ?? '');

  if (!child) {
    router.back();
    return null;
  }

  const handleSave = () => {
    updateChild(child.id, {
      bloodType: bloodType || undefined,
      allergyNotes: allergies.trim() || undefined,
      medicationNotes: medications.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
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
            title={t('medicalProfile.title')}
            subtitle={t('medicalProfile.subtitle')}
          />

          {/* Blood type picker */}
          <Text style={[styles.label, { fontFamily: font(700) }]}>
            {t('medicalProfile.bloodTypeLabel')}
          </Text>
          <View style={styles.bloodGrid}>
            <Pressable
              onPress={() => setBloodType('')}
              style={[styles.bloodChip, !bloodType && styles.bloodChipActive]}>
              <Text
                style={[
                  styles.bloodChipText,
                  { fontFamily: font(!bloodType ? 700 : 600) },
                  !bloodType && styles.bloodChipTextActive,
                ]}>
                {t('medicalProfile.bloodTypeNone')}
              </Text>
            </Pressable>
            {BLOOD_TYPES.map((bt) => (
              <Pressable
                key={bt}
                onPress={() => setBloodType(bt)}
                style={[styles.bloodChip, bloodType === bt && styles.bloodChipActive]}>
                {bloodType === bt && (
                  <Ionicons name="checkmark" size={12} color={colors.teal} style={{ marginRight: 3 }} />
                )}
                <Text
                  style={[
                    styles.bloodChipText,
                    { fontFamily: font(bloodType === bt ? 700 : 600) },
                    bloodType === bt && styles.bloodChipTextActive,
                  ]}>
                  {bt}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Allergy notes */}
          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.xl }]}>
            {t('medicalProfile.allergyLabel')}
          </Text>
          <TextInput
            value={allergies}
            onChangeText={setAllergies}
            placeholder={t('medicalProfile.allergyPlaceholder')}
            placeholderTextColor={colors.ink3}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.multiline, { fontFamily: font(600) }]}
          />

          {/* Medication notes */}
          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.xl }]}>
            {t('medicalProfile.medicationLabel')}
          </Text>
          <TextInput
            value={medications}
            onChangeText={setMedications}
            placeholder={t('medicalProfile.medicationPlaceholder')}
            placeholderTextColor={colors.ink3}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.multiline, { fontFamily: font(600) }]}
          />

          {/* Emergency contact */}
          <Text style={[styles.label, { fontFamily: font(700), marginTop: spacing.xl }]}>
            {t('medicalProfile.emergencyContactLabel')}
          </Text>
          <TextInput
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder={t('medicalProfile.emergencyContactPlaceholder')}
            placeholderTextColor={colors.ink3}
            keyboardType="phone-pad"
            style={[styles.input, { fontFamily: font(600) }]}
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
            label={t('medicalProfile.saveCta')}
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
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bloodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bloodChipActive: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  bloodChipText: {
    fontSize: 14,
    color: colors.ink2,
  },
  bloodChipTextActive: {
    color: colors.teal,
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
