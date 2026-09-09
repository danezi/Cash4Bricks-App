import { useState } from 'react';
import { View } from 'react-native';

import type { SubmissionStatus } from '@/domain';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  ListRow,
  LoadingState,
  Screen,
  StatusBadge,
  Text,
  useTheme,
} from '@/ui';

const STATUSES: SubmissionStatus[] = [
  'submitted',
  'under_review',
  'offer_sent',
  'accepted',
  'received',
  'payment_initiated',
  'paid',
];

/** Entwicklungs-Übersicht aller Designsystem-Bausteine. Nicht Teil der Nutzer-Navigation. */
export default function UiDemo() {
  const { spacing } = useTheme();
  const [value, setValue] = useState('');

  return (
    <Screen>
      <Text variant="title">Designsystem</Text>

      <Text variant="label" tone="muted">
        BUTTONS
      </Text>
      <View style={{ gap: spacing.sm }}>
        <Button label="Angebot anfordern" onPress={() => {}} />
        <Button label="Weiteres Set" variant="secondary" onPress={() => {}} />
        <Button label="Abbrechen" variant="ghost" onPress={() => {}} />
        <Button label="Wird gesendet" loading onPress={() => {}} />
        <Button label="Nicht verfügbar" disabled onPress={() => {}} />
      </View>

      <Text variant="label" tone="muted">
        EINGABE
      </Text>
      <Input
        label="E-Mail"
        value={value}
        onChangeText={setValue}
        placeholder="name@beispiel.de"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input label="Telefon" value="" onChangeText={() => {}} error="Pflichtfeld" />

      <Text variant="label" tone="muted">
        STATUS
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {STATUSES.map((s) => (
          <StatusBadge key={s} status={s} />
        ))}
      </View>

      <Text variant="label" tone="muted">
        LISTE
      </Text>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <ListRow
          title="LEGO Star Wars X-Wing"
          subtitle="75355 · Menge 2"
          trailing={<Text tone="muted">120 €</Text>}
        />
        <ListRow
          title="LEGO Technic Ferrari"
          subtitle="42143 · Menge 1"
          trailing={<Text tone="muted">95 €</Text>}
        />
      </Card>

      <Text variant="label" tone="muted">
        ZUSTÄNDE
      </Text>
      <Card>
        <LoadingState />
      </Card>
      <Card>
        <EmptyState
          title="Noch keine Sammlung"
          hint="Scanne dein erstes LEGO-Set, um zu starten."
        />
      </Card>
      <Card>
        <ErrorState onRetry={() => {}} />
      </Card>
    </Screen>
  );
}
