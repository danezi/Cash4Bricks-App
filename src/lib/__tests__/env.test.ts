import { env } from '@/lib/env';

describe('env', () => {
  it('faellt ohne EXPO_PUBLIC_API_MODE auf den Mock-Modus zurueck', () => {
    expect(env.apiMode).toBe('mock');
  });

  it('liefert einen gueltigen appEnv-Wert', () => {
    expect(['development', 'preview', 'production']).toContain(env.appEnv);
  });
});
