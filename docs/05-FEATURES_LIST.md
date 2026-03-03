# Shadoo Platform — Features List

## Client Portal Features

### Authentication & Account
| # | Feature | Status |
|---|---------|--------|
| C1 | Email + password signup | ✅ Done |
| C2 | Email verification | ✅ Done |
| C3 | Login / Logout | ✅ Done |
| C4 | Forgot password / Reset password | ✅ Done |
| C5 | Forced password change (admin-created accounts) | ✅ Done |
| C6 | Profile management (name, company, phone, avatar) | ✅ Done |
| C7 | Company logo upload | ✅ Done |
| C8 | Change password | ✅ Done |

### Dashboard
| # | Feature | Status |
|---|---------|--------|
| C9 | Overview stats (missions, visits, branches, budget) | ✅ Done (UI) |
| C10 | Recent activity feed | ✅ Done (UI) |
| C11 | Quick action buttons | ✅ Done (UI) |
| C12 | Visits remaining widget (subscription quota) | ✅ Done (UI) |

### Branch Management
| # | Feature | Status |
|---|---------|--------|
| C13 | Create branch (bilingual EN/AR) | ✅ Done |
| C14 | Edit branch | ✅ Done |
| C15 | Delete branch | ✅ Done |
| C16 | Bulk branch import (CSV) | ✅ Done (UI) |
| C17 | Branch status tracking (pending/verified/rejected) | ✅ Done |
| C18 | City + district selection | ✅ Done |
| C19 | Google Maps link with coordinate extraction | ✅ Done |
| C20 | Branch filtering (status, city, search) | ✅ Done |
| C21 | Map view of branches | ✅ Done (UI) |

### Mission Management
| # | Feature | Status |
|---|---------|--------|
| C22 | Multi-step mission creation wizard | ✅ Done |
| C23 | Branch selection (verified only) | ✅ Done |
| C24 | Agent tier selection (A/B/C) | ✅ Done |
| C25 | Questionnaire builder (bilingual) | ✅ Done |
| C26 | Question types: text, multiple choice, yes/no, rating | ✅ Done |
| C27 | Load from question templates | ✅ Done (UI) |
| C28 | Photo requirements configuration | ✅ Done |
| C29 | Purchase items + budget per visit | ✅ Done |
| C30 | Visit scheduling (date, time, duration) | ✅ Done |
| C31 | Geo-tagging toggle | ✅ Done |
| C32 | Budget calculation & review | ✅ Done |
| C33 | Mission publishing (with validation) | ✅ Done (UI) |
| C34 | Mission status management (pause/resume/archive) | ✅ Done (UI) |
| C35 | Mission details view | ✅ Done |
| C36 | Completed visits dialog | ✅ Done (UI) |
| C37 | Mission filtering (status, search) | ✅ Done |

### Wallet & Billing
| # | Feature | Status |
|---|---------|--------|
| C38 | Wallet balance display | ✅ Done (UI) |
| C39 | Transaction history | ✅ Done (UI) |
| C40 | Top-up dialog (amount + payment method) | ✅ Done (UI) |
| C41 | PayMob payment integration | 🔲 TODO |
| C42 | Subscription plan selection | ✅ Done (UI) |
| C43 | Plan upgrade/downgrade | 🔲 TODO |
| C44 | Usage tracking (visits used/remaining) | ✅ Done (UI) |

### Reports
| # | Feature | Status |
|---|---------|--------|
| C45 | Visit analytics charts | ✅ Done (UI) |
| C46 | Budget analytics | ✅ Done (UI) |
| C47 | Branch performance comparison | ✅ Done (UI) |
| C48 | Date range filtering | ✅ Done (UI) |
| C49 | CSV/Excel export | 🔲 TODO |

### Settings
| # | Feature | Status |
|---|---------|--------|
| C50 | Account settings | ✅ Done |
| C51 | Notification preferences | ✅ Done (UI) |
| C52 | Security settings | ✅ Done (UI) |
| C53 | Billing & invoices | ✅ Done (UI) |
| C54 | Team members (invite/manage) | ✅ Done (UI) |

### General
| # | Feature | Status |
|---|---------|--------|
| C55 | Bilingual UI (English + Arabic) | ✅ Done |
| C56 | RTL layout support | ✅ Done |
| C57 | Responsive design (desktop + tablet) | ✅ Done |
| C58 | Dark mode (theme support) | ✅ Done |
| C59 | In-app notifications | ✅ Done (UI) |
| C60 | Landing page | ✅ Done |

---

## Admin Portal Features

### Authentication & Access
| # | Feature | Status |
|---|---------|--------|
| A1 | Admin login (separate /admin/auth route) | ✅ Done |
| A2 | Role-based access control (super_admin, admin, support, finance, operations) | ✅ Done |
| A3 | Protected routes with role check | ✅ Done |
| A4 | Demo admin access mode | ✅ Done |

### Dashboard
| # | Feature | Status |
|---|---------|--------|
| A5 | Platform overview stats | ✅ Done (UI) |
| A6 | Revenue metrics | ✅ Done (UI) |
| A7 | Recent activity feed | ✅ Done (UI) |
| A8 | System health indicators | ✅ Done (UI) |

### Client Management
| # | Feature | Status |
|---|---------|--------|
| A9 | List all clients (search, filter) | ✅ Done |
| A10 | Create client (with auto-generated password) | ✅ Done |
| A11 | View client details | ✅ Done (UI) |
| A12 | Suspend/activate client | ✅ Done (UI) |
| A13 | Adjust wallet balance | 🔲 TODO |
| A14 | Override subscription | 🔲 TODO |
| A15 | Impersonate client | 🔲 TODO |
| A16 | Client analytics view | ✅ Done (UI) |

