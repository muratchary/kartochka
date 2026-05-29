import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../src/components/Card';
import { ChildAvatar } from '../src/components/ChildAvatar';
import { ScreenTitle } from '../src/components/ScreenTitle';
import { useChildrenStore } from '../src/stores/childrenStore';
import { colors, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

export default function SwitchChildScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();

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
            const active = c.id === selectedChildId || (!selectedChildId && c.id === children[0]?.id);
            return (
              <Pressable key={c.id} onPress={() => handlePick(c.id)}>
                <Card style={[styles.card, active && styles.cardActive]}>
                  <View style={styles.row}>
                    <ChildAvatar name={c.name} photoUri={c.photoUri} size={48} colorSeed={c.id} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.name, { fontFamily: font(700) }]}>{c.name}</Text>
                      <Text style={[styles.meta, { fontFamily: font(600) }]}>
                        {childAgeLabel(c.dateOfBirth, t)} · {t(`countries.${c.countryCode}`)}
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

function childAgeLabel(dob: string, t: (k: string, opts?: Record<string, unknown>) => string): string {
  const totalMonths = Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.4375),
  );
  if (totalMonths <= 0) return t('home.pdf.ageDays', { count: 1 });
  if (totalMonths < 24) return t('home.pdf.ageMonths', { count: totalMonths });
  const years = Math.floor(totalMonths / 12);
  const rem = totalMonths % 12;
  if (rem === 0) return t('home.pdf.ageYears', { count: years });
  return `${t('home.pdf.ageYears', { count: years })} ${t('home.pdf.ageMonths', { count: rem })}`;
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
  name: { fontSize: typography.body.fontSize, color: colors.ink },
  meta: { fontSize: typography.caption.fontSize, color: colors.ink2, marginTop: 2 },
});
