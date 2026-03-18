# Shadoo Backend Development Guide for Claude Code

> **Last Updated**: February 2026  
> **Platform**: Shadoo Mystery Shopping Ecosystem  
> **Target**: Agent Mobile App Backend Development

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [Database Schema Reference](#3-database-schema-reference)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Existing Edge Functions](#5-existing-edge-functions)
6. [Agent Mobile App Backend Requirements](#6-agent-mobile-app-backend-requirements)
7. [Edge Functions to Implement](#7-edge-functions-to-implement)
8. [API Contracts](#8-api-contracts)
9. [Business Logic Flows](#9-business-logic-flows)
10. [Storage & File Uploads](#10-storage--file-uploads)
11. [Real-time Features](#11-real-time-features)
12. [Security Considerations](#12-security-considerations)
13. [Testing Guidelines](#13-testing-guidelines)

---

## 1. Platform Overview

### What is Shadoo?

Shadoo is a B2B SaaS mystery shopping platform with **three user-facing interfaces**:

| Interface | Users | Purpose | Status |
|-----------|-------|---------|--------|
| **Client Dashboard** | Organizations/Businesses | Create missions, manage branches, fund wallet, view reports | ✅ Complete |
| **Admin Dashboard** | Platform Operators | Manage clients, verify agents, review visits, handle payouts | ✅ Complete |
| **Agent Mobile App** | Mystery Shoppers | Accept missions, execute visits, submit reports, request payouts | 🔨 To Build |

### Core Business Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHADOO PLATFORM FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CLIENT                    ADMIN                      AGENT                  │
│  ───────                   ─────                      ─────                  │
│                                                                              │
│  1. Create Account ◄────── Admin creates client                              │
│  2. Add Branches ─────────► Verify Branches                                  │
│  3. Fund Wallet                                                              │
│  4. Create Mission ─────────────────────────────────► Discover Mission       │
│  5. Publish Mission                                   Accept Mission         │
│                                                       Execute Visit          │
│                                                       Submit Report ────────►│
│                            Review Submission ◄────────                       │
│                            Approve/Reject ───────────► Receive Earnings      │
│  6. View Reports ◄──────── Generate Reports           Request Payout ───────►│
│                            Process Payouts ◄──────────                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture & Technology Stack

### Backend Stack

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL (via Supabase) |
| Authentication | Supabase Auth |
| API Layer | Supabase Edge Functions (Deno) |
| File Storage | Supabase Storage |
| Real-time | Supabase Realtime (PostgreSQL changes) |
| Email | Resend API |

### Frontend Stack (For Reference)

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Routing | React Router DOM v6 |
| State Management | TanStack React Query |
| UI Components | shadcn/ui + Tailwind CSS |
| Forms | React Hook Form + Zod |

### Supabase Project Details

```
Project ID: qskqbjtohzwjkwhyoaab
Region: Default
```

### Environment Variables Available in Edge Functions

```typescript
Deno.env.get("SUPABASE_URL")           // Project URL
Deno.env.get("SUPABASE_ANON_KEY")      // Public anon key
Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") // Admin key (full access)
Deno.env.get("SUPABASE_DB_URL")        // Direct DB connection
Deno.env.get("LOVABLE_API_KEY")        // AI Gateway (if needed)
```

---

## 3. Database Schema Reference

### Core Tables

#### `agents` - Agent Profiles
```sql
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,           -- Links to auth.users
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  national_id TEXT,                -- Egyptian National ID
  tier TEXT DEFAULT 'C',           -- 'A', 'B', or 'C'
  status TEXT DEFAULT 'pending',   -- 'pending', 'active', 'suspended', 'rejected'
  rating_avg NUMERIC,
  completed_visits INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  available_balance NUMERIC DEFAULT 0,
  verification_docs JSONB DEFAULT '[]',
  questionnaire_answers JSONB DEFAULT '[]',
  mobile_wallet TEXT,              -- E.g., Vodafone Cash number
  bank_details JSONB,              -- { bank_name, account_number, iban }
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `missions` - Mystery Shopping Missions
```sql
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,           -- Client who owns this mission
  name TEXT NOT NULL,
  branch_id UUID REFERENCES branches(id),
  agent_tier TEXT DEFAULT 'C',     -- Minimum tier required
  status TEXT DEFAULT 'draft',     -- 'draft', 'published', 'paused', 'completed', 'archived'
  questions JSONB DEFAULT '[]',    -- Array of Question objects
  photo_requirements JSONB DEFAULT '{"required_count": 0}',
  number_of_visits INTEGER DEFAULT 0,
  visit_schedules JSONB DEFAULT '[]',  -- Array of VisitSchedule objects
  purchase_budget_per_visit NUMERIC DEFAULT 0,
  purchase_item_name TEXT,
  total_purchase_budget NUMERIC DEFAULT 0,
  visits_completed INTEGER DEFAULT 0,
  visits_pending INTEGER DEFAULT 0,
  budget_used NUMERIC DEFAULT 0,
  is_geo_tagged BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `visits` - Individual Visit Instances
```sql
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id),
  agent_id UUID REFERENCES agents(id),
  status TEXT DEFAULT 'pending',   -- 'pending', 'in_progress', 'submitted', 'approved', 'rejected'
  answers JSONB DEFAULT '[]',      -- Array of { question_id, value }
  photos TEXT[] DEFAULT '{}',      -- Array of storage URLs
  receipt_photo TEXT,              -- Single receipt photo URL
  purchase_amount NUMERIC,
  -- Schedule fields (copied from mission's visit_schedules)
  schedule_id TEXT,                -- Links to specific slot in visit_schedules
  scheduled_date DATE,
  scheduled_time TIME,
  scheduled_duration INTEGER,      -- Minutes
  -- Timestamps
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `branches` - Client Branch Locations
```sql
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,           -- Client who owns this branch
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  google_maps_link TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT DEFAULT 'pending_verification',  -- 'pending_verification', 'verified', 'rejected'
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `agent_payouts` - Withdrawal Requests
```sql
CREATE TABLE public.agent_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,            -- 'bank_transfer', 'mobile_wallet', 'cash'
  status TEXT DEFAULT 'pending',   -- 'pending', 'approved', 'rejected', 'completed'
  payment_details JSONB,
  transaction_reference TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID
);
```

#### `profiles` - User Profiles (Clients & Admins)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  logo_url TEXT,
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_roles` - Role-Based Access Control
```sql
CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'admin',
  'support',
  'finance',
  'operations',
  'client_admin',
  'client_manager',
  'client_viewer',
  'agent'
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);
```

### JSONB Structures

#### Question Object (in `missions.questions`)
```typescript
interface Question {
  id: string;
  type: 'multiple_choice' | 'rating' | 'short_text' | 'yes_no';
  text: string;
  required: boolean;
  options?: { id: string; text: string }[];  // For multiple_choice
  max_rating?: number;                        // For rating (default 5)
  photoRequirement?: {
    enabled: boolean;
    triggerCondition?: 'low_rating' | 'negative_answer';
    ratingThreshold?: number;
    samplePhotoUrl?: string;
    instructions?: string;
  };
}
```

#### VisitSchedule Object (in `missions.visit_schedules`)
```typescript
interface VisitSchedule {
  id: string;            // UUID for linking to visits.schedule_id
  date: string;          // ISO date: 'YYYY-MM-DD'
  time: string;          // Time: 'HH:mm'
  duration: number;      // Minutes (15, 30, 45, 60, 90, 120)
}
```

#### Visit Answer Object (in `visits.answers`)
```typescript
interface VisitAnswer {
  question_id: string;
  value: string | number | boolean;
  photo_url?: string;    // If photo was required for this question
}
```

---

## 4. Authentication & Authorization

### Role Hierarchy

```
Platform Roles (Admins):
├── super_admin  ─── Full platform access
├── admin        ─── Full platform access
├── support      ─── Read access + support operations
├── finance      ─── Financial operations + payouts
└── operations   ─── Mission/agent management

Client Roles:
├── client_admin   ─── Full organization access
├── client_manager ─── Create/manage missions
└── client_viewer  ─── Read-only access

Agent Role:
└── agent ─── Mobile app access only
```

### Database Functions for Authorization

```sql
-- Check if user has a specific role
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is any admin type
CREATE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'support', 'finance', 'operations')
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `agents` | Own profile OR admin | Admin only | Own profile OR admin | Admin only |
| `missions` | Own missions OR admin | Own OR admin | Own OR admin | Own OR admin |
| `visits` | Own visits OR mission owner OR admin | Agent only | Agent (pending/in_progress) OR admin | Admin only |
| `agent_payouts` | Own payouts OR admin | Agent only | Finance/admin only | - |
| `branches` | Own branches OR admin | Own OR admin | Own OR admin | Own OR admin |

---

## 5. Existing Edge Functions

### `create-client` (Admin Only)

**Location**: `supabase/functions/create-client/index.ts`

**Purpose**: Creates new client accounts with auto-generated credentials.

**Request**:
```typescript
POST /functions/v1/create-client
Authorization: Bearer <admin_jwt>

{
  email: string;
  companyName: string;
  fullName: string;
  phone?: string;
  planId?: string;
  logoUrl?: string;
  isFreeTrial?: boolean;
  trialDays?: number;
  trialVisits?: number;
}
```

**Response**:
```typescript
{
  success: true;
  userId: string;
  email: string;
  companyName: string;
  emailSent: boolean;
  tempPassword?: string;  // Only if email failed
}
```

**What it does**:
1. Verifies caller is admin via `is_admin()` RPC
2. Generates temporary password
3. Creates user in Supabase Auth with `admin.createUser()`
4. Creates profile with `must_change_password: true`
5. Assigns `client_admin` role
6. Creates wallet
7. Creates trial or standard subscription
8. Sends credentials email via Resend (if configured)

---

## 6. Agent Mobile App Backend Requirements

### 6.1 Agent Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT REGISTRATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Agent opens app ──► Sign Up Screen                          │
│  2. Enters: email, password, full_name, phone                   │
│  3. App calls: supabase.auth.signUp()                           │
│  4. Backend trigger creates `agents` record (status: pending)   │
│  5. Agent fills questionnaire ──► Updates `questionnaire_answers`│
│  6. Agent uploads documents ──► Updates `verification_docs`     │
│  7. Admin reviews ──► Approves (status: active) or Rejects      │
│  8. Agent can now accept missions                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Mission Discovery & Acceptance

```
┌─────────────────────────────────────────────────────────────────┐
│                    MISSION ACCEPTANCE FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Agent opens "Available Missions" tab                         │
│  2. API fetches published missions matching:                     │
│     - Agent's tier >= mission's agent_tier                       │
│     - Has unclaimed visit slots                                  │
│     - Optional: Within agent's preferred cities                  │
│  3. Agent views mission details:                                 │
│     - Branch location, questions, photo requirements             │
│     - Budget per visit, scheduled dates/times                    │
│  4. Agent selects a visit slot ──► Calls accept-visit endpoint  │
│  5. Backend creates `visits` record:                             │
│     - status: 'pending' (or 'in_progress' if starting now)      │
│     - Copies schedule info from visit_schedules                  │
│     - Increments mission.visits_pending                          │
│  6. Agent sees visit in "My Visits" tab                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Visit Execution & Submission

```
┌─────────────────────────────────────────────────────────────────┐
│                    VISIT EXECUTION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Agent starts visit ──► status changes to 'in_progress'      │
│  2. If geo-tagged mission:                                       │
│     - App gets current GPS coordinates                           │
│     - Backend validates within 100m of branch                    │
│  3. Agent answers questions (stores locally)                     │
│  4. Agent takes photos as required                               │
│  5. Agent records purchase amount                                │
│  6. Agent submits visit:                                         │
│     a. Upload photos to storage                                  │
│     b. Send answers + photo URLs to backend                      │
│     c. Backend validates:                                        │
│        - All required questions answered                         │
│        - Minimum photos uploaded                                 │
│        - Geo-location if required                                │
│     d. status changes to 'submitted'                             │
│  7. Admin reviews ──► 'approved' or 'rejected'                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Earnings & Payouts

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYOUT FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  On Visit Approval:                                              │
│  1. Admin approves visit                                         │
│  2. Commission calculated: budget * tier_commission_rate         │
│  3. agents.total_earnings += commission                          │
│  4. agents.available_balance += commission                       │
│                                                                  │
│  Payout Request:                                                 │
│  1. Agent requests payout (minimum threshold)                    │
│  2. Creates agent_payouts record (status: pending)               │
│  3. agents.available_balance -= payout_amount                    │
│  4. Finance admin reviews:                                       │
│     - Approves ──► Processes payment ──► status: completed       │
│     - Rejects ──► Refunds balance ──► status: rejected           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Edge Functions to Implement

### 7.1 `register-agent`

**Purpose**: Handle agent registration with initial questionnaire.

```typescript
// supabase/functions/register-agent/index.ts

POST /functions/v1/register-agent

Request:
{
  email: string;
  password: string;
  fullName: string;
  phone: string;
  nationalId?: string;
  questionnaireAnswers?: object[];
}

Response:
{
  success: boolean;
  userId: string;
  agentId: string;
  message: string;
}
```

**Implementation Notes**:
- Use `admin.createUser()` to create auth user
- Create `agents` record with status: 'pending'
- Assign 'agent' role in `user_roles`
- Store initial questionnaire answers
- DO NOT auto-verify email for agents (require email verification)

---

### 7.2 `get-available-missions`

**Purpose**: Fetch missions available to the authenticated agent.

```typescript
// supabase/functions/get-available-missions/index.ts

GET /functions/v1/get-available-missions?city=Cairo&limit=20

Headers:
Authorization: Bearer <agent_jwt>

Response:
{
  missions: [{
    id: string;
    name: string;
    branch: {
      id: string;
      name: string;
      address: string;
      city: string;
      latitude: number;
      longitude: number;
    };
    agent_tier: string;
    questions_count: number;
    photo_requirements: object;
    purchase_budget_per_visit: number;
    is_geo_tagged: boolean;
    available_slots: [{
      schedule_id: string;
      date: string;
      time: string;
      duration: number;
    }];
  }];
}
```

**Implementation Notes**:
- Get agent's tier from `agents` table
- Filter missions where:
  - `status = 'published'`
  - `agent_tier <= agent's tier` (A > B > C)
  - Has unclaimed slots in `visit_schedules`
- Exclude missions where agent already has an active visit
- Join with `branches` for location data
- Calculate `available_slots` by comparing `visit_schedules` with existing `visits`

---

### 7.3 `accept-mission-slot`

**Purpose**: Agent claims a specific visit slot.

```typescript
// supabase/functions/accept-mission-slot/index.ts

POST /functions/v1/accept-mission-slot

Headers:
Authorization: Bearer <agent_jwt>

Request:
{
  missionId: string;
  scheduleId: string;  // From visit_schedules array
}

Response:
{
  success: boolean;
  visitId: string;
  scheduledDate: string;
  scheduledTime: string;
}
```

**Implementation Notes**:
- Verify agent is 'active' status
- Verify slot is not already claimed
- Create `visits` record with:
  - `status: 'pending'`
  - Copy `scheduled_date`, `scheduled_time`, `scheduled_duration` from mission
  - Set `schedule_id` for linking
- Increment `mission.visits_pending`

---

### 7.4 `start-visit`

**Purpose**: Agent starts executing a visit (optional geo-verification).

```typescript
// supabase/functions/start-visit/index.ts

POST /functions/v1/start-visit

Headers:
Authorization: Bearer <agent_jwt>

Request:
{
  visitId: string;
  latitude?: number;   // Required if mission.is_geo_tagged
  longitude?: number;  // Required if mission.is_geo_tagged
}

Response:
{
  success: boolean;
  geoVerified?: boolean;
  message: string;
}
```

**Implementation Notes**:
- Verify visit belongs to agent
- If `is_geo_tagged`:
  - Calculate distance from branch coordinates
  - Accept if within 100 meters (configurable)
  - Store verification status
- Update `visit.status = 'in_progress'`
- Update `visit.started_at = now()`

---

### 7.5 `submit-visit`

**Purpose**: Agent submits completed visit report.

```typescript
// supabase/functions/submit-visit/index.ts

POST /functions/v1/submit-visit

Headers:
Authorization: Bearer <agent_jwt>

Request:
{
  visitId: string;
  answers: [{
    question_id: string;
    value: string | number | boolean;
    photo_url?: string;
  }];
  photos: string[];          // Array of storage URLs
  receiptPhoto?: string;     // Storage URL
  purchaseAmount: number;
  latitude?: number;         // Final location if geo-tagged
  longitude?: number;
}

Response:
{
  success: boolean;
  message: string;
  validationErrors?: string[];
}
```

**Implementation Notes**:
- Validate all required questions are answered
- Validate minimum photo count met
- Validate purchase amount within budget
- If geo-tagged, verify location
- Update visit:
  - `answers`, `photos`, `receipt_photo`, `purchase_amount`
  - `status = 'submitted'`
  - `submitted_at = now()`

---

### 7.6 `get-agent-earnings`

**Purpose**: Get agent's earnings summary and history.

```typescript
// supabase/functions/get-agent-earnings/index.ts

GET /functions/v1/get-agent-earnings

Headers:
Authorization: Bearer <agent_jwt>

Response:
{
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  recentTransactions: [{
    id: string;
    type: 'visit_payment' | 'payout_request' | 'payout_completed';
    amount: number;
    description: string;
    date: string;
    status: string;
  }];
  completedVisits: number;
}
```

---

### 7.7 `request-payout`

**Purpose**: Agent requests withdrawal of available balance.

```typescript
// supabase/functions/request-payout/index.ts

POST /functions/v1/request-payout

Headers:
Authorization: Bearer <agent_jwt>

Request:
{
  amount: number;
  method: 'bank_transfer' | 'mobile_wallet';
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    mobileWalletNumber?: string;
  };
}

Response:
{
  success: boolean;
  payoutId: string;
  message: string;
}
```

**Implementation Notes**:
- Verify amount <= available_balance
- Verify minimum payout threshold (e.g., 100 EGP)
- Create `agent_payouts` record
- Deduct from `agents.available_balance`

---

### 7.8 `update-agent-profile`

**Purpose**: Agent updates their profile and payment details.

```typescript
// supabase/functions/update-agent-profile/index.ts

PATCH /functions/v1/update-agent-profile

Headers:
Authorization: Bearer <agent_jwt>

Request:
{
  phone?: string;
  mobileWallet?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    iban?: string;
  };
}

Response:
{
  success: boolean;
  agent: Agent;
}
```

---

### 7.9 `upload-verification-docs`

**Purpose**: Agent uploads verification documents (National ID, etc.).

```typescript
// supabase/functions/upload-verification-docs/index.ts

POST /functions/v1/upload-verification-docs

Headers:
Authorization: Bearer <agent_jwt>
Content-Type: multipart/form-data

Request:
{
  docType: 'national_id_front' | 'national_id_back' | 'selfie';
  file: File;
}

Response:
{
  success: boolean;
  documentUrl: string;
  documentsStatus: {
    national_id_front: boolean;
    national_id_back: boolean;
    selfie: boolean;
    complete: boolean;
  };
}
```

---

## 8. API Contracts

### Standard Response Format

```typescript
// Success
{
  success: true,
  data: { ... },
  message?: string
}

// Error
{
  success: false,
  error: string,
  code?: string,
  details?: object
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | No valid JWT provided |
| `FORBIDDEN` | User lacks required role/permission |
| `NOT_FOUND` | Resource doesn't exist |
| `VALIDATION_ERROR` | Request body validation failed |
| `SLOT_TAKEN` | Mission slot already claimed |
| `GEO_FAILED` | Location verification failed |
| `INSUFFICIENT_BALANCE` | Not enough balance for payout |
| `AGENT_NOT_ACTIVE` | Agent account not yet approved |

### CORS Headers (Required for all functions)

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
```

---

## 9. Business Logic Flows

### 9.1 Agent Pricing (Duration-Range Based)

Agent pay is determined by visit duration and tier via the `visit_duration_pricing` table.
Each row defines a **duration range** (min_duration_minutes to max_duration_minutes) and price per tier.

```typescript
// Example: visit_duration_pricing rows
// tier_code: 'PREMIUM', min_duration_minutes: 15, max_duration_minutes: 30, price: 100
// tier_code: 'PREMIUM', min_duration_minutes: 31, max_duration_minutes: 60, price: 175

// Lookup: find the range that contains the scheduled visit duration
function lookupVisitPrice(pricing, tierCode, durationMinutes) {
  return pricing.find(
    p => p.tier_code === tierCode &&
      durationMinutes >= p.min_duration_minutes &&
      (p.max_duration_minutes === null || durationMinutes <= p.max_duration_minutes)
  )?.price ?? null;
}
```

### 9.1b Agent Tier System

Tiers are **dynamic** — admins create tiers with demographic criteria (age, gender, city, education, etc.)
and agents are **auto-assigned** based on profile matching. Each tier has an `icon` field for UI display.
A fallback "GENERAL" tier catches agents who don't match any specific tier.

### 9.2 Geo-Location Verification

```typescript
function isWithinRange(
  agentLat: number,
  agentLng: number,
  branchLat: number,
  branchLng: number,
  maxDistanceMeters: number = 100
): boolean {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = agentLat * Math.PI / 180;
  const φ2 = branchLat * Math.PI / 180;
  const Δφ = (branchLat - agentLat) * Math.PI / 180;
  const Δλ = (branchLng - agentLng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= maxDistanceMeters;
}
```

### 9.3 Tier Eligibility Check

```typescript
const TIER_HIERARCHY = { 'A': 3, 'B': 2, 'C': 1 };

function canAccessMission(
  agentTier: string,
  missionTier: string
): boolean {
  return TIER_HIERARCHY[agentTier] >= TIER_HIERARCHY[missionTier];
}
```

---

## 10. Storage & File Uploads

### Storage Buckets to Create

```sql
-- Visit photos bucket (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('visit-photos', 'visit-photos', false);

-- Verification documents bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', false);

-- Receipt photos bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipt-photos', 'receipt-photos', false);
```

### Storage RLS Policies

```sql
-- Agents can upload to visit-photos
CREATE POLICY "Agents can upload visit photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'visit-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Agents can view their own photos
CREATE POLICY "Agents can view own visit photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visit-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all photos
CREATE POLICY "Admins can view all visit photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visit-photos' AND
  is_admin(auth.uid())
);

-- Clients can view photos for their missions
CREATE POLICY "Clients can view mission photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visit-photos' AND
  EXISTS (
    SELECT 1 FROM visits v
    JOIN missions m ON v.mission_id = m.id
    WHERE m.user_id = auth.uid()
    AND v.agent_id::text = (storage.foldername(name))[1]
  )
);
```

### Upload Path Convention

```
visit-photos/{agent_id}/{visit_id}/{timestamp}_{filename}
verification-docs/{agent_id}/{doc_type}_{timestamp}.{ext}
receipt-photos/{agent_id}/{visit_id}/receipt_{timestamp}.{ext}
```

---

## 11. Real-time Features

### Enable Realtime on Tables

```sql
-- Enable realtime for visits (agents need to see status changes)
ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;

-- Enable realtime for agent_payouts
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_payouts;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### Notification Types for Agents

```typescript
type AgentNotificationType = 
  | 'visit_approved'      // Visit was approved by admin
  | 'visit_rejected'      // Visit was rejected
  | 'payout_approved'     // Payout request approved
  | 'payout_completed'    // Payout sent
  | 'payout_rejected'     // Payout request rejected
  | 'tier_upgraded'       // Agent promoted to higher tier
  | 'account_verified'    // Agent account activated
  | 'new_mission'         // New mission in agent's city (optional)
```

---

## 12. Security Considerations

### Critical Security Rules

1. **NEVER expose admin endpoints to agents**
   - All agent endpoints must verify agent role
   - Never trust client-side role claims

2. **Always validate ownership**
   ```typescript
   // Before updating a visit
   const { data: visit } = await supabase
     .from('visits')
     .select('agent_id')
     .eq('id', visitId)
     .single();
   
   if (visit.agent_id !== agentId) {
     throw new Error('Forbidden');
   }
   ```

3. **Validate file uploads**
   - Check file types (images only for photos)
   - Limit file sizes (e.g., 5MB max)
   - Sanitize filenames

4. **Prevent slot overbooking**
   ```typescript
   // Use database-level locks or transactions
   const { data, error } = await supabase.rpc('claim_visit_slot', {
     p_mission_id: missionId,
     p_schedule_id: scheduleId,
     p_agent_id: agentId
   });
   ```

5. **Rate limiting**
   - Limit payout requests (e.g., 1 per day)
   - Limit API calls per minute

---

## 13. Testing Guidelines

### Test Accounts

Create test accounts for each role:

```sql
-- Test Agent (tier C)
-- email: agent.test@shadoo.app

-- Test Agent (tier A)
-- email: agent.premium@shadoo.app

-- Test Admin
-- email: admin.test@shadoo.app
```

### Test Scenarios

1. **Agent Registration**
   - ✅ Successful registration with valid data
   - ❌ Duplicate email rejection
   - ❌ Invalid phone format rejection

2. **Mission Discovery**
   - ✅ Agent sees only eligible missions
   - ✅ Tier filtering works correctly
   - ❌ Inactive agent can't see missions

3. **Visit Execution**
   - ✅ Geo-verification passes within range
   - ❌ Geo-verification fails outside range
   - ✅ All answers validated
   - ❌ Missing required answer rejected

4. **Payouts**
   - ✅ Request within balance succeeds
   - ❌ Request exceeding balance fails
   - ❌ Inactive agent can't request

### Edge Function Testing

Use the Supabase CLI or the provided tools:

```bash
# Deploy function
supabase functions deploy get-available-missions

# Test locally
supabase functions serve get-available-missions --env-file .env.local

# Call function
curl -X GET 'http://localhost:54321/functions/v1/get-available-missions' \
  -H 'Authorization: Bearer <jwt>' \
  -H 'Content-Type: application/json'
```

---

## Appendix: Quick Reference

### Supabase Client Initialization (Edge Functions)

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

// For admin operations (bypass RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// For user-context operations (respects RLS)
const userClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
});
```

### Standard Edge Function Template

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Your logic here...

    return new Response(
      JSON.stringify({ success: true, data: {} }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## Contact & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Deno Docs**: https://deno.land/manual
- **Project Repository**: Lovable project (this codebase)

---

*This document should be used as the primary reference for implementing the agent mobile app backend. All edge functions should follow the patterns and security practices outlined above.*
