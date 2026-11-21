# DECISION LOG
> Every major decision saved here. This stops direction changes and mental restarts.

---

## Log

### 2026-11-21 — Agafay Tent Night Unit & Price Confirmation
```
Date: 2026-11-21
Decision: Agafay luxury tent night is priced at 2,200 MAD / 200 EUR per person (breakfast included).
Reason: Confirmed by owner/product lead to resolve the PDF discrepancy (EN 110€ vs FR 200€ / 2 pax vs per person).
Impact: catalog.json updated with unit="per_person", pricing engine and vitest test cases adjusted and passing.
Next action: Maintain pure pricing calculation based on per_person multiplier.
```

### 2026-11-21 — WhatsApp Request Flow & Direct Hand-off
```
Date: 2026-11-21
Decision: Guest booking requests use direct WhatsApp deep-links (wa.me/+212663715754) with structured bilingual message templates.
Reason: Simplifies operation for non-technical riad staff without requiring database or server overhead in Phase 1.
Impact: BookingModal builds formatted EN/FR message including guest name, room number, date, time, total estimate (MAD & EUR), and course selections.
Next action: Monitor request formats and delivery during the 30-day pilot.
```

### 2026-11-21 — Riad Atlas Acacia Identity & Coordinates
```
Date: 2026-11-21
Decision: Set official GPS coordinates to [31.62214, -7.98336] in Riad Zitoun Jdid (Derb Sidi Moussa N°100).
Reason: Verified exact coordinates next to Bahia Palace and Dar Si Said Museum.
Impact: Leaflet interactive map and distance utility automatically recalculate walking and taxi times for all nearby points of interest.
Next action: None.
```

---
