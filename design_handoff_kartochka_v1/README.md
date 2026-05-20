# Handoff — Kartochka v1

A child health record app for Russian-speaking and Arabic-speaking parents in CIS and MENA.
Helps parents track vaccinations, growth, and developmental milestones, and export a
pediatrician-ready PDF.

Target platforms: iOS + Android (Expo / React Native).
Launch languages: Russian, Arabic, English.

---

## About the files in this bundle

The HTML files in `prototypes/` are **design references**, not production code. They were
built with React + Babel-in-the-browser purely to visualise the intended look, copy,
interactions, and i18n behaviour. The developer's job is to **recreate the screens inside
the existing Expo + TypeScript scaffold** that you already have, using the design tokens,
component library, navigation, and theming conventions already established there. Do not
ship the HTML or its inline JSX.

The HTML covers iPhone 14/15 dimensions (393 × 852 logical). Treat all measurements as
points/dp at @1× — Expo will handle scaling.

---

## Fidelity

**High-fidelity.** Colours, typography, spacing, radii, copy, and iconography are final
for v1. The only intentional placeholders are:

- Growth chart data points (smoothed visual approximation — replace with real WHO LMS
  data on integration; see `Growth tracking` below).
- PDF preview (`3.2`) is a static visual mock. The real export should be generated with
  `expo-print` + an HTML template, OR `@react-pdf/renderer` if you prefer a JSX
  template.
- "Photo of certificate" upload row in `2.3` is a placeholder for `expo-image-picker`.

---

## Brand identity

### Logo — Seedling

A two-leaf sprout cradling an amber bud, on a teal squircle background. No human/child
imagery. Reads identically in Latin, Cyrillic, and Arabic markets. Three variants:

| Variant | Use | File ref |
|---|---|---|
| App icon | iOS / Android launcher (1024² master) | `SeedlingMark` |
| Wordmark | Splash, welcome, marketing — mark + "Карточка"/"Kartochka"/"كارتوشكا" | `Wordmark` |
| Monogram | Favicons, tab icons in nav stacks | small `SeedlingMark` |

The mark is a single inline SVG. At handoff, export PNGs at 1024², 180², 120², 87², 60²,
40², 29², and Android adaptive icon foreground + monochrome variants.

### Palette (final)

```ts
export const colors = {
  teal:        '#2A7F7F', // primary — buttons, accents, active state
  tealDark:    '#1F6363', // pressed states, on-dark headlines
  tealSoft:    '#E8F1F0', // tinted backgrounds, selected rows
  tealLine:    '#BFD7D5', // separators on teal-tinted surfaces

  amber:       '#F0A848', // accent — CTAs (PDF export), FAB, premium
  amberDark:   '#D88E2E', // amber-on-amber-soft text
  amberSoft:   '#FBE9CC', // amber-tinted backgrounds (PDF CTA card)

  bg:          '#FAFAF7', // app background (warm off-white)
  surface:     '#FFFFFF', // cards, sheets
  ink:         '#1A2E2E', // primary text
  ink2:        '#5A6E6E', // secondary text
  ink3:        '#8FA0A0', // tertiary / disabled
  border:      '#E0E5E5', // card borders, inputs
  border2:     '#EDF0F0', // dividers inside cards

  success:     '#4A9D6E', // completed vaccines, "in range"
  successSoft: '#E4F2EB',
  warning:     '#E89B3C', // upcoming / due-soon
  warningSoft: '#FBEBD3',
  error:       '#C75959', // overdue, errors, destructive
  errorSoft:   '#F6E2E2',
};
```

**Discipline:** amber appears in exactly four places — the PDF export CTA on Home, the
FAB on Growth, the primary action on the vaccine-detail screen, and the paywall.
Don't introduce it elsewhere; it cheapens fast.

### Typography

- **Latin / Cyrillic:** `Nunito` (Google Fonts) — weights 400, 500, 600, 700, 800.
- **Arabic:** `IBM Plex Sans Arabic` — weights 400, 500, 600, 700. (Nunito has no real
  Arabic glyphs — verified during exploration.)

Switch the family per locale at the theme level. Don't try to use Nunito for Arabic.

**Scale:**

| Token | Size | Weight | Use |
|---|---|---|---|
| display | 30–32 | 800 | Welcome / paywall headlines |
| title   | 22–28 | 800 | Screen titles, big numbers |
| h2      | 18–19 | 800 | Card titles (e.g. vaccine name) |
| body    | 14–16 | 600–700 | Body, list rows, buttons |
| caption | 11–13 | 600–700 | Helper text, eyebrows |
| eyebrow | 11–12 | 800 | Uppercase section labels with letter-spacing 0.4 |

