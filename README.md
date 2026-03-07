# Shadoo — Mystery Shopping Platform

A B2B SaaS mystery shopping platform connecting organizations with field agents who conduct undercover store visits to evaluate service quality, compliance, and customer experience.

**Country**: Egypt | **Currency**: EGP | **Languages**: English + Arabic (RTL)

## Architecture

| Interface | Tech | Status |
|-----------|------|--------|
| Client Portal | React + Vite + Supabase | UI Complete |
| Admin Dashboard | Same codebase (`/admin/*` routes) | UI Complete |
| Agent Mobile App | Separate project (React Native / Flutter) | Not started |

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui (Radix)
- **State**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **i18n**: i18next (English + Arabic with RTL)
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in your Supabase credentials

# 3. Start dev server (http://localhost:8080)
npm run dev

# 4. Build for production
npm run build

# 5. Run tests
npm test
```

## Project Structure

```
src/
├── components/         # React components (admin/, auth/, missions/, etc.)
├── hooks/              # 25+ custom hooks (data fetching, business logic)
├── pages/              # Route pages (client + admin)
├── i18n/locales/       # Translation files (en/ + ar/)
├── integrations/       # Supabase client & auto-generated types
├── lib/                # Constants, utilities, mock data
├── types/              # TypeScript type definitions
└── test/               # Test setup

supabase/
├── migrations/         # 21 database migration files
└── functions/          # Edge functions (create-client)

docs/                   # 11 comprehensive documentation files
```

## Key Documentation

| File | Description |
|------|-------------|
| `HANDOFF.md` | Full developer handoff guide |
| `TASK_LIST.md` | Prioritized task list for development |
| `.claude/CLAUDE.md` | Claude Code project rules and conventions |
| `docs/BACKEND_GUIDE_FOR_CLAUDE_CODE.md` | Backend development guide (37KB) |
| `docs/01-PROJECT_OVERVIEW.md` | Platform overview and flows |
| `docs/03-BACKEND_DATABASE_HIERARCHY.md` | Database schema reference |
| `docs/05-FEATURES_LIST.md` | Feature status checklist |

## Scripts

```bash
npm run dev          # Dev server (port 8080)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests (Vitest)
npm run test:watch   # Test watch mode
```
