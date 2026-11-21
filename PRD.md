# PRD — Riad Guest Guide, Phase 1 (Riad Atlas Acacia pilot)

## 1. Problem
Riad Atlas Acacia sells meals, excursions, spa treatments and workshops through a static bilingual PDF.
Guests can't easily browse it on their phone, prices are hard to compare, rules (cash payment, order
cut-offs) are buried, and every request needs back-and-forth messages.

## 2. Goal
Turn the PDF into a fast mobile experience where a guest can browse, see the right price for their group
size, and send a complete request to the riad on WhatsApp in under a minute.

**Success metric (30-day pilot):** number of requests sent per week, broken down by category.

## 3. Users
- **Guest:** tourist staying at the riad, on a phone, often weak Wi-Fi, speaks EN or FR.
- **Riad owner/staff:** receives requests on WhatsApp; not technical.

## 4. Scope
**In:** catalog browsing (5 categories), EN/FR, MAD/EUR display, price calculator, cash-discount and
payment notes, request form with WhatsApp hand-off, PWA/offline, basic analytics, QR landing, per-riad config.

**Out (Phase 2+):** payments, accounts, admin dashboard, n8n/Sheets/Telegram pipeline, AI chat, native apps.

## 5. Data
`data/riads/riad-atlas-acacia/catalog.json` (provided). Item pricing models:
- `per_person`: `price × guests`.
- `base_plus_extra`: covers `base_pax` people for `base`; each additional person adds `extra_person`.
  Optional `shared_minibus` is `price × guests`.
- `options`: guest picks one option; `unit` per_person by default (`per_2_people` for the Agafay tent night).
Every price has `mad` and `eur`. Items carry `payment` (`cash_mad_to_driver`, `pay_at_riad`, `unspecified`)
and `cash_discount_applies`. The dining item carries `rules`. Items may carry `flags`.

## 6. Functional requirements
**FR-1 Home.** Shows riad name/logo, language switch (EN/FR), currency toggle (MAD/EUR), and the 5 categories.
**FR-2 Category list.** Cards with photo, title, short description, "from" price. Spa grouped by hammam / massage / package. Agafay options grouped (lunch / dinner / extras / overnight / activities).
**FR-3 Item detail.** Description, itinerary (if any), included/excluded, price block, payment note, option selector, guest counter, live total.
**FR-4 Pricing.** Implemented as pure functions with tests (see section 7).
**FR-5 Payment and discount messaging.** Show the payment note from `payment.method` in plain words. If `cash_discount_applies`, show "−10% if you pay in cash (€ or MAD)" as information; do not change the displayed total. For `unspecified`, show nothing about payment.
**FR-6 Request flow.** Form: name, room, date, (time for dining), guests, option, notes. Validate, then open WhatsApp with the message in section 8. No server call.
**FR-7 Dining rules.** Enforce `rules.service_hours`, `min_lead_hours` (4h) and the dinner cut-off (dinner orders must be placed before 16:00). Show a friendly message when a choice is not allowed. Time zone: `Africa/Casablanca`.
**FR-8 Meal formula.** Guest picks one starter, one main, one dessert/water per guest; vegetarian choices are tagged.
**FR-9 Flags.** Items with `flags` render normally. Flags are for developers and the owner, never shown to guests.
**FR-10 i18n.** All catalog text is `{en, fr}`. UI strings via the i18n layer. Language persists across sessions. Detect browser language on first visit, default EN.
**FR-11 PWA.** Installable; catalog and assets cached for offline browsing; request form works offline up to the WhatsApp hand-off.
**FR-12 Analytics.** Privacy-friendly (Plausible or PostHog, ask before choosing). Events: `qr_landing`, `category_view`, `item_view`, `request_started`, `request_sent` (category, item id, language). No personal data.
**FR-13 QR landing.** URL `/r/<riad-id>?src=qr-room|qr-reception|prearrival` records source and opens Home.
**FR-14 Multi-riad config.** `data/riads/<riad-id>/riad.json` holds name, theme, logo, languages, WhatsApp number, catalog path. Routing and theming read from it.

## 7. Pricing spec and test cases
Rounding: none (all catalog values are integers). EUR totals use the catalog `eur` values with the same formulas.

| Case | Guests | Expected MAD | Expected EUR |
|---|---|---|---|
| Ourika taxi | 2 | 1100 | 99 |
| Ourika taxi | 4 | 1254 | 113 |
| Ourika shared minibus | 3 | 825 | 75 |
| Imlil taxi | 1 | 1100 | 99 |
| Cooking class | 3 | 1210 | 110 |
| Medina guide half day | 5 | 990 | 90 |
| Meal formula | 3 | 660 | 60 |
| Hot-air balloon | 2 | 3600 | 328 |
| Agafay lunch + 2h quad | 2 | 1600 | 146 |
| Zagora luxury tent | 4 | 4800 | 436 |
| Agafay tent night | 2 | 2200 | 200 |

Open point: Agafay and Sahara unit (per person vs per group) and tent night for odd group sizes are unconfirmed. Implement per the catalog and keep behavior isolated so it is easy to change.

## 8. WhatsApp message template
EN:
```
Hello Riad Atlas Acacia, I'd like to request:
• {item title} — {option label}
• Date: {date} {time?}
• Guests: {n}
• Estimated total: {total MAD} MAD / {total EUR} €
• Name / Room: {name} / {room}
• Notes: {notes}
```
FR: same structure translated ("Bonjour, je souhaite demander : …"). Language follows the guest's selected language. URL-encode correctly; test long notes and emoji/accents.

## 9. Non-functional
- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95.
- First load under 200 KB JS where practical; images responsive and lazy.
- Works on iOS Safari and Android Chrome, 360px to desktop.
- No third-party calls except analytics.

## 10. Acceptance for Phase 1
1. A guest can complete the request flow for any item in EN and FR.
2. All pricing test cases in section 7 pass.
3. The dining rules block invalid orders with clear messages.
4. Adding a second riad folder with its own catalog and config works with no code changes.
5. Owner receives a correctly formatted test request on WhatsApp.
6. Owner reviews and confirms the `needs_confirmation` list.

## 11. Open questions (owner/product)
WhatsApp number; photos and logo; per-person vs per-group for Agafay/Sahara; payment method for dining, spa and cooking class; Agafay tent night EUR price (110 vs 200); definition of "dinner" time (assume 18:00 and later until confirmed).
