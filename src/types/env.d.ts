// Von der App gelesene Umgebungsvariablen.
// Nur `EXPO_PUBLIC_*` landet im App-Bundle — hier stehen keine Geheimnisse.
// Zugriff ausschließlich über `src/lib/env.ts`, nicht direkt über `process.env`.
declare namespace NodeJS {
  interface ProcessEnv {
    /** Adapter-Modus von `src/api`: `mock` (Default) oder `supabase`. */
    EXPO_PUBLIC_API_MODE?: 'mock' | 'supabase';
    /** Logischer Umgebungsname: `development` | `preview` | `production`. */
    EXPO_PUBLIC_ENV?: 'development' | 'preview' | 'production';
    /** Supabase-Projekt-URL (nur im `supabase`-Modus nötig). */
    EXPO_PUBLIC_SUPABASE_URL?: string;
    /** Öffentlicher Supabase-Anon-Key. */
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    /** Sentry-DSN. Fehlt er, ist das Error-Monitoring deaktiviert. */
    EXPO_PUBLIC_SENTRY_DSN?: string;
  }
}

declare const __DEV__: boolean;
