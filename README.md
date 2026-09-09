# Cash4Bricks App

Mobile App (iOS & Android) für den Ankauf ungeöffneter LEGO-Sets von privaten Sammlern.
Sammler reichen ihre Sets per Barcode-Scan ein und erhalten ein Angebot; intern wird der
Wareneingang gegen die eingereichte Liste abgeglichen und der Deal abgeschlossen.

- **Grundlage:** Cash4Bricks_Lastenheft_Pflichtenheft (aktuelle Version)
- **Status:** in Entwicklung – Meilenstein M0 (Projekt-Setup)

## Tech-Stack

| Bereich    | Technologie                                                      |
| ---------- | ---------------------------------------------------------------- |
| App        | React Native + Expo (Expo Router), TypeScript (strict)           |
| Backend    | Supabase (Postgres, Auth, Storage) + Edge Functions (TypeScript) |
| Daten      | Rebrickable (Katalog), Brickset (EAN → Set)                      |
| E-Mail     | Resend                                                           |
| CI / Build | GitHub Actions, EAS Build & Submit                               |
| Monitoring | Sentry                                                           |

## Umgebung aufsetzen

```bash
npm install
npx expo start        # Dev-Server; danach i (iOS-Simulator) / a (Android-Emulator) / w (Web)
```

Node ≥ 20 empfohlen. Umgebungsvariablen (später) in `.env` – wird von Git ignoriert.

## Scripts

| Script                                            | Zweck                                        |
| ------------------------------------------------- | -------------------------------------------- |
| `npm start`                                       | Expo Dev-Server                              |
| `npm run android` / `npm run ios` / `npm run web` | Dev-Server direkt auf Zielplattform          |
| `npm run typecheck`                               | `tsc --noEmit`                               |
| `npm run lint` / `npm run lint:fix`               | ESLint (`eslint-config-expo` + Prettier-Off) |
| `npm run format` / `npm run format:check`         | Prettier über das ganze Repo                 |
| `npm test` / `npm run test:watch`                 | Jest (`jest-expo`) + Testing Library         |

Vor jedem Commit läuft automatisch ein Husky-Pre-Commit-Hook: `lint-staged`
(ESLint `--fix` + Prettier auf geänderte Dateien) und anschließend `npm run typecheck`.

CI (GitHub Actions) prüft bei jedem PR: `lint`, `format:check`, `typecheck`, `test`.

## Tests

Jest mit dem `jest-expo`-Preset und `@testing-library/react-native`. Testdateien liegen
neben dem Code unter `__tests__/` bzw. als `*.test.ts(x)`. `render(...)` ist asynchron –
`await render(<Screen />)`.

## Error-Monitoring (Sentry)

`@sentry/react-native` ist eingebunden und wird in `src/app/_layout.tsx` über
`initSentry()` gestartet. Ohne `EXPO_PUBLIC_SENTRY_DSN` ist es ein **No-op** – lokale
Entwicklung, Tests und CI brauchen kein Sentry-Konto.

Aktivieren:

1. In Sentry ein Projekt (Plattform „React Native") anlegen, DSN kopieren.
2. `.env` anlegen (siehe `.env.example`), `EXPO_PUBLIC_SENTRY_DSN=…` setzen.
3. Testfehler auslösen, z. B. `Sentry.captureException(new Error('Sentry Test'))`, und im
   Sentry-Dashboard prüfen, dass das Event ankommt.
4. Für Source-Map-Upload beim EAS-Build zusätzlich `SENTRY_ORG`, `SENTRY_PROJECT`,
   `SENTRY_AUTH_TOKEN` als (nicht öffentliche) Secrets setzen. Solange die fehlen, warnt
   der Config-Plugin beim Build – ohne Funktionsverlust.

> TODO (M0): EAS + `eas.json` (M0-009), `.env`-Konzept finalisieren (M0-010)

## Projektstruktur

```
src/
  app/         Expo-Router-Screens und -Layouts (nur Screens/Layouts)
  api/         Adapter-Schicht (Mock ↔ Supabase, per ENV umschaltbar)
  domain/      Zod-Schemas + Typen der Kernentitäten
  features/    fachliche Bausteine je Anwendungsfall (scan, submission, dashboard, ...)
  ui/          Designsystem: Tokens + Basiskomponenten
  lib/         Querschnitt: Clients, i18n, Helfer
assets/        Icons, Splash, Bilder
```

> `supabase/` (migrations, functions) folgt ab M0-014.

## Lizenz

Proprietär – siehe [LICENSE](LICENSE). © 2026 Cash4Bricks.
