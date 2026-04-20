<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Firebase-12-orange?style=for-the-badge&logo=firebase" />
  <img src="https://img.shields.io/badge/Gemini_AI-live-4285F4?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Tests-26_passing-brightgreen?style=for-the-badge&logo=jest" />
</p>

<h1 align="center">VenueFlow 🏟️</h1>
<p align="center"><strong>Smart Stadium Companion — Real-time crowd intelligence for the modern spectator.</strong></p>

---

## Overview

**VenueFlow** is a real-time venue intelligence platform built for large-scale sporting events. It combines live crowd density simulation, a Google Gemini-powered AI concierge, live football match scores, and an interactive facility map — all in a single, premium web interface.

Built for the **[Prompt Wars](https://promptwars.dev)** challenge (Apr 2026).

> **Problem Statement**: *Design a solution that improves the physical event experience for attendees at large-scale sporting venues, addressing crowd movement, waiting times, and real-time coordination.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Live Metrics Dashboard** | Real-time crowd density, gate wait times, and movement flow — updated every 4.5 seconds |
| 🤖 **Gemini AI Concierge** | Context-aware assistant powered by Google Gemini 1.5 Flash; answers questions about queues, exits, and facilities using live venue sensor data |
| ⚽ **Live Match Scores** | Fetches live football fixtures via [API-Sports](https://api-sports.io) — shows the current match score in the header |
| 🗺️ **Venue Live View** | Crowd heatmap overlays on a stadium blueprint with animated density zones |
| 🚨 **Emergency Page** | Dedicated emergency information and exit guidance |
| 🧺 **Facilities Page** | Interactive facilities finder for concessions, restrooms, and services |
| 🗺️ **Live Map Page** | Google Maps integration with venue POI overlays |
| 📱 **Fully Responsive** | Mobile-first design with a collapsible bottom nav for small screens |

---

## 🛠️ Tech Stack

### Core
- **[Next.js 16](https://nextjs.org)** — App Router, TypeScript, API Routes
- **[React 19](https://react.dev)** — Latest concurrent features
- **[Tailwind CSS v4](https://tailwindcss.com)** + **[shadcn/ui](https://ui.shadcn.com)** — Component styling

### Google Services
- **[Google Gemini AI](https://ai.google.dev)** (`@google/generative-ai`) — AI concierge backend
- **[Cloud Natural Language API](https://cloud.google.com/natural-language)** — Entity extraction on user queries to enrich Gemini prompts
- **[Firebase](https://firebase.google.com)** (`firebase@12`) — Firestore + Analytics event tracking
- **[Google Maps](https://developers.google.com/maps)** (`@vis.gl/react-google-maps`) — Venue map integration
- **[BigQuery](https://cloud.google.com/bigquery)** (`@google-cloud/bigquery`) — Venue event logging (dashboard opens, density alerts)
- **[Cloud Functions (Gen 2)](https://cloud.google.com/functions)** — HTTP function that processes crowd events and computes alert levels

### Other
- **[Framer Motion](https://www.framer.com/motion/)** — Animations and transitions
- **[API-Sports Football API](https://api-sports.io)** — Live match data
- **[Jest](https://jestjs.io)** + **[Testing Library](https://testing-library.com/)** — Unit and integration testing

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)
- A [Firebase](https://console.firebase.google.com) project
- A [Google Maps](https://console.cloud.google.com) API key
- An [API-Sports](https://rapidapi.com/api-sports/api/api-football/) key (optional — for live scores)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/venueflow.git
cd venueflow
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

```env
# Server-side only (not exposed to the browser)
GOOGLE_AI_STUDIO_API_KEY=your_gemini_key_here
API_FOOTBALL_KEY=your_football_api_key_here

# Firebase (client-side, safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

> **Note**: The Football API key uses the `API_FOOTBALL_KEY` name (no `NEXT_PUBLIC_` prefix) intentionally — it is only accessed server-side in an API route to prevent key exposure.

### 3. Run in Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

VenueFlow has **26 tests** across three test suites covering the UI, accessibility, and API logic.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

### Test Suites

| Suite | Tests | Coverage |
|---|---|---|
| `Home.test.tsx` | 12 tests — page render, chat UI, accessibility, user flows |
| `Navbar.test.tsx` | 6 tests — navigation, ARIA attributes, skip link |
| `api.test.ts` | 8 tests — input validation, demo mode, error handling |

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard (metrics, map, AI chat)
│   ├── layout.tsx            # Root layout with fonts and metadata
│   ├── map/page.tsx          # Google Maps integration page
│   ├── facilities/page.tsx   # Facilities finder page
│   ├── emergency/page.tsx    # Emergency info and exit guidance
│   ├── api/
│   │   ├── assistant/route.ts  # POST — Gemini AI concierge endpoint
│   │   └── football/route.ts   # GET  — Live match scores endpoint
│   └── __tests__/
│       ├── Home.test.tsx
│       └── api.test.ts
├── components/
│   ├── Navbar.tsx            # Sticky nav with skip-to-content
│   └── __tests__/
│       └── Navbar.test.tsx
└── lib/
    ├── firebase.ts           # Firebase init + Analytics helper
    └── utils.ts              # Tailwind class merge utility
```

---

## 🔒 Security

- **API keys are kept server-side** — the Football API key has no `NEXT_PUBLIC_` prefix and is only accessed inside an API route
- **Input validation** on all API routes — message length capped at 1,000 characters, type checked, and sanitized before Gemini prompt injection
- **No raw error messages** returned to clients — internal errors are mapped to generic responses

---

## ♿ Accessibility

- Skip-to-content link visible on keyboard focus
- `aria-label="Main navigation"` on `<nav>`
- `aria-current="page"` on active navigation links
- `aria-live="polite"` + `role="log"` on the live chat message area
- `aria-label` on all icon-only buttons and inputs
- `role="status"` + `aria-label` on loading states
- All decorative icons have `aria-hidden="true"`

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint via `next lint` |
| `npm test` | Run Jest test suite |
| `npm run test:coverage` | Run tests with V8 coverage report |

---

## 📄 License

Built for **Prompt Wars 2026**. All rights reserved.

---

<p align="center">Built with 💙 using Google Antigravity · Next.js · Firebase · Gemini AI</p>
