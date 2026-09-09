import { Card, Screen, Text } from '@/ui';

export default function Index() {
  return (
    <Screen>
      <Text variant="title">Cash4Bricks</Text>
      <Card>
        <Text variant="heading">Projekt-Gerüst (M0)</Text>
        <Text tone="muted">
          Toolchain, API-Adapter mit Mock und das Designsystem stehen. Die eigentlichen Screens
          kommen ab M1. Die Komponenten-Übersicht liegt unter der Route „ui-demo“.
        </Text>
      </Card>
    </Screen>
  );
}
