import AE from '../data/vaccinations/AE.json';
import KZ from '../data/vaccinations/KZ.json';
import RU from '../data/vaccinations/RU.json';
import SA from '../data/vaccinations/SA.json';
import TR from '../data/vaccinations/TR.json';
import UZ from '../data/vaccinations/UZ.json';
import type { CountryVaccinationSchedule } from '../types';

const SCHEDULES: Record<string, CountryVaccinationSchedule> = {
  AE: AE as CountryVaccinationSchedule,
  KZ: KZ as CountryVaccinationSchedule,
  RU: RU as CountryVaccinationSchedule,
  SA: SA as CountryVaccinationSchedule,
  TR: TR as CountryVaccinationSchedule,
  UZ: UZ as CountryVaccinationSchedule,
};

export function getSchedule(countryCode: string): CountryVaccinationSchedule | null {
  return SCHEDULES[countryCode] ?? null;
}
