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

/**
 * Window-aware status: a dose is only "overdue" once the LATEST acceptable
 * date has passed. Past the recommended date but still inside the acceptable
 * window reads as "due-soon" — not the alarming red "overdue" — so parents
 * aren't told they're late when they're medically still on time. Falls back to
 * the recommended-date behavior when a schedule provides no latest window.
 */
export function statusFromWindow(
  daysFromNow: number,
  latestDate: Date | null,
  now: Date = new Date(),
): DueStatus {
  if (latestDate && now.getTime() > latestDate.getTime()) return 'overdue';
  if (daysFromNow < 0) return latestDate ? 'due-soon' : 'overdue';
  if (daysFromNow <= 30) return 'due-soon';
  if (daysFromNow <= 90) return 'upcoming';
  return 'far-future';
}

export interface DoseDueInfo {
  dueDate: Date;
  latestDate: Date | null;
  status: DueStatus;
  daysFromNow: number;
}

/**
 * Single source of truth for a dose's due date + status. Accounts for catch-up
 * (a delayed previous dose pushes this one out by the minimum interval) and
 * uses the acceptable-age window for the overdue threshold. Pass the child's
 * own vaccination records so the previous-dose date can be found.
 */
export function doseDueInfo(
  child: Child,
  vaccine: VaccineScheduleEntry,
  dose: VaccineDose,
  childRecords: VaccinationRecord[],
  now: Date = new Date(),
): DoseDueInfo {
  const prevDate =
    dose.doseNumber > 1
      ? childRecords.find(
          (r) => r.vaccineCode === vaccine.code && r.doseNumber === dose.doseNumber - 1,
        )?.administeredOn ?? null
      : null;
  const dueDate = dueDateForDose(child.dateOfBirth, dose.recommendedAgeMonths, prevDate);
  const latestDate =
    dose.latestAgeMonths != null
      ? dueDateForDose(child.dateOfBirth, dose.latestAgeMonths, prevDate)
      : null;
  const daysFromNow = Math.round((dueDate.getTime() - now.getTime()) / MS_PER_DAY);
  return { dueDate, latestDate, status: statusFromWindow(daysFromNow, latestDate, now), daysFromNow };
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

      const { dueDate, status, daysFromNow } = doseDueInfo(child, vaccine, dose, childRecords, now);

      if (!best || dueDate.getTime() < best.dueDate.getTime()) {
        best = { vaccine, dose, dueDate, status, daysFromNow };
      }
    }
  }

  return best;
}
