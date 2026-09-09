import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
}

export function ListRow({ title, subtitle, leading, trailing, onPress }: ListRowProps) {
  const { colors, spacing } = useTheme();
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean }) => [
        styles.row,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
          backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {leading ? <View>{leading}</View> : null}
      <View style={styles.center}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  center: {
    flex: 1,
    gap: 2,
  },
});
