# AGENTS.md — Riad Guest Guide (Riad Atlas Acacia pilot)

Read this file at the start of every session. Then read `docs/PRD.md` and the task you were given in `docs/TASKS.md`.

## What this project is
A mobile-first guest web app for riads in Marrakech. Guests scan a QR code, browse the riad's offers
(dining, day trips, desert tours, spa, workshops) in EN/FR, see prices, and send a booking REQUEST to
the riad on WhatsApp. No payments, no accounts in Phase 1.

It extends an existing app (Next.js, Leaflet.js, Framer Motion, multilingual hooks). Do not rewrite
what already works. Extend it.

## Source of truth
- `data/riads/<riad-id>/catalog.json` is the ONLY source of offers, prices, rules and translations.
- Never hardcode a price, offer name, or guest-facing string in a component.
- Values listed in `needs_confirmation` inside the catalog are unconfirmed. Do not "fix" them yourself. Surface them in the PR notes.

## Working rules
1. Start every task by reading the relevant files. Match the existing code style, folder structure, and package manager. Detect commands from `package.json`; do not assume.
2. Make the smallest change that satisfies the task's acceptance criteria. No drive-by refactors.
3. Ask before adding any dependency. Prefer what is already installed.
4. All guest-facing text goes through the i18n layer. EN and FR must both work for everything you build.
5. Pricing logic lives in pure, tested functions (`lib/pricing`). UI never computes prices inline.
6. MAD is the primary currency. EUR values come from the catalog's `eur` fields; never convert with a live rate.
7. Mobile first: design for 390px width, test at 360px. Weak connections are normal; avoid heavy assets.
8. Accessibility basics: semantic HTML, labels on inputs, 44px touch targets, visible focus, sufficient contrast.
9. No secrets in the repo. Config such as the WhatsApp number comes from the riad config file or env vars.
10. If the PRD is ambiguous or contradicts the code, stop and ask. Do not guess on money, rules, or legal text.

## Out of scope in Phase 1 (do not build)
Payments, user accounts, admin dashboard, n8n or webhook integration, AI chat, native apps.

## Definition of done (every task)
- Acceptance criteria in the task are met.
- Type check, lint, and tests pass (use the project's own scripts).
- Works in EN and FR, at 360px and desktop width.
- Short summary written: what changed, files touched, decisions made, open questions.

## Multi-riad principle
Everything riad-specific (name, colors, logo, WhatsApp number, languages, catalog) lives in
`data/riads/<riad-id>/`. Adding a second riad must require zero code changes.
