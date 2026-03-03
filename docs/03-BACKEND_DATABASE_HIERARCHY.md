# Shadoo Platform — Backend & Database Hierarchy

## Database Schema Overview

```
                        ┌─────────────┐
                        │  auth.users │  (Supabase managed)
                        └──────┬──────┘
                               │ user_id
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────┴──────┐ ┌──────┴──────┐ ┌───────┴───────┐
       │  profiles   │ │ user_roles  │ │    wallets    │
       │  (1:1)      │ │  (1:many)   │ │    (1:1)      │
       └──────┬──────┘ └─────────────┘ └───────┬───────┘
              │                                │
              │                    ┌───────────┴───────────┐
              │                    │ wallet_transactions   │
              │                    └───────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────┴────┐    ┌───────┴──────────┐
│ branches│    │ user_subscriptions│──→ subscription_plans
└────┬────┘    └──────────────────┘
     │
┌────┴────┐
│ missions│
└────┬────┘
     │
┌────┴────┐
│  visits │──→ agents ──→ agent_payouts
└─────────┘
```

---

## Table Hierarchy & Relationships

### Tier 1: Core Identity

| Table | Purpose | Owner |
|-------|---------|-------|
| `profiles` | User profile data (name, company, phone, avatar) | User (1:1) |
| `user_roles` | RBAC roles — **separate table for security** | User (1:many) |
| `wallets` | Financial balance per user | User (1:1) |

### Tier 2: Client Operations

| Table | Purpose | Owner |
|-------|---------|-------|
| `branches` | Physical locations to be mystery-shopped | Client |
| `missions` | Sets of visits targeting a branch | Client |
| `visits` | Individual agent assignments within a mission | Mission → Agent |
| `wallet_transactions` | All financial movements (topup, deduction, refund) | User |
| `user_subscriptions` | Active subscription linking user → plan | User |

### Tier 3: Agent Operations

| Table | Purpose | Owner |
|-------|---------|-------|
| `agents` | Agent profile, tier, verification, earnings | Agent (1:1 with auth.users) |
| `agent_payouts` | Payout requests and processing records | Agent |

### Tier 4: Platform Configuration (Admin-managed)

| Table | Purpose | Managed By |
|-------|---------|------------|
| `subscription_plans` | Available plans with pricing | Admin |
| `agent_tiers` | Tier definitions (A/B/C) with requirements | Admin |
| `question_templates` | Reusable questionnaire templates | Admin |
| `cities` | Supported cities | Admin |
| `districts` | Districts within cities | Admin |
| `system_config` | Key-value platform settings | Admin |
| `notification_templates` | Email/SMS/push templates | Admin |

### Tier 5: Audit & Monitoring

| Table | Purpose | Access |
|-------|---------|--------|
| `audit_logs` | Immutable record of admin actions | Admin (read/insert only) |
| `notifications` | In-app notifications for all users | User (read own) |
| `organization_members` | Multi-user org team membership | Org owner |

---

## Security Architecture

### Row-Level Security (RLS) Strategy

```
Every table has RLS ENABLED.

Pattern 1 — User-owned data:
  SELECT/UPDATE/DELETE WHERE auth.uid() = user_id

Pattern 2 — Admin override:
  ALL WHERE is_admin(auth.uid())

Pattern 3 — Public read:
  SELECT WHERE is_active = true (plans, tiers, cities)

Pattern 4 — Cross-reference:
  Clients see visits WHERE mission.user_id = auth.uid()
  Agents see visits WHERE agent.user_id = auth.uid()
```

### Security Definer Functions

| Function | Purpose |
|----------|---------|
| `has_role(user_id, role)` | Check specific role without recursion |
| `is_admin(user_id)` | Check any admin role (super_admin/admin/support/finance/operations) |

### Data Isolation

```
Client A cannot see Client B's data (branches, missions, visits)
Agent X cannot see Agent Y's data (visits, payouts, earnings)
Only admins have cross-tenant visibility
```

---

## Recommended Indexes

```sql
-- High-traffic queries
CREATE INDEX idx_branches_user_status ON branches(user_id, status);
CREATE INDEX idx_missions_user_status ON missions(user_id, status);
CREATE INDEX idx_visits_mission_status ON visits(mission_id, status);
CREATE INDEX idx_visits_agent_status ON visits(agent_id, status);
CREATE INDEX idx_wallet_tx_user ON wallet_transactions(user_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_agents_status_tier ON agents(status, tier);
```

---

## Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `client-logos` | Yes | Company logos uploaded by clients |
| `visit-photos` | No | Photos captured during visits (agent-uploaded) |
| `receipt-photos` | No | Purchase receipt photos |
| `verification-docs` | No | Agent ID documents for verification |
| `avatars` | Yes | User profile pictures |
| `report-exports` | No | Generated CSV/Excel report files |

---

## Database Functions & Triggers

### Current Functions

| Function | Type | Purpose |
|----------|------|---------|
| `handle_new_user()` | Trigger | Auto-create profile + wallet on signup |
| `update_updated_at_column()` | Trigger | Auto-update `updated_at` timestamps |
| `has_role()` | Security Definer | RBAC role check |
| `is_admin()` | Security Definer | Admin role check |

### Recommended Additional Functions

| Function | Type | Purpose |
|----------|------|---------|
| `publish_mission()` | RPC | Atomic: validate → deduct wallet → deduct quota → update status |
| `archive_mission()` | RPC | Atomic: refund remaining budget → update status |
| `approve_visit()` | RPC | Atomic: update visit → credit agent → increment mission counter |
| `process_payout()` | RPC | Atomic: deduct agent balance → record transaction → update status |
| `reset_monthly_quotas()` | CRON | Monthly: reset visits_used_this_month for all active subscriptions |

---

## Realtime Subscriptions

| Table | Events | Consumer |
|-------|--------|----------|
| `notifications` | INSERT | All portals — live notification bell |
| `visits` | UPDATE | Client portal — live visit status changes |
| `missions` | UPDATE | Client portal — mission progress |
| `branches` | UPDATE | Client portal — branch verification status |
| `agent_payouts` | UPDATE | Mobile app — payout status changes |
