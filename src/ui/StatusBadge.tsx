import { View } from 'react-native';

import { t } from '@/lib/i18n';
import type { SubmissionStatus } from '@/domain';
import { Text } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

type Tone = 'neutral' | 'info' | 'progress' | 'success';

const TONE_BY_STATUS: Record<SubmissionStatus, Tone> = {
  submitted: 'neutral',
  under_review: 'info',
  offer_sent: 'info',
  accepted: 'progress',
  received: 'progress',
  payment_initiated: 'progress',
  paid: 'success',
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const { colors, radius, spacing } = useTheme();
  const tone = TONE_BY_STATUS[status];

  const fg = {
    neutral: colors.textMuted,
    info: colors.info,
    progress: colors.warning,
    success: colors.success,
  }[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: fg,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
      }}
    >
      <Text variant="label" style={{ color: fg }}>
        {t(`status.${status}`)}
      </Text>
    </View>
  );
}
