import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/ui/theme';

type Variant = 'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'caption';
type Tone = 'default' | 'muted' | 'primary' | 'danger' | 'success';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
}

export function Text({ variant = 'body', tone = 'default', style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  const toneColor = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
  }[tone];

  return <RNText style={[typography[variant], { color: toneColor }, style]} {...rest} />;
}
