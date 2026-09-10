# Cash4Bricks App

Mobile App (iOS & Android) für den Ankauf ungeöffneter LEGO-Sets von privaten Sammlern.
Sammler reichen ihre Sets per Barcode-Scan ein und erhalten ein Angebot; intern wird der
Wareneingang gegen die eingereichte Liste abgeglichen und der Deal abgeschlossen.

- **Grundlage:** Cash4Bricks_Lastenheft_Pflichtenheft (aktuelle Version)
- **Status:** Meilenstein M0 – Toolchain steht, Fachfunktionen ab M1

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
cp .env.example .env   # Werte eintragen (siehe „Umgebungsvariablen")
npx expo start         # Dev-Server; danach i (iOS-Simulator) / a (Android-Emulator) / w (Web)
```

Node laut `.nvmrc` (22); mindestens 20.

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

## Builds (EAS)

`eas.json` definiert drei Build-Profile:

| Profil        | Zweck                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| `development` | Dev-Client-Build (`expo-dev-client`), interne Verteilung, iOS-Simulator |
| `preview`     | interner Test-Build (Android als `.apk`), TestFlight / Play Internal    |
| `production`  | Store-Build, `autoIncrement` der Build-Nummer                           |

Einmalig einrichten (braucht Expo-Konto):

```bash
npx eas-cli login
npx eas-cli init          # legt das EAS-Projekt an, schreibt extra.eas.projectId in app.json
npx eas-cli build --profile development --platform android
```

`eas-cli` wird per `npx` genutzt, ist bewusst **keine** Dependency (hält `npm ci` / CI schlank).

## Umgebungsvariablen

`.env` (aus `.env.example`) wird von Git ignoriert. Nur `EXPO_PUBLIC_*` landet im
App-Bundle – **keine Geheimnisse**. Im Code wird nie direkt `process.env` gelesen,
sondern immer das typisierte Objekt aus [`src/lib/env.ts`](src/lib/env.ts).

| Variable                        | Pflicht             | Default            | Zweck                                                    |
| ------------------------------- | ------------------- | ------------------ | -------------------------------------------------------- |
| `EXPO_PUBLIC_API_MODE`          | –                   | `mock`             | Adapter-Modus: `mock` oder `supabase`                    |
| `EXPO_PUBLIC_ENV`               | –                   | `development`      | logische Umgebung (`development`/`preview`/`production`) |
| `EXPO_PUBLIC_SUPABASE_URL`      | im `supabase`-Modus | –                  | Supabase-Projekt-URL                                     |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | im `supabase`-Modus | –                  | öffentlicher Anon-Key (RLS schützt die Daten)            |
| `EXPO_PUBLIC_SENTRY_DSN`        | –                   | – (Monitoring aus) | Sentry-DSN                                               |

Im `supabase`-Modus ohne URL/Key bricht die App früh ab (in Dev als Fehler, sonst
als `console.error`).

**Serverseitige Geheimnisse** (`SENTRY_AUTH_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`,
`REBRICKABLE_API_KEY`, `BRICKSET_API_KEY`, `RESEND_API_KEY`) gehören in Supabase- bzw.
EAS-Secrets, nicht in `.env`.

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

## Datenbank (Supabase)

Eigenes Projekt, Region EU (Frankfurt). Das Schema liegt als Migrationen in
[`supabase/migrations/`](supabase/migrations/):

| Migration       | Inhalt                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------- |
| `…_schema.sql`  | Enums, acht Tabellen, `handle_new_user`-Trigger (legt `profiles` an)                         |
| `…_rls.sql`     | `is_admin()`-Helfer, RLS auf allen Tabellen, Policies (Kunde = eigene Zeilen, Admin = alles) |
| `…_storage.sql` | Bucket `receipts` + Storage-Policies                                                         |

**Migrationen anwenden** (braucht Supabase-CLI, Personal Access Token, DB-Passwort):

```bash
export SUPABASE_ACCESS_TOKEN=sbp_…
export SUPABASE_DB_PASSWORD='…'
npx supabase link --project-ref <project-ref>   # einmalig
npx supabase db push
```

Eine Person zum Admin machen (nach der ersten Anmeldung), im Supabase SQL-Editor:

```sql
update public.profiles set role = 'admin' where email = 'name@firma.de';
```

`supabase/.temp/` und `.env` sind git-ignoriert; Zugangsdaten kommen nie ins Repo.

## API-Schicht (Ports & Adapter)

Screens sprechen das Backend nie direkt an, sondern über `getApi()` aus
[`src/api/`](src/api/). `src/api/types.ts` definiert sechs rollenreine Ports
(`CatalogPort`, `SubmissionPort`, `GoodsReceiptPort`, `AuthPort`,
`NotificationPort`, `ScannerPort`). `EXPO_PUBLIC_API_MODE` wählt die
Implementierung:

- **`mock`** (Default) – vollständig in-memory, aus Fixtures gespeist
  ([`src/api/mock/`](src/api/mock/)); deterministisch, für Entwicklung und Tests.
- **`supabase`** – noch Platzhalter, wird ab AP-0.2 implementiert.

Die fachlichen Typen und die reinen Geld-Pfad-Funktionen liegen framework-frei in
[`src/domain/`](src/domain/) (Zod-Schemas, `z.infer`-Typen, `estimatedTotal` /
`finalTotal` / `missingItems`).

## Designsystem

[`src/ui/`](src/ui/) – Tokens (`tokens.ts`: Palette hell/dunkel, Spacing, Radius,
Typo) + `ThemeProvider`/`useTheme` + Basiskomponenten: `Text`, `Button`
(primary/secondary/ghost, loading, disabled), `Input` (Label + Fehlertext), `Card`,
`ListRow`, `StatusBadge` (die sieben Einreichungs-Status), `Screen` (SafeArea +
Padding + Keyboard), `ScannerFrame`, `LoadingState` / `EmptyState` / `ErrorState`.

Systemschrift; Ziel hell/clean/vertrauenswürdig. Marken-Feinschliff (Logo, exakte
Farben, ggf. eigene Schrift) folgt mit OP-07.

Alle sichtbaren Strings laufen über `t(...)` aus [`src/lib/i18n.ts`](src/lib/i18n.ts)
(nur Deutsch im MVP). Die Route `ui-demo` zeigt alle Komponenten.

## Lizenz

Proprietär – siehe [LICENSE](LICENSE). © 2026 Cash4Bricks.
