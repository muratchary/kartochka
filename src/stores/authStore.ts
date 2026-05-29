import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
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
      // On iOS, "Sign in with Apple" must use the native API (App Store
      // guideline 4.8). The native flow returns an identity token we hand
      // straight to Supabase — no browser, no redirect URL, no risk of
      // landing on Site URL = localhost.
      if (Platform.OS === 'ios' && provider === 'apple') {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          if (!credential.identityToken) {
            throw new Error('apple_no_identity_token');
          }
          const { data: sessionData, error: idErr } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });
          if (idErr) throw idErr;
          if (sessionData.user) {
            usePurchasesStore.getState().identify(sessionData.user.id).catch(() => {});
            fullSync(sessionData.user.id).catch(() => {});
          }
          return;
        } catch (e: unknown) {
          // ERR_REQUEST_CANCELED = user backed out of the Apple sheet → silent
          if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'ERR_REQUEST_CANCELED') {
            return;
          }
          throw e;
        }
      }

      // Everything else (Google on iOS+Android, Apple on Android — not exposed
      // in UI but defensive) goes through Supabase's OAuth web flow.
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
