import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { SeedlingMark } from '../../src/components/brand/SeedlingMark';
import { Wordmark } from '../../src/components/brand/Wordmark';
import { useChildrenStore } from '../../src/stores/childrenStore';
import { colors, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const seedDemoData = useChildrenStore((s) => s.seedDemoData);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <View style={styles.markCircle}>
          <SeedlingMark size={140} radius={140 * 0.22} />
        </View>
        <View style={styles.wordmark}>
          <Wordmark size={28} />
        </View>
        <Text
          style={[
            styles.tagline,
            { fontFamily: font(typography.body.weight) },
          ]}>
          {t('brand.tagline')}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.privacy,
            { fontFamily: font(typography.caption.weight) },
          ]}>
          {t('onboarding.welcome.privacy')}
        </Text>
        <Button
          label={t('onboarding.welcome.cta')}
          variant="primary"
          size="lg"
          full
          onPress={() => router.push('/onboarding/country')}
        />
        {__DEV__ && (
          <Pressable
            onPress={() => {
              seedDemoData();
              router.replace('/(tabs)');
            }}
            hitSlop={8}>
            <Text style={[styles.demoLink, { fontFamily: font(600) }]}>
              {t('onboarding.welcome.tryDemo')}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCircle: {
    marginBottom: spacing.xl,
  },
  wordmark: { marginBottom: spacing.md },
  tagline: {
    fontSize: 16,
    color: colors.ink2,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  footer: {
    gap: spacing.md,
  },
  demoLink: {
    fontSize: typography.body.fontSize,
    color: colors.teal,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  privacy: {
    fontSize: typography.caption.fontSize,
    color: colors.ink3,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
