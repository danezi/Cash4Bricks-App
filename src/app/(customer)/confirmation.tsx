import { useLocalSearchParams, useRouter } from 'expo-router';

import { ConfirmationScreen } from '@/features/submission/ConfirmationScreen';

export default function Confirmation() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return <ConfirmationScreen contactEmail={email ?? ''} onDone={() => router.replace('/')} />;
}
