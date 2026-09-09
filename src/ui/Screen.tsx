import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/ui/theme';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
}

/** Standard-Bühne für jeden Screen: SafeArea, Hintergrundfarbe, Padding, Tastatur-Ausweichen. */
export function Screen({ children, scroll = true }: ScreenProps) {
  const { colors, spacing } = useTheme();
  const contentStyle = { padding: spacing.lg, gap: spacing.lg };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={contentStyle}>
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
