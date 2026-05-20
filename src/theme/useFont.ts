import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '../i18n';
import { fontFamily } from './index';

export type FontWeight = 400 | 500 | 600 | 700 | 800;

export function useFont(): (weight: FontWeight) => string {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en') as SupportedLanguage;
  return (weight) => fontFamily(lang, weight);
}
