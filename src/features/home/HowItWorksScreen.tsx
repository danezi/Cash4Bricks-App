import { t } from '@/lib/i18n';
import { Button, Card, Screen, Text } from '@/ui';

export interface HowItWorksScreenProps {
  /** Optional: CTA am Ende der Seite, z. B. direkt zum Scanner. */
  onCtaPress?: () => void;
}

const STEPS = [
  { title: t('howItWorks.step1Title'), body: t('howItWorks.step1Body') },
  { title: t('howItWorks.step2Title'), body: t('howItWorks.step2Body') },
  { title: t('howItWorks.step3Title'), body: t('howItWorks.step3Body') },
  { title: t('howItWorks.step4Title'), body: t('howItWorks.step4Body') },
  { title: t('howItWorks.step5Title'), body: t('howItWorks.step5Body') },
  { title: t('howItWorks.step6Title'), body: t('howItWorks.step6Body') },
] as const;

/** Statische Erklärung des Ankaufprozesses (Lastenheft §6). */
export function HowItWorksScreen({ onCtaPress }: HowItWorksScreenProps) {
  return (
    <Screen>
      <Text tone="muted">{t('howItWorks.subtitle')}</Text>
      {STEPS.map((step) => (
        <Card key={step.title}>
          <Text variant="heading">{step.title}</Text>
          <Text tone="muted">{step.body}</Text>
        </Card>
      ))}
      {onCtaPress ? <Button label={t('howItWorks.cta')} onPress={onCtaPress} /> : null}
    </Screen>
  );
}
