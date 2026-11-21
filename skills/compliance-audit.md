# SKILL: compliance-audit

> A reusable, repeatable trust, legal compliance, and launch-readiness audit framework across 14 critical checkpoints.

---

## Skill Name
`compliance-audit`

## Purpose
Ensure digital products, websites, apps, and funnels meet all essential legal, privacy, accessibility, and consumer trust requirements prior to public launch, ad spend, or client handover. Prevents legal liability (GDPR, CCPA, FTC), payment processor suspensions, and user trust friction.

## Input
- **Target URL / Codebase**: Staging or production URL, app repository, or page templates.
- **Operating Jurisdiction**: Primary target markets (e.g. EU/UK, US, Morocco/CNDP, GCC, Worldwide).
- **Business Model**: SaaS, E-commerce / D2C, Local Services / Hospitality, Marketplace, or Content.
- **Third-Party Stack**: Analytics, CRM, payment gateway, tracking pixels, email tools, WhatsApp API.

## The 14-Point Checkpoint Framework

| # | Checkpoint | Focus Area | Standards / Regulation |
|---|---|---|---|
| **01** | **Privacy Policy** | Data collection disclosure, user rights, contact channel | GDPR Arts 12-14, CCPA/CPRA, Law 09-08 (CNDP) |
| **02** | **Terms of Service** | Acceptable use, IP terms, liability limits, governing law | Contract Law, Digital Services Act |
| **03** | **Refund & Cancellation Policy** | Clear window, renewal terms, easy cancellation steps | Consumer Rights, FTC, Payment Gateways |
| **04** | **Cookie Policy & Consent** | Prior-consent blocking, granular toggles, revoke widget | ePrivacy Directive, GDPR Art 7 |
| **05** | **Form Consent & Data Minimization** | Unchecked opt-ins, strictly necessary fields, privacy links | GDPR Art 5(1)(c), Art 7 |
| **06** | **Audit Third-Party SDKs & Integrations** | Trackers, session replays with PII masking, local fonts | GDPR Chapter V, Schrems II |
| **07** | **Remove Dark Patterns & Hidden Fees** | Upfront pricing, no pre-checked add-ons, neutral copy | FTC Dark Patterns, EU DSA Art 25 |
| **08** | **Remove Fake Reviews & Claims** | Real testimonials, substantiated ROI, influencer disclosures | FTC Endorsement Guides, EU Omnibus Directive |
| **09** | **Accessibility (Alt text, Contrast, Keyboard)** | WCAG 2.1/2.2 AA: semantic tags, contrast ≥ 4.5:1, visible focus | W3C WCAG 2.1 AA, ADA Title III |
| **10** | **Business Identity & Contact Details** | Registered entity name, physical address, direct email/phone | Commercial Law, Consumer Protection |
| **11** | **Font and Image Licenses** | Commercial licensing clearance for stock media and webfonts | Copyright Law, DMCA, Foundry EULAs |
| **12** | **Data Deletion & Account Removal** | Self-serve deletion or clear request SLA (Right to be Forgotten) | GDPR Art 17, CCPA § 1798.105, App Store |
| **13** | **Email Unsubscribe Mechanism** | 1-click unsubscribe, no login wall, sender physical address | US CAN-SPAM, CASL, GDPR Art 7(3) |
| **14** | **Age Protections** | Age gate, minimum age in ToS, no minor behavioral profiling | COPPA (under 13), GDPR-K (under 16) |

---

## Process

### Phase 1 — Technical & Code Scan
1. **Network Tab Inspection**: Open site in incognito. Verify that no marketing pixels (Meta, TikTok, GA4, Hotjar) fire before cookie banner consent.
2. **Third-Party Script Scan**: Check external CDNs, tracking SDKs, and verify if Google Fonts are loaded externally or self-hosted.
3. **Automated Accessibility Scan**: Run Lighthouse / Axe-core for color contrast ratios, missing `alt` attributes, and unlabelled form elements.
4. **Form Inspection**: Verify forms collect only minimal required data; check that marketing consent boxes are unchecked by default.

### Phase 2 — UX & Consumer Protection Walkthrough
1. **Pricing & Checkout Flow**: Verify total price matches final bill without hidden surcharges, surprise fees, or pre-ticked add-ons.
2. **Cancellation & Unsubscribe Testing**: Verify subscriptions can be canceled online without forced phone calls; check email footer for 1-click unsubscribe.
3. **Claims & Testimonials Verification**: Audit social proof, guarantee wording, and case study metrics against substantiation standards.
4. **Account & Data Removal**: Check profile settings for a data deletion option or clear instructions with an SLA.

### Phase 3 — Legal Policies & Identity Verification
1. Inspect sitewide footer for active links to:
   - Privacy Policy (with processor list and DPO/contact email)
   - Terms of Service (with governing law and liability limit)
   - Refund & Cancellation Policy (clear refund window and renewal terms)
   - Cookie Policy & settings toggle
2. Verify registered business name, physical address, and contact info in footer or Imprint page.
3. Verify commercial licenses for custom typography and stock imagery.

---

## Output
1. **Compliance Scorecard**: A 14-point status table marking each item as `Pass`, `Partial`, or `Fail` with priority ratings (`P0` Blocker, `P1` High Risk, `P2` Best Practice).
2. **Remediation Action Plan**: Exact code snippets, policy copy templates, or UI redesign instructions for every failed checkpoint.
3. **Launch Sign-Off Certificate**: Final checklist confirmation prior to public traffic or payment activation.

## Tools Used
- Browser DevTools (Network tab, Console, Elements)
- Lighthouse / Axe DevTools / WAVE (Accessibility)
- Codebase Search / grep (tracking scripts, form attributes, font imports)
- Mail tester / email client (unsubscribe flow verification)

## Quick Prompt / Script for AI Agents
```
Act as a Senior Compliance & Trust Auditor. Evaluate [Target URL / Codebase] against the 14-Point Trust & Legal Compliance Framework:
1. Privacy Policy
2. Terms of Service
3. Refund and Cancellation Policy
4. Cookie Policy and Consent
5. Form Consent and Data Minimization
6. Third-Party SDKs and Integrations
7. Dark Patterns and Hidden Fees
8. Fake Reviews and Unsupported Claims
9. Accessibility: Alt Text, Contrast, Keyboard Navigation (WCAG 2.1 AA)
10. Business Identity and Contact Details
11. Font and Image Licenses
12. Data Deletion and Account Removal Process
13. Email Unsubscribe Mechanism
14. Age Protections

Provide a 14-point Scorecard (Pass/Partial/Fail), cite specific findings and file/line locations or URLs, and provide drop-in remediation copy and code for any gaps.
```

## Success Criteria
- [ ] All 14 checkpoints evaluated with explicit evidence.
- [ ] Zero P0 blockers remaining before launch.
- [ ] Legal policies published, accurate, and linked sitewide.
- [ ] No unconsented cookies or trackers firing on cold visits.
- [ ] 1-click unsubscribe and clear data deletion mechanisms verified.
