import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { SupportedLanguage } from '../i18n';
import { STANDARD_MILESTONES } from './milestones';
import { getSchedule } from './schedules';
import { dueDateForDose, statusFromDays } from './vaccinationStatus';
import type {
  Child,
  GrowthEntry,
  MilestoneRecord,
  VaccinationRecord,
} from '../types';

type T = (key: string, opts?: Record<string, unknown>) => string;

const SEEDLING_SVG = `<svg viewBox="0 0 232 232" xmlns="http://www.w3.org/2000/svg">
  <rect width="232" height="232" rx="51" fill="#2A7F7F"/>
  <path d="M116 178 L116 110" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M116 124 C100 110 78 110 70 96 C84 88 108 90 116 110 Z" fill="#FFFFFF"/>
  <path d="M116 118 C132 100 156 102 168 88 C162 74 134 70 116 102 Z" fill="#FFFFFF"/>
  <circle cx="116" cy="90" r="11" fill="#F0A848"/>
</svg>`;

export interface ExportArgs {
  child: Child;
  vaccinations: VaccinationRecord[];
  growthEntries: GrowthEntry[];
  milestones: MilestoneRecord[];
  lang: SupportedLanguage;
  t: T;
}

export async function exportChildPdf(args: ExportArgs): Promise<string> {
  const html = buildHtml(args);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: args.t('home.pdf.shareTitle'),
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}

