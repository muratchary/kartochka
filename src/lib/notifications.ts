import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Child, CountryVaccinationSchedule, VaccinationRecord } from '../types';
import { doseDueInfo } from './vaccinationStatus';

const DAYS_BEFORE_DUE = 1;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH = 30.4375;

// Age checkpoints (months) at which we nudge parents to check milestones
const MILESTONE_NUDGE_AGES = [2, 4, 6, 9, 12, 15, 18];

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
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (current.canAskAgain) {
      const result = await Notifications.requestPermissionsAsync();
      return result.granted;
    }
    return false;
  } catch {
    // Native module unhappy (Expo Go edge cases / revoked channel) — treat as
    // "no permission" rather than crashing the caller.
    return false;
  }
}

export async function scheduleVaccineReminders(
  child: Child,
  schedule: CountryVaccinationSchedule,
  vaccinations: VaccinationRecord[],
  buildBody: (vaccineNameEn: string, doseNumber: number, totalDoses: number) => string,
  reminderTitle: string,
): Promise<void> {
 try {
  const status = await Notifications.getPermissionsAsync();
  if (!status.granted) return;

  await cancelChildReminders(child.id);

  const childRecords = vaccinations.filter((v) => v.childId === child.id);
  const now = new Date();

  for (const vaccine of schedule.vaccines) {
    for (const dose of vaccine.doses) {
      const done = childRecords.some(
        (r) => r.vaccineCode === vaccine.code && r.doseNumber === dose.doseNumber,
      );
      if (done) continue;

      const { dueDate } = doseDueInfo(child, vaccine, dose, childRecords, now);
      const triggerAt = new Date(dueDate.getTime() - DAYS_BEFORE_DUE * MS_PER_DAY);
      if (triggerAt.getTime() <= now.getTime()) continue;

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
 } catch {
   // Best-effort scheduling; never let a notification error break the caller.
 }
}

export async function cancelChildReminders(childId: string): Promise<void> {
  // Same defensive wrap as cancelAllReminders — removing a child shouldn't
  // crash because the notification module is unhappy.
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => (n.content.data as { childId?: string } | null)?.childId === childId)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // ignore; best-effort cleanup
  }
}

export async function cancelAllReminders(): Promise<void> {
  // Native module can throw on Android if notifications permissions are in
  // a weird state, OS-level rate limiting hits, or the channel was revoked.
  // Either way, the caller (e.g. More tab → Clear all data) must not crash.
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore; reminder cancellation is best-effort, the local data clear
    // proceeds regardless.
  }
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
 try {
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
 } catch {
   // Best-effort scheduling; never let a notification error break the caller.
 }
}

// ─── Milestone nudge ─────────────────────────────────────────────────────────
// Fires on the exact day the child reaches each age checkpoint.

export async function scheduleMilestoneNudges(
  child: Child,
  buildTitle: (ageMonths: number) => string,
  buildBody: (ageMonths: number) => string,
): Promise<void> {
 try {
  const status = await Notifications.getPermissionsAsync();
  if (!status.granted) return;

  await cancelMilestoneNudges(child.id);

  const dob = new Date(child.dateOfBirth).getTime();
  const now = Date.now();

  for (const ageMonths of MILESTONE_NUDGE_AGES) {
    const triggerAt = new Date(dob + ageMonths * DAYS_PER_MONTH * MS_PER_DAY);
    if (triggerAt.getTime() <= now) continue; // already past this age

    await Notifications.scheduleNotificationAsync({
      identifier: `milestone-nudge-${child.id}-${ageMonths}`,
      content: {
        title: buildTitle(ageMonths),
        body: buildBody(ageMonths),
        data: { kind: 'milestone-nudge', childId: child.id, ageMonths, url: '/milestone-album' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerAt,
      },
    });
  }
 } catch {
   // Best-effort scheduling; never let a notification error break the caller.
 }
}

export async function cancelMilestoneNudges(childId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(`milestone-nudge-${childId}`))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

// ─── Overdue vaccine alert ────────────────────────────────────────────────────
// Fires 7 days after a vaccine's due date if the parent hasn't logged it yet.

export async function scheduleOverdueVaccineAlerts(
  child: Child,
  schedule: CountryVaccinationSchedule,
  vaccinations: VaccinationRecord[],
  buildTitle: (vaccineNameEn: string) => string,
  buildBody: (vaccineNameEn: string, doseNumber: number) => string,
): Promise<void> {
 try {
  const status = await Notifications.getPermissionsAsync();
  if (!status.granted) return;

  await cancelOverdueAlerts(child.id);

  const childRecords = vaccinations.filter((v) => v.childId === child.id);
  const now = new Date();
  const OVERDUE_GRACE_DAYS = 7;

  for (const vaccine of schedule.vaccines) {
    for (const dose of vaccine.doses) {
      const done = childRecords.some(
        (r) => r.vaccineCode === vaccine.code && r.doseNumber === dose.doseNumber,
      );
      if (done) continue;

      // Base the "you're overdue" nudge on the LATEST acceptable date (so we
      // don't cry wolf while the child is still within the window); fall back
      // to the recommended date when no window is defined.
      const { dueDate, latestDate } = doseDueInfo(child, vaccine, dose, childRecords, now);
      const overdueFrom = latestDate ?? dueDate;
      const triggerAt = new Date(overdueFrom.getTime() + OVERDUE_GRACE_DAYS * MS_PER_DAY);
      if (triggerAt.getTime() <= now.getTime()) continue; // already past the grace window

      await Notifications.scheduleNotificationAsync({
        identifier: `overdue-${child.id}-${vaccine.code}-${dose.doseNumber}`,
        content: {
          title: buildTitle(vaccine.displayName.en),
          body: buildBody(vaccine.displayName.en, dose.doseNumber),
          data: {
            kind: 'overdue-vaccine',
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
 } catch {
   // Best-effort scheduling; never let a notification error break the caller.
 }
}

export async function cancelOverdueAlerts(childId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(`overdue-${childId}`))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export function isNotificationsSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
