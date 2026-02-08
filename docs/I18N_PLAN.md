# Internationalization (i18n) & RTL Plan — Arabic + English

## 1. Architecture Overview

### Library: `react-i18next` + `i18next`
- Industry standard, lazy-loading support, namespace splitting
- Integrates with React context for re-renders on language change

### RTL Strategy
- Set `dir="rtl"` and `lang="ar"` on `<html>` element when Arabic is active
- Use Tailwind CSS logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`) instead of `ml-`, `mr-`, `pl-`, `pr-`, `left`, `right`
- Replace all `left-0`, `right-0` with `start-0`, `end-0` equivalents
- Flip chevron icons (`ChevronLeft` ↔ `ChevronRight`) based on direction

### Font: SF Compact
- Use `SF Compact Display` for headings, `SF Compact Text` for body
- Fallback: system-ui, sans-serif
- For Arabic: SF Compact supports Arabic glyphs natively on Apple devices; for web, use `SF Arabic` or fall back to `Noto Kufi Arabic` / `Cairo` as web-safe Arabic alternatives

### Dual-Language Inputs
- Create `<BilingualInput>` and `<BilingualTextarea>` components
- Side-by-side EN/AR fields with clear labels
- Store as `{ en: string, ar: string }` in form data
- Display based on current language, store both always

---

## 2. File Structure

```
src/
├── i18n/
│   ├── index.ts                    # i18next initialization
│   ├── LanguageProvider.tsx         # Context + direction manager
│   ├── LanguageSwitcher.tsx         # Toggle button component
│   └── locales/
│       ├── en/
│       │   ├── common.json         # Shared: buttons, labels, statuses
│       │   ├── nav.json            # Sidebar & header navigation
│       │   ├── dashboard.json      # Client dashboard
│       │   ├── missions.json       # Mission CRUD, form steps
│       │   ├── branches.json       # Branch management
│       │   ├── wallet.json         # Wallet & transactions
│       │   ├── settings.json       # Settings tabs
│       │   ├── auth.json           # Login/signup forms
│       │   ├── landing.json        # Landing page
│       │   └── admin.json          # All admin dashboard strings
│       └── ar/
│           ├── common.json
│           ├── nav.json
│           ├── dashboard.json
│           ├── missions.json
│           ├── branches.json
│           ├── wallet.json
│           ├── settings.json
│           ├── auth.json
│           ├── landing.json
│           └── admin.json
```

---

## 3. Component-by-Component Audit

### 3.1 Global / Layout Components

| Component | Hardcoded Strings | RTL Issues | Dual Input | Notes |
|-----------|------------------|------------|------------|-------|
| `Sidebar.tsx` | Nav labels ("DASHBOARD", "MISSIONS", etc.), "Wallet Balance", "on hold" | `left-0`, `left-4`, `ChevronLeft/Right` icons | No | Flip sidebar position for RTL |
| `Header.tsx` | "Sign out", "User" | No major issues | No | Mirror layout |
| `AdminSidebar.tsx` | Section titles, nav labels, "Admin" badge | `left-0`, `left-4`, chevron icons | No | Same as client sidebar |
| `AdminHeader.tsx` | Search placeholder, user menu | Layout flex direction | No | |
| `AdminLayout.tsx` | None | `pl-16`, `pl-64` → `ps-16`, `ps-64` | No | |
| `DashboardLayout.tsx` | None | Same padding issue | No | |
| `PageHeader.tsx` | None (props-based) | No | No | Clean |

### 3.2 Client Pages

| Page | Hardcoded Strings | RTL Issues | Dual Input Needed |
|------|------------------|------------|-------------------|
| `Landing.tsx` | All marketing copy, portal descriptions, footer | `translate-x-1` on arrows | No |
| `Auth.tsx` | Form labels, buttons, validation messages | No | No |
| `ClientDashboard.tsx` | "Dashboard", "Welcome back!", card titles, "Create Mission", "View All", status badges | `ArrowRight` icons | No |
| `Missions.tsx` | "Missions", description, filter labels, empty states | No | No |
| `MissionCreate.tsx` | Step titles (from constants), nav buttons "BACK"/"CONTINUE" | Stepper chevron direction | Yes — mission name |
| `MissionDetails.tsx` | Stats labels, action buttons | No | No |
| `Branches.tsx` | "Branches", filter labels, form fields | No | Yes — branch name, address |
| `Wallet.tsx` | "Wallet", "Recent Activity" | No | No |
| `Reports.tsx` | Page title, chart labels | No | No |
| `Settings.tsx` | Tab labels, form labels | No | No |

### 3.3 Mission Form Steps

| Step Component | Hardcoded Strings | Dual Input Needed |
|----------------|------------------|-------------------|
| `StepBasics.tsx` | "Mission Name*", placeholder, "Branches*", "Select All Branches", help text | Yes — Mission Name |
| `StepAgentTier.tsx` | Tier names, descriptions, features | No (system data) |
| `StepQuestions.tsx` | "Quick Start with Templates", "Add Question", type labels, "Enter your question", "Option text", photo labels | Yes — Question text, Option text |
| `StepGeoSettings.tsx` | Labels, descriptions | No |
| `StepFunding.tsx` | Labels, currency, help text | No |
| `StepReview.tsx` | Section headers, summary labels | No |

### 3.4 Admin Pages (16 pages)

| Page | Key Strings | Dual Input |
|------|-------------|------------|
| `AdminDashboard.tsx` | Stat labels, card titles | No |
| `AdminClients.tsx` | Table headers, dialog labels | No |
| `AdminBranches.tsx` | Table headers, status labels | No |
| `AdminMissions.tsx` | Table headers, filters | No |
| `AdminMissionCreate.tsx` | Step titles, buttons | Yes — Mission Name |
| `AdminVisits.tsx` | Table headers, review dialog | No |
| `AdminAgents.tsx` | Table headers, approval dialog | No |
| `AdminTiers.tsx` | Form labels, descriptions | Yes — Tier name, description |
| `AdminPayouts.tsx` | Table headers, status labels | No |
| `AdminTemplates.tsx` | Template names, descriptions | Yes — Template name, questions |
| `AdminPlans.tsx` | Plan names, features | Yes — Plan name, description |
| `AdminFinance.tsx` | Chart labels, stat cards | No |
| `AdminReports.tsx` | Report labels | No |
| `AdminConfig.tsx` | Config labels | No |
| `AdminAudit.tsx` | Table headers, action labels | No |
| `AdminAdmins.tsx` | Table headers, role labels | No |

### 3.5 Shared Components

| Component | Strings | RTL |
|-----------|---------|-----|
| `EmptyState.tsx` | Via props (clean) | No |
| `LoadingState.tsx` | Loading text | No |
| `BranchForm.tsx` | All form labels, placeholders | Yes — Branch name |
| `BranchTable.tsx` | Column headers | No |
| `BranchStatusBadge.tsx` | Status text | No |
| `MissionTable.tsx` | Column headers, action labels | No |
| `MissionStatusBadge.tsx` | Status text | No |
| `WalletCard.tsx` | "Available Balance", "Allocated" | No |
| `TopUpDialog.tsx` | Dialog text, form labels | No |
| `TransactionList.tsx` | Column headers, type labels | No |
| `VisitsRemainingWidget.tsx` | "Visits Remaining" | No |
| `StatCard.tsx` | Via props (clean) | No |
| `SubscriptionPlans.tsx` | Plan names, features, CTA | No |
| All Settings components | Form labels, descriptions, buttons | No |

### 3.6 Constants File (`lib/constants.ts`)
- All status labels, descriptions, form step titles, tier info, template names/questions, nav items, empty states, messages
- **Action**: Move all to translation files, keep constants as key references

---

## 4. RTL-Specific Changes

### 4.1 CSS / Tailwind Replacements
```
ml-* → ms-*          mr-* → me-*
pl-* → ps-*          pr-* → pe-*
left-* → start-*     right-* → end-*
text-left → text-start    text-right → text-end
border-l → border-s       border-r → border-e
rounded-l → rounded-s     rounded-r → rounded-e
```

### 4.2 Icon Flipping
- `ChevronLeft` / `ChevronRight` → conditionally swap based on `dir`
- `ArrowLeft` / `ArrowRight` → conditionally swap
- Use a utility: `useDirectionalIcon(leftIcon, rightIcon)`

### 4.3 Sidebar Position
- Desktop sidebar: `left-0` → RTL should be `right-0`
- Using logical `start-0` handles this automatically
- Padding offset: `pl-64` → `ps-64`

### 4.4 Sheet/Dialog Side
- Mobile sidebar: `side="left"` → dynamic `side={isRTL ? "right" : "left"}`

---

## 5. Dual-Input Fields Summary

Fields requiring bilingual EN/AR input:

| Context | Field | Component |
|---------|-------|-----------|
| Mission Creation | Mission Name | `StepBasics`, `AdminStepBasics` |
| Mission Creation | Question Text | `StepQuestions` |
| Mission Creation | Question Options | `StepQuestions` |
| Mission Creation | Photo Instructions | `StepQuestions` |
| Branch Management | Branch Name | `BranchForm` |
| Admin Templates | Template Name | `AdminTemplates` |
| Admin Templates | Template Questions | `AdminTemplates` |
| Admin Plans | Plan Name | `AdminPlans` |
| Admin Plans | Plan Description | `AdminPlans` |
| Admin Tiers | Tier Name | `AdminTiers` |
| Admin Tiers | Tier Description | `AdminTiers` |

---

## 6. Implementation Order

### Phase 1: Infrastructure (Foundation)
1. Install `react-i18next` + `i18next`
2. Create i18n initialization (`src/i18n/index.ts`)
3. Create `LanguageProvider` with direction management
4. Create `LanguageSwitcher` component
5. Update `index.css` with SF Compact font + Arabic fallback
6. Update `tailwind.config.ts` font family
7. Create `BilingualInput` and `BilingualTextarea` components

### Phase 2: Translation Files
8. Create all EN translation JSON files (extract from codebase)
9. Create all AR translation JSON files

### Phase 3: Global Components
10. Update `App.tsx` with i18n provider
11. Update `Sidebar.tsx` — translations + RTL
12. Update `AdminSidebar.tsx` — translations + RTL
13. Update `Header.tsx` + `AdminHeader.tsx` — translations + language switcher
14. Update `DashboardLayout.tsx` + `AdminLayout.tsx` — RTL padding

### Phase 4: Client Pages
15. Update `Landing.tsx`
16. Update `Auth.tsx`
17. Update `ClientDashboard.tsx`
18. Update `Missions.tsx`
19. Update `MissionCreate.tsx` + all form steps (including dual inputs)
20. Update `MissionDetails.tsx`
21. Update `Branches.tsx` + `BranchForm.tsx` (including dual inputs)
22. Update `Wallet.tsx`
23. Update `Reports.tsx`
24. Update `Settings.tsx` + all settings components

### Phase 5: Admin Pages
24. Update all 16 admin pages
25. Update admin form components (dual inputs for templates, tiers, plans)

### Phase 6: Shared Components
26. Update all shared components (badges, tables, widgets, etc.)
27. Update `lib/constants.ts` to use translation keys

---

## 7. Data Model Changes for Dual-Language

### Option A: JSON fields (Recommended)
Store bilingual content as JSON in existing text columns:
```json
{ "en": "Mission Name", "ar": "اسم المهمة" }
```

### Option B: Separate columns
Add `_ar` suffix columns: `name_ar`, `description_ar`

**Recommendation**: Option A — no schema changes needed, more flexible.

### Display Logic
```tsx
function getLocalizedValue(value: string | { en: string; ar: string }, lang: string): string {
  if (typeof value === 'string') return value; // legacy data
  return value[lang] || value.en || '';
}
```

---

## 8. Key Utilities to Create

```tsx
// src/i18n/utils.ts
export function useDirection(): 'ltr' | 'rtl';
export function useIsRTL(): boolean;
export function useDirectionalIcon(ltrIcon: Component, rtlIcon: Component): Component;
export function getLocalizedValue(value: string | BilingualValue, lang: string): string;
```

---

## 9. Estimated Scope

- **Translation keys**: ~400-500 unique strings
- **Files to modify**: ~60-70 component files
- **New files**: ~15-20 (i18n config + translation JSONs + utility components)
- **RTL fixes**: ~30-40 files with directional CSS
