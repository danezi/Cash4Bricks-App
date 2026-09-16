import { View } from 'react-native';

import { Button, Screen, Text, useTheme } from '@/ui';

export interface ConfirmationScreenProps {
  contactEmail: string;
  onDone: () => void;
}

/**
 * Bestätigungs-Screen (AP-1.7): eigener Bildschirm statt Pop-up, nach erfolgreichem
 * "Angebot anfordern". Zeigt den im Lastenheft vorgegebenen Bestätigungstext.
 */
export function ConfirmationScreen({ contactEmail, onDone }: ConfirmationScreenProps) {
  const { spacing } = useTheme();

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <Text variant="heading" style={{ textAlign: 'center' }}>
          Vielen Dank!
        </Text>
        <Text style={{ textAlign: 'center' }}>
          Wir prüfen deine LEGO-Sammlung innerhalb von 24 Stunden und melden uns mit deinem
          persönlichen Angebot.
        </Text>
        <Text tone="muted" style={{ textAlign: 'center' }}>
          Wir melden uns per E-Mail an {contactEmail}.
        </Text>
      </View>
      <Button label="Zurück zur Startseite" onPress={onDone} />
    </Screen>
  );
}
