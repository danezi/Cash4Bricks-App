import { t } from '@/lib/i18n';
import { EmptyState, Screen } from '@/ui';

/** Platzhalter — der echte Scan-Screen (Kamera + EAN-13) folgt in AP-1.3. */
export default function ScanStub() {
  return (
    <Screen>
      <EmptyState title={t('scanStub.title')} hint={t('scanStub.hint')} />
    </Screen>
  );
}
