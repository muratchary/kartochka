import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pykfgyfkmbbsciirdshs.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5a2ZneWZrbWJic2NpaXJkc2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTA2OTAsImV4cCI6MjA5NTM4NjY5MH0.869zQEe_j5OB79xWYsoJrCUdFtQbSPzYwBGfZesPfyU';

export const isSupabaseConfigured =
  !SUPABASE_URL.includes('YOUR_PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Expo handles deep links manually
  },
});
