# Shadoo Platform — API Design

## Architecture

All APIs are implemented as **Supabase Edge Functions** (Deno runtime) + **direct Supabase client queries** (for simple CRUD). Edge functions handle complex business logic, external integrations, and multi-step transactions.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Client Portal│  │ Admin Portal │  │  Mobile App  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │    Supabase JS SDK (direct DB)    │
       │    + Edge Functions (complex)     │
       └─────────────────┼─────────────────┘
                         │
              ┌──────────┴──────────┐
              │  Supabase Backend   │
              │  • PostgREST (CRUD) │
              │  • Edge Functions   │
              │  • Auth             │
              │  • Storage          │
              │  • Realtime         │
              └─────────────────────┘
```

---

## API Categories

### A. Direct Supabase Client Queries (Simple CRUD)

These use the Supabase JS SDK directly from the frontend. RLS policies enforce access control.

| Resource | Client Portal | Admin Portal | Mobile App |
|----------|:---:|:---:|:---:|
| `profiles` | Read/Update own | Read/Update all | Read/Update own |
| `branches` | Full CRUD (own) | Full CRUD (all) | Read (for missions) |
| `missions` | Full CRUD (own) | Full CRUD (all) | Read (available) |
| `visits` | Read (own missions) | Full CRUD (all) | Create/Update/Read (own) |
| `wallets` | Read own | Read/Update all | Read own |
| `wallet_transactions` | Read own | Read all | Read own |
| `subscription_plans` | Read active | Full CRUD | Read active |
| `user_subscriptions` | Read own | Full CRUD | Read own |
| `question_templates` | Read public | Full CRUD | — |
| `agent_tiers` | Read active | Full CRUD | Read active |
| `notifications` | Read/Update own | Insert + Read all | Read/Update own |
| `agents` | — | Full CRUD | Read/Update own |
| `agent_payouts` | — | Full CRUD | Create/Read own |
| `audit_logs` | — | Read/Insert | — |
| `cities` / `districts` | Read active | Full CRUD | Read active |
| `system_config` | — | Full CRUD | — |
| `notification_templates` | — | Full CRUD | — |
| `user_roles` | Read own | Full CRUD (super_admin) | Read own |

---

### B. Edge Functions (Complex Business Logic)

#### 1. Client ↔ Backend

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/create-client` | POST | Admin creates a client account with auto-generated password | ✅ Done |
| `/publish-mission` | POST | Validate + deduct wallet + quota atomically | 🔲 TODO |
| `/archive-mission` | POST | Release remaining budget back to wallet | 🔲 TODO |
| `/wallet-topup-initiate` | POST | Create PayMob payment intention | 🔲 TODO |
| `/wallet-topup-callback` | POST | PayMob webhook → credit wallet | 🔲 TODO |
| `/wallet-topup-verify` | GET | Check payment status | 🔲 TODO |
| `/export-report` | POST | Generate CSV/Excel for mission data | ✅ Done (client-side via xlsx) |
| `/team-invite` | POST | Send invitation email to org member | 🔲 TODO |

#### 2. Admin ↔ Backend

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/admin/verify-branch` | POST | Approve/reject branch with notification | 🔲 TODO |
| `/admin/approve-agent` | POST | Approve agent + assign tier | 🔲 TODO |
| `/admin/adjust-wallet` | POST | Manual credit/debit with audit log | 🔲 TODO |
| `/admin/process-payout` | POST | Approve + process agent payout | 🔲 TODO |
| `/admin/bulk-payout` | POST | Process multiple payouts at once | 🔲 TODO |
| `/admin/impersonate` | POST | Generate impersonation token | 🔲 TODO |
| `/admin/suspend-client` | POST | Suspend client account | 🔲 TODO |
| `/admin/suspend-agent` | POST | Suspend agent + cancel assignments | 🔲 TODO |

#### 3. Mobile App ↔ Backend

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/agent/register` | POST | Agent signup with questionnaire | 🔲 TODO |
| `/agent/accept-mission` | POST | Assign agent to visit slot | 🔲 TODO |
| `/agent/checkin` | POST | Geo-fence validation at branch | 🔲 TODO |
| `/agent/submit-visit` | POST | Upload answers + photos + receipt | 🔲 TODO |
| `/agent/request-payout` | POST | Create payout request | 🔲 TODO |
| `/agent/available-missions` | GET | List missions matching tier + location | 🔲 TODO |

---

### C. Shared APIs (All Portals)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/auth/register` | POST | Supabase Auth (built-in) | ✅ Done |
| `/auth/login` | POST | Supabase Auth (built-in) | ✅ Done |
| `/auth/forgot-password` | POST | Supabase Auth (built-in) | ✅ Done |
| `/auth/reset-password` | POST | Supabase Auth (built-in) | ✅ Done |
| `/send-notification` | POST | Internal: send email/push/SMS | 🔲 TODO |

---

## Authentication Flow

```
Client/Admin (Web):
  Email + Password → Supabase Auth → JWT token
  Token includes user_id → RLS policies enforce access
  Role checked via has_role() / is_admin() functions

Mobile App (Agent):
  Email + Password → Supabase Auth → JWT token
  Agent profile linked via agents.user_id
  Role = 'agent' in user_roles table
```

## Webhook Events (External Integrations)

| Event | Trigger | Consumer |
|-------|---------|----------|
| `payment.success` | PayMob callback | `/wallet-topup-callback` |
| `payment.failed` | PayMob callback | `/wallet-topup-callback` |

---

## Error Response Format

```json
{
  "error": true,
  "code": "INSUFFICIENT_BALANCE",
  "message": "Wallet balance is insufficient for this mission",
  "details": {
    "required": 5000,
    "available": 2300
  }
}
```

## Pagination

All list endpoints support:
```
?limit=20&offset=0&sort=created_at&order=desc
```

## Rate Limiting

- Auth endpoints: 5 requests/minute per IP
- API endpoints: 100 requests/minute per user
- File uploads: 10 requests/minute per user
