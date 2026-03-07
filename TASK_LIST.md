# Shadoo — Prioritized Task List for Development

> P0 = Must do before launch | P1 = Should do before launch | P2 = Nice to have

---

## Phase 1: Code Hardening (Week 1)

### P0-1: Fix TypeScript Strict Mode
Enable incrementally in tsconfig.json and tsconfig.app.json:
1. `"noImplicitAny": true` → fix all errors
2. `"strictNullChecks": true` → fix null errors
3. `"strict": true` → full strict mode

### P0-2: Remove All `as any` Casts (38 instances)
Replace with proper types from `src/integrations/supabase/types.ts`. Key files: useAdminVisits.ts, useVisitPricing.ts, useAgents.ts, AgentApprovalDialog.tsx, VisitReviewDialog.tsx, Reports.tsx

### P0-3: Fix `as unknown as` Double Casts (8 instances)
Fix underlying type mismatches. Key files: Reports.tsx, useAdminPayouts.ts, useSalesCallRequests.ts, useSubscriptionPlans.ts, useVisitPricing.ts

### P0-4: Switch Reports to Real Data
Set `USE_MOCK_DATA = false` in `src/lib/mockReportsData.ts`. Verify Supabase queries work. Keep mock file for demos via env variable.

### P0-5: Remove Mock Data from Hooks
Replace hardcoded mocks in: useWallet.ts, useSubscription.ts, usePackage.ts, Settings components

---

## Phase 2: Testing & Quality (Week 1-2)

### P0-6: Add Tests for Critical Hooks
Test: calcNPS(), calcCSAT(), calcCES(), calcTop2Box(), calcTopBox(), calcYesPercent(), lookupVisitPrice(), identifyQuestionRoles(), getPrimaryScore(), parseTiers(). Target: 80%+ coverage on utilities.

### P1-1: Add Prettier Config
Add `.prettierrc` with: semi, singleQuote, tabWidth 2, trailingComma es5, printWidth 100

### P1-2: Enable ESLint Unused Vars
Change `@typescript-eslint/no-unused-vars` from `"off"` to `"error"` and fix all issues.

### P1-3: Clean Up Console Statements
Remove debug console.log calls. Keep console.error in catch blocks.

---

## Phase 3: Backend Hardening (Week 2)

### P0-7: Audit RLS Policies
Verify RLS on all 24 tables. Check: visit_duration_pricing, agent_payouts, question_templates. Test cross-client data isolation.

### P0-8: Verify Edge Functions
Verify create-client error handling. Check Resend API integration. Plan mobile app edge functions.

### P1-4: Database Indexes Audit
Verify indexes on: visits.mission_id, visits.agent_id, visits.status, missions.user_id, branches.user_id

### P1-5: Add Database Triggers
Move from frontend JS to DB triggers: auto-payout on visit approval, re-queue on rejection, wallet balance validation.

---

## Phase 4: Feature Completion (Week 2-3)

### P1-6: Wallet Integration (PayMob)
### P1-7: Notification System (Resend emails + Supabase realtime)
### P1-8: Excel Export Audit (include CX scores, Arabic support)
### P2-1: Demo Account System (seeded data, demo role)
### P2-2: Subscription & Billing (payment processing, quotas)

---

## Phase 5: Production Readiness (Week 3-4)

### P1-9: Error Monitoring (Sentry)
### P1-10: Performance Optimization (code split, lazy load, query optimization)
### P2-3: Accessibility Audit (axe-core, keyboard nav, screen reader)
### P2-4: SEO & Meta Tags (landing page)

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 8 tasks | Type safety, real data, testing, RLS |
| **P1** | 10 tasks | Formatting, exports, payments, notifications |
| **P2** | 4 tasks | Demo, a11y, SEO |

**Start with**: P0-1 → P0-2 → P0-4 → P0-6