Letter-spacing on display sizes: `-0.5` to `-0.7`. Tabular numerals for measurements.

### Shape language

```ts
export const radii   = { sm: 4, md: 8, lg: 12, xl: 16, sheet: 24, pill: 999 };
export const spacing = [0, 4, 8, 12, 16, 24, 32, 48];
```

- **Cards:** 12 radius
- **Buttons:** 8 radius
- **Sheets / modals:** 24 top-only
- **Pills / tags:** 999

### Iconography

**Lucide** with 2px stroke, rounded line caps and joins. All icons used are listed in
`Icon` inside `kartochka-base.jsx`. On RN swap to `lucide-react-native`.

Icon set used (referenced by Lucide name): home, syringe, activity, star, settings,
chevron-left/right/down, plus, check, check-circle, circle, clock, calendar, file-text,
bell, shield, shield-check, globe, more-horizontal, info, share, camera, user, sparkles,
leaf, download, wifi-off, arrow-right, edit, trash-2, lock, cloud.

---

## Component inventory

Build these as reusable primitives in your component library before the screens. Each
maps 1:1 to a function defined in `prototypes/src/kartochka-base.jsx`.

| Component | Props | Notes |
|---|---|---|
| `SeedlingMark` | `size`, `bg`, `leaf`, `bud`, `radius` | Brand glyph |
| `Wordmark` | `size`, `color`, `mark` | Mark + "Карточка" |
| `Icon` | `name`, `size`, `color`, `strokeWidth` | Lucide wrapper |
| `Flag` | `country` (RU/KZ/UZ/AE/SA/TR), `size` | Simplified, 7:5 aspect, 5px radius |
| `NavBar` | `title`, `subtitle`, `back`, `right`, `rtl` | 56pt tall, transparent on bg |
| `TabBar` | `active`, `rtl` | 5 items, active = teal filled, label 10.5pt bold |
| `Button` | `variant` (primary/amber/ghost/secondary/danger), `size` (lg/md/sm), `icon`, `iconRight`, `full` | 8 radius |
| `Card` | `p` (default 16) | 12 radius, 1px border `colors.border`, surface fill |
| `Pill` | `tone` (neutral/success/warning/error/ghost/amber), `size` | 999 radius |
| `ScreenTitle` | `title`, `subtitle`, `align`, `rtl` | Display + body sub |
| `StepDots` | `step`, `total` | Onboarding progress; active = wide teal pill |
| `FormField` | `label`, `help`, `required` | Wraps any input |
| `Segmented` | `options`, `value` | iOS-style 3-up control |
| `Toggle` | `on` | 44×26 |
| `ChildHeader` | `rtl` | Avatar + greeting + name + bell |
| `PercentileBar` | `value` (0–100) | True normal-curve viz |
| `RingProgress` | `value`, `size` | Conic ring, used on milestones overview |

Status bar and home indicator are mocked in `Phone` for the design — your app will get
them from `react-native-safe-area-context`.

---

## Screens

24 screens across 6 groups. Each screen's React function and visual reference live at
`prototypes/src/kartochka-{onboarding,main,phase3}.jsx`. Open the canvas
(`Kartochka v1 — All Screens.html`) to see them all at once.

### Group 1 — Onboarding

| # | Name | Purpose | Notes |
|---|---|---|---|
| 1.1 | Splash | Brand + load | Centered mark + wordmark + tagline + 3-dot loader |
| 1.2 | Welcome | First-run | Hero seedling on radial bg, "Начать" primary, "У меня уже есть аккаунт" link, teal-tinted privacy reassurance |
| 1.3 | Country | Pick locale schedule | 6 countries, pre-selected from device locale. Each row shows flag + name + schedule source. Step 2/4. |
| 1.4 | Language | Pick UI lang | Pre-selected from country. 3 options shown in their native script (Русский / العربية / English). |
| 1.5 | Add first child | Bootstrap data | Name, DOB, sex (segmented Мальчик/Девочка/Не указывать). Includes WHO-curves rationale in help text. **Ends with a country confirmation strip** showing which vaccination schedule will be generated, with "Изменить" inline link. |

**Step indicator:** uses 4 dots (1.1 is implicit), animating to a wide pill on the
current step. 1.3 = step 2, 1.4 = step 3, 1.5 = step 4.

### Group 2 — Main app

