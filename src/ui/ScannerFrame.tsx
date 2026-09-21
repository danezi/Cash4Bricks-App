import { StyleSheet, View } from 'react-native';

import { t } from '@/lib/i18n';
import { Text } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

const WINDOW_WIDTH = '78%';
const WINDOW_ASPECT_RATIO = 1.6;

/**
 * Sucher-Overlay für den Scan-Screen: abgedunkelter Rand rund um ein echtes,
 * durchsichtiges Zielfenster mit Eckmarken. Wird als Geschwister-Element direkt
 * über einer `CameraView` platziert (absolut positioniert, deckungsgleich).
 *
 * Vier-Banden-Technik statt eines flächigen Overlays mit „transparentem" Fenster
 * darin: Ein Kind-View mit `backgroundColor: transparent` zeigt nur, was der
 * *eigene* Elternknoten bereits gezeichnet hat — nicht die Kamera dahinter. Nur
 * eine echte Lücke zwischen vier separaten, abgedunkelten Flächen lässt die
 * Kamera im Fenster sichtbar durchscheinen.
 */
// Das Overlay liegt über der Kamera, nicht über dem App-Hintergrund — es bleibt
// deshalb bewusst fest dunkel/hell in beiden Farbschemata (kein `colors.*`, das
// würde im Dark Mode z. B. `primaryText` auf Fast-Schwarz drehen und Markierungen
// samt Hinweistext auf dem schwarzen Rand unsichtbar machen).
const OVERLAY_DIM_COLOR = '#000000AA';
const OVERLAY_FOREGROUND = '#FFFFFF';

export function ScannerFrame({ hint = t('scan.hint') }: { hint?: string }) {
  const { spacing } = useTheme();
  const dim = { backgroundColor: OVERLAY_DIM_COLOR };
  const corner = {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    borderColor: OVERLAY_FOREGROUND,
    borderWidth: 3,
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[{ flex: 1 }, dim]} />
      <View style={{ flexDirection: 'row' }}>
        <View style={[{ flex: 1 }, dim]} />
        <View style={{ width: WINDOW_WIDTH, aspectRatio: WINDOW_ASPECT_RATIO }}>
          <View
            style={[corner, { top: -3, left: -3, borderRightWidth: 0, borderBottomWidth: 0 }]}
          />
          <View
            style={[corner, { top: -3, right: -3, borderLeftWidth: 0, borderBottomWidth: 0 }]}
          />
          <View
            style={[corner, { bottom: -3, left: -3, borderRightWidth: 0, borderTopWidth: 0 }]}
          />
          <View
            style={[corner, { bottom: -3, right: -3, borderLeftWidth: 0, borderTopWidth: 0 }]}
          />
        </View>
        <View style={[{ flex: 1 }, dim]} />
      </View>
      <View style={[{ flex: 1, alignItems: 'center', paddingTop: spacing.lg }, dim]}>
        <Text
          style={{ color: OVERLAY_FOREGROUND, textAlign: 'center', paddingHorizontal: spacing.xl }}
        >
          {hint}
        </Text>
      </View>
    </View>
  );
}
