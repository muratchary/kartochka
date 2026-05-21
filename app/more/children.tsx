import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScreenTitle } from '../../src/components/ScreenTitle';
import type { SupportedLanguage } from '../../src/i18n';
import { cancelChildReminders } from '../../src/lib/notifications';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function ChildrenSettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();

  const children = useChildrenStore((s) => s.children);
  const removeChild = useChildrenStore((s) => s.removeChild);
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const handleRemove = (id: string, name: string) => {
    Alert.alert(t('more.childrenScreen.removeConfirm', { name }), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('more.childrenScreen.remove'),
        style: 'destructive',
        onPress: async () => {
          await cancelChildReminders(id);
          removeChild(id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <ScreenTitle
          title={t('more.childrenScreen.title')}
          subtitle={t('more.childrenScreen.subtitle')}
        />

        <View style={styles.list}>
          {children.map((c) => {
            const letter = c.name.trim().charAt(0).toUpperCase() || '?';
            return (
              <Card key={c.id} style={{ padding: spacing.lg }}>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={[styles.avatarLetter, { fontFamily: font(800) }]}>{letter}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { fontFamily: font(700) }]}>{c.name}</Text>
                    <Text style={[styles.meta, { fontFamily: font(600) }]}>
                      {formatDate(new Date(c.dateOfBirth), lang)} · {t(`countries.${c.countryCode}`)}
                    </Text>
                  </View>
                  <Pressable hitSlop={8} onPress={() => handleRemove(c.id, c.name)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </Pressable>
                </View>
              </Card>
            );
          })}
        </View>

        <Button
          label={t('more.childrenScreen.addCta')}
          variant="primary"
          size="lg"
          full
          onPress={() => router.push('/more/add-child')}
        />

        <Text style={[styles.premiumNote, { fontFamily: font(typography.caption.weight) }]}>
          {t('more.childrenScreen.premiumNote')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topRow: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  list: { gap: spacing.md, marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 20, color: colors.tealDark },
  name: { fontSize: typography.body.fontSize, color: colors.ink },
  meta: { fontSize: typography.caption.fontSize, color: colors.ink2, marginTop: 2 },
  premiumNote: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
