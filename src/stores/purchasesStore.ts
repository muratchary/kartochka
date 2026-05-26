import Purchases, {
  LOG_LEVEL,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { create } from 'zustand';

// ─── Keys ────────────────────────────────────────────────────────────────────
// Replace with production keys from RevenueCat → Project Settings → API Keys
// before App Store / Play Store submission.
// iOS production key starts with `appl_`, Android with `goog_`.
const RC_KEY = Platform.select({
  ios: 'appl_PKjJDBBAJmwnTPrkkfFytTYglgm',
  android: 'test_RsOppJbMSDkQWfNxRcTCBbtIHMt', // replace with goog_xxx when Android is set up
}) ?? 'appl_PKjJDBBAJmwnTPrkkfFytTYglgm';

const ENTITLEMENT_ID = 'Kartochka Pro';

// ─────────────────────────────────────────────────────────────────────────────

interface PurchasesState {
  isPremium: boolean;
  isLoading: boolean;
  offering: PurchasesOffering | null;
  initialize: () => Promise<void>;
  refreshEntitlements: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export const usePurchasesStore = create<PurchasesState>((set, get) => ({
  isPremium: false,
  isLoading: false,
  offering: null,

  initialize: async () => {
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
      set({
        isPremium: ENTITLEMENT_ID in info.entitlements.active,
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
      const isPremium = ENTITLEMENT_ID in customerInfo.entitlements.active;
      set({ isPremium, isLoading: false });
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
      const isPremium = ENTITLEMENT_ID in info.entitlements.active;
      set({ isPremium, isLoading: false });
      return isPremium;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },
}));
