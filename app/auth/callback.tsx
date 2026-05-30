import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fullSync } from '../../src/lib/sync';
import { supabase } from '../../src/lib/supabase';
import { usePurchasesStore } from '../../src/stores/purchasesStore';
import { colors, spacing, typography } from '../../src/theme';
import { useFont } from '../../src/theme/useFont';

/**
 * Deep-link landing for the Supabase OAuth flow.
 *
 * On Android, after the in-app browser completes Google sign-in, Supabase
 * redirects to `kartochka://auth/callback?code=…`. Chrome Custom Tabs hands
 * the URL back to Android, which opens our app at this route (it can't
 * always re-emit through WebBrowser.openAuthSessionAsync the way iOS does).
 *
 * We read the `code` query param, exchange it for a Supabase session, then
 * route the user home. If something goes wrong, we still navigate away so
 * the user isn't stuck on a blank screen.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const font = useFont();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    (async () => {
      try {
        if (params.error) {
          // Supabase returned an error (user cancelled, OAuth rejected, etc.)
          throw new Error(params.error_description || params.error);
        }
        if (!params.code) {
          // No code in the URL — nothing to exchange. Probably a stale deep link.
          router.replace('/');
          return;
        }

        // Android's WebBrowser.openAuthSessionAsync sometimes intercepts the
        // OAuth redirect AND the OS also routes the same deep link to this
        // screen, so we can race a parallel exchange attempt in authStore.
        // If a session is already set, the other path won. Skip the exchange
        // (the code is already consumed and Supabase would throw "PKCE code
        // verifier not found in storage") and just route home.
        const { data: existing } = await supabase.auth.getSession();
        if (existing.session) {
          router.replace('/');
          return;
        }

        // exchangeCodeForSession takes the auth code string, NOT a URL.
        // Passing a URL causes "invalid flow state" because Supabase tries
        // to look up the URL itself as the code in its PKCE flow table.
        const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
        if (error) throw error;

        if (data.user) {
          usePurchasesStore.getState().identify(data.user.id).catch(() => {});
          fullSync(data.user.id).catch(() => {});
        }
      } catch {
        // Silently route home. Genuine errors are already surfaced by the
        // primary sign-in flow in authStore.signInWithProvider; landing
        // here on an error means we're the *secondary* path and the user
        // shouldn't see a second alert.
      } finally {
        router.replace('/');
      }
    })();
  }, [params.code, params.error, params.error_description, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={[styles.label, { fontFamily: font(600) }]}>{t('signIn.signingIn')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  label: { fontSize: typography.body.fontSize, color: colors.ink2 },
});
