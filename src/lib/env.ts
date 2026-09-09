/**
 * Zentraler, typisierter Zugriff auf die Umgebungsvariablen der App.
 *
 * Regeln:
 * - Nur `EXPO_PUBLIC_*` wird von Expo ins App-Bundle übernommen — diese Werte sind
 *   im Client sichtbar und dürfen keine Geheimnisse enthalten.
 * - Serverseitige Geheimnisse (API-Keys, Service-Role-Key, Sentry-Auth-Token) gehören
 *   in Supabase- bzw. EAS-Secrets, nicht hierher.
 * - Kein Modul liest `process.env` direkt; alles läuft über dieses `env`-Objekt.
 */

export type ApiMode = 'mock' | 'supabase';
export type AppEnv = 'development' | 'preview' | 'production';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

function readApiMode(): ApiMode {
  return process.env.EXPO_PUBLIC_API_MODE === 'supabase' ? 'supabase' : 'mock';
}

function readAppEnv(): AppEnv {
  const value = process.env.EXPO_PUBLIC_ENV;
  if (value === 'production' || value === 'preview' || value === 'development') {
    return value;
  }
  return isDev ? 'development' : 'production';
}

export const env = {
  /** Welche Adapter-Implementierung `src/api` nutzt. Default: `mock`. */
  apiMode: readApiMode(),
  /** Logischer Umgebungsname (Sentry-Environment, Feature-Flags). */
  appEnv: readAppEnv(),
  /** Supabase-Projekt-URL. Nur im `supabase`-Modus erforderlich. */
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  /** Öffentlicher Supabase-Anon-Key (RLS schützt die Daten). */
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  /** Sentry-DSN. Leer → Error-Monitoring deaktiviert. */
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
} as const;

// Fail-fast: im supabase-Modus müssen URL und Key gesetzt sein.
if (env.apiMode === 'supabase' && (!env.supabaseUrl || !env.supabaseAnonKey)) {
  const message =
    'EXPO_PUBLIC_API_MODE=supabase, aber EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY fehlen.';
  if (isDev) {
    throw new Error(message);
  }
  console.error(message);
}
