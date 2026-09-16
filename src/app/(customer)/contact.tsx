import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { getApi } from '@/api';
import type { ContactInfo } from '@/domain';
import { useCollection } from '@/features/submission/CollectionContext';
import { ContactScreen } from '@/features/submission/ContactScreen';

export default function Contact() {
  const router = useRouter();
  const collection = useCollection();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(contact: ContactInfo) {
    setSubmitting(true);
    try {
      await getApi().submissions.createSubmission({
        ...contact,
        items: collection.items.map(({ setNumber, setName, qty, source }) => ({
          setNumber,
          setName,
          qty,
          source,
        })),
      });
      collection.clear();
      Alert.alert(
        'Anfrage gesendet',
        'Vielen Dank! Wir prüfen deine LEGO-Sammlung innerhalb von 24 Stunden und melden uns mit deinem persönlichen Angebot.',
        [{ text: 'OK', onPress: () => router.replace('/') }],
      );
    } catch {
      Alert.alert(
        'Das hat nicht geklappt',
        'Deine Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ContactScreen
      setCount={collection.totals.setCount}
      totalQty={collection.totals.totalQty}
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  );
}
