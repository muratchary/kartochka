import { useTranslation } from 'react-i18next';

import type { Child } from '../types';
import {
  scheduleMilestoneNudges,
  scheduleOverdueVaccineAlerts,
  scheduleVaccineReminders,
} from './notifications';
import { getSchedule } from './schedules';
import { useChildrenStore } from '../stores/childrenStore';

export function useRescheduleReminders(): (child: Child) => Promise<void> {
  const { t } = useTranslation();
  const vaccinations = useChildrenStore((s) => s.vaccinations);

  return async (child) => {
    const schedule = getSchedule(child.countryCode);
    if (!schedule) return;

    // 1. Vaccine reminders — 1 day before each due dose
    await scheduleVaccineReminders(
      child,
      schedule,
      vaccinations,
      (name, n, total) => t('vaccines.notification.body', { vaccine: name, number: n, total }),
      t('vaccines.notification.title'),
    );

    // 2. Milestone nudges — fires on the day the child reaches each age checkpoint
    await scheduleMilestoneNudges(
      child,
      (ageMonths) => t('notifications.milestoneNudge.title', { name: child.name, ageMonths }),
      (ageMonths) => t('notifications.milestoneNudge.body', { ageMonths }),
    );

    // 3. Overdue vaccine alerts — fires 7 days after a due date if the dose isn't logged
    await scheduleOverdueVaccineAlerts(
      child,
      schedule,
      vaccinations,
      (vaccineName) => t('notifications.overdueVaccine.title', { name: child.name }),
      (vaccineName, dose) =>
        t('notifications.overdueVaccine.body', { vaccine: vaccineName, dose }),
    );
  };
}
