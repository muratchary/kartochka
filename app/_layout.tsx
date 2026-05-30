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
import { useEffect, useState } from 'react';
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

  // Deep link from notification taps
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | null;
      if (data?.url === '/milestone-album') {
        router.push('/milestone-album');
      }
    });
    return () => sub.remove();
  }, [router]);

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
