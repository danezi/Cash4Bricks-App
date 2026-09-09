import { View } from 'react-native';

import { t } from '@/lib/i18n';
import { Text } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

/**
 * Statisches Sucher-Overlay für den Scan-Screen: abgedunkelter Rand, freies
 * Zielfenster mit Eckmarken, Hinweistext. Die Kamera selbst kommt in AP-1.3.
 */
export function ScannerFrame({ hint = t('scan.hint') }: { hint?: string }) {
  const { colors, radius, spacing } = useTheme();
  const corner = {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    borderColor: colors.primaryText,
    borderWidth: 3,
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000000AA',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.lg,
      }}
    >
      <View
        style={{
          width: '78%',
          aspectRatio: 1.6,
          borderRadius: radius.md,
          backgroundColor: 'transparent',
        }}
      >
        <View style={[corner, { top: -3, left: -3, borderRightWidth: 0, borderBottomWidth: 0 }]} />
        <View style={[corner, { top: -3, right: -3, borderLeftWidth: 0, borderBottomWidth: 0 }]} />
        <View style={[corner, { bottom: -3, left: -3, borderRightWidth: 0, borderTopWidth: 0 }]} />
        <View style={[corner, { bottom: -3, right: -3, borderLeftWidth: 0, borderTopWidth: 0 }]} />
      </View>
      <Text
        style={{ color: colors.primaryText, textAlign: 'center', paddingHorizontal: spacing.xl }}
      >
        {hint}
      </Text>
    </View>
  );
}
