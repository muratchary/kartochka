import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../src/stores/authStore';
import { colors, radii, spacing, typography } from '../src/theme';
import { useFont } from '../src/theme/useFont';

// Minimal email shape check — Supabase rejects truly invalid addresses
// server-side anyway, this just prevents obvious typos.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const font = useFont();
  const { user, isSigningIn, signInWithProvider, signInWithEmail, signOut } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSignIn = async (provider: 'apple' | 'google') => {
    try {
      await signInWithProvider(provider);
      if (useAuthStore.getState().user) {
        router.back();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === 'not_configured') {
        Alert.alert(t('signIn.notConfiguredTitle'), t('signIn.notConfiguredBody'));
      } else if (msg === 'expo_go') {
        Alert.alert(t('signIn.expoGoTitle'), t('signIn.expoGoBody'));
      } else {
        // Surface the actual error so we can debug Google OAuth in TestFlight.
        // TODO: switch back to friendly generic message once we know what's
        // failing in the wild.
        Alert.alert(t('signIn.errorTitle'), msg || t('signIn.errorBody'));
      }
    }
  };

  const handleEmailSignIn = async () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      Alert.alert(t('signIn.email.invalidTitle'), t('signIn.email.invalidBody'));
      return;
    }
    try {
      await signInWithEmail(trimmed);
      setEmailSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === 'not_configured') {
        Alert.alert(t('signIn.notConfiguredTitle'), t('signIn.notConfiguredBody'));
      } else {
        Alert.alert(t('signIn.errorTitle'), msg || t('signIn.errorBody'));
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

  // Post-send confirmation view — replaces the form so the user knows the
  // email is on its way and where to look for it.
  if (emailSent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.ink2} />
        </Pressable>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="mail-outline" size={48} color={colors.teal} />
          </View>
          <Text style={[styles.title, { fontFamily: font(800) }]}>
            {t('signIn.email.sentTitle')}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: font(600) }]}>
            {t('signIn.email.sentBody', { email: email.trim() })}
          </Text>
          <View style={styles.buttonStack}>
            <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={[styles.primaryBtnText, { fontFamily: font(700) }]}>
                {t('common.close')}
              </Text>
            </Pressable>
            <Pressable
              style={styles.skipBtn}
              onPress={() => {
                setEmailSent(false);
                setEmail('');
              }}>
              <Text style={[styles.skipText, { fontFamily: font(600) }]}>
                {t('signIn.email.useDifferent')}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        {/* Close / skip */}
        <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.ink2} />
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="cloud-upload-outline" size={48} color={colors.teal} />
          </View>

          {/* Text */}
          <Text style={[styles.title, { fontFamily: font(800) }]}>{t('signIn.title')}</Text>
          <Text style={[styles.subtitle, { fontFamily: font(600) }]}>
            {t('signIn.subtitle')}
          </Text>

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

            {/* Or divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={[styles.orText, { fontFamily: font(600) }]}>
                {t('signIn.email.or')}
              </Text>
              <View style={styles.orLine} />
            </View>

            {/* Email magic link */}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('signIn.email.placeholder')}
              placeholderTextColor={colors.ink3}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              returnKeyType="go"
              editable={!isSigningIn}
              onSubmitEditing={handleEmailSignIn}
              style={[styles.emailInput, { fontFamily: font(600) }]}
            />
            <Pressable
              style={[
                styles.providerBtn,
                styles.emailBtn,
                (!email.trim() || isSigningIn) && styles.emailBtnDisabled,
              ]}
              onPress={handleEmailSignIn}
              disabled={!email.trim() || isSigningIn}>
              {isSigningIn ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.emailBtnText, { fontFamily: font(700) }]}>
                  {t('signIn.email.cta')}
                </Text>
              )}
            </Pressable>

            {/* Skip */}
            <Pressable style={styles.skipBtn} onPress={() => router.back()}>
              <Text style={[styles.skipText, { fontFamily: font(600) }]}>
                {t('signIn.skip')}
              </Text>
            </Pressable>
          </View>

          {/* Privacy note */}
          <Text style={[styles.note, { fontFamily: font(500) }]}>{t('signIn.note')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  closeBtn: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10, padding: spacing.sm },
  content: {
    // flexGrow (not flex) lets content vertically center when it fits AND
    // scroll when it doesn't. With flex: 1 the contentContainer was locked
    // to viewport height, so on shorter screens (or with the keyboard up)
    // the email input + CTA + skip got pushed past the bottom and were
    // unreachable — confirmed via Android tester report.
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    paddingTop: spacing.xxxl,
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

  // Email magic-link UI
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { fontSize: 12, color: colors.ink3, textTransform: 'uppercase', letterSpacing: 0.5 },
  emailInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: 16,
    color: colors.ink,
  },
  emailBtn: { backgroundColor: colors.teal },
  emailBtnDisabled: { opacity: 0.45 },
  emailBtnText: { color: '#fff', fontSize: 16 },
});
