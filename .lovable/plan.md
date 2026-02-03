
# Shadoo Platform: Backend Documentation & Admin Dashboard Plan

## Overview

This document outlines the comprehensive backend requirements for the Client Dashboard and the complete feature set for the Admin Dashboard. Shadoo is a B2B SaaS platform with three distinct sides:
1. **Client Dashboard** (built) - Organizations create and manage mystery shopping missions
2. **Admin Dashboard** (to be built) - Shadoo staff manage all clients, agents, and platform operations
3. **Mobile App** (future) - Agents complete missions and request payouts

---

## Part 1: Backend API Documentation for Client Dashboard

### Recommended Technology Stack

**Primary Recommendation: Node.js with Supabase Edge Functions**
- **Runtime**: Deno (Supabase Edge Functions)
- **Database**: PostgreSQL (already configured via Supabase)
- **Authentication**: Supabase Auth (already configured)
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime for live updates

**Alternative Options:**
- **Go**: If high-performance, low-latency is critical for agent mobile app
- **Python (FastAPI)**: If heavy data analytics/ML features are planned
- **Node.js (Express/NestJS)**: If team has strong Node.js expertise and needs more control

**Architecture Pattern**: Serverless with Edge Functions
- Scales automatically with demand
- Low operational overhead
- Already integrated with existing Supabase setup

---

### Database Schema (Current State)

```text
+-------------------+     +-------------------+     +-------------------+
|     profiles      |     |     branches      |     |     missions      |
+-------------------+     +-------------------+     +-------------------+
| id (PK)           |     | id (PK)           |     | id (PK)           |
| user_id (FK->auth)|     | user_id (FK)      |     | user_id (FK)      |
| full_name         |     | name              |     | name              |
| company_name      |     | address           |     | branch_id (FK)    |
| phone             |     | city              |     | status            |
| avatar_url        |     | district          |     | agent_tier        |
| created_at        |     | google_maps_link  |     | questions (JSONB) |
| updated_at        |     | latitude/longitude|     | photo_requirements|
+-------------------+     | status            |     | number_of_visits  |
                          | rejection_reason  |     | purchase_items    |
                          | created_at        |     | total_budget      |
                          +-------------------+     | visits_completed  |
                                                    | published_at      |
                                                    +-------------------+

+-------------------+     +-------------------+     +-------------------+
|      wallets      |     |wallet_transactions|     |subscription_plans |
+-------------------+     +-------------------+     +-------------------+
| id (PK)           |     | id (PK)           |     | id (PK)           |
| user_id (FK)      |     | user_id (FK)      |     | name              |
| balance           |     | type              |     | price             |
| currency          |     | amount            |     | visits_per_month  |
| created_at        |     | description       |     | features (JSONB)  |
| updated_at        |     | status            |     | billing_period    |
+-------------------+     | payment_method    |     | is_active         |
                          | payment_reference |     +-------------------+
                          | created_at        |
                          +-------------------+

+-------------------+
| user_subscriptions|
+-------------------+
| id (PK)           |
| user_id (FK)      |
| plan_id (FK)      |
| status            |
| visits_used       |
| period_start/end  |
+-------------------+
```

---

### API Endpoints Required

#### 1. Authentication Module
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/auth/register` | POST | Register new organization | `{email, password, company_name, full_name}` | `{user, session}` |
| `/auth/login` | POST | Login | `{email, password}` | `{user, session}` |
| `/auth/logout` | POST | Logout | - | `{success}` |
| `/auth/refresh` | POST | Refresh token | `{refresh_token}` | `{session}` |
| `/auth/forgot-password` | POST | Request password reset | `{email}` | `{success}` |
| `/auth/reset-password` | POST | Reset password | `{token, new_password}` | `{success}` |

**Note**: Currently using Supabase Auth - continue using it.

---

#### 2. Profile Module
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/profile` | GET | Get current user profile | - | `{profile}` |
| `/profile` | PATCH | Update profile | `{full_name?, company_name?, phone?, avatar_url?}` | `{profile}` |
| `/profile/avatar` | POST | Upload avatar | `FormData(file)` | `{avatar_url}` |

---