| # | Name | Purpose | Notes |
|---|---|---|---|
| 2.1 | Home | Daily glance | ChildHeader + 3 cards (next vaccination · growth · milestones) + amber PDF CTA. Tab bar pinned. **Card 1** carries the only inline actions (Подробнее / Отметить). |
| 2.2 | Vaccines | Calendar list | Filter chips (Все / Скоро / Готово / Просрочено), grouped headers, status icons. 16 total entries shown so user sees a full year ahead. |
| 2.3 | Vaccine detail | Mark / record | Hero (icon + status pill + name + sub-name), "Защищает от" card with tag pills, post-vaccination reassurance card ("Лёгкие реакции… 24–48 часов"), schedule card, optional fields placeholder, amber "Отметить как сделано" + ghost "Перенести". |
| 2.4 | Growth | Trends | Segmented Вес/Рост/Окр. головы, big number card with percentile pill, line chart with 5 WHO curves (3/15/50/85/97 — 50 labelled "норма") + child line in amber, FAB amber bottom-right for new measurement. |
| 2.5 | Milestones | Checklist | Top: tealSoft progress overview card with ring + summary. Then age groups as expandable cards; collapsed groups show a slim progress bar; expanded group lists items with check/empty state and date stamps. Future groups dimmed 65%. |

**Tab bar items (always 5):** Главная · Прививки · Рост · Развитие · Ещё.

### Group 3 — PDF export + paywall

| # | Name | Purpose | Notes |
|---|---|---|---|
| 3.1 | Paywall | Premium upsell | Bottom-sheet style sliding up from a dimmed bg, with grabber + close button. PDF thumbnail hero (rotated −3°), 4 benefits, plan toggle (annual selected by default with −48% badge), amber "Начать 7 дней бесплатно" CTA in pinned footer with sub-line showing recurring price, footer link row "Восстановить покупки · Условия · Конфиденциальность". RTL-aware. |
| 3.2 | PDF preview | Premium view | Full A4 portrait mock rendered inside a navbar shell, plus a partial second-page peek. Pinned footer has secondary "Сохранить" and primary "Поделиться" side-by-side. |
| 3.3 | Sub success | Trial activated | Centered seedling + amber check badge, "Премиум активен" headline, next-billing date, "Открыто" card listing the 4 unlocked features, primary "Создать первый PDF" + ghost "На главную". |

**Paywall pricing on Russia locale:** annual 1 890 ₽ / monthly 299 ₽ (≈ −48%). The
prompt called for $3.99/mo $24.99/yr — we're showing the App Store equivalent in RUB
because Russian users won't see USD prices. Implement using the store's pricing tier
that maps to your $3.99/$24.99 anchor; show whatever currency the store returns.

### Group 4 — Settings & secondary

| # | Name | Purpose | Notes |
|---|---|---|---|
| 4.1 | Settings home | Hub | Premium-status banner at top (teal gradient + amber CTA), then grouped lists: Дети · Приложение (Язык/Страна/Уведомления) · Безопасность (Конфиденциальность/Резервное копирование) · Подписка (Управление/О приложении/Связаться). "Add child" + "Резервное копирование" rows show `LockBadge` "PRO". |
| 4.2 | Privacy | Reassure + control | Big teal hero "На вашем устройстве", two toggles (Облачная копия — PRO + lock badge, Анонимная статистика), two action rows (Экспорт всех данных, Удалить все данные — red icon). |
| 4.3 | Notifications | Reminders | Teal explainer banner, "Напоминания о прививках" group with 4 toggles (14 / 7 / 1 day before, day-of). "Развитие" group with 2 more toggles. Ghost "Отправить тестовое" at bottom. |
| 4.4 | Add 2nd child | Premium gate | Amber-gradient gate card with lock icon, headline "До 5 детей в одной семье", amber CTA. Below: dimmed preview of the actual form with bottom fade-out — "Так это будет выглядеть". |

### Group 5 — States

| # | Name | Purpose | Notes |
|---|---|---|---|
| 5.1 | Empty home | No child yet | Custom illustration (seedling growing out of a record card), "Добавьте первого ребёнка" + body + primary CTA. Settings cog in nav bar (no avatar yet). |
| 5.2 | Loading | Skeleton | Home layout with shimmering placeholder rectangles. `@keyframes shimmer` defined inline. |
| 5.3 | Error | Recoverable failure | Red soft-circle behind an error tile, "Что-то пошло не так" + body explaining data is safe locally, primary "Повторить" + ghost "Связаться с поддержкой". |
| 5.4 | Offline | Connectivity loss | Warning-tinted banner under the safe area "Без подключения · Данные сохраняются локально", then a regular home below it. |

