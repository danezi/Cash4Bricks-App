// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'coverage/*',
      'android/*',
      'ios/*',
      'example/*',
      // Deno-Laufzeit (Supabase Edge Functions): eigenes Modulsystem (URL-/
      // jsr:-Imports, `Deno`-Globals) — nicht mit dem Node/RN-Regelwerk
      // auflösbar. mapping.ts & Tests bleiben regulär gelintet (portables TS).
      'supabase/functions/*/index.ts',
    ],
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
]);