#### 3. Branches Module
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/branches` | GET | List user's branches | `?status=verified&city=Cairo&search=mall` | `{branches[], total}` |
| `/branches` | POST | Create branch | `{name, address, city, district?, google_maps_link}` | `{branch}` |
| `/branches/bulk` | POST | Bulk create branches | `{branches[]}` | `{created[], errors[]}` |
| `/branches/:id` | GET | Get single branch | - | `{branch}` |
| `/branches/:id` | PATCH | Update branch | `{name?, address?, ...}` | `{branch}` |
| `/branches/:id` | DELETE | Delete branch | - | `{success}` |

**Business Rules**:
- Branches start as `pending_verification`
- Only `verified` branches can be used in missions
- Deleting a branch with active missions should be blocked
- Coordinate extraction from Google Maps link (server-side validation)

---

#### 4. Missions Module
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/missions` | GET | List missions | `?status=published&branch_id=xxx` | `{missions[], total}` |
| `/missions` | POST | Create mission (draft) | `{name, branch_id, agent_tier, questions[], purchase_items[], ...}` | `{mission}` |
| `/missions/:id` | GET | Get mission details | - | `{mission, visits_stats}` |
| `/missions/:id` | PATCH | Update draft mission | `{...updates}` | `{mission}` |
| `/missions/:id` | DELETE | Delete draft mission | - | `{success}` |
| `/missions/:id/publish` | POST | Publish mission | - | `{mission}` |
| `/missions/:id/pause` | POST | Pause mission | - | `{mission}` |
| `/missions/:id/resume` | POST | Resume mission | - | `{mission}` |
| `/missions/:id/archive` | POST | Archive mission | - | `{mission}` |
| `/missions/:id/duplicate` | POST | Duplicate as draft | - | `{new_mission}` |
| `/missions/:id/visits` | GET | Get mission visits | `?status=completed` | `{visits[]}` |

**Business Rules**:
- Publishing requires: valid branch, sufficient wallet balance, available visit quota
- Publish deducts from wallet and visit quota atomically (transaction)
- Pausing stops new agent assignments, doesn't refund
- Archiving releases remaining budget back to wallet

---

#### 5. Wallet Module
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/wallet` | GET | Get wallet balance | - | `{balance, allocated, currency}` |
| `/wallet/transactions` | GET | List transactions | `?type=topup&limit=20&offset=0` | `{transactions[], total}` |
| `/wallet/topup/initiate` | POST | Start payment | `{amount, payment_method}` | `{payment_url, reference}` |
| `/wallet/topup/callback` | POST | Payment webhook | `{provider_payload}` | `{success}` |
| `/wallet/topup/verify` | GET | Verify payment status | `?reference=xxx` | `{status, transaction}` |

**Payment Integration** (PayMob):
- Create payment intention
- Redirect to PayMob hosted page
- Handle webhook callback
- Update wallet balance on success

---

#### 6. Subscription Module
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/subscription` | GET | Get current subscription | - | `{subscription, plan, usage}` |
| `/subscription/plans` | GET | List available plans | - | `{plans[]}` |
| `/subscription/upgrade` | POST | Upgrade/change plan | `{plan_id}` | `{subscription}` |
| `/subscription/cancel` | POST | Cancel subscription | - | `{subscription}` |
| `/subscription/usage` | GET | Get usage stats | `?month=2024-02` | `{visits_used, visits_remaining}` |

---

#### 7. Reports Module
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/reports/overview` | GET | Dashboard stats | `?from=date&to=date` | `{stats}` |
| `/reports/visits` | GET | Visit analytics | `?branch_ids[]=x&months[]=Jan` | `{data[]}` |
| `/reports/budget` | GET | Budget analytics | `?branch_ids[]=x&months[]=Jan` | `{data[]}` |
| `/reports/missions/:id/responses` | GET | Mission response data | - | `{responses[], aggregates}` |
| `/reports/export` | POST | Export report | `{type, filters, format}` | `{download_url}` |

---

#### 8. Team/Users Module (Organizations)
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/team` | GET | List team members | - | `{members[]}` |
| `/team/invite` | POST | Invite member | `{email, role}` | `{invitation}` |
| `/team/:id` | PATCH | Update member role | `{role}` | `{member}` |
| `/team/:id` | DELETE | Remove member | - | `{success}` |
| `/team/invitations` | GET | Pending invitations | - | `{invitations[]}` |
| `/team/invitations/:id/resend` | POST | Resend invitation | - | `{success}` |

**Roles**: admin, manager, viewer

---

#### 9. Notifications Module
| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/notifications` | GET | List notifications | `?unread=true` | `{notifications[]}` |
| `/notifications/:id/read` | POST | Mark as read | - | `{success}` |
| `/notifications/read-all` | POST | Mark all as read | - | `{success}` |
| `/notifications/preferences` | GET | Get preferences | - | `{preferences}` |
| `/notifications/preferences` | PATCH | Update preferences | `{...settings}` | `{preferences}` |

---

### New Database Tables Required

```sql
-- Visits (agent submissions)
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL, -- References agents table (to be created)
  status TEXT DEFAULT 'pending', -- pending, in_progress, submitted, approved, rejected
  answers JSONB DEFAULT '[]',
  photos TEXT[] DEFAULT '{}',
  purchase_amount NUMERIC,
  receipt_photo TEXT,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team members (multi-user organizations)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES profiles(user_id),
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'viewer', -- admin, manager, viewer
  status TEXT DEFAULT 'pending', -- pending, active
  invited_by UUID,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- visit_completed, branch_verified, low_balance, etc.
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Question templates (admin-managed)
CREATE TABLE question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- nps, csat, custom
  questions JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent tiers configuration (admin-managed)
