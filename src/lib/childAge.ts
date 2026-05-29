/**
 * Single source of truth for "how do we display a child's age to the user?"
 *
 * Three previous in-app callers (Home, Doctor card, Switch-child) each rolled
 * their own copy of the same logic and all three had the SAME bug — they
 * hardcoded "1 day" for any child younger than ~1 month, which meant a
 * 26-day-old showed as "1 day old" on Home while the vaccine schedule
 * (correctly) treated them as 26 days old. The mismatch confused parents.
 *
 * This helper standardizes the rules:
 *   - 0 days  → "0 days" (Today)
 *   - 1 day to 1 month → "N days"
 *   - 1 month to 2 years → "N months"
 *   - 2 years and above → "N years" (+ "M months" if not a whole year)
 */
type Translator = (key: string, opts?: Record<string, unknown>) => string;

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH = 30.4375; // average length of a calendar month

export function formatChildAge(dateOfBirth: string, t: Translator): string {
  const ms = Date.now() - new Date(dateOfBirth).getTime();
  const days = Math.max(0, Math.floor(ms / MS_PER_DAY));
  const totalMonths = Math.floor(ms / (MS_PER_DAY * DAYS_PER_MONTH));

  // Show day count for newborns up to 1 month old, then switch to months.
  if (totalMonths < 1) return t('home.pdf.ageDays', { count: days });
  if (totalMonths < 24) return t('home.pdf.ageMonths', { count: totalMonths });

  const years = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;
  if (remMonths === 0) return t('home.pdf.ageYears', { count: years });
  return `${t('home.pdf.ageYears', { count: years })} ${t('home.pdf.ageMonths', { count: remMonths })}`;
}
