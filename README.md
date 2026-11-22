# Riad Atlas Acacia — Marrakech Guest Guide & Manager Portal

> Mobile-first digital concierge, bedside QR deep-linking, authentic dining, spa treatments, excursions, and operations dashboard for **Riad Atlas Acacia** in the Marrakech Medina.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🏛️ About Riad Atlas Acacia

Nestled in **Riad Zitoun Jdid**, steps away from Bahia Palace, Dar Si Said Museum, and Jemaa El-Fna square, **Riad Atlas Acacia** is an intimate luxury boutique riad offering authentic Moroccan hospitality, courtyard plunge pool, hammam & spa, rooftop solarium, and homemade 3-course Moroccan dinners.

This dedicated guest application replaces legacy paper binders with an interactive, multilingual mobile web application and gives riad managers real-time visibility over incoming orders and item stock availability.

---

## 🌟 Key Features

### 1. Luxury Guest Experience (`/`)
- **Zero Friction**: No account creation, no password, no app store download required.
- **Bilingual**: Complete English and French localization across all descriptions, house policies, and booking workflows.
- **Mobile-First Luxury Aesthetic**: Designed specifically for 390px mobile viewports with warm cream (`#FAF7F2`), terracotta accents (`#B85C3C`), and deep olive tones (`#2C4A3E`).
- **Clean Guest UI**: Completely free of staff tools or downloadable QR assets.
- **Dynamic Stock Control**: Dishes or excursions flagged unavailable by the manager immediately show a `"Temporarily Unavailable"` badge and cannot be booked.

### 2. Bedside QR Code Placards
Each private suite and key location has a dedicated high-resolution QR placard (1024×1024):
- **Suite Atlas** (`Suite 1` • 1st Floor) → `/?src=qr-room&room=atlas`
- **Suite Majorelle** (`Suite 2` • 1st Floor) → `/?src=qr-room&room=majorelle`
- **Suite Ourika** (`Suite 3` • 1st Floor) → `/?src=qr-room&room=ourika`
- **Suite Koutoubia** (`Suite 4` • 1st Floor) → `/?src=qr-room&room=koutoubia`
- **Suite Makhila** (`Suite 5` • Rooftop Terrace) → `/?src=qr-room&room=makhila`
- **Suite Mimosa** (`Suite 6` • Rooftop Terrace) → `/?src=qr-room&room=mimosa`
- **Reception & Lobby** (`Patio`) → `/?src=qr-reception`
- **Pre-Arrival Welcome** (`Transfers & Airport`) → `/?src=prearrival`

Scanning automatically identifies the guest's suite, bypasses the cover hero, and lands directly into the catalog.

### 3. WhatsApp Direct Booking with Pure Pricing Engine
- When a guest books a 3-course Moroccan dinner, a hammam ritual, an Agafay desert expedition, or airport transfer, the pure pricing engine (`lib/pricing`) computes all prices in Moroccan Dirhams (MAD) with secondary EUR reference.
- Formats a human-readable booking message and routes directly to the riad's official WhatsApp (`+212 663-715754`).
- Non-blocking asynchronous logging stores the order in the manager's live dashboard.

### 4. Manager Operations Portal (`/manager`)
Accessible to riad staff via `/manager`:
- **PIN-Protected**: Secured by a 4-digit PIN (default: `1234`, configurable in `data/riad.json`).
- **Orders Tracking**: Live incoming order feed detailing suite, guest name, flight number (for airport pickup), menu items, and total price with 1-click status bumps (**New → Seen → Confirmed → Done**).
- **Stock & Availability**: Toggle switch to temporarily disable any dish, massage, or excursion if ingredients run out or slots are booked.
- **Placards Print Center**: Direct preview, download, and A5 printable sheet for all in-room placards (`/qr-placards/print.html`).

---

## 📊 Manager Operations Dashboard (`/manager`)

The dedicated **Manager Portal** empowers riad hosts and concierge staff to oversee guest activity, track orders, adjust menu availability in real time, and manage in-room QR placards without touching code.

```
                              ┌──────────────────────────┐
                              │     /manager (Login)     │
                              │    4-Digit PIN (1234)    │
                              └────────────┬─────────────┘
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     ▼                     ▼                     ▼
          ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
          │  📋 Orders Feed    │ │  📦 Stock Control  │ │  🖨️ QR Placards   │
          │  - New / Seen      │ │  - Menu items      │ │  - 6 Private Suites│
          │  - Confirmed / Done│ │  - Spa treatments  │ │  - Reception       │
          │  - Flight tracker  │ │  - Real-time badge │ │  - A5 Print Sheet  │
          └────────────────────┘ └────────────────────┘ └────────────────────┘
```

### 🔐 Authentication & Security
- **Access Route**: `https://riad-atlas-acacia-guest-guide.vercel.app/manager`
- **Default PIN**: `1234`
- **PIN Configuration**: The PIN is stored in `data/riad.json` under `"manager_pin"` and verified securely on the server/API.
- **Session Lifespan**: Successfully entering the PIN grants session access via `sessionStorage`. Logging out or closing the browser locks the portal immediately.

