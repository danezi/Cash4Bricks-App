import type { Api } from '@/api/types';

/**
 * Platzhalter für den echten Supabase-Adapter. Die Umschaltung existiert schon
 * (`EXPO_PUBLIC_API_MODE=supabase`), die Implementierung folgt ab AP-0.2
 * (Supabase-Grundschema + RLS). Bis dahin schlägt jeder Aufruf klar erkennbar fehl.
 */
export function createSupabaseApi(): Api {
  const notReady = (): never => {
    throw new Error(
      'Supabase-Adapter noch nicht implementiert (AP-0.2). Bis dahin EXPO_PUBLIC_API_MODE=mock nutzen.',
    );
  };

  return {
    catalog: {
      searchSets: notReady,
      resolveBarcode: notReady,
      confirmBarcode: notReady,
    },
    submissions: {
      createSubmission: notReady,
      listSubmissions: notReady,
      getSubmission: notReady,
    },
    goodsReceipt: {
      scan: notReady,
      addAdjustment: notReady,
      closeDeal: notReady,
    },
    auth: {
      requestOtp: notReady,
      verifyOtp: notReady,
      currentSession: () => null,
      signOut: notReady,
    },
    notifications: {
      sendSubmissionReceived: notReady,
      sendDealClosed: notReady,
    },
    scanner: {
      isSupported: () => false,
    },
  };
}
