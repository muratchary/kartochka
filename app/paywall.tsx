import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PurchasesPackage } from 'react-native-purchases';

import { usePurchasesStore } from '../src/stores/purchasesStore';
import { colors, radii, spacing } from '../src/theme';
import { useFont } from '../src/theme/useFont';

// What Premium unlocks — shown as benefit rows
const BENEFITS: Array<{ icon: string; labelKey: string }> = [
  { icon: 'document-text-outline', labelKey: 'paywall.benefit1' },
  { icon: 'people-outline', labelKey: 'paywall.benefit2' },
  { icon: 'person-add-outline', labelKey: 'paywall.benefit3' },
  { icon: 'cloud-upload-outline', labelKey: 'paywall.benefit4' },
];

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const { offering, isLoading, refreshEntitlements, purchasePackage, restorePurchases } =
    usePurchasesStore();

  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  // Pre-select yearly (best value)
  useEffect(() => {
    if (offering?.annual) {
      setSelectedPackage(offering.annual);
    } else if (offering?.monthly) {
      setSelectedPackage(offering.monthly);
    }
  }, [offering]);

  useEffect(() => {
    refreshEntitlements();
  }, [refreshEntitlements]);

  const monthly = offering?.monthly;
  const yearly = offering?.annual;

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    try {
      const success = await purchasePackage(selectedPackage);
      if (success) {
        Alert.alert(t('paywall.successTitle'), t('paywall.successBody'), [
          { text: t('common.close'), onPress: () => router.back() },
        ]);
      }
    } catch {
      Alert.alert(t('paywall.errorTitle'), t('paywall.errorBody'));
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert(t('paywall.restoredTitle'), t('paywall.restoredBody'), [
        { text: t('common.close'), onPress: () => router.back() },
      ]);
    } else {
      Alert.alert(t('paywall.nothingToRestore'));
    }
  };

  // Dev-mode: RevenueCat not available in Expo Go
  const isDevMode = !offering && !isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Close button */}
      <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="close" size={24} color={colors.ink2} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { fontFamily: font(700) }]}>
              {t('paywall.trialBadge')}
            </Text>
          </View>
          <Text style={[styles.title, { fontFamily: font(800) }]}>{t('paywall.title')}</Text>
          <Text style={[styles.subtitle, { fontFamily: font(600) }]}>{t('paywall.subtitle')}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          {BENEFITS.map((b) => (
            <View key={b.labelKey} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon as never} size={18} color={colors.teal} />
              </View>
              <Text style={[styles.benefitLabel, { fontFamily: font(600) }]}>{t(b.labelKey)}</Text>
            </View>
          ))}
        </View>

        {/* Plan cards */}
        {isLoading ? (
          <ActivityIndicator color={colors.teal} style={{ marginVertical: spacing.xl }} />
        ) : isDevMode ? (
          <View style={styles.devNotice}>
            <Ionicons name="information-circle-outline" size={16} color={colors.ink3} />
            <Text style={[styles.devText, { fontFamily: font(600) }]}>
              {t('paywall.devNotice')}
            </Text>
          </View>
        ) : (
          <View style={styles.planRow}>
            {monthly && (
              <Pressable
                style={[styles.planCard, selectedPackage?.identifier === monthly.identifier && styles.planCardSelected]}
                onPress={() => setSelectedPackage(monthly)}>
                {selectedPackage?.identifier === monthly.identifier && (
                  <View style={styles.planCheck}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
                  </View>
                )}
                <Text style={[styles.planLabel, { fontFamily: font(700) }]}>
                  {t('paywall.monthly')}
                </Text>
                <Text style={[styles.planPrice, { fontFamily: font(800) }]}>
                  {monthly.product.priceString}
                </Text>
                <Text style={[styles.planPeriod, { fontFamily: font(600) }]}>
                  {t('paywall.perMonth')}
                </Text>
              </Pressable>
            )}

            {yearly && (
              <Pressable
                style={[styles.planCard, styles.planCardFeatured, selectedPackage?.identifier === yearly.identifier && styles.planCardSelected]}
                onPress={() => setSelectedPackage(yearly)}>
                <View style={styles.savingsChip}>
                  <Text style={[styles.savingsText, { fontFamily: font(700) }]}>
                    {t('paywall.yearlySavings')}
                  </Text>
                </View>
                {selectedPackage?.identifier === yearly.identifier && (
                  <View style={styles.planCheck}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
                  </View>
                )}
                <Text style={[styles.planLabel, { fontFamily: font(700) }]}>
                  {t('paywall.yearly')}
                </Text>
                <Text style={[styles.planPrice, { fontFamily: font(800) }]}>
                  {yearly.product.priceString}
                </Text>
                <Text style={[styles.planPeriod, { fontFamily: font(600) }]}>
                  {t('paywall.perYear')}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Trial note */}
        <Text style={[styles.trialNote, { fontFamily: font(600) }]}>{t('paywall.trialNote')}</Text>

        {/* CTA */}
        <Pressable
          style={[styles.cta, (isLoading || isDevMode) && styles.ctaDisabled]}
          onPress={handlePurchase}
          disabled={isLoading || isDevMode || !selectedPackage}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.ctaText, { fontFamily: font(700) }]}>{t('paywall.cta')}</Text>
          )}
        </Pressable>

        {/* Restore */}
        <Pressable onPress={handleRestore} style={styles.restoreBtn} hitSlop={8}>
          <Text style={[styles.restoreText, { fontFamily: font(600) }]}>
            {t('paywall.restore')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  closeBtn: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10, padding: spacing.sm },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, paddingTop: spacing.xl },

  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  badge: {
    backgroundColor: colors.amberSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  badgeText: { fontSize: 12, color: colors.amberDark },
  title: {
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: { fontSize: 15, color: colors.ink2, textAlign: 'center', lineHeight: 22 },

  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: { fontSize: 15, color: colors.ink, flex: 1 },

  planRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    position: 'relative',
  },
  planCardFeatured: { borderColor: colors.tealLine },
  planCardSelected: { borderColor: colors.teal, backgroundColor: colors.tealSoft },
  planCheck: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  savingsChip: {
    backgroundColor: colors.teal,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  savingsText: { fontSize: 11, color: '#fff' },
  planLabel: { fontSize: 13, color: colors.ink2, textTransform: 'uppercase', letterSpacing: 0.4 },
  planPrice: { fontSize: 24, color: colors.ink, letterSpacing: -0.4 },
  planPeriod: { fontSize: 12, color: colors.ink3 },

  devNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.border2,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  devText: { fontSize: 13, color: colors.ink2, flex: 1, lineHeight: 18 },

  trialNote: { fontSize: 13, color: colors.ink3, textAlign: 'center', marginBottom: spacing.lg },

  cta: {
    backgroundColor: colors.teal,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { fontSize: 16, color: '#fff' },

  restoreBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  restoreText: { fontSize: 14, color: colors.ink3 },
});
