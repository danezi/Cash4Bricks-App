import { type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

function Centered({ children }: { children: ReactNode }) {
  const { spacing } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        gap: spacing.md,
      }}
    >
      {children}
    </View>
  );
}

export function LoadingState({ label = t('common.loading') }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <Centered>
      <ActivityIndicator color={colors.primary} />
      <Text tone="muted">{label}</Text>
    </Centered>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Centered>
      <Text variant="heading">{title}</Text>
      {hint ? (
        <Text tone="muted" style={{ textAlign: 'center' }}>
          {hint}
        </Text>
      ) : null}
    </Centered>
  );
}

export function ErrorState({
  message = t('common.error'),
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Centered>
      <Text tone="danger" variant="bodyStrong">
        {message}
      </Text>
      {onRetry ? <Button variant="secondary" label={t('common.retry')} onPress={onRetry} /> : null}
    </Centered>
  );
}
