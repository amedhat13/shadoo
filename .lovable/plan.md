# Admin Visit Review Alignment

## Goal
Update the admin visit review so it presents the submitted result with the same clarity and structure as the completed-visits screen, while preserving the admin approval and rejection workflow.

## Changes
- Expand the review to a near-full-screen layout for better visibility.
- Add a compact visit summary showing the calculated visit score, amount spent, evidence count, and items needing attention.
- Group responses by the mission’s question sections and make each section independently collapsible.
- Show a score and question count on every section header, with the first section open by default.
- Render each question using its current configuration: bilingual question and scoring description, rating scale, yes/no result, selected options, N/A, comments, metric tag, required state, and per-question attachments.
- Flag low scores and missing required comments or photo evidence without hiding the rest of the submission.
- Match general photos to their configured photo-slot IDs and titles instead of relying only on upload order; show missing required slots clearly.
- Present the receipt with the submitted amount, configured cap, and missing-required state.
- Keep agent details, schedule details, rejection reason, and approve/reject controls available without competing with the result content.

## Scoring Used on This Screen
- Rating question: `(submitted rating ÷ question maximum) × 100`.
- Yes/No question: Yes = 100%, No = 0%.
- N/A and non-measurable question types are excluded from score averages.
- Section score: average of measurable answers inside that section.
- Visit score: average of every measurable answer in the visit.
- Needs attention: score at or below 60%, missing required comment, or missing required question photo.
- These review scores are an operational summary. Configured report metrics such as NPS, Top 2 Box, weighted averages, and custom formulas continue to be calculated by the Reports metric engine.

## Technical Notes
- Reuse the existing visit-answer normalizer so client and admin interpret sections, bilingual content, options, attachments, and N/A identically.
- Keep approval/rejection mutations unchanged.
- Use semantic design tokens and existing controls.
- Verify the review visually at desktop and mobile widths and confirm the preview builds successfully.
