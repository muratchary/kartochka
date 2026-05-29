import Purchases, {
  LOG_LEVEL,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { create } from 'zustand';

// ─── Keys ────────────────────────────────────────────────────────────────────
// Public client keys — safe to ship in app bundles.
// Source: RevenueCat → Project Settings → API Keys.
// iOS keys start with `appl_`, Android with `goog_`.
const RC_KEY = Platform.select({
  ios: 'appl_PKjJDBBAJmwnTPrkkfFytTYglgm',
  android: 'goog_VvmJlZQlQkcuIinlDDYbwHOgfKu',
}) ?? 'appl_PKjJDBBAJmwnTPrkkfFytTYglgm';

const ENTITLEMENT_ID = 'Kartochka Pro';

// ─────────────────────────────────────────────────────────────────────────────

type ActivePackageType = 'monthly' | 'annual' | null;

interface PurchasesState {
  isPremium: boolean;
  isLoading: boolean;
  offering: PurchasesOffering | null;
  // Which plan the user currently holds (null if not premium or product id unknown).
  activePackageType: ActivePackageType;
  initialize: () => Promise<void>;
  refreshEntitlements: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
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
  activePackageType: null,

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
      const entitlement = info.entitlements.active[ENTITLEMENT_ID];
      const isPremium = !!entitlement;
      set({
        isPremium,
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
        isPremium,
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
        isPremium,
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
