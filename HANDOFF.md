# Shadoo — Developer Handoff Document

> **Date**: March 2026
> **From**: Product/Design phase (Lovable AI-generated)
> **To**: Software Engineer + Claude Code for finalization
> **Project**: Shadoo Mystery Shopping Platform

---

## 1. What Is This Project?

Shadoo is a **B2B SaaS mystery shopping platform** based in **Egypt**. It connects organizations (clients) with field agents who conduct undercover store visits to evaluate service quality.

### Three Interfaces

| Interface | Status | Tech |
|-----------|--------|------|
| **Client Portal** (Web) | UI Complete, needs backend hardening | React + Vite + Supabase |
| **Admin Portal** (Web) | UI Complete, needs backend hardening | Same codebase, `/admin/*` routes |
| **Agent Mobile App** | NOT BUILT YET — separate project | Will use same Supabase backend |

### What Lovable Built

Lovable (AI code generation) built the entire frontend for both client and admin portals. It works visually but has typical Lovable issues: loose TypeScript, mock data in places, `as any` casts, and no tests. **Your job is to harden this into production-ready code.**

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3 + TypeScript 5.8 |
| Build | Vite 5.4 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix) |
| State | TanStack React Query 5.83 |
| Forms | React Hook Form 7.61 + Zod 3.25 |
| i18n | i18next 25.8 (English + Arabic, RTL support) |
| Charts | Recharts 2.15 |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime) |
| Export | XLSX 0.18.5 |

---

## 3. How to Run

```bash
npm install
npm run dev      # port 8080
npm run build    # production
npm test         # vitest
npm run lint     # eslint
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials.

---

## 4. Project Structure

```
src/
├── assets/              # Static images, icons
├── components/
│   ├── admin/           # Admin portal components
│   ├── auth/            # Client auth (login, register, protected routes)
│   ├── branches/        # Branch CRUD components
│   ├── common/          # Shared UI (LanguageSwitcher, ThemeToggle)
│   ├── layout/          # Client sidebar, header
│   ├── missions/        # Mission wizard, question builder
│   ├── reports/         # Client report components
│   ├── settings/        # Account, billing, team settings
│   ├── ui/              # shadcn/ui primitives (DO NOT EDIT)
│   └── wallet/          # Wallet funding, transactions
├── hooks/               # 25+ custom hooks (data fetching, mutations)
├── i18n/locales/        # Translation files (en/ + ar/)
├── integrations/supabase/  # Supabase client + auto-generated types
├── lib/                 # Constants, utilities, mock data
├── pages/               # Route-level page components
├── test/                # Test setup (almost empty)
└── types/               # TypeScript type definitions

supabase/
├── migrations/          # 21 SQL migration files
└── functions/           # Edge functions (create-client)

docs/                    # 11 comprehensive documentation files
```

---

## 5. Key Files to Know

| File | What It Does |
|------|-------------|
| `src/App.tsx` | All routes, wrapped in providers |
| `src/hooks/useAuth.ts` | Auth state management |
| `src/hooks/useMissions.ts` | Mission CRUD |
| `src/hooks/useAdminVisits.ts` | Visit approve/reject (auto-payout + re-queue) |
| `src/hooks/useVisitPricing.ts` | Duration-based pricing lookup |
| `src/hooks/useAgents.ts` | Agent CRUD + approval |
| `src/hooks/useClientReports.ts` | Report calculations (NPS, CSAT, CES, all CX) |
| `src/lib/mockReportsData.ts` | Mock data — `USE_MOCK_DATA = true` (must switch to false) |
| `src/lib/constants.ts` | Tiers, statuses, nav |
| `src/integrations/supabase/types.ts` | Auto-generated DB types (24 tables) |

---

## 6. Business Logic

### CX Methodologies (12 types)
NPS, CSAT, CES, Overall Score, Top 2 Box, Top Box, Menu Try-Out, Buy & Try, Delivery CX, Call Center CX, App/Digital CX, In-Store CX

### Agent Tiers
- Tier C (Entry), Tier B (Standard), Tier A (Premium)
- Agents can be in MULTIPLE tiers
- Pricing is per tier + per visit duration (not commission)

### Visit Lifecycle
Created → Assigned → In Progress → Submitted → Under Review → Approved (auto-payout) / Rejected (re-queued)

### Location
Currency: EGP | Country: Egypt | Cities: Cairo, Alexandria, Giza, etc.

---

## 7. Known Issues to Fix

| Issue | Severity | Count |
|-------|----------|-------|
| TypeScript strict mode OFF | Critical | All checks disabled |
| `as any` casts | Critical | 38 instances |
| `as unknown as` double casts | High | 8 instances |
| Reports on mock data | Critical | USE_MOCK_DATA = true |
| Hooks with hardcoded mocks | High | Wallet, Subscription, Package, Settings |
| Zero tests | Critical | Only 1 placeholder test |
| No Prettier config | Medium | No formatting standard |
| ESLint unused vars OFF | Medium | Dead code accumulates |

See `TASK_LIST.md` for the full prioritized plan.

---

## 8. Documentation Index

| Doc | Priority |
|-----|----------|
| `docs/BACKEND_GUIDE_FOR_CLAUDE_CODE.md` | READ FIRST (37KB) |
| `docs/01-PROJECT_OVERVIEW.md` | High |
| `docs/03-BACKEND_DATABASE_HIERARCHY.md` | High |
| `docs/04-MAIN_FLOWS.md` | High |
| `docs/05-FEATURES_LIST.md` | Medium |
| `docs/08-ANALYTICS_RATING_SYSTEM.md` | Medium |
| `docs/06-NOTIFICATION_SYSTEM.md` | Medium |
| `docs/I18N_PLAN.md` | Low |
