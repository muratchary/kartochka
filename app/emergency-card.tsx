import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChildAvatar } from '../src/components/ChildAvatar';
import { selectActiveChild, useChildrenStore } from '../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

export default function EmergencyCardScreen() {
  const { t } = useTranslation();
  const font = useFont();
  const router = useRouter();

  const child = useChildrenStore(selectActiveChild);

  if (!child) return <Redirect href="/onboarding/welcome" />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.surface} />
        </Pressable>
        <Text style={[styles.screenTitle, { fontFamily: font(typography.title.weight) }]}>
          {t('emergencyCard.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Identity */}
        <View style={styles.identity}>
          <ChildAvatar name={child.name} photoUri={child.photoUri} size={80} />
          <Text style={[styles.childName, { fontFamily: font(800) }]}>{child.name}</Text>
          {child.dateOfBirth ? (
            <Text style={[styles.childDob, { fontFamily: font(600) }]}>
              {new Date(child.dateOfBirth).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          ) : null}
        </View>

        {/* Blood type — extra prominent */}
        <View style={styles.bloodCard}>
          <Text style={[styles.bloodLabel, { fontFamily: font(600) }]}>
            {t('emergencyCard.bloodType')}
          </Text>
          <Text style={[styles.bloodValue, { fontFamily: font(800) }]}>
            {child.bloodType ?? t('emergencyCard.notSet')}
          </Text>
        </View>

        {/* Allergies */}
        <InfoRow
          icon="warning-outline"
          iconColor="#DC2626"
          bgColor="#FEE2E2"
          label={t('emergencyCard.allergies')}
          value={child.allergyNotes}
          notSet={t('emergencyCard.notSet')}
          font={font}
        />

        {/* Medications */}
        <InfoRow
          icon="medical-outline"
          iconColor={colors.teal}
          bgColor={colors.tealSoft}
          label={t('emergencyCard.medications')}
          value={child.medicationNotes}
          notSet={t('emergencyCard.notSet')}
          font={font}
        />

        {/* Emergency contact */}
        <InfoRow
          icon="call-outline"
          iconColor="#7C3AED"
          bgColor="#F5F3FF"
          label={t('emergencyCard.emergencyContact')}
          value={child.emergencyContact}
          notSet={t('emergencyCard.notSet')}
          font={font}
        />

        <Pressable
          style={styles.editCta}
          onPress={() => router.push('/more/medical-profile')}>
          <Ionicons name="create-outline" size={15} color={colors.teal} />
          <Text style={[styles.editCtaText, { fontFamily: font(600) }]}>
            {t('emergencyCard.editCta')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  iconColor,
  bgColor,
  label,
  value,
  notSet,
  font,
}: {
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  label: string;
  value?: string;
  notSet: string;
  font: (w: 400 | 500 | 600 | 700 | 800) => string;
}) {
  return (
    <View style={[styles.infoCard, { backgroundColor: bgColor }]}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={[styles.infoLabel, { fontFamily: font(600), color: iconColor }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { fontFamily: font(700) }]}>
        {value?.trim() || notSet}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DC2626' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  screenTitle: {
    flex: 1,
    fontSize: typography.title.fontSize,
    color: colors.surface,
    textAlign: 'center',
    letterSpacing: typography.title.letterSpacing,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  childName: {
    fontSize: 28,
    color: colors.surface,
    letterSpacing: -0.5,
  },
  childDob: {
    fontSize: typography.body.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  bloodCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bloodLabel: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  bloodValue: {
    fontSize: 52,
    color: '#DC2626',
    letterSpacing: -1,
  },
  infoCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.eyebrow.fontSize,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  infoValue: {
    fontSize: 18,
    color: colors.ink,
    lineHeight: 26,
  },
  editCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  editCtaText: {
    fontSize: typography.body.fontSize,
    color: colors.surface,
  },
});
