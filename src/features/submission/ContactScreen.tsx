import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { contactInfoSchema, type ContactInfo } from '@/domain';
import { Button, Card, Input, Screen, Text } from '@/ui';

export interface ContactScreenProps {
  setCount: number;
  totalQty: number;
  onSubmit: (contact: ContactInfo) => void | Promise<void>;
  submitting?: boolean;
}

/**
 * Kontaktformular (AP-1.6): E-Mail + Telefon, Zod-validiert über React Hook Form.
 * Bekommt Summen + Aktion als Props — kennt weder `CollectionContext` noch `getApi()`.
 */
export function ContactScreen({
  setCount,
  totalQty,
  onSubmit,
  submitting = false,
}: ContactScreenProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInfo>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: { contactEmail: '', contactPhone: '' },
  });

  return (
    <Screen>
      <Card>
        <Text variant="bodyStrong">Deine Kontaktdaten</Text>
        <Text tone="muted">
          {setCount} {setCount === 1 ? 'Set' : 'Sets'} · {totalQty} Stück gesamt
        </Text>
      </Card>

      <Controller
        control={control}
        name="contactEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <Card>
            <Input
              label="E-Mail-Adresse"
              placeholder="du@beispiel.de"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.contactEmail?.message}
            />
          </Card>
        )}
      />

      <Controller
        control={control}
        name="contactPhone"
        render={({ field: { onChange, onBlur, value } }) => (
          <Card>
            <Input
              label="Telefonnummer"
              placeholder="0151 23456789"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.contactPhone?.message}
            />
          </Card>
        )}
      />

      <Button
        label="Angebot anfordern"
        loading={submitting}
        onPress={handleSubmit((values) => onSubmit(values))}
      />
    </Screen>
  );
}