### Branch Verification
| # | Feature | Status |
|---|---------|--------|
| A17 | Pending branches queue | ✅ Done |
| A18 | Branch detail review | ✅ Done |
| A19 | Create branch for client | ✅ Done |
| A20 | Edit branch | ✅ Done |
| A21 | Bulk branch creation | ✅ Done |
| A22 | Approve/reject branch | ✅ Done (UI) |
| A23 | Client selector filter | ✅ Done |

### Mission Monitoring
| # | Feature | Status |
|---|---------|--------|
| A24 | All missions list (filter by client, status) | ✅ Done |
| A25 | Create mission for client | ✅ Done |
| A26 | Mission details view | ✅ Done (UI) |
| A27 | Force pause/archive | 🔲 TODO |
| A28 | View visit responses | ✅ Done (UI) |
| A29 | Export mission data | 🔲 TODO |

### Agent Management
| # | Feature | Status |
|---|---------|--------|
| A30 | Agent list (search, filter by tier/status) | ✅ Done |
| A31 | Agent approval queue | ✅ Done |
| A32 | Agent detail view | ✅ Done |
| A33 | Approve/reject agent (with questionnaire review) | ✅ Done (UI) |
| A34 | Change agent tier | ✅ Done (UI) |
| A35 | Suspend/ban agent | ✅ Done (UI) |
| A36 | Agent performance metrics | ✅ Done (UI) |

### Visit Management
| # | Feature | Status |
|---|---------|--------|
| A37 | All visits list | ✅ Done |
| A38 | Visit review dialog (answers, photos) | ✅ Done (UI) |
| A39 | Approve/reject visit | ✅ Done (UI) |
| A40 | Filter by mission, agent, status | ✅ Done |

### Configuration
| # | Feature | Status |
|---|---------|--------|
| A41 | Agent tier management (CRUD) | ✅ Done (UI) |
| A42 | Question template management (CRUD, bilingual) | ✅ Done |
| A43 | Subscription plan management (CRUD, bilingual) | ✅ Done |
| A44 | Cities & districts management | ✅ Done (UI) |
| A45 | Notification templates (email/SMS) | ✅ Done (UI) |
| A46 | System config (feature flags, maintenance mode) | ✅ Done (UI) |

### Financial
| # | Feature | Status |
|---|---------|--------|
| A47 | Revenue dashboard | ✅ Done (UI) |
| A48 | Transaction history | ✅ Done (UI) |
| A49 | Agent payout queue | ✅ Done (UI) |
| A50 | Approve/reject payout | ✅ Done (UI) |
| A51 | Bulk payout processing | 🔲 TODO |
| A52 | Financial reports export | 🔲 TODO |

### Reports & Analytics
| # | Feature | Status |
|---|---------|--------|
| A53 | Platform overview tab | ✅ Done (UI) |
| A54 | Client analytics tab | ✅ Done (UI) |
| A55 | Agent performance tab | ✅ Done (UI) |
| A56 | Geographic distribution tab | ✅ Done (UI) |
| A57 | Mission analytics tab | ✅ Done (UI) |
| A58 | Custom report builder | 🔲 TODO |

### System Administration
| # | Feature | Status |
|---|---------|--------|
| A59 | Admin user management | ✅ Done (UI) |
| A60 | Audit log viewer | ✅ Done (UI) |
| A61 | Admin roles & permissions | ✅ Done (UI) |

### General
| # | Feature | Status |
|---|---------|--------|
| A62 | Bilingual UI (English + Arabic) | ✅ Done |
| A63 | RTL layout support | ✅ Done |
| A64 | Responsive sidebar navigation | ✅ Done |
| A65 | Breadcrumb navigation | ✅ Done |

---

## Mobile App Features (Future — Agent App)

### Authentication
| # | Feature | Status |
|---|---------|--------|
| M1 | Agent registration (with questionnaire) | 🔲 TODO |
| M2 | Login / Logout | 🔲 TODO |
| M3 | Profile management | 🔲 TODO |
| M4 | Document upload for verification | 🔲 TODO |

### Mission Discovery
| # | Feature | Status |
|---|---------|--------|
| M5 | Available missions feed (filtered by tier + location) | 🔲 TODO |
| M6 | Mission details view | 🔲 TODO |
| M7 | Accept/decline mission | 🔲 TODO |
| M8 | My active missions list | 🔲 TODO |

### Visit Execution
| # | Feature | Status |
|---|---------|--------|
| M9 | Navigate to branch (maps integration) | 🔲 TODO |
| M10 | Geo-fence check-in | 🔲 TODO |
| M11 | Questionnaire completion | 🔲 TODO |
| M12 | Photo capture (camera integration) | 🔲 TODO |
| M13 | Receipt photo capture | 🔲 TODO |
| M14 | Visit submission | 🔲 TODO |
| M15 | Visit history with statuses | 🔲 TODO |

### Earnings & Payouts
| # | Feature | Status |
|---|---------|--------|
| M16 | Earnings dashboard | 🔲 TODO |
| M17 | Payout request | 🔲 TODO |
| M18 | Payout history | 🔲 TODO |
| M19 | Bank/wallet details management | 🔲 TODO |

### General
| # | Feature | Status |
|---|---------|--------|
| M20 | Push notifications | 🔲 TODO |
| M21 | Bilingual (EN/AR) | 🔲 TODO |
| M22 | Offline support (queue submissions) | 🔲 TODO |
| M23 | RTL layout | 🔲 TODO |

---

## Feature Count Summary

| Portal | Done | UI Only | TODO | Total |
|--------|------|---------|------|-------|
| Client | 28 | 24 | 4 | 56 |
| Admin | 30 | 27 | 6 | 63 |
| Mobile | 0 | 0 | 23 | 23 |
| **Total** | **58** | **51** | **33** | **142** |
