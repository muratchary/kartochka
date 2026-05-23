import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../src/components/Card';
import { ScreenTitle } from '../src/components/ScreenTitle';
import type { SupportedLanguage } from '../src/i18n';
import { useChildrenStore } from '../src/stores/childrenStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

export default function SwitchChildScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const lang = (i18n.language || 'en') as SupportedLanguage;

  const children = useChildrenStore((s) => s.children);
  const selectedChildId = useChildrenStore((s) => s.selectedChildId);
  const setSelectedChild = useChildrenStore((s) => s.setSelectedChild);

  const handlePick = (id: string) => {
    setSelectedChild(id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <ScreenTitle
          title={t('more.switchChildScreen.title')}
          subtitle={t('more.switchChildScreen.subtitle')}
        />
        <View style={styles.list}>
          {children.map((c) => {
            const letter = c.name.trim().charAt(0).toUpperCase() || '?';
            const active = c.id === selectedChildId || (!selectedChildId && c.id === children[0]?.id);
            return (
              <Pressable key={c.id} onPress={() => handlePick(c.id)}>
                <Card style={[styles.card, active && styles.cardActive]}>
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
                    {active && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.teal} />
                    )}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(date: Date, lang: SupportedLanguage): string {
  try {
    const locale = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topRow: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  list: { gap: spacing.md },
  card: { padding: spacing.lg },
  cardActive: { borderColor: colors.tealLine, backgroundColor: colors.tealSoft },
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
});
