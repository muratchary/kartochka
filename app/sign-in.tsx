import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../src/stores/authStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const { user, isSigningIn, signInWithProvider, signOut } = useAuthStore();

  const handleSignIn = async (provider: 'apple' | 'google') => {
    try {
      await signInWithProvider(provider);
      if (useAuthStore.getState().user) {
        router.back();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'not_configured') {
        Alert.alert(t('signIn.notConfiguredTitle'), t('signIn.notConfiguredBody'));
      } else if (msg === 'expo_go') {
        Alert.alert(t('signIn.expoGoTitle'), t('signIn.expoGoBody'));
      } else {
        Alert.alert(t('signIn.errorTitle'), t('signIn.errorBody'));
      }
    }
  };

  const handleSignOut = async () => {
    Alert.alert(t('signIn.signOutConfirmTitle'), t('signIn.signOutConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('signIn.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.back();
        },
      },
    ]);
  };

  // Already signed in
  if (user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.ink2} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={48} color={colors.teal} />
          </View>
          <Text style={[styles.title, { fontFamily: font(800) }]}>{t('signIn.signedInTitle')}</Text>
          <Text style={[styles.email, { fontFamily: font(600) }]}>
            {user.email ?? user.phone ?? t('signIn.noEmail')}
          </Text>

          <View style={styles.buttonStack}>
            <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={[styles.primaryBtnText, { fontFamily: font(700) }]}>
                {t('common.close')}
              </Text>
            </Pressable>
            <Pressable style={styles.ghostBtn} onPress={handleSignOut}>
              <Text style={[styles.ghostBtnText, { fontFamily: font(600) }]}>
                {t('signIn.signOut')}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Close / skip */}
      <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="close" size={24} color={colors.ink2} />
      </Pressable>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="cloud-upload-outline" size={48} color={colors.teal} />
        </View>

        {/* Text */}
        <Text style={[styles.title, { fontFamily: font(800) }]}>{t('signIn.title')}</Text>
        <Text style={[styles.subtitle, { fontFamily: font(600) }]}>{t('signIn.subtitle')}</Text>

        {/* Buttons */}
        <View style={styles.buttonStack}>
          {/* Apple — iOS only (no native Sign in with Apple on Android). */}
          {Platform.OS === 'ios' && (
            <Pressable
              style={[styles.providerBtn, styles.appleBtn]}
              onPress={() => handleSignIn('apple')}
              disabled={isSigningIn}>
              {isSigningIn ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                  <Text style={[styles.appleBtnText, { fontFamily: font(600) }]}>
                    {t('signIn.apple')}
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Google */}
          <Pressable
            style={[styles.providerBtn, styles.googleBtn]}
            onPress={() => handleSignIn('google')}
            disabled={isSigningIn}>
            {isSigningIn ? (
              <ActivityIndicator color={colors.ink} size="small" />
            ) : (
              <>
                {/* Google "G" — simple text since we can't import SVG easily */}
                <Text style={[styles.googleG, { fontFamily: font(700) }]}>G</Text>
                <Text style={[styles.googleBtnText, { fontFamily: font(600) }]}>
                  {t('signIn.google')}
                </Text>
              </>
            )}
          </Pressable>

          {/* Skip */}
          <Pressable style={styles.skipBtn} onPress={() => router.back()}>
            <Text style={[styles.skipText, { fontFamily: font(600) }]}>{t('signIn.skip')}</Text>
          </Pressable>
        </View>

        {/* Privacy note */}
        <Text style={[styles.note, { fontFamily: font(500) }]}>{t('signIn.note')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  closeBtn: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10, padding: spacing.sm },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.title.fontSize,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  email: { fontSize: 16, color: colors.teal, textAlign: 'center' },

  buttonStack: { width: '100%', gap: spacing.md, marginTop: spacing.sm },

  providerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  appleBtn: { backgroundColor: '#000' },
  appleBtnText: { color: '#fff', fontSize: 16 },
  googleBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  googleG: { fontSize: 17, color: '#4285F4' },
  googleBtnText: { color: colors.ink, fontSize: 16 },

  skipBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { fontSize: 15, color: colors.ink3 },

  primaryBtn: {
    backgroundColor: colors.teal,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16 },
  ghostBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  ghostBtnText: { fontSize: 15, color: colors.error },

  note: { fontSize: 12, color: colors.ink3, textAlign: 'center', lineHeight: 18, maxWidth: 280 },
});
