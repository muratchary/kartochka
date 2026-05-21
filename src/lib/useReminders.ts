import { useTranslation } from 'react-i18next';

import type { Child } from '../types';
import { scheduleVaccineReminders } from './notifications';
import { getSchedule } from './schedules';
import { useChildrenStore } from '../stores/childrenStore';

export function useRescheduleReminders(): (child: Child) => Promise<void> {
  const { t } = useTranslation();
  const vaccinations = useChildrenStore((s) => s.vaccinations);

  return async (child) => {
    const schedule = getSchedule(child.countryCode);
    if (!schedule) return;
    await scheduleVaccineReminders(
      child,
      schedule,
      vaccinations,
      (name, n, total) => t('vaccines.notification.body', { vaccine: name, number: n, total }),
      t('vaccines.notification.title'),
    );
  };
}
