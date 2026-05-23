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

export function dueDateForDose(
  dateOfBirth: string,
  recommendedAgeMonths: number,
  prevDoseGivenDate?: string | null,
  minimumIntervalDays = 28,
): Date {
  const birth = new Date(dateOfBirth);
  const scheduledDate = new Date(birth.getTime() + recommendedAgeMonths * DAYS_PER_MONTH * MS_PER_DAY);
  if (prevDoseGivenDate) {
    const prevGiven = new Date(prevDoseGivenDate);
    const earliestFromPrev = new Date(prevGiven.getTime() + minimumIntervalDays * MS_PER_DAY);
    return earliestFromPrev > scheduledDate ? earliestFromPrev : scheduledDate;
  }
  return scheduledDate;
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

      // For catch-up: base due date on when the previous dose was actually given
      const prevRecord = dose.doseNumber > 1
        ? childRecords.find(
            (r) => r.vaccineCode === vaccine.code && r.doseNumber === dose.doseNumber - 1,
          )
        : null;
      const dueDate = dueDateForDose(
        child.dateOfBirth,
        dose.recommendedAgeMonths,
        prevRecord?.administeredOn ?? null,
      );
      const daysFromNow = Math.round((dueDate.getTime() - now.getTime()) / MS_PER_DAY);
      const status = statusFromDays(daysFromNow);

      if (!best || dueDate.getTime() < best.dueDate.getTime()) {
        best = { vaccine, dose, dueDate, status, daysFromNow };
      }
    }
  }

  return best;
}
