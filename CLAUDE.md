@AGENTS.md

# Kartochka — Child Health Record App

## What this is
A mobile app (iOS + Android) that helps parents in CIS and MENA
track their child's vaccinations, growth, and developmental milestones,
and export a PDF report for pediatrician visits.

## Target users
Russian-speaking and Arabic-speaking parents of children aged 0-6,
primarily in Russia, Kazakhstan, Uzbekistan, UAE, Saudi Arabia, and Turkey.

## Tech stack
- React Native + Expo SDK 55 (TypeScript)
- Supabase (auth, database, storage, edge functions)
- RevenueCat for subscriptions
- Zustand for state
- i18next for localization (ru, ar, en at launch)
- expo-notifications for vaccine reminders

## Architecture decisions
- Local-first: all child data stored on-device first, synced to Supabase
  only if user opts into cloud backup
- No AI features in v1 — this is structured data + reminders + PDF
- Country-specific vaccination schedules stored as JSON, loaded at onboarding
- PDF generation happens server-side via Supabase Edge Function

## Monetization
- Free: 1 child, all logging features
- Premium ($3.99/mo or $24.99/year): PDF export, unlimited children,
  partner sharing, cloud backup
- Paywall hits at first PDF export attempt

## Apple Developer account
- Developer name: Agamyrat Durdymyradov (personal account)
- Team ID: 787GCXLSTM
- Account email: bitubixdxb@gmail.com

## Google Play account
- Developer name: MChary

## What I want from Claude Code
- Honest pushback when I'm overcomplicating things
- Suggest the simplest implementation that works
- Flag when something needs a real parent tester before shipping
- Don't add features I didn't ask for
- Keep v1 scope locked: vaccinations + growth + milestones + PDF export only

## What's explicitly out of scope for v1
- Feed/sleep/diaper logging
- Expense tracking
- Nanny/daycare features
- AI symptom checker
- Telehealth integration

## Languages
- v1.0: Russian (ru), Arabic (ar), English (en), Turkish (tr)
- v1.1: Turkmen (tk), Uzbek (uz), Kazakh (kk)

## Country vaccination schedules to support at launch
- Russia (RU)
- Kazakhstan (KZ)
- Uzbekistan (UZ)
- UAE (AE)
- Saudi Arabia (SA)
- Turkey (TR)
- Turkmenistan (TM) — v1.1
