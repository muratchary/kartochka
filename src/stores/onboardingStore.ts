import { create } from 'zustand';

import type { SupportedLanguage } from '../i18n';
import type { Sex } from '../types';

interface OnboardingState {
  country: string | null;
  language: SupportedLanguage | null;
  name: string;
  dateOfBirth: string | null;
  sex: Sex | null;
  setCountry: (country: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setName: (name: string) => void;
  setDateOfBirth: (date: string) => void;
  setSex: (sex: Sex) => void;
  reset: () => void;
}

const initial: Pick<OnboardingState, 'country' | 'language' | 'name' | 'dateOfBirth' | 'sex'> = {
  country: null,
  language: null,
  name: '',
  dateOfBirth: null,
  sex: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setCountry: (country) => set({ country }),
  setLanguage: (language) => set({ language }),
  setName: (name) => set({ name }),
  setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
  setSex: (sex) => set({ sex }),
  reset: () => set(initial),
}));
