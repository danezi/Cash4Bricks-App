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
      const api = getApi();
      const id = await api.submissions.createSubmission({
        ...contact,
        items: collection.items.map(({ setNumber, setName, qty, source }) => ({
          setNumber,
          setName,
          qty,
          source,
        })),
      });
      await api.notifications.sendSubmissionReceived(id).catch(() => {
        // Bestätigungs-E-Mail ist ein Nice-to-have, darf den Erfolgspfad nicht blockieren.
      });
      collection.clear();
      router.replace({ pathname: '/confirmation', params: { email: contact.contactEmail } });
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
