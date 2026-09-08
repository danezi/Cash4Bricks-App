# Cash4Bricks App

Mobile App (iOS & Android) für den Ankauf ungeöffneter LEGO-Sets von privaten Sammlern.
Sammler reichen ihre Sets per Barcode-Scan ein und erhalten ein Angebot; intern wird der
Wareneingang gegen die eingereichte Liste abgeglichen und der Deal abgeschlossen.

- **Grundlage:** Cash4Bricks_Lastenheft_Pflichtenheft (aktuelle Version)
- **Status:** in Entwicklung – Meilenstein M0 (Projekt-Setup)

## Tech-Stack

| Bereich    | Technologie |
|------------|-------------|
| App        | React Native + Expo (Expo Router), TypeScript (strict) |
| Backend    | Supabase (Postgres, Auth, Storage) + Edge Functions (TypeScript) |
| Daten      | Rebrickable (Katalog), Brickset (EAN → Set) |
| E-Mail     | Resend |
| CI / Build | GitHub Actions, EAS Build & Submit |
| Monitoring | Sentry |

## Umgebung aufsetzen

> TODO (M0-002 ff.): Node-Version, `npm install`, `.env`-Variablen, `npx expo start`

## Scripts

> TODO (M0): `lint`, `typecheck`, `test`, `build`

## Projektstruktur

> TODO (M0): `app/` (Screens), `src/` (api, domain, ui, lib), `supabase/` (migrations, functions)

## Lizenz

Proprietär – siehe [LICENSE](LICENSE). © 2026 Cash4Bricks.
