import { env } from '@/lib/env';
import { createMockApi } from '@/api/mock';
import { createSupabaseApi } from '@/api/supabase';
import type { Api } from '@/api/types';

export type { Api } from '@/api/types';
export type {
  CatalogPort,
  SubmissionPort,
  GoodsReceiptPort,
  AuthPort,
  NotificationPort,
  ScannerPort,
} from '@/api/types';

let instance: Api | null = null;

/**
 * Liefert die aktive API-Implementierung. Die Wahl trifft `EXPO_PUBLIC_API_MODE`
 * (`mock` per Default, `supabase` ab AP-0.2). Screens importieren nur diese Funktion.
 */
export function getApi(): Api {
  if (!instance) {
    instance = env.apiMode === 'supabase' ? createSupabaseApi() : createMockApi();
  }
  return instance;
}

/** Nur für Tests: erzwingt beim nächsten `getApi()` eine frische Instanz. */
export function resetApi(): void {
  instance = null;
}
