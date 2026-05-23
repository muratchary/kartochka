import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Child, CountryVaccinationSchedule, VaccinationRecord } from '../types';
import { dueDateForDose } from './vaccinationStatus';

const DAYS_BEFORE_DUE = 1;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (current.canAskAgain) {
    const result = await Notifications.requestPermissionsAsync();
    return result.granted;
  }
  return false;
}

export async function scheduleVaccineReminders(
  child: Child,
  schedule: CountryVaccinationSchedule,
  vaccinations: VaccinationRecord[],
  buildBody: (vaccineNameEn: string, doseNumber: number, totalDoses: number) => string,
  reminderTitle: string,
): Promise<void> {
  const status = await Notifications.getPermissionsAsync();
  if (!status.granted) return;

  await cancelChildReminders(child.id);

  const childRecords = vaccinations.filter((v) => v.childId === child.id);
  const now = Date.now();

  for (const vaccine of schedule.vaccines) {
    for (const dose of vaccine.doses) {
      const done = childRecords.some(
        (r) => r.vaccineCode === vaccine.code && r.doseNumber === dose.doseNumber,
      );
      if (done) continue;

      const dueDate = dueDateForDose(child.dateOfBirth, dose.recommendedAgeMonths);
      const triggerAt = new Date(dueDate.getTime() - DAYS_BEFORE_DUE * MS_PER_DAY);
      if (triggerAt.getTime() <= now) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: reminderIdentifier(child.id, vaccine.code, dose.doseNumber),
        content: {
          title: reminderTitle,
          body: buildBody(vaccine.displayName.en, dose.doseNumber, vaccine.doses.length),
          data: {
            kind: 'vaccine-reminder',
            childId: child.id,
            vaccineCode: vaccine.code,
            doseNumber: dose.doseNumber,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerAt,
        },
      });
    }
  }
}

export async function cancelChildReminders(childId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => (n.content.data as { childId?: string } | null)?.childId === childId)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function reminderIdentifier(childId: string, vaccineCode: string, doseNumber: number): string {
  return `vaccine-${childId}-${vaccineCode}-${doseNumber}`;
}

const GROWTH_REMINDER_WEEKS = 6;
const GROWTH_REMINDER_ID_PREFIX = 'growth-reminder-';

export async function scheduleGrowthReminder(
  childId: string,
  lastMeasuredDate: string | null,
  title: string,
  body: string,
): Promise<void> {
  const status = await Notifications.getPermissionsAsync();
  if (!status.granted) return;

  // Cancel any existing growth reminder for this child
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(`${GROWTH_REMINDER_ID_PREFIX}${childId}`))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  const baseline = lastMeasuredDate ? new Date(lastMeasuredDate) : new Date();
  const triggerAt = new Date(baseline.getTime() + GROWTH_REMINDER_WEEKS * 7 * MS_PER_DAY);
  if (triggerAt.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `${GROWTH_REMINDER_ID_PREFIX}${childId}-${Date.now()}`,
    content: {
      title,
      body,
      data: { kind: 'growth-reminder', childId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerAt,
    },
  });
}

export function isNotificationsSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
