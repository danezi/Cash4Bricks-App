import { Stack } from 'expo-router';

import { initSentry, Sentry } from '@/lib/sentry';

initSentry();

function RootLayout() {
  return <Stack />;
}

export default Sentry.wrap(RootLayout);
