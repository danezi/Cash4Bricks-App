# Testprotokoll M1 – Vertikaler Durchstich (AP-1.8)

Stand: 2026-09-17. Deckt die MUSS-Anforderungen LF-C-02 bis LF-C-10 (Kundenfluss
ohne Login/Dashboard/Admin) sowie EK-01/EK-02 ab. Wird bei jedem weiteren M1-Merge
nachgeführt.

## LF-C-Anforderungen: Status

| LF-C    | Anforderung (Kurzform)                               | Automatisiert getestet                                           | Manuell verifiziert                     | Bemerkung                                                                                                                                                                                                                                                                                     |
| ------- | ---------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LF-C-02 | Home-Screen mit 3 Einstiegen                         | `HomeScreen.test.tsx`                                            | Ja (Screenshot 15.09.)                  | —                                                                                                                                                                                                                                                                                             |
| LF-C-03 | Kamera-Scan EAN-13                                   | – (Kamera nicht CI-testbar)                                      | Ja (Android/Expo Go, Screenshot 15.09.) | iOS-Gerät noch nicht getestet (M1-035 offen)                                                                                                                                                                                                                                                  |
| LF-C-04 | Set-Erkennung: Setnummer, Name, **Bild**             | `mock.test.ts`, `ScanResultScreen.test.tsx` (nur Setnummer/Name) | Teilweise                               | **Lücke:** Katalog ist noch der Mock (20 Test-Sets), kein Bild wird angezeigt. `imageUrl` ist im Schema vorbereitet, aber im Mock immer `null` und in `ScanResultScreen.tsx` noch nicht gerendert – bewusst zurückgestellt, bis AP-1.2 echte Bild-URLs liefert (sonst UI ohne testbare Daten) |
| LF-C-05 | „Ist das dein Set?“-Rückfrage + manuelle Eingabe     | `ScanResultScreen.test.tsx` (7 Fälle inkl. Set-Suche)            | Ja                                      | Manuelle Eingabe jetzt suchgestützt (ab 2 Zeichen, Treffer direkt übernehmbar), Freitextfelder bleiben als Fallback                                                                                                                                                                           |
| LF-C-06 | Mengenlogik + Doppel-Scan-Rückfrage                  | `collectionLogic.test.ts`                                        | Ja                                      | —                                                                                                                                                                                                                                                                                             |
| LF-C-07 | Sammlungsliste anzeigen/ändern/löschen/erweitern     | `CollectionListScreen.test.tsx`                                  | Ja                                      | —                                                                                                                                                                                                                                                                                             |
| LF-C-08 | Kontaktdaten E-Mail + Telefon, Pflicht + Validierung | `ContactScreen.test.tsx`                                         | Ja                                      | Feld heißt „Telefonnummer“, nicht explizit „WhatsApp“ – funktional gleichwertig (Pflichtfeld, Format-Validierung), Benennung ggf. mit Annika abstimmen                                                                                                                                        |
| LF-C-09 | „Angebot anfordern“ → Einreichung im Backend anlegen | `mock.test.ts` (Port-Ebene)                                      | Ja (End-to-End auf Handy)               | Route-Datei `contact.tsx` selbst ist wie alle Routen ungetestet (dünner Wrapper), Logik über Port getestet                                                                                                                                                                                    |
| LF-C-10 | Bestätigungs-Screen + Bestätigungs-E-Mail (24h)      | `ConfirmationScreen.test.tsx` (nur Screen)                       | Ja (Screen)                             | **Lücke:** Auto-E-Mail via Resend nicht gebaut (offen, s. README „Offen (AP-1.7, Auto-E-Mail)“)                                                                                                                                                                                               |

**Zusammenfassung:** 8 von 9 Anforderungen inhaltlich erfüllt und automatisiert
abgesichert; 2 bewusste Lücken (Bild-Anzeige hängt an AP-1.2, Auto-E-Mail hängt an
Resend-Zugang) sind dokumentiert, keine stillen Annahmen.

## EK-01 – 20 Sets in unter 10 Minuten erfassen

**Noch nicht gemessen.** Braucht einen realen Durchlauf auf einem Gerät (Stoppuhr,
3 Wiederholungen, Mittelwert). Kann nachgeholt werden, sobald ein Testtermin
steht – unabhängig von AP-1.2, da der Mock-Katalog dafür ausreicht.

## EK-02 – Trefferquote ≥ 80 % bei 20 realen EANs

**Noch nicht sinnvoll messbar.** Der Mock kennt nur 10 fest hinterlegte Test-EANs
(100 % Trefferquote per Definition, nicht aussagekräftig). Eine echte Messung
braucht den realen Katalog/Barcode-Index aus AP-1.2 (Rebrickable + Brickset).
**Blocker:** Rebrickable-API-Key noch nicht vorhanden (kostenlos zu bekommen,
siehe Feinplan-Block M1-011 im Projektplan).

## Automatisierte Testsuite (Gesamtstand)

64 Tests, 13 Suiten, alle grün (`npm test`). CI läuft bei jedem PR
(`.github/workflows/ci.yml`): Lint, Format-Check, Typecheck, Tests.

## Offene Punkte für den Abschluss von AP-1.8

- [ ] EK-01-Messung (3 Durchläufe, Mittelwert) – Termin mit echtem Gerät
- [ ] EK-02-Messung – hängt an AP-1.2 (Katalog/Barcode-Index)
- [ ] iOS-Gerätetest (bisher nur Android/Expo Go getestet)
- [ ] Preview-Build (EAS) auf Gerät installieren
