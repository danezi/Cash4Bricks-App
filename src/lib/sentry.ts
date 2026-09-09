import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

/** true, wenn ein DSN gesetzt ist und Sentry initialisiert wurde. */
export const sentryEnabled = Boolean(dsn);

/**
 * Initialisiert das Error-Monitoring. Ohne `EXPO_PUBLIC_SENTRY_DSN` ist es ein No-op –
 * so laufen lokale Entwicklung, Tests und CI ohne Sentry-Konto.
 */
export function initSentry(): void {
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_ENV ?? (__DEV__ ? 'development' : 'production'),
    // Kein Performance-Tracing im MVP – nur Fehler.
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}

export { Sentry };
