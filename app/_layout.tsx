import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { initI18n } from '../src/i18n';
import { useAuthStore } from '../src/stores/authStore';
import { useChildrenStore } from '../src/stores/childrenStore';
import { usePurchasesStore } from '../src/stores/purchasesStore';
import { colors } from '../src/theme';

export default function RootLayout() {
  const router = useRouter();
  const [i18nReady, setI18nReady] = useState(false);
  const [storeHydrated, setStoreHydrated] = useState(() =>
    useChildrenStore.persist.hasHydrated(),
  );
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  const initializePurchases = usePurchasesStore((s) => s.initialize);
  const initializeAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if (storeHydrated) return;
    const unsub = useChildrenStore.persist.onFinishHydration(() => setStoreHydrated(true));
    if (useChildrenStore.persist.hasHydrated()) setStoreHydrated(true);
    return unsub;
  }, [storeHydrated]);

  // Initialize RevenueCat and auth after fonts + i18n are ready
  useEffect(() => {
    if (!i18nReady || !storeHydrated) return;
    initializePurchases();
    initializeAuth();
  }, [i18nReady, storeHydrated, initializePurchases, initializeAuth]);

  // Route a notification tap to the screen it's about. Previously only the
  // milestone nudge was handled, so every other tap (vaccine reminder, overdue
  // alert, growth reminder) just dropped the user on the home tab.
  const routeFromNotification = useCallback(
    (data: Record<string, unknown> | null | undefined) => {
      if (!data) return;
      // Switch to the child the notification is about so the destination shows
      // the right child's data. (If the id no longer exists, the store falls
      // back to the first child.)
      if (typeof data.childId === 'string') {
        try {
          useChildrenStore.getState().setSelectedChild(data.childId);
        } catch {
          // ignore — navigation still proceeds
        }
      }

      const kind = typeof data.kind === 'string' ? data.kind : null;
      const code = typeof data.vaccineCode === 'string' ? data.vaccineCode : null;
      const dose = typeof data.doseNumber === 'number' ? data.doseNumber : null;

      if (kind === 'vaccine-reminder' || kind === 'overdue-vaccine') {
        // Vaccine detail route is /vaccine/<code>_<doseNumber>.
        if (code && dose != null) router.push(`/vaccine/${code}_${dose}`);
        else router.push('/(tabs)/vaccines');
      } else if (kind === 'growth-reminder') {
        router.push('/(tabs)/growth');
      } else if (kind === 'milestone-nudge' || data.url === '/milestone-album') {
        router.push('/milestone-album');
      }
    },
    [router],
  );

  // Deep link from notification taps (while the app is running or backgrounded).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      routeFromNotification(
        response.notification.request.content.data as Record<string, unknown> | null,
      );
    });
    return () => sub.remove();
  }, [routeFromNotification]);

  if (!i18nReady || !fontsLoaded || !storeHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="vaccine/[id]" />
      <Stack.Screen name="vaccine/mark-done" options={{ presentation: 'modal' }} />
      <Stack.Screen name="growth/add" options={{ presentation: 'modal' }} />
      <Stack.Screen name="more/language" />
      <Stack.Screen name="more/notifications" />
      <Stack.Screen name="more/children" />
      <Stack.Screen name="more/add-child" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="switch-child" options={{ presentation: 'modal' }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
      <Stack.Screen name="partner-sharing" />
      <Stack.Screen name="milestone-album" />
      <Stack.Screen name="redeem" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
