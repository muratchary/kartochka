import { Platform } from 'react-native';

import { supabase } from './supabase';

/**
 * Anonymous, fire-and-forget usage ping: one row per completed PDF export
 * (no user id, no child data — just platform + UI language). This is the
 * app's only activation metric; it fails silently offline.
 */
export function logPdfExport(lang: string): void {
  supabase
    .from('pdf_exports')
    .insert({ platform: Platform.OS, lang })
    .then(() => {}, () => {});
}
