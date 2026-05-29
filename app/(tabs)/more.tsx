import { Ionicons, type Ionicons as IoniconsType } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelAllReminders } from '../../src/lib/notifications';
import { useAuthStore } from '../../src/stores/authStore';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { usePurchasesStore } from '../../src/stores/purchasesStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

const truncateEmail = (email: string, max = 24): string =>
  email.length > max ? `${email.slice(0, max - 1)}…` : email;

type IoniconName = ComponentProps<typeof IoniconsType>['name'];

interface RowDef {
  icon: IoniconName;
  labelKey: string;
  onPress: () => void;
  destructive?: boolean;
  highlight?: boolean;
  subtitle?: string;
}

export default function MoreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const seedDemoData = useChildrenStore((s) => s.seedDemoData);
  const clearAll = useChildrenStore((s) => s.clearAll);
  const isPremium = usePurchasesStore((s) => s.isPremium);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = () => {
    Alert.alert(t('signIn.signOutConfirmTitle'), t('signIn.signOutConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('signIn.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const childrenSection: RowDef[] = [
    {
      icon: 'people-outline',
      labelKey: 'more.items.manageChildren',
      onPress: () => router.push('/more/children'),
    },
    {
      icon: 'person-add-outline',
      labelKey: 'more.items.partnerSharing',
      onPress: () => router.push('/partner-sharing'),
    },
    {
      icon: 'medkit-outline',
      labelKey: 'more.items.medicalProfile',
      onPress: () => router.push('/more/medical-profile'),
    },
    {
      icon: 'person-outline',
      labelKey: 'more.items.doctorVisits',
      onPress: () => router.push('/doctor-visits'),
    },
  ];

  const accountSection: RowDef[] = [
    {
      icon: isPremium ? 'star' : 'star-outline',
      labelKey: isPremium ? 'more.items.premiumActive' : 'more.items.upgradePremium',
      onPress: () => router.push('/paywall'),
      highlight: !isPremium,
    },
    {
      icon: user ? 'person-circle' : 'person-circle-outline',
      labelKey: user ? 'more.items.account' : 'more.items.signIn',
      // For signed-in users, show their email under the row instead of the bare label
      subtitle: user ? truncateEmail(user.email ?? user.phone ?? '') : undefined,
      onPress: () => router.push('/sign-in'),
    },
    // Visible sign-out row — only when signed in, so it's discoverable without
    // having to remember the sign-in screen hides it.
    ...(user
      ? [
          {
            icon: 'log-out-outline' as const,
            labelKey: 'more.items.signOut',
            onPress: handleSignOut,
            destructive: true,
          },
        ]
      : []),
  ];

  const appSection: RowDef[] = [
    {
      icon: 'language-outline',
      labelKey: 'more.items.language',
      onPress: () => router.push('/more/language'),
    },
    {
      icon: 'notifications-outline',
      labelKey: 'more.items.notifications',
      onPress: () => router.push('/more/notifications'),
    },
  ];

  const handleLoadDemo = () => {
    Alert.alert(t('more.loadDemoConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('more.loadDemoCta'),
        onPress: async () => {
          await cancelAllReminders();
          seedDemoData();
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(t('more.clearAllConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await cancelAllReminders();
          clearAll();
        },
      },
    ]);
  };

  // Both rows are developer-only conveniences for resetting tester state.
  // In production, parents who want to delete data uninstall the app or
  // use the web page at kartochka.app/delete-account (which is linked
  // from Google Play Data Safety). A single-tap "wipe everything"
  // button is too dangerous for a medical-history app where a mistap
  // costs years of irreversible records.
  const dataSection: RowDef[] = __DEV__
    ? [
        {
          icon: 'sparkles-outline' as const,
          labelKey: 'more.items.loadDemo',
          onPress: handleLoadDemo,
        },
        {
          icon: 'trash-outline' as const,
          labelKey: 'more.items.clearAll',
          onPress: handleClearAll,
          destructive: true,
        },
      ]
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: font(typography.title.weight) }]}>
          {t('more.title')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Section title={t('more.sections.account')} font={font} rows={accountSection} t={t} />
        <Section title={t('more.sections.children')} font={font} rows={childrenSection} t={t} />
        <Section title={t('more.sections.app')} font={font} rows={appSection} t={t} />
        {dataSection.length > 0 && (
          <Section title={t('more.sections.developer')} font={font} rows={dataSection} t={t} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  rows,
  font,
  t,
}: {
  title: string;
  rows: RowDef[];
  font: (w: 400 | 500 | 600 | 700 | 800) => string;
  t: (k: string) => string;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontFamily: font(typography.eyebrow.weight) }]}>
        {title}
      </Text>
      <View style={styles.sectionRows}>
        {rows.map((row, i) => (
          <Pressable
            key={row.labelKey}
            onPress={row.onPress}
            style={[
              styles.row,
              i === 0 && styles.rowFirst,
              i === rows.length - 1 && styles.rowLast,
              i !== rows.length - 1 && styles.rowDivider,
            ]}>
            <Ionicons
              name={row.icon}
              size={22}
              color={row.destructive ? colors.error : row.highlight ? colors.teal : colors.ink2}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowLabel,
                  { fontFamily: font(600) },
                  row.destructive && { color: colors.error },
                  row.highlight && { color: colors.teal },
                ]}>
                {t(row.labelKey)}
              </Text>
              {row.subtitle ? (
                <Text style={[styles.rowSubtitle, { fontFamily: font(500) }]}>
                  {row.subtitle}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: {
    fontSize: typography.title.fontSize,
    letterSpacing: typography.title.letterSpacing,
    color: colors.ink,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: typography.eyebrow.fontSize,
    color: colors.ink2,
    textTransform: 'uppercase',
    letterSpacing: typography.eyebrow.letterSpacing,
  },
  sectionRows: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: spacing.md,
  },
  rowFirst: { borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg },
  rowLast: { borderBottomLeftRadius: radii.lg, borderBottomRightRadius: radii.lg },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border2 },
  rowLabel: { fontSize: typography.body.fontSize, color: colors.ink },
  rowSubtitle: { fontSize: 12, color: colors.ink3, marginTop: 2 },
});
