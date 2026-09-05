# Reports Overview: heat map, top branch, branch comparison, pinned questions

Adds four things to the Reports overview (client dashboard) and mirrors them in the admin per-client report view, per the platform parity rule.

## 1. Location heat map (best-scoring locations)
A city/branch heat grid on the Overview tab: one tile per branch, coloured from red to green by its overall score (using the client's active metrics engine), with the score, city and answer count on the tile. Grouped by city so clusters are visible. Tiles with too few answers are greyed out and labelled "not enough data". Clicking a tile filters the rest of the overview to that branch.

## 2. Top branch highlight card
A prominent card above the metric scorecards showing the best-performing branch: name (EN/AR), score, city, number of visits, and the gap versus the account average. A smaller companion line names the branch that needs the most attention.

## 3. Branch comparison chart (radar, like the reference image)
A multi-branch radar chart where each axis is an active metric (NPS, CSAT, Top 2 Box, ...) and each branch is an overlaid coloured shape, so "who scored best in what" is readable at a glance. Includes a branch selector (up to 4 branches at a time) plus a "best in" summary row that lists, per metric, which branch leads and by how much.

## 4. Pin a question to the overview
Clients can pin any measurable question (rating / yes-no) so it appears as a card at the top of the Overview with its score, distribution, and per-branch best/worst.

- Pin control (pin icon) on each question row in the Question Analytics tab and in the "Questions feeding this metric" list.
- Pinned question cards sit in the top card row, each with an unpin action.
- Pins are saved per account so they persist across sessions and devices, and the admin per-client view shows that client's pins.

## Technical notes
- New table `public.report_pins` (`id`, `user_id`, `question_key` = normalised question label/id, `label`, `label_ar`, `sort_order`, `created_at`) with GRANTs for `authenticated` + `service_role` and RLS scoping every policy to `auth.uid()`; admins read via the existing `is_admin()` helper. New hook `useReportPins(ownerId?)` mirroring the `useReportMetrics` owner-override pattern.
- Scoring reuses `src/lib/reportMetrics.ts` (`computeMetric`, `formatMetricValue`, `healthColor`) and the branch resolution already used in `MetricsOverview.tsx` (visit → mission → branch). No new calculation rules.
- New components under `src/components/reports/`: `BranchHeatMap.tsx`, `TopBranchCard.tsx`, `BranchRadarComparison.tsx`, `PinnedQuestionCards.tsx`; wired into `MetricsOverview.tsx` so both `src/pages/Reports.tsx` and `src/components/admin/reports/ClientReportView.tsx` get them automatically.
- Radar uses recharts `RadarChart`; scores normalised to 0-100 per metric so axes are comparable.
- All labels bilingual EN/AR via the existing reports translation namespace; colours from existing design tokens (no hardcoded palette outside the heat scale, which is added as tokens).
