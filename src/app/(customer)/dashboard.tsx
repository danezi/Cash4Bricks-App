import { t } from '@/lib/i18n';
import { EmptyState, Screen } from '@/ui';

/** Platzhalter — Anmeldung + Dashboard folgen in einem späteren Arbeitspaket. */
export default function DashboardStub() {
  return (
    <Screen>
      <EmptyState title={t('dashboardStub.title')} hint={t('dashboardStub.hint')} />
    </Screen>
  );
}