### Arabic RTL screens

`1.2 Welcome`, `2.1 Home`, and `3.1 Paywall` are also rendered in Arabic. Use as the
RTL reference. Key behaviours to mirror:

- Layout direction flips (paddings, flex order, justify start/end).
- Chevrons flip (`chevronRight` → `chevronLeft`).
- The paywall close button moves to the **left** corner.
- Prices and Western numerals **stay LTR** even within RTL text (no Eastern Arabic
  numerals — confirmed during spec flagging).
- Font family switches to `IBM Plex Sans Arabic`.

---

## i18n strings

Russian is primary; English and Arabic strings live alongside RU. Below are the
high-frequency strings only — the rest live inline in the JSX and should be moved
into your i18n catalogue.

```ts
// Brand
brand: { ru: 'Карточка', en: 'Kartochka', ar: 'كارتوشكا' }
tagline: {
  ru: 'Медкарта ребёнка, которую оценит педиатр',
  en: 'The child health record your pediatrician will thank you for',
  ar: 'سجل صحي لطفلك، سيشكرك عليه طبيب الأطفال',
}

// Tabs
tabs: {
  home:       { ru: 'Главная',  en: 'Home',       ar: 'الرئيسية'  },
  vaccines:   { ru: 'Прививки', en: 'Vaccines',   ar: 'التطعيمات' },
  growth:     { ru: 'Рост',     en: 'Growth',     ar: 'النمو'    },
  milestones: { ru: 'Развитие', en: 'Milestones', ar: 'النماء'   },
  settings:   { ru: 'Ещё',      en: 'More',       ar: 'المزيد'   },
}

// Common verbs
save:     { ru: 'Сохранить',     en: 'Save',       ar: 'حفظ' }
continue: { ru: 'Продолжить',    en: 'Continue',   ar: 'متابعة' }
markDone: { ru: 'Отметить',      en: 'Mark done',  ar: 'تم' }
exportPdf:{ ru: 'PDF для педиатра', en: "Doctor's PDF", ar: 'PDF للطبيب' }
```

Pluralisation: Russian has 3 forms (1 / 2-4 / 5+). Use `i18next` with the
`ru` rule set, or `react-intl` with `Intl.PluralRules`.

Date formatting:
- RU: `12 апреля 2024` (`d MMMM yyyy`, lowercase month)
- EN: `12 Apr 2024` (`d MMM yyyy`)
- AR (UAE/SA): `12 أبريل 2024` (gregorian, lowercase month)

---

## Interactions & state

### Navigation

- Stack: most screens are stacked. Onboarding stack → main tabs.
- Tab navigator: 5 tabs (Home / Vaccines / Growth / Milestones / More).
- Paywall: modal presentation sliding from the bottom.
- PDF preview: stack push from Home or from Settings → "Управление подпиской".
- Vaccine detail: stack push from Vaccines list and from Home card.

### Critical flows

1. **First run** — Splash → Welcome → Country → Language → Add first child → Home.
2. **Mark vaccination done** — Home card "Отметить" or Vaccines row tap →
   **confirm sheet** (date picker pre-filled to today + optional photo + optional
   note) → save. **This sheet is not in the design yet**; build it as a small
   bottom sheet using `Card`-style content. (Was flagged in the spec — see the
   "Notes for engineers" section at the bottom.)
3. **Export PDF (free)** — Home amber CTA → Paywall (3.1) → Start trial → Sub
   Success (3.3) → PDF preview (3.2).
4. **Export PDF (premium)** — Home amber CTA → PDF preview (3.2) directly.
5. **Add second child (free)** — Settings → Дети → "Добавить ребёнка" → 4.4 gate →
   Paywall → Sub Success → 1.5 add-child form.

### State

- **Selected child** — global. Default to first child. UI assumes one active child
  at a time everywhere except Settings (children management).
- **Locale + direction** — global. Direction comes from locale (`ar` → RTL).
- **Premium status** — global. Drives lock badges, paywall triggers, and tab/menu
  availability.
- **Offline status** — global. Banner appears on Home (and only Home) when offline.

### Animation

Keep it calm. Suggested defaults:

- Card press: `transform: scale(0.98)` 120ms ease-out.
- Pill / toggle change: 200ms ease.
- Sheet slide-in (paywall): 280ms `cubic-bezier(.32, .72, 0, 1)` (iOS sheet curve).
- Skeleton shimmer: `200% → −200%` over 1400ms infinite linear.
- Step-dot expand (onboarding): 200ms ease.

