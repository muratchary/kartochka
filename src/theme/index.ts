import type { SupportedLanguage } from '../i18n';

export const colors = {
  teal: '#2A7F7F',
  tealDark: '#1F6363',
  tealSoft: '#E8F1F0',
  tealLine: '#BFD7D5',

  amber: '#F0A848',
  amberDark: '#D88E2E',
  amberSoft: '#FBE9CC',

  bg: '#FAFAF7',
  surface: '#FFFFFF',
  ink: '#1A2E2E',
  ink2: '#5A6E6E',
  ink3: '#8FA0A0',
  border: '#E0E5E5',
  border2: '#EDF0F0',

  success: '#4A9D6E',
  successSoft: '#E4F2EB',
  warning: '#E89B3C',
  warningSoft: '#FBEBD3',
  error: '#C75959',
  errorSoft: '#F6E2E2',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  sheet: 24,
  pill: 999,
} as const;

const RTL_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set(['ar']);

export function fontFamily(lang: SupportedLanguage, weight: 400 | 500 | 600 | 700 | 800): string {
  if (RTL_LANGUAGES.has(lang)) {
    const arWeight = Math.min(weight, 700) as 400 | 500 | 600 | 700;
    return `IBMPlexSansArabic_${arWeight}${arWeightSuffix[arWeight]}`;
  }
  return `Nunito_${weight}${nunitoWeightSuffix[weight]}`;
}

const nunitoWeightSuffix: Record<400 | 500 | 600 | 700 | 800, string> = {
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold',
};

const arWeightSuffix: Record<400 | 500 | 600 | 700, string> = {
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
};

export const typography = {
  display: { fontSize: 30, weight: 800 as const, letterSpacing: -0.5 },
  title: { fontSize: 24, weight: 800 as const, letterSpacing: -0.4 },
  h2: { fontSize: 18, weight: 800 as const },
  body: { fontSize: 15, weight: 600 as const },
  caption: { fontSize: 12, weight: 600 as const },
  eyebrow: { fontSize: 11, weight: 800 as const, letterSpacing: 0.4 },
} as const;
