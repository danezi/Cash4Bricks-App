import { Stack } from 'expo-router';

import { CollectionProvider } from '@/features/submission/CollectionContext';
import { useTheme } from '@/ui';

export default function CustomerLayout() {
  const { colors } = useTheme();

  return (
    <CollectionProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '600' },
          headerBackTitle: '',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="how-it-works" options={{ title: 'So funktioniert es' }} />
        <Stack.Screen name="scan" options={{ title: 'LEGO scannen' }} />
        <Stack.Screen name="list" options={{ title: 'Deine Sammlung' }} />
        <Stack.Screen name="contact" options={{ title: 'Kontaktdaten' }} />
        <Stack.Screen
          name="confirmation"
          options={{ title: 'Angefragt', headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen name="dashboard" options={{ title: 'Mein Dashboard' }} />
      </Stack>
    </CollectionProvider>
  );
}
