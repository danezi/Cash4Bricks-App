import { View } from 'react-native';

import { t } from '@/lib/i18n';
import { Button, Card, Screen, Text, useTheme } from '@/ui';

export interface HomeScreenProps {
  onScanPress: () => void;
  onDashboardPress: () => void;
  onHowItWorksPress: () => void;
}

/**
 * Home-Screen — die drei Einstiege aus dem Lastenheft (§6): scannen, Dashboard,
 * So funktioniert es. Reine Darstellung; die Navigation kommt von außen als Props,
 * damit der Screen ohne Router-Kontext testbar bleibt.
 */
export function HomeScreen({ onScanPress, onDashboardPress, onHowItWorksPress }: HomeScreenProps) {
  const { spacing } = useTheme();

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Text variant="title">Cash4Bricks</Text>
        <Text tone="muted">{t('home.tagline')}</Text>
      </View>

      <Card>
        <Text variant="heading">{t('home.scanTitle')}</Text>
        <Text tone="muted">{t('home.scanSubtitle')}</Text>
        <Button label={t('home.scanCta')} onPress={onScanPress} />
      </Card>

      <Card>
        <Text variant="heading">{t('home.dashboardTitle')}</Text>
        <Text tone="muted">{t('home.dashboardSubtitle')}</Text>
        <Button label={t('home.dashboardCta')} variant="secondary" onPress={onDashboardPress} />
      </Card>

      <Card>
        <Text variant="heading">{t('home.howItWorksTitle')}</Text>
        <Text tone="muted">{t('home.howItWorksSubtitle')}</Text>
        <Button label={t('home.howItWorksCta')} variant="ghost" onPress={onHowItWorksPress} />
      </Card>
    </Screen>
  );
}
