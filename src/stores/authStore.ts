import type { Session, User } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { create } from 'zustand';

import { fullSync, syncDown } from '../lib/sync';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { usePurchasesStore } from './purchasesStore';

interface AuthState {
  session: Session | null;
  user: User | null;
  isSigningIn: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signInWithProvider: (provider: 'apple' | 'google') => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isSigningIn: false,
  initialized: false,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ initialized: true });
      return;
    }
    try {
      const { data } = await supabase.auth.getSession();
      set({ session: data.session, user: data.session?.user ?? null, initialized: true });

      // If there's already a session, pull down any cloud data + tie the
      // RevenueCat anonymous user to this auth user so the entitlement
      // survives reinstall / device switch.
      if (data.session?.user) {
        usePurchasesStore.getState().identify(data.session.user.id).catch(() => {});
        syncDown(data.session.user.id).catch(() => {});
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
        if (session?.user) {
          usePurchasesStore.getState().identify(session.user.id).catch(() => {});
        }
      });
    } catch {
      set({ initialized: true });
    }
  },

  signInWithProvider: async (provider: 'apple' | 'google') => {
    if (!isSupabaseConfigured) {
      throw new Error('not_configured');
    }
    // OAuth deep links can't return to Expo Go — they require a real build.
    // Constants.appOwnership === 'expo' means we're inside the Expo Go app.
    if (Constants.appOwnership === 'expo') {
      throw new Error('expo_go');
    }
    set({ isSigningIn: true });
    try {
      const redirectTo = Linking.createURL('/auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('no_url');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        // Exchange the code for a session (PKCE flow)
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        if (code) {
          const { data: sessionData } = await supabase.auth.exchangeCodeForSession(result.url);
          // Push all local data to Supabase, then pull back merged state.
          // Also tie this user to their RC entitlement so the subscription
          // survives reinstall / device switch.
          if (sessionData.user) {
            usePurchasesStore.getState().identify(sessionData.user.id).catch(() => {});
            fullSync(sessionData.user.id).catch(() => {});
          }
        }
      }
    } finally {
      set({ isSigningIn: false });
    }
  },

  signOut: async () => {
    try {
      if (isSupabaseConfigured) await supabase.auth.signOut();
    } catch {
      // ignore
    }
    // Detach from RC's aliased user; local entitlement on this device is
    // preserved, but new purchases on a different device won't merge until
    // the user signs back in.
    usePurchasesStore.getState().logOut().catch(() => {});
    set({ session: null, user: null });
  },
}));
