import { useRouter } from 'expo-router';

import { HomeScreen } from '@/features/home/HomeScreen';

export default function Home() {
  const router = useRouter();

  return (
    <HomeScreen
      onScanPress={() => router.push('/scan')}
      onDashboardPress={() => router.push('/dashboard')}
      onHowItWorksPress={() => router.push('/how-it-works')}
    />
  );
}
