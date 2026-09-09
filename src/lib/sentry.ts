import * as Sentry from '@sentry/react-native';

import { env } from '@/lib/env';

/** true, wenn ein DSN gesetzt ist und Sentry initialisiert wird. */
export const sentryEnabled = Boolean(env.sentryDsn);

/**
 * Initialisiert das Error-Monitoring. Ohne `EXPO_PUBLIC_SENTRY_DSN` ist es ein No-op –
 * so laufen lokale Entwicklung, Tests und CI ohne Sentry-Konto.
 */
export function initSentry(): void {
  if (!sentryEnabled) {
    return;
  }

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    // Kein Performance-Tracing im MVP – nur Fehler.
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}

export { Sentry };
