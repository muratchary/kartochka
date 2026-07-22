import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';
import { Alert, Linking, Platform } from 'react-native';

const INSTALLED_AT_KEY = 'kartochka.rating.installedAt';
const SESSIONS_KEY = 'kartochka.rating.sessions';
const PROMPTED_VERSION_KEY = 'kartochka.rating.promptedVersion';

const MIN_DAYS_SINCE_INSTALL = 3;
const MIN_SESSIONS = 2;

// User-initiated "write a review" destinations (allowed to be linked directly;
// only the unsolicited native prompt is rate-limited by Apple).
const IOS_WRITE_REVIEW_URL = 'https://apps.apple.com/app/id6773370520?action=write-review';
const ANDROID_STORE_URL = 'https://www.rustore.ru/catalog/app/app.kartochka';

const SUPPORT_EMAIL_URL = 'mailto:support@kartochka.app?subject=Kartochka%20feedback';

type T = (key: string) => string;

/** Call once per app launch (root layout). Tracks install date + session count. */
export async function registerAppSession(): Promise<void> {
  try {
    const [[, installedAt], [, sessions]] = await AsyncStorage.multiGet([
      INSTALLED_AT_KEY,
      SESSIONS_KEY,
    ]);
    const writes: [string, string][] = [
      [SESSIONS_KEY, String((Number(sessions) || 0) + 1)],
    ];
    if (!installedAt) writes.push([INSTALLED_AT_KEY, new Date().toISOString()]);
    await AsyncStorage.multiSet(writes);
  } catch {
    // storage unavailable — prompting will just stay conservative
  }
}

/**
 * Maybe show the rating flow after a high-value moment (successful PDF export,
 * 3rd meaningful record). Guards: ≥3 days since install, ≥2 sessions, at most
 * once per app version (Apple additionally caps the native prompt at 3/365d
 * and may silently not show it). A soft "Enjoying Kartochka?" pre-prompt
 * routes unhappy users to support email instead of the store.
 */
export async function maybePromptForReview(t: T): Promise<void> {
  try {
    const version = Constants.expoConfig?.version ?? '0';
    const entries = await AsyncStorage.multiGet([
      INSTALLED_AT_KEY,
      SESSIONS_KEY,
      PROMPTED_VERSION_KEY,
    ]);
    const installedAt = entries[0][1];
    const sessions = Number(entries[1][1]) || 0;
    const promptedVersion = entries[2][1];

    if (promptedVersion === version) return;
    if (sessions < MIN_SESSIONS) return;
    if (!installedAt) return;
    const daysSinceInstall =
      (Date.now() - new Date(installedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceInstall < MIN_DAYS_SINCE_INSTALL) return;

    // Burn the attempt up front so a crash/dismiss never causes a re-ask loop.
    await AsyncStorage.setItem(PROMPTED_VERSION_KEY, version);

    Alert.alert(t('rating.preTitle'), t('rating.preBody'), [
      {
        text: t('rating.preNo'),
        style: 'cancel',
        onPress: () => {
          Linking.openURL(SUPPORT_EMAIL_URL).catch(() => {});
        },
      },
      {
        text: t('rating.preYes'),
        onPress: () => {
          StoreReview.requestReview().catch(() => {});
        },
      },
    ]);
  } catch {
    // never let rating logic break a real flow
  }
}

/** User-initiated "Rate Kartochka" row (More tab). */
export function openWriteReview(): void {
  const url = Platform.OS === 'ios' ? IOS_WRITE_REVIEW_URL : ANDROID_STORE_URL;
  Linking.openURL(url).catch(() => {});
}
