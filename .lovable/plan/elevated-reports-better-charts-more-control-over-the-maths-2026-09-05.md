# Elevated reports: better charts, more control over the maths

Two things: give the report charts a real design pass with richer chart types and drill-down, and give your team (not clients) full control over how every score is calculated — including weights per question and your own formulas.

Today the metric setup lives in the client's own Settings → Reports tab, and the maths is limited to five fixed formulas (NPS, top boxes, top box, average, yes rate) where every answer counts equally.

## Part 1 — Control over calculations (your team only)

**Move configuration to the admin side.** A new "Report metrics" area in the admin dashboard, per client plus a platform default set. The client's Settings → Reports tab becomes read-only: they see how each score is defined and what it counts, but can't change it. Nothing already configured is lost.

**Weights.** Each question tagged with a metric gets a weight (default 1). A weight of 2 makes that question count twice as much in the score. Weights can also be set per section, so a whole section like "Cleanliness" can carry a defined share of the total. Scores become weighted averages instead of flat averages, and every chart follows automatically.

**Your own formulas.** A formula builder where you combine existing metrics and question groups into a new one — for example `Overall = 0.5 × Service + 0.3 × Cleanliness + 0.2 × Speed`, or a compliance index from several yes/no groups. Written in a safe, restricted expression box with live preview against real data, so you can see the result before saving. Invalid or unsafe expressions are refused with a clear message.

**Edge-case rules per metric.** Whether Not-applicable answers are excluded or count as a miss, and a minimum number of answers before a score is shown at all (below that it reads "not enough data" instead of a misleading number).

## Part 2 — Elevated charts

**Look and feel.** One consistent chart style across client and admin reports: brand colours, target lines, benchmark bands (poor / fair / good / excellent shading), clear value labels, readable Arabic and English axes with RTL support, and richer tooltips showing score, number of answers and gap to target.

**New chart types.**
- Gauge / dial per metric, showing the score against its target and colour bands.
- Stacked bars for answer split (promoters / passives / detractors, yes / no, score bands).
- Question heat grid: questions down the side, branches across the top, coloured cells — spot the weak question-branch combinations instantly.
- Period comparison bars: this month vs last, with the change shown.
- Weight contribution chart showing how much each question or section pushed the total score up or down.

**Interactivity.**
- Click any bar, cell or tile to drill into that branch, question or period; the rest of the page follows the selection, with a visible "filtered by" bar and one-click clear.
- Hover for full detail, including sample size and a low-sample warning.
- Compare a chosen period against the previous one across every chart.
- Expand any chart to full screen and download it as an image.

## Technical notes

- Extend `report_metrics.config` with `weights` (per question key and per section), `naHandling`, `minSample`, and `bands`. Add a `formula_kind` of `builtin` or `expression` plus an `expression` field for custom metrics.
- Extend `src/lib/reportMetrics.ts`: weighted aggregation in `computeMetric`, a small safe expression evaluator (whitelisted tokens: metric keys, numbers, `+ - * / ( )`, min/max/avg — no `eval`), min-sample gating returning a `null` value with a reason.
- New `src/components/reports/charts/` primitives (gauge, stacked split, heat grid, period compare, weight contribution) built on the existing Recharts setup, shared by client `Reports.tsx` and admin `ClientReportView.tsx` so both stay identical.
- Selection/drill-down held in a single `ReportFilterContext` (branch, question, period) consumed by every chart block.
- New admin page `src/pages/admin/AdminReportMetrics.tsx` (sidebar entry + route) reusing the current editor, extended with weights, the formula builder and live preview; `src/components/settings/ReportMetricsSettings.tsx` becomes a read-only summary for clients.
- Seed the demo accounts with weights and one custom composite metric so the new charts have something meaningful to show.

## What I need from you

Nothing to start. Once it's in, tell me if the weighting should default to per-question or per-section for the demo data.
