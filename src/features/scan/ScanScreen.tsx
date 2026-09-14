import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Linking, StyleSheet, View } from 'react-native';

import { acceptScan, createScanGate } from '@/features/scan/scanGate';
import { t } from '@/lib/i18n';
import { Button, ScannerFrame, Screen, Text, useTheme } from '@/ui';

export interface ScannedCode {
  type: string;
  data: string;
}

export interface ScanScreenProps {
  onDetected: (code: ScannedCode) => void;
}

/**
 * Kamera-Scan-Bildschirm (AP-1.3). Erkennt EAN-13/EAN-8/UPC-A und meldet jeden
 * Treffer — höchstens alle 1,5 s einen, per `scanGate` — über `onDetected` nach
 * außen. Die Auflösung Barcode → Set (AP-1.4) passiert dort, nicht hier.
 */
export function ScanScreen({ onDetected }: ScanScreenProps) {
  const { spacing } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const gateRef = useRef(createScanGate());

  // Berechtigungsstatus wird noch geladen.
  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Screen>
        <Text variant="heading">{t('scan.permissionTitle')}</Text>
        <Text tone="muted">
          {permission.canAskAgain ? t('scan.permissionBody') : t('scan.permissionDeniedBody')}
        </Text>
        <Button
          label={permission.canAskAgain ? t('scan.permissionCta') : t('scan.openSettings')}
          onPress={() => {
            if (permission.canAskAgain) {
              requestPermission();
            } else {
              Linking.openSettings();
            }
          }}
        />
      </Screen>
    );
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (!acceptScan(gateRef.current, Date.now())) {
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
      // Haptik ist ein Nice-to-have; ein Fehlschlag darf den Scan nicht blockieren.
    });
    onDetected({ type: result.type, data: result.data });
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <ScannerFrame />
      <View style={{ position: 'absolute', top: spacing.md, right: spacing.md }}>
        <Button
          label={torchOn ? t('scan.torchOff') : t('scan.torchOn')}
          variant="secondary"
          onPress={() => setTorchOn((v) => !v)}
        />
      </View>
    </View>
  );
}
