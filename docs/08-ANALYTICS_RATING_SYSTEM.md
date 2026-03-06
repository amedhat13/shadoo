# Shadoo Platform — Analytics & Rating System

## 1. Methodology-Aware Analytics Engine

### Overview
The Reports page (`src/pages/Reports.tsx`) provides a methodology-aware analytics engine with two layers:

- **Layer 1: Generic Analytics** — works for any mission; aggregates raw question answers per-question
- **Layer 2: Curated Methodology Dashboards** — when a mission has a recognized `methodology` value, shows purpose-built KPIs, formulas, benchmarks, and visualizations

### Data Sources
All data is fetched via `useClientReports()` hook from Supabase:
- `missions` table: mission metadata, questions JSON, methodology field
- `visits` table: visit answers JSON, status, timestamps, purchase amounts
- `branches` table: branch info for performance comparison

### Report Tabs
1. **Overview** — Key metric cards + high-level charts (always visible)
2. **Methodology Dashboard** — Curated analytics per methodology (hidden for "custom")
3. **Question Analytics** — Generic per-question breakdown (always visible)
4. **Branch Performance** — Branch comparison with real aggregated data
5. **Budget & Operations** — Budget utilization, response times, rejection rates

### Methodology Formulas

| Methodology | Primary Score | Formula |
|---|---|---|
| NPS | NPS (-100 to +100) | %Promoters(9-10) - %Detractors(0-6) |
| CSAT | CSAT% | % rated 4-5 on 5-point scale |
| CES | Average (1-7) | Mean of CES question answers |
| Overall Score | Average (1-10) | Mean across all attribute ratings |
| Top 2 Box | T2B% | % rated 4-5 on 5-point scale |
| Top Box | TB% | % rated 5/5 |
| Menu Try-Out | LRS (0-100) | 30% PI + 25% RI + 15% Like + 10% Unique + 10% Value + 10% Quality |
| Buy & Try | PLS (0-100) | Same weight structure as LRS |
| Delivery CX | DEI (0-100) | Weighted composite of speed, accuracy, condition, packaging, professionalism, ease |
| Call Center CX | Support CSAT% | % rated 4-5 on support satisfaction |
| App/Digital CX | CES (1-7) | Mean of ease question |
| In-Store CX | Overall (1-10) | Mean of main overall experience rating |

### Question Role Identification
The system identifies which questions serve which analytical role by matching `type` and position within the template structure. See `identifyQuestionRoles()` in `useClientReports.ts`.

### Excel Export
The Export button generates a multi-sheet .xlsx file with:
- Summary sheet with key metrics
- Visits detail sheet (per mission)
- Budget detail sheet
- Branch performance sheet
- Mission status distribution sheet

---

## 2. Client Mission Rating System

### Overview
Clients can rate completed visits (1-5 stars) with optional text feedback. Ratings feed into agent performance metrics.

### Database Fields (visits table)
- `client_rating` (numeric, 1-5) — the star rating
- `client_feedback` (text) — optional comment (max 200 chars)
- `rated_at` (timestamp) — when the rating was submitted

### Agent Rating Calculation
A PostgreSQL trigger `update_agent_rating_avg()` fires after INSERT or UPDATE on `visits.client_rating`. It recalculates the agent's `rating_avg` in the `agents` table as the average of all non-null `client_rating` values for that agent's visits.

### UI Flow
1. Client opens CompletedVisitsDialog for a mission
2. Selects a completed visit
3. If not yet rated: clickable star rating appears
4. After selecting stars: optional feedback textarea + Submit button
5. On submit: saves to DB, triggers agent rating recalc, shows success toast
6. If already rated: shows filled stars (read-only) with feedback

### Admin Visibility
- Admin can see client ratings in visit review
- Agent `rating_avg` reflects real client ratings
- Agent tier thresholds (`min_rating` in `agent_tiers`) work against this calculated rating

---

## 3. Settings Changes

### Removed Features
- **SMS Notifications** section removed from NotificationSettings
- **Danger Zone** (Delete Account) section removed from SecuritySettings

### User Limit
- Maximum 2 users per account (including owner)
- When at limit, invite button is hidden and info banner shown
- Additional users require contacting support (paid feature)

---

## 4. Branch Filtering in Mission Creation

Only branches with `status = 'verified'` appear in the branch selector during mission creation (both client and admin portals). If no verified branches exist, an empty state message with a link to the Branches page is shown.