function buildHtml({ child, vaccinations, growthEntries, milestones, lang, t }: ExportArgs): string {
  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';
  const fontImport = isRtl
    ? "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');"
    : "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');";
  const fontFamily = isRtl
    ? "'IBM Plex Sans Arabic', system-ui, sans-serif"
    : "'Nunito', system-ui, sans-serif";
  const localeTag = lang === 'ru' ? 'ru' : lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en';

  const generatedDate = formatDate(new Date(), localeTag);
  const birth = new Date(child.dateOfBirth);
  const dobFormatted = formatDate(birth, localeTag);
  const ageString = formatAge(birth, t);
  const sexKey =
    child.sex === 'male'
      ? 'home.pdf.sexMale'
      : child.sex === 'female'
        ? 'home.pdf.sexFemale'
        : 'home.pdf.sexUnspecified';

  const schedule = getSchedule(child.countryCode);

  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<style>
  ${fontImport}
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: ${fontFamily};
    color: #1A2E2E;
    padding: 32px 36px 24px;
    font-size: 11pt;
    line-height: 1.5;
    margin: 0;
  }
  header {
    display: flex;
    flex-direction: ${isRtl ? 'row-reverse' : 'row'};
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 3px solid #2A7F7F;
    margin-bottom: 22px;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-name { font-weight: 800; font-size: 18pt; color: #2A7F7F; letter-spacing: -0.3px; }
  .brand-mark { display: inline-block; line-height: 0; }
  .brand-mark svg { display: block; width: 28px; height: 28px; }
  .generated { color: #5A6E6E; font-size: 9pt; }
  h1 { margin: 0 0 4px; font-size: 22pt; font-weight: 800; letter-spacing: -0.4px; }
  .child-meta { color: #5A6E6E; margin-bottom: 22px; font-size: 10pt; }
  .child-meta span:not(:last-child)::after { content: ' · '; color: #BFD7D5; }
  h2 {
    font-size: 12pt; font-weight: 800; margin: 22px 0 8px;
    color: #1F6363; text-transform: uppercase; letter-spacing: 0.4px;
  }
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  th {
    text-align: ${isRtl ? 'right' : 'left'};
    padding: 7px 8px; background: #E8F1F0;
    font-weight: 700; font-size: 8.5pt; color: #1F6363;
    text-transform: uppercase; letter-spacing: 0.4px;
    border-bottom: 1px solid #BFD7D5;
  }
  td {
    padding: 7px 8px; border-bottom: 1px solid #EDF0F0;
    font-size: 10pt; vertical-align: top;
  }
  tr:last-child td { border-bottom: none; }
  .num { font-variant-numeric: tabular-nums; }
  .pill {
    display: inline-block; padding: 2px 9px; border-radius: 999px;
    font-size: 8pt; font-weight: 700; letter-spacing: 0.2px;
  }
  .pill-done { background: #E4F2EB; color: #4A9D6E; }
  .pill-overdue { background: #F6E2E2; color: #C75959; }
  .pill-scheduled { background: #FBEBD3; color: #B57624; }
  .empty { color: #8FA0A0; font-style: italic; font-size: 10pt; padding: 12px 0; }
  footer {
    margin-top: 28px; padding-top: 10px; border-top: 1px solid #E0E5E5;
    font-size: 8pt; color: #8FA0A0; line-height: 1.5;
  }
  section { page-break-inside: auto; break-inside: auto; }
  h2 { page-break-after: avoid; break-after: avoid; }
  table { page-break-inside: auto; break-inside: auto; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  @page { size: A4; margin: 18mm 14mm; }
  @page :first { margin-top: 12mm; }
</style>
</head>
<body>
  <header>
    <div class="brand">
      <span class="brand-mark">${SEEDLING_SVG}</span>
      <span class="brand-name">${escapeHtml(t('brand.name'))}</span>
    </div>
    <div class="generated">${escapeHtml(generatedDate)}</div>
  </header>

  <h1>${escapeHtml(child.name)}</h1>
  <div class="child-meta">
    <span>${escapeHtml(t('home.pdf.dob', { date: dobFormatted }))}</span>
    <span>${escapeHtml(t('home.pdf.age', { age: ageString }))}</span>
    <span>${escapeHtml(t(sexKey))}</span>
    <span>${escapeHtml(t(`countries.${child.countryCode}`))}</span>
  </div>

  <h2>${escapeHtml(t('home.pdf.vaccinationsHeading'))}</h2>
  ${renderVaccinations(child, schedule, vaccinations, lang, t, localeTag)}

  <h2>${escapeHtml(t('home.pdf.growthHeading'))}</h2>
  ${renderGrowth(child, growthEntries, lang, t, localeTag)}

  <h2>${escapeHtml(t('home.pdf.milestonesHeading'))}</h2>
  ${renderMilestones(child, milestones, lang, t, localeTag)}

  <footer>
    ${escapeHtml(
      t('home.pdf.disclaimer', {
        source: schedule?.sourceUrl ?? '',
      }),
    )}
  </footer>
</body>
</html>`;
}

function renderVaccinations(
  child: Child,
  schedule: ReturnType<typeof getSchedule>,
  vaccinations: VaccinationRecord[],
  lang: SupportedLanguage,
  t: T,
  localeTag: string,
): string {
  if (!schedule) {
    return `<div class="empty">${escapeHtml(t('home.pdf.noVaccinations'))}</div>`;
  }
  const records = vaccinations.filter((v) => v.childId === child.id);
  type Row = { name: string; doseLabel: string; date: string; status: 'done' | 'overdue' | 'scheduled' };
  const rows: Row[] = [];

  for (const v of schedule.vaccines) {
    const name = v.displayName[lang] ?? v.displayName.en;
    for (const dose of v.doses) {
      const record = records.find((r) => r.vaccineCode === v.code && r.doseNumber === dose.doseNumber);
      const dueDate = dueDateForDose(child.dateOfBirth, dose.recommendedAgeMonths);
      const days = Math.round((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const baseStatus = record ? 'done' : statusFromDays(days) === 'overdue' ? 'overdue' : 'scheduled';
      rows.push({
        name,
        doseLabel: `${dose.doseNumber} / ${v.doses.length}`,
        date: record
          ? formatDate(new Date(record.administeredOn), localeTag)
          : formatDate(dueDate, localeTag),
        status: baseStatus,
      });
    }
  }

  if (rows.length === 0) {
    return `<div class="empty">${escapeHtml(t('home.pdf.noVaccinations'))}</div>`;
  }

  return `<table>
    <thead>
      <tr>
        <th>${escapeHtml(t('home.pdf.colVaccine'))}</th>
        <th>${escapeHtml(t('home.pdf.colDose'))}</th>
        <th>${escapeHtml(t('home.pdf.colDueDate'))}</th>
        <th>${escapeHtml(t('home.pdf.colStatus'))}</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r) => `<tr>
            <td>${escapeHtml(r.name)}</td>
            <td class="num">${escapeHtml(r.doseLabel)}</td>
            <td class="num">${escapeHtml(r.date)}</td>
            <td><span class="pill pill-${r.status}">${escapeHtml(
              t(
                r.status === 'done'
                  ? 'home.pdf.statusDone'
                  : r.status === 'overdue'
                    ? 'home.pdf.statusOverdue'
                    : 'home.pdf.statusScheduled',
              ),
            )}</span></td>
          </tr>`,
        )
        .join('')}
    </tbody>
  </table>`;
}

function renderGrowth(
  child: Child,
  growthEntries: GrowthEntry[],
  lang: SupportedLanguage,
  t: T,
  localeTag: string,
): string {
  const entries = growthEntries
    .filter((g) => g.childId === child.id)
    .sort((a, b) => b.measuredOn.localeCompare(a.measuredOn));
  if (entries.length === 0) {
    return `<div class="empty">${escapeHtml(t('home.pdf.noGrowth'))}</div>`;
  }
  return `<table>
    <thead>
      <tr>
        <th>${escapeHtml(t('home.pdf.colDate'))}</th>
        <th>${escapeHtml(t('home.pdf.colWeight'))}</th>
        <th>${escapeHtml(t('home.pdf.colHeight'))}</th>
        <th>${escapeHtml(t('home.pdf.colHeadCirc'))}</th>
        <th>${escapeHtml(t('home.pdf.colNotes'))}</th>
      </tr>
    </thead>
    <tbody>
      ${entries
        .map(
          (e) => `<tr>
            <td class="num">${escapeHtml(formatDate(new Date(e.measuredOn), localeTag))}</td>
            <td class="num">${e.weightKg != null ? `${e.weightKg} ${escapeHtml(t('growth.kg'))}` : '—'}</td>
            <td class="num">${e.heightCm != null ? `${e.heightCm} ${escapeHtml(t('growth.cm'))}` : '—'}</td>
            <td class="num">${e.headCircumferenceCm != null ? `${e.headCircumferenceCm} ${escapeHtml(t('growth.cm'))}` : '—'}</td>
            <td>${escapeHtml(e.notes ?? '')}</td>
          </tr>`,
        )
        .join('')}
    </tbody>
  </table>`;
}

function renderMilestones(
  child: Child,
  milestoneRecords: MilestoneRecord[],
  lang: SupportedLanguage,
  t: T,
  localeTag: string,
): string {
  const records = milestoneRecords
    .filter((m) => m.childId === child.id)
    .sort((a, b) => a.achievedOn.localeCompare(b.achievedOn));
  if (records.length === 0) {
    return `<div class="empty">${escapeHtml(t('home.pdf.noMilestones'))}</div>`;
  }
  const definitionByCode = new Map(STANDARD_MILESTONES.map((m) => [m.code, m]));
  return `<table>
    <thead>
      <tr>
        <th>${escapeHtml(t('home.pdf.colMilestone'))}</th>
        <th>${escapeHtml(t('home.pdf.colCategory'))}</th>
        <th>${escapeHtml(t('home.pdf.colReached'))}</th>
      </tr>
    </thead>
    <tbody>
      ${records
        .map((r) => {
          const def = definitionByCode.get(r.milestoneCode);
          const name = def?.displayName[lang] ?? def?.displayName.en ?? r.milestoneCode;
          const category = def ? t(`milestones.categories.${def.category}`) : '';
          return `<tr>
            <td>${escapeHtml(name)}</td>
            <td>${escapeHtml(category)}</td>
            <td class="num">${escapeHtml(formatDate(new Date(r.achievedOn), localeTag))}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>`;
}

function formatAge(dob: Date, t: T): string {
  const now = new Date();
  const ms = now.getTime() - dob.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 60) return t('home.pdf.ageDays', { count: Math.max(days, 0) });
  const months = Math.floor(days / 30.4375);
  if (months < 24) return t('home.pdf.ageMonths', { count: months });
  const years = Math.floor(months / 12);
  return t('home.pdf.ageYears', { count: years });
}

function formatDate(date: Date, locale: string): string {
  try {
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
