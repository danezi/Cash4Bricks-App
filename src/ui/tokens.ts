/**
 * Design-Tokens für das Cash4Bricks-Designsystem.
 * Ziel laut Pflichtenheft (NF-07): hell, clean, modern, vertrauenswürdig — bewusst
 * NICHT das dunkelblau/gold des bestehenden cash-4-bricks-Auftritts.
 *
 * Marken-Feinschliff (Logo, exakte Farben, ggf. eigene Schrift) folgt mit OP-07;
 * bis dahin ist die Systemschrift gesetzt und die Palette neutral-vertrauenswürdig.
 */

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  focus: string;
}

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    bg: '#FFFFFF',
    surface: '#F7F8FA',
    surfaceAlt: '#EEF1F5',
    border: '#E1E5EA',
    text: '#1A1D21',
    textMuted: '#5C636B',
    primary: '#1E6FE0',
    primaryText: '#FFFFFF',
    success: '#1F8A4C',
    warning: '#9A6700',
    danger: '#C7341F',
    info: '#1E6FE0',
    focus: '#1E6FE0',
  },
  dark: {
    bg: '#121417',
    surface: '#1B1E22',
    surfaceAlt: '#23272C',
    border: '#2C3036',
    text: '#E7E9EC',
    textMuted: '#9AA1A9',
    primary: '#4C93F0',
    primaryText: '#0C1116',
    success: '#3FB268',
    warning: '#D9A441',
    danger: '#F1705C',
    info: '#4C93F0',
    focus: '#4C93F0',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export interface TypeStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing?: number;
}

export const typography: Record<
  'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'caption',
  TypeStyle
> = {
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  label: { fontSize: 13, lineHeight: 16, fontWeight: '600', letterSpacing: 0.3 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
};

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
