import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import Purchases, {
  LOG_LEVEL,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { supabase } from '../lib/supabase';

// ─── Keys ────────────────────────────────────────────────────────────────────
// Public client keys — safe to ship in app bundles.
// Source: RevenueCat → Project Settings → API Keys.
// iOS keys start with `appl_`, Android with `goog_`.
const RC_KEY = Platform.select({
  ios: 'appl_PKjJDBBAJmwnTPrkkfFytTYglgm',
  android: 'goog_VvmJlZQlQkcuIinlDDYbwHOgfKu',
}) ?? 'appl_PKjJDBBAJmwnTPrkkfFytTYglgm';

const ENTITLEMENT_ID = 'Kartochka Pro';

// Promo-code grant (tester / launch). Persisted locally so Premium survives
// app restarts independently of any App Store / Play purchase. Decoupled from
// RevenueCat on purpose — works even before the Paid Apps Agreement is live.
const PROMO_KEY = 'kartochka.promoGranted';
const PROMO_DEVICE_KEY = 'kartochka.promoDeviceId';

// ─────────────────────────────────────────────────────────────────────────────

type ActivePackageType = 'monthly' | 'annual' | null;

export type RedeemResult = {
  ok: boolean;
  reason: 'granted' | 'already' | 'invalid' | 'exhausted' | 'network';
};

async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(PROMO_DEVICE_KEY);
  if (!id) {
    id = Crypto.randomUUID();
    await AsyncStorage.setItem(PROMO_DEVICE_KEY, id);
  }
  return id;
}

interface PurchasesState {
  isPremium: boolean;
  isLoading: boolean;
  offering: PurchasesOffering | null;
  // True when Premium was unlocked via a promo code (not a store purchase).
  promoGranted: boolean;
  // Which plan the user currently holds (null if not premium or product id unknown).
  activePackageType: ActivePackageType;
  initialize: () => Promise<void>;
  refreshEntitlements: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  // Redeem a shared promo code against the Supabase cap. On success, Premium
  // is granted locally and persisted.
  redeemCode: (code: string) => Promise<RedeemResult>;
  // Tie this RC anonymous user id to a real auth user id so the entitlement
  // survives uninstall / device-switch. Safe to call repeatedly.
  identify: (userId: string) => Promise<void>;
  // Cut the link to a real auth user (called on sign-out). RC reverts to
  // anonymous id; entitlements on this device persist until restore.
  logOut: () => Promise<void>;
}

function packageTypeFromProductId(productId: string | undefined): ActivePackageType {
  if (!productId) return null;
  const id = productId.toLowerCase();
  if (id.includes('annual') || id.includes('yearly') || id.includes('year')) return 'annual';
  if (id.includes('month')) return 'monthly';
  return null;
}

export const usePurchasesStore = create<PurchasesState>((set, get) => ({
  isPremium: false,
  isLoading: false,
  offering: null,
  promoGranted: false,
  activePackageType: null,

  initialize: async () => {
    // Load any persisted promo grant first so Premium is correct even if RC
    // is unavailable (e.g. Expo Go) or returns no entitlement.
    try {
      const granted = (await AsyncStorage.getItem(PROMO_KEY)) === 'true';
      if (granted) set({ promoGranted: true, isPremium: true });
    } catch {
      // ignore storage errors — fall through to RC
    }
    try {
      Purchases.setLogLevel(LOG_LEVEL.WARN);
      Purchases.configure({ apiKey: RC_KEY });
      await get().refreshEntitlements();
    } catch {
      // Native module unavailable in Expo Go — remain in free tier
    }
  },

  refreshEntitlements: async () => {
    try {
      set({ isLoading: true });
      const [info, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      const entitlement = info.entitlements.active[ENTITLEMENT_ID];
      const isPremium = !!entitlement;
      set({
        // Promo grant keeps Premium on even when RC reports no entitlement.
        isPremium: isPremium || get().promoGranted,
        activePackageType: isPremium
          ? packageTypeFromProductId(entitlement?.productIdentifier)
          : null,
        offering: offerings.current,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  purchasePackage: async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      set({ isLoading: true });
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      const isPremium = !!entitlement;
      set({
        isPremium: isPremium || get().promoGranted,
        activePackageType: isPremium
          ? packageTypeFromProductId(entitlement?.productIdentifier)
          : null,
        isLoading: false,
      });
      return isPremium;
    } catch (e: unknown) {
      set({ isLoading: false });
      if (e && typeof e === 'object' && 'userCancelled' in e && e.userCancelled) return false;
      throw e;
    }
  },

  restorePurchases: async (): Promise<boolean> => {
    try {
      set({ isLoading: true });
      const info = await Purchases.restorePurchases();
      const entitlement = info.entitlements.active[ENTITLEMENT_ID];
      const isPremium = !!entitlement;
      set({
        isPremium: isPremium || get().promoGranted,
        activePackageType: isPremium
          ? packageTypeFromProductId(entitlement?.productIdentifier)
          : null,
        isLoading: false,
      });
      return isPremium;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  redeemCode: async (code: string): Promise<RedeemResult> => {
    const trimmed = code.trim();
    if (!trimmed) return { ok: false, reason: 'invalid' };
    try {
      const deviceId = await getDeviceId();
      const { data, error } = await supabase.rpc('redeem_promo', {
        p_code: trimmed,
        p_device_id: deviceId,
      });
      if (error) return { ok: false, reason: 'network' };
      const res = (data ?? {}) as { ok?: boolean; reason?: RedeemResult['reason'] };
      if (res.ok) {
        await AsyncStorage.setItem(PROMO_KEY, 'true');
        set({ promoGranted: true, isPremium: true });
        return { ok: true, reason: res.reason === 'already' ? 'already' : 'granted' };
      }
      return { ok: false, reason: res.reason === 'exhausted' ? 'exhausted' : 'invalid' };
    } catch {
      return { ok: false, reason: 'network' };
    }
  },

  identify: async (userId: string) => {
    try {
      await Purchases.logIn(userId);
      await get().refreshEntitlements();
    } catch {
      // RC unavailable (Expo Go etc.) — silent no-op
    }
  },

  logOut: async () => {
    try {
      await Purchases.logOut();
      await get().refreshEntitlements();
    } catch {
      // RC unavailable — silent no-op
    }
  },
}));