CREATE TABLE agent_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_code TEXT UNIQUE NOT NULL, -- A, B, C
  name TEXT NOT NULL,
  description TEXT,
  features JSONB,
  min_subscription_plan UUID, -- Minimum plan required
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);
```

---

### Webhook Events (for integrations)

| Event | Trigger | Payload |
|-------|---------|---------|
| `visit.completed` | Agent submits visit | `{visit_id, mission_id, agent_id}` |
| `mission.published` | Client publishes mission | `{mission_id, branch_id}` |
| `branch.verified` | Admin verifies branch | `{branch_id, status}` |
| `wallet.topup` | Payment successful | `{transaction_id, amount}` |
| `subscription.changed` | Plan upgrade/downgrade | `{subscription_id, old_plan, new_plan}` |

---

## Part 2: Admin Dashboard Features

### Core Modules

#### 1. Dashboard Overview
- Total clients, active missions, agents count
- Revenue metrics (subscriptions + wallet topups)
- Visits completed today/week/month
- System health indicators
- Recent activity feed

#### 2. Client Management
| Feature | Description |
|---------|-------------|
| List all clients | Search, filter by plan, status, signup date |
| Client details | View profile, subscription, wallet, missions |
| Impersonate client | Login as client to debug issues |
| Suspend/activate client | Block access with reason |
| Adjust wallet balance | Manual credit/debit with notes |
| Override subscription | Extend trial, change plan manually |
| View client activity log | All actions taken by client |

#### 3. Branch Verification
| Feature | Description |
|---------|-------------|
| Pending branches queue | List all pending_verification branches |
| Branch detail view | Name, address, map preview, Google Maps link |
| Verify branch | Approve with optional notes |
| Reject branch | Reject with mandatory reason (shown to client) |
| Bulk actions | Approve/reject multiple branches |
| Re-verification requests | Handle updated branches |

#### 4. Mission Monitoring
| Feature | Description |
|---------|-------------|
| All missions list | Filter by client, status, branch, date |
| Mission details | Full mission config, visits status, responses |
| Force pause/archive | Admin intervention on problematic missions |
| View visit responses | All submitted visit data and photos |
| Export mission data | CSV/Excel export |

#### 5. Agent Management
| Feature | Description |
|---------|-------------|
| Agent registration queue | Approve new agent signups |
| Agent profiles | Personal info, tier, verification docs |
| Tier assignment | Assign/change agent tier (A/B/C) |
| Performance metrics | Completion rate, ratings, response quality |
| Suspend/ban agent | With reason, affects ongoing assignments |
| Payout management | Approve/process agent payouts |
| Agent earnings report | Earnings by period, mission type |

#### 6. Agent Tier Configuration
| Feature | Description |
|---------|-------------|
| Tier list | A, B, C tiers with settings |
| Tier pricing | Commission rates per tier |
| Tier requirements | Min completed visits, rating threshold |
| Tier visibility | Which plans can access which tiers |
| Tier promotions | Rules for automatic tier upgrades |

#### 7. Question Templates
| Feature | Description |
|---------|-------------|
| Template list | All public templates |
| Create template | Name, description, question builder |
| Edit template | Modify existing templates |
| Delete template | Remove (soft delete) |
| Template categories | NPS, CSAT, Custom, etc. |
| Preview template | See how it renders |

#### 8. Subscription Plans
| Feature | Description |
|---------|-------------|
| Plans list | All subscription plans |
| Create plan | Name, price, visits, features |
| Edit plan | Modify (affects new subscribers) |
| Archive plan | Hide from new signups |
| Plan analytics | Subscribers per plan, revenue |
| Feature flags | Which features each plan includes |

#### 9. Financial Management
| Feature | Description |
|---------|-------------|
| Revenue dashboard | Total revenue, MRR, growth |
| Transaction history | All wallet topups, refunds |
| Subscription payments | Recurring billing status |
| Agent payouts | Pending, processed, failed |
| Refund management | Process refunds to clients |
| Financial reports | Export for accounting |

#### 10. Payout Management (for Agents)
| Feature | Description |
|---------|-------------|
| Pending payouts queue | All requested payouts |
| Payout details | Agent, amount, bank details |
| Approve payout | Mark for processing |
| Reject payout | With reason |
| Bulk payout processing | Process multiple payouts |
| Payout history | All completed payouts |
| Payment method management | Bank transfer, mobile wallet |

#### 11. Reports & Analytics
| Feature | Description |
|---------|-------------|
| Platform overview | Key metrics over time |
| Client acquisition | New signups, conversion |
| Mission analytics | Creation, completion rates |
| Agent performance | Top agents, tier distribution |
| Geographic distribution | Branches/missions by city |
| Revenue analytics | By plan, by period |
| Custom report builder | Select metrics, export |

#### 12. System Configuration
| Feature | Description |
|---------|-------------|
| Cities/districts | Location data management |
| Notification templates | Email/SMS templates |
| System settings | Platform-wide configs |
| Feature flags | Enable/disable features |
| Maintenance mode | Scheduled downtime notice |

#### 13. Audit Logs
| Feature | Description |
|---------|-------------|
| Admin actions log | All admin activities |
| Client actions log | Important client events |
| Security events | Login attempts, failures |
| Filter and search | By admin, action type, date |
| Export logs | For compliance |

#### 14. Admin User Management
| Feature | Description |
|---------|-------------|
| Admin list | All admin users |
| Create admin | Invite new admin |
| Admin roles | Super admin, support, finance, operations |
| Permissions | Role-based access control |
| Activity tracking | Admin session logs |

---

### Admin Database Schema Additions

```sql
-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL, -- Links to auth.users
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  national_id TEXT,
  tier TEXT DEFAULT 'C', -- A, B, C
  status TEXT DEFAULT 'pending', -- pending, active, suspended, banned
  verification_docs JSONB, -- ID photos, etc.
  bank_details JSONB, -- For payouts
  mobile_wallet TEXT,
  total_earnings NUMERIC DEFAULT 0,
  available_balance NUMERIC DEFAULT 0,
  rating_avg NUMERIC,
  completed_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID
);

