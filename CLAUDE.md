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
- Account email: muratchary@icloud.com

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


---

<!-- AGENT-FIRST-STANDARDS:v1 — shared org standard, propagated to every project. Edit the canonical copy and re-run propagation; do not diverge per project. -->
# Agent-First Development Standards

> Org-wide standard for every project we develop with Claude Code, so AI agents can discover and work on our projects consistently.

## 1. Machine Comprehension & API Design
- **API-First:** Every feature must be defined as an API contract before implementation.
- **OpenAPI/JSON Schema:** All endpoints must be documented with OpenAPI v3.1 schemas (stored in /docs/openapi.yaml).
- **No Ambiguity:** Avoid descriptive prose in function comments. Use strict JSDoc/TSDoc or Python type hints.
- **Idempotency:** Mark all state-changing endpoints with explicit idempotency keys and describe potential side effects.

## 2. Agent Discovery
- **llms.txt:** Maintain an `llms.txt` at the root that summarizes the project architecture, entry points, and current API capabilities.
- **Consistency:** Use standardized naming for entities (e.g., `user_id` instead of `account_ref`).
- **Directory Metadata:** Include a `README.md` in every significant sub-folder summarizing its contents, purpose, and key exports.

## 3. Workflow & Constraints
- **Modularization:** Prefer small, single-purpose functions over large monolithic modules to reduce context window usage.
- **Error Handling:** Every API endpoint must have a documented error schema.
- **Safety:** Always verify auth/permission scopes for any state-changing agent action.

## 4. Agent-Sync Protocol (Crucial)
- **Source of Truth:** Code is the primary source; `openapi.yaml` and `llms.txt` are the "interfaces of truth."
- **Atomic Updates:** No commit may be merged if it alters an API signature without a corresponding update to the OpenAPI spec and `llms.txt`.
- **Validation:** Every change must trigger a check to ensure `openapi.yaml` matches the implementation.
- **AI-Reflective Comments:** When modifying a business-critical function, update the associated `llms.txt` snippet to reflect the capability change immediately.

## 5. Reference
- Refer to `docs/architecture.md` for high-level design.
- Use `npm run validate:schema` (or equivalent) to ensure API consistency.
