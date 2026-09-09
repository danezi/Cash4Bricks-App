import { t } from '@/lib/i18n';

describe('t', () => {
  it('löst verschachtelte Schlüssel auf', () => {
    expect(t('status.paid')).toBe('Ausgezahlt');
    expect(t('common.retry')).toBe('Erneut versuchen');
  });

  it('gibt unbekannte Schlüssel unverändert zurück', () => {
    // @ts-expect-error absichtlich ungültiger Schlüssel
    expect(t('does.not.exist')).toBe('does.not.exist');
  });
});
