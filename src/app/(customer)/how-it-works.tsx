import { useRouter } from 'expo-router';

import { HowItWorksScreen } from '@/features/home/HowItWorksScreen';

export default function HowItWorks() {
  const router = useRouter();

  return <HowItWorksScreen onCtaPress={() => router.push('/scan')} />;
}