---

## WHO growth curves

The growth chart shows 5 WHO percentile curves (3/15/50/85/97) plus the child's
line. The current SVG uses smoothed visual approximations.

For production:

1. Pull the official WHO LMS tables (boys / girls / 0–24mo + 2–5y) — they're CSV
   on the WHO site.
2. Convert L/M/S triplets to percentile-Z values with the standard formula:
   `X = M * (1 + L*S*Z)^(1/L)` where Z is the inverse-normal of the percentile.
3. Pre-compute the 5 curves at every month for both sexes for weight-for-age,
   height-for-age, and head-circumference-for-age. Ship as a small JSON.
4. Plot the child's data points using the same x-axis (months from birth).
5. For "Прививки → 50 · норма" label keep our plain-language framing.

For under-5 + over-2 transition: switch from the 0–24mo dataset to the 2–5y
dataset at 24 months.

---

## Files in this bundle

```
prototypes/
├── Kartochka v1 — All Screens.html     ← entry, opens the design canvas
├── Logo Concepts.html                  ← Phase 1, kept for traceability
├── design-canvas.jsx                   ← canvas chrome (drag/zoom/focus)
├── ios-frame.jsx                       ← iPhone bezel
└── src/
    ├── kartochka-base.jsx              ← tokens, Icon, Flag, primitives
    ├── kartochka-onboarding.jsx        ← screens 1.1 – 1.5
    ├── kartochka-main.jsx              ← screens 2.1 – 2.5
    ├── kartochka-phase3.jsx            ← screens 3.x, 4.x, 5.x + PDFContents
    └── kartochka-canvas.jsx            ← canvas composition (6 sections)
```

Open `Kartochka v1 — All Screens.html` to view the full set. Use the focus button
(⤢) on any artboard to open it fullscreen, and ← / → to step through siblings.

---

## Notes for engineers

A few decisions made during design that aren't obvious from the screens alone:

1. **"Mark as done" confirmation sheet** — the timeline (`2.2`) and the home next-
   vaccination card both expose a "Отметить" / "Mark done" action. We deliberately
   do **not** complete the vaccine on a single tap; instead, build a small bottom
   sheet that prompts for the date (default today), optional clinic name, optional
   photo, and optional notes. This was raised as a spec concern early and never
   got its own mock — please mock it from the design system and we'll review.
2. **Sex-at-birth helper text** — copy is `"Кривые роста ВОЗ построены отдельно
   для мальчиков и девочек. Это нужно только для них."` Don't reword without
   medical review.
3. **"Prefer not to say"** for sex breaks WHO percentile charts. The intended
   behaviour: hide the percentile pill on Home and on the chart's header card,
   and replace the chart's curves with the median across both sexes, with a
   note "Кривые не разделены по полу". Stub this on the chart for v1.
4. **Photo of vaccine certificate** — local-only by default. If "Облачная копия"
   is enabled, photos go to the same encrypted bucket as the rest of the data.
5. **PDF generation** — header should always carry the child's full name and DOB,
   the chosen country's schedule reference (e.g. "Приказ Минздрава РФ № 1122н"),
   and the generation date. Tables must be vector text, not rasterised, so the
   pediatrician can copy from them.
6. **Family sharing** — Premium "до 5 детей" applies to a single Apple/Google
   account. Cross-device sync between parents goes through the cloud backup
   feature (different code path).
7. **Reduced motion** — respect `prefers-reduced-motion` on the splash dots and
   the skeleton shimmer.

---

## Suggested implementation order

1. Set up the theme: install Nunito + IBM Plex Sans Arabic, wire the colour
   tokens above into your tokens file, set up the locale → font-family selector.
2. Build the primitives table (component inventory above), top-down.
3. Implement Group 5 (states) first — empty, loading, error, offline — they're
   small and shake out theme + layout issues fast.
4. Implement onboarding (Group 1) end-to-end. Keep `Add first child` flow tight.
5. Implement Home (2.1) — it consumes the most primitives.
6. Vaccines + Vaccine detail (2.2, 2.3) — wire the confirm sheet here.
7. Growth (2.4) — drop in real WHO data.
8. Milestones (2.5).
9. Settings (4.1–4.3).
10. Paywall + PDF preview + sub success (3.x). Save the PDF template for last.
11. Second-child gate (4.4).
12. Pass over for RTL — Arabic locale, run through every screen.