### 📋 Tab 1: Live Order Tracking
Whenever a guest completes the booking modal and clicks **Request via WhatsApp**, the order is asynchronously logged to the dashboard:
- **Comprehensive Details**: Displays the guest's suite (e.g. *Suite Atlas*, *Suite Mimosa*), guest name, flight number (for airport transfers), selected options, customized 3-course dinner selections, special dietary notes, and estimated total in MAD and EUR.
- **Order Lifecycle Management**: Each order features 1-click status progression:
  - 🟡 **New**: Newly arrived order awaiting host review.
  - 🔵 **Seen**: Acknowledged by staff.
  - 🟢 **Confirmed**: Confirmed with the guest on WhatsApp or booked with the driver/chef.
  - ⚪ **Done**: Service completed.
- **Filter Bar**: Filter orders at a glance by status (*All*, *New*, *Seen*, *Confirmed*, *Done*).
- **Offline & Static Resilience**: Built with dual-layer persistence — orders POST to `/api/orders` (Node runtime) and automatically sync to `localStorage`, ensuring the dashboard functions reliably even on static serverless deployments.

### 📦 Tab 2: Dynamic Stock & Menu Availability
Manage real-time availability of culinary items, hammam slots, and excursions:
- **Instant Toggle**: Switch any item between *Available* and *Unavailable* with a single tap.
- **Category Navigation**: Filter by category (*Dining*, *Spa & Wellness*, *Day Trips*, *Desert Tours*, *Workshops*).
- **Immediate Guest Protection**: When an item is marked unavailable in the manager dashboard, the guest app immediately reflects this change:
  - The card is subtly dimmed.
  - Displays an amber `"Temporarily Unavailable"` / `"Temporairement Indisponible"` badge.
  - The booking button is disabled, preventing guests from ordering out-of-stock dishes or fully-booked activities.

### 🖨️ Tab 3: Bedside QR Placards Center
Manage and print the physical in-room QR code signage:
- **Suite-by-Suite Placard Preview**: View cards for all 6 suites (*Atlas*, *Majorelle*, *Ourika*, *Koutoubia*, *Makhila*, *Mimosa*), the *Reception Patio*, and *Pre-Arrival*.
- **Download High-Res Assets**: Download high-resolution PNGs (1024×1024) or SVGs directly from the dashboard.
- **1-Click A5 Batch Printing**: Click **Print All Placards (A5)** to open `/qr-placards/print.html`, formatted specifically for luxury hotel desktop tent cards and bedside acrylic stands.
- **Deep-Link URL Copying**: Copy the exact scan URL for any room to clipboard in one click.

---

## 📁 Repository Structure

```
degitize-riad-acacia/
├── client/                     # Frontend client (Vite + React 19)
│   ├── public/
│   │   ├── qr-placards/        # High-res QR codes & printable A5 layout
│   │   │   ├── print.html      # Print-ready placards sheet
│   │   │   ├── qr-suite-*.png  # 1024x1024 suite QR codes
│   │   │   └── qr-suite-*.svg  # Scalable vector QR codes
│   │   ├── riad-atlas-acacia/  # Authentic riad photography & logo
│   │   ├── manifest.json       # PWA manifest
│   │   └── sw.js               # Offline service worker
│   └── src/
│       ├── components/         # UI components & interactive catalog
│       │   ├── BookingModal.tsx# WhatsApp booking modal & flight tracker
│       │   ├── CatalogSection.tsx # Catalog with dynamic stock checks
│       │   └── ...
│       ├── lib/
│       │   ├── pricing/        # Pure, tested pricing engine
│       │   ├── orderLogger.ts  # Non-blocking order persistence
│       │   └── whatsapp.ts     # WhatsApp message builder
│       └── pages/
│           ├── Home.tsx        # Guest guide application
│           ├── Manager.tsx     # Operations & tracking dashboard
│           └── ManagerLogin.tsx# 4-digit PIN authentication
├── data/                       # Single Source of Truth
│   ├── riad.json               # Riad config, amenities, suites & PIN
│   ├── places.json             # Medina walking guide & curated places
│   ├── routes.json             # Medina step-by-step walking routes
│   └── riads/
│       └── riad-atlas-acacia/
│           └── catalog.json    # Complete dining, spa & excursion catalog
├── scripts/
│   └── generate-qr-placards.mjs# Automated QR code generation script
├── server/
│   └── index.ts                # Express server for Node runtime
└── vercel.json                 # Vercel deployment configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone https://github.com/mostaach/riad-atlas-acacia-guest-guide.git
cd riad-atlas-acacia-guest-guide

# Install dependencies
pnpm install
```

### Development
```bash
pnpm dev
```
The application will start on `http://localhost:3000/` (or next available port).

### Run Test Suite
```bash
# Type check
pnpm check

# Unit tests (Pricing Engine)
pnpm vitest run
```

### Production Build
```bash
pnpm build
```

---

## 🌐 Deployment on Vercel

The project is pre-configured with `vercel.json` for one-click Vercel deployment:

1. Import this repository in [Vercel](https://vercel.com).
2. Set Framework Preset: **Vite**.
3. Build Command: `npm run build` (or `pnpm build`).
4. Output Directory: `dist/public`.
5. Deploy!

The QR codes will automatically target `https://riad-atlas-acacia-guest-guide.vercel.app` (or your custom domain configured in Vercel).

---

## 🔒 Security & Data Privacy

- No customer passwords or credit cards are collected.
- Guest orders transition directly into end-to-end encrypted WhatsApp communication with the riad reception.
- Riad manager access is protected by PIN-based authentication.
- All live order and stock runtime files (`data/orders.json`, `data/stock.json`) are strictly gitignored.

---

## 📜 License

Private & Proprietary © Riad Atlas Acacia, Marrakech. All rights reserved.