-- Agent payouts
CREATE TABLE agent_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL, -- bank_transfer, mobile_wallet
  payment_details JSONB,
  status TEXT DEFAULT 'pending', -- pending, approved, processing, completed, failed
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  rejection_reason TEXT,
  transaction_reference TEXT
);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'support', -- super_admin, support, finance, operations
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL, -- Admin or system
  actor_type TEXT NOT NULL, -- admin, system, client
  action TEXT NOT NULL, -- branch.verify, agent.suspend, etc.
  resource_type TEXT, -- branch, agent, mission
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User roles (separate table as per security requirements)
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'support', 'finance', 'operations', 'client_admin', 'client_manager', 'client_viewer', 'agent');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
```

---

### Admin API Endpoints

#### Clients
- `GET /admin/clients` - List all clients
- `GET /admin/clients/:id` - Client details
- `POST /admin/clients/:id/suspend` - Suspend client
- `POST /admin/clients/:id/activate` - Reactivate client
- `POST /admin/clients/:id/wallet/adjust` - Adjust wallet
- `POST /admin/clients/:id/impersonate` - Get impersonation token

#### Branches
- `GET /admin/branches` - All branches
- `GET /admin/branches/pending` - Pending verification
- `POST /admin/branches/:id/verify` - Verify branch
- `POST /admin/branches/:id/reject` - Reject branch

#### Agents
- `GET /admin/agents` - All agents
- `GET /admin/agents/pending` - Pending approval
- `GET /admin/agents/:id` - Agent details
- `POST /admin/agents/:id/approve` - Approve agent
- `POST /admin/agents/:id/tier` - Change tier
- `POST /admin/agents/:id/suspend` - Suspend agent

#### Payouts
- `GET /admin/payouts` - All payouts
- `GET /admin/payouts/pending` - Pending payouts
- `POST /admin/payouts/:id/approve` - Approve payout
- `POST /admin/payouts/:id/reject` - Reject payout
- `POST /admin/payouts/bulk-process` - Bulk processing

#### Configuration
- `GET /admin/tiers` - Agent tiers
- `POST /admin/tiers` - Create tier
- `GET /admin/templates` - Question templates
- `POST /admin/templates` - Create template
- `GET /admin/plans` - Subscription plans
- `POST /admin/plans` - Create plan

---

### Security Considerations

1. **Role-Based Access Control (RBAC)**
   - Store roles in separate `user_roles` table
   - Use security definer functions for role checks
   - Never check roles client-side

2. **Admin Authentication**
   - Separate admin auth flow
   - Require 2FA for admin accounts
   - Session timeout after inactivity
   - IP allowlisting (optional)

3. **Audit Trail**
   - Log all admin actions
   - Include IP address and timestamp
   - Immutable audit records

4. **Data Protection**
   - Encrypt sensitive agent data (bank details, national ID)
   - Mask sensitive data in logs
   - RLS policies for all tables

---

### Summary

This document provides:
1. Complete API specification for the Client Dashboard backend
2. Database schema additions required
3. Comprehensive Admin Dashboard feature list
4. Admin-specific database tables
5. Security architecture recommendations

The backend should be implemented using Supabase Edge Functions (Deno) for consistency with the current architecture, with PostgreSQL for data storage and Supabase Auth for authentication.
