import type {
  Child,
  CountryVaccinationSchedule,
  VaccinationRecord,
  VaccineDose,
  VaccineScheduleEntry,
} from '../types';

const DAYS_PER_MONTH = 30.4375;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type DueStatus = 'overdue' | 'due-soon' | 'upcoming' | 'far-future';

export interface NextDue {
  vaccine: VaccineScheduleEntry;
  dose: VaccineDose;
  dueDate: Date;
  status: DueStatus;
  daysFromNow: number;
}

export function dueDateForDose(dateOfBirth: string, recommendedAgeMonths: number): Date {
  const birth = new Date(dateOfBirth);
  const daysToAdd = recommendedAgeMonths * DAYS_PER_MONTH;
  return new Date(birth.getTime() + daysToAdd * MS_PER_DAY);
}

export function statusFromDays(daysFromNow: number): DueStatus {
  if (daysFromNow < 0) return 'overdue';
  if (daysFromNow <= 30) return 'due-soon';
  if (daysFromNow <= 90) return 'upcoming';
  return 'far-future';
}

export function nextDueVaccine(
  child: Child,
  schedule: CountryVaccinationSchedule,
  vaccinations: VaccinationRecord[],
  now: Date = new Date(),
): NextDue | null {
  const childRecords = vaccinations.filter((v) => v.childId === child.id);

  let best: NextDue | null = null;

  for (const vaccine of schedule.vaccines) {
    for (const dose of vaccine.doses) {
      const isDone = childRecords.some(
        (r) => r.vaccineCode === vaccine.code && r.doseNumber === dose.doseNumber,
      );
      if (isDone) continue;

      const dueDate = dueDateForDose(child.dateOfBirth, dose.recommendedAgeMonths);
      const daysFromNow = Math.round((dueDate.getTime() - now.getTime()) / MS_PER_DAY);
      const status = statusFromDays(daysFromNow);

      if (!best || dueDate.getTime() < best.dueDate.getTime()) {
        best = { vaccine, dose, dueDate, status, daysFromNow };
      }
    }
  }

  return best;
}
