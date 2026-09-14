import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
}

export function Input({ label, error, onFocus, onBlur, ...rest }: InputProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.focus : colors.border;

  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={{
          ...typography.body,
          color: colors.text,
          backgroundColor: colors.surface,
          borderColor,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
        }}
        {...rest}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
