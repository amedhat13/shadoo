# Shadoo Platform — Project Overview

## What is Shadoo?

Shadoo is a B2B SaaS mystery shopping platform connecting **organizations** (clients) with **field agents** who conduct undercover store visits. The platform evaluates service quality, compliance, and customer experience across physical branch locations.

## Three-Sided Ecosystem

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client Portal  │     │  Admin Portal   │     │   Mobile App    │
│  (Web Dashboard)│     │  (Web Dashboard)│     │   (Agent App)   │
│                 │     │                 │     │                 │
│ • Create missions│    │ • Manage platform│    │ • Accept missions│
│ • Manage branches│    │ • Verify branches│    │ • Complete visits│
│ • View reports  │     │ • Approve agents │    │ • Submit evidence│
│ • Fund wallet   │     │ • Process payouts│    │ • Request payouts│
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   Lovable Cloud Backend │
                    │  (Supabase + Edge Fns)  │
                    │                         │
                    │ • PostgreSQL Database    │
                    │ • Auth & RBAC           │
                    │ • File Storage          │
                    │ • Realtime Subscriptions│
                    │ • Edge Functions (API)  │
                    └─────────────────────────┘
```

---

## End-to-End Experience

### Phase 1: Onboarding

1. **Client signs up** → creates account with company name, email, password
2. **Email verification** → confirms email address
3. **Profile setup** → uploads logo, adds phone number
4. **Subscription selection** → picks a plan (Starter / Pro / Business / Enterprise)
5. **Wallet funding** → tops up wallet via PayMob (credit card, mobile wallet)

### Phase 2: Branch Setup

1. **Client adds branches** → name (EN/AR), address, city, district, Google Maps link
2. **Bulk import** → CSV upload for multiple branches at once
3. **Admin reviews** → verifies branch exists at stated location (pending → verified / rejected)
4. **Client notified** → email + in-app notification of branch status

### Phase 3: Mission Creation

1. **Client creates mission** → selects branch, agent tier, number of visits
2. **Questionnaire setup** → picks from admin templates or builds custom questions (EN/AR)
3. **Photo requirements** → specifies what photos agents must capture
4. **Purchase items** → optional: defines what agents should buy + per-visit budget
5. **Visit scheduling** → sets dates, times, and duration windows
6. **Geo-tagging** → enables location verification for agent check-in
7. **Budget review** → system calculates total cost (visits × budget)
8. **Publish** → deducts from wallet + visit quota atomically; mission goes live

### Phase 4: Agent Assignment & Execution (Mobile App)

1. **Agent browses** → sees available missions matching their tier + location
2. **Agent accepts** → assigned to a specific visit slot
3. **Agent travels** → GPS tracks approach to branch (if geo-tagged)
4. **Agent checks in** → geo-fence validates arrival at branch
5. **Agent performs visit** → follows questionnaire, takes photos, makes purchases
6. **Agent submits** → uploads answers, photos, receipts via mobile app

### Phase 5: Review & Reporting

1. **Admin reviews visit** → checks answers, photos, receipt for quality
2. **Visit approved/rejected** → if rejected, agent can resubmit or lose payout
3. **Client views results** → sees completed visit data, photos, answers in dashboard
4. **Reports generated** → analytics by branch, time period, question responses
5. **Export** → CSV/Excel download of mission data

### Phase 6: Financial Settlement

1. **Agent earnings credited** → approved visits add to agent balance
2. **Agent requests payout** → specifies amount + payment method (bank / mobile wallet)
3. **Finance admin approves** → verifies details, processes payment
4. **Transaction recorded** → audit trail for all financial movements

### Phase 7: Ongoing Operations

- **Subscription renewal** → auto-renews monthly; visit quota resets
- **Plan upgrades** → unlock higher agent tiers + more visits
- **Wallet top-ups** → as needed for mission budgets
- **Branch re-verification** → if client updates branch details
- **Agent tier promotions** → based on completed visits + ratings

---

## User Roles

| Role | Portal | Permissions |
|------|--------|-------------|
| `super_admin` | Admin | Full platform access, manage other admins |
| `admin` | Admin | All operations except admin management |
| `support` | Admin | Client/agent support, branch verification |
| `finance` | Admin | Payouts, wallet adjustments, financial reports |
| `operations` | Admin | Missions, visits, agent management |
| `client_admin` | Client | Full org access, invite team members |
| `client_manager` | Client | Create/manage missions, view reports |
| `client_viewer` | Client | View-only access to reports |
| `agent` | Mobile | Accept missions, complete visits, request payouts |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Client + Admin) | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Lovable Cloud (Supabase) — PostgreSQL, Auth, Storage, Edge Functions |
| Mobile App (Future) | React Native or Flutter |
| Payments | PayMob (Egypt) |
| Internationalization | i18next (English + Arabic, RTL support) |
| Maps | Google Maps API |
| Real-time | Supabase Realtime (PostgreSQL changes) |
