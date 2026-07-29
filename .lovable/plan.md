## Goal

Deliver one screenshot for each requested capability. Items 4 and 8 are backend-only APIs and are skipped per your answer, leaving 8 visual deliverables. Five already exist as screens; three need to be built first.

## What already exists (screenshot only)

| # | Item | Where |
|---|---|---|
| 2 | Visit detail drawer | `VisitReviewDialog` opened from `/admin/visits` |
| 5 | Global visit monitoring feed with filters | `/admin/visits` |
| 6 | Platform analytics overview | `/admin/reports` (Overview tab) |
| 9 | Agent management view | `/admin/agents` |
| 10 | Admin audit log | `/admin/audit` |

Note: the audit log page currently renders mock rows; the screenshot will show that mock data unless you want it wired to real records.

## What to build

**1. Mission duplication & save-as-template**
- Add "Duplicate" and "Save as template" actions to the row menu in `MissionTable` (client `/missions`) and mirror them in `/admin/missions`.
- Duplicate: clones the mission into the create flow as a draft prefilled with basics, questions, photo slots, and geo settings, with a `(Copy)` name suffix; visit schedules reset to empty so dates must be re-picked.
- Save as template: dialog capturing bilingual template name + description, writes into the existing `question_templates` store so it appears in the mission builder template picker.

**3. Bulk visit approval / rejection**
- Add row checkboxes and a header select-all to `/admin/visits`.
- A sticky action bar appears on selection: "Approve N visits" / "Reject N visits", with a confirmation dialog. Rejection requires a shared reason (reusing the existing rejection category + note pattern).
- Reuses the current single-visit approve/reject mutations run in sequence, so existing payout-on-approval and re-queue-on-rejection behaviour is preserved.

**7. Wallet top-up flow (manual funding request)**
- Client side: add a "Request manual funding" path to `TopUpDialog` — amount, reference/receipt note, optional transfer proof — creating a pending funding request instead of an instant charge.
- Admin side: a "Funding requests" section in `/admin/finance` listing pending requests with Approve / Decline; approving credits the client wallet and writes a transaction record.
- Backend: one migration adding a `wallet_topup_requests` table with grants, RLS (clients see their own, admins see all), plus the approval path.

## Screenshot capture

- Drive the running app with Playwright inside the sandbox, signed in with the admin/demo session, viewport 1280x1800.
- One PNG per item, named `01-mission-duplication.png` … `10-admin-audit-log.png` (skipping 04 and 08), each framed on the relevant UI state (menu open, drawer open, selection active).
- Saved to `/mnt/documents/` and shown back to you as a gallery.

## Technical notes

- All new UI strings go through `useTranslation` with EN + AR entries in the `admin`, `missions`, and `wallet` namespaces; RTL respected.
- Bulk actions and funding approval reuse existing hooks (`useAdminVisits`, `useWallet`) rather than new data layers.
- Per the platform-parity rule, mission duplication is added to both the client and admin mission tables.
