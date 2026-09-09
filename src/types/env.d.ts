// Von der App gelesene Umgebungsvariablen. Nur `EXPO_PUBLIC_*` landet im Client-Bundle.
declare namespace NodeJS {
  interface ProcessEnv {
    /** Sentry DSN. Fehlt er, ist das Error-Monitoring deaktiviert. */
    EXPO_PUBLIC_SENTRY_DSN?: string;
    /** Umgebungsname für Sentry (z. B. "development", "staging", "production"). */
    EXPO_PUBLIC_ENV?: string;
    /** Backend-Modus des API-Adapters. */
    EXPO_PUBLIC_API_MODE?: 'mock' | 'supabase';
  }
}

declare const __DEV__: boolean;
