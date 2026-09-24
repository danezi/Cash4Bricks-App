import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

let client: SupabaseClient | null = null;

/**
 * Liefert den Supabase-Client (lazy, einmalig). `env.ts` garantiert bereits,
 * dass URL/Key im `supabase`-Modus gesetzt sind (Fail-fast beim App-Start) —
 * hier also ohne erneute Prüfung nutzbar.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
