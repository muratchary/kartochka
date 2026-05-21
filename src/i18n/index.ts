import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { I18nManager } from 'react-native';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'ar', 'tr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const RTL_LANGUAGES: readonly SupportedLanguage[] = ['ar'];
const LANGUAGE_STORAGE_KEY = 'kartochka.language';

function isSupported(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

function detectDeviceLanguage(): SupportedLanguage {
  for (const locale of getLocales()) {
    const code = locale.languageCode;
    if (code && isSupported(code)) return code;
  }
  return 'en';
}

async function getStoredLanguage(): Promise<SupportedLanguage | null> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored && isSupported(stored) ? stored : null;
}

function applyRTL(lang: SupportedLanguage): boolean {
  const shouldBeRTL = RTL_LANGUAGES.includes(lang);
  if (I18nManager.isRTL === shouldBeRTL) return false;
  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);
  return true;
}

export async function setLanguage(lang: SupportedLanguage): Promise<{ rtlChanged: boolean }> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
  return { rtlChanged: applyRTL(lang) };
}

export async function initI18n(): Promise<void> {
  const stored = await getStoredLanguage();
  const initialLang = stored ?? detectDeviceLanguage();
  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      ar: { translation: ar },
      tr: { translation: tr },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
  applyRTL(initialLang);
}

export default i18n;
