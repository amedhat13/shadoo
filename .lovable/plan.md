# Agent Mobile App Revamp — End-to-End Prototype

A brand new route (`/agent-app`) that hosts a mobile-framed prototype of the revamped agent flow. Nothing in the existing client/admin dashboards changes. Uses seeded/mock data (Tamara + TBS missions already loaded) so we can demo the full journey without touching the live mobile app.

## Problems being solved

1. Agent can't preview a mission's questions/instructions before accepting → adds a full **Mission Brief** screen (rules, questions preview, photo requirements, purchase policy, payout, cancellation window) with an explicit "I understand & accept" gate.
2. Bottom-sheet trap → replaced with a real **stacked navigation** (Home → Mission Detail → Brief → Active Mission → Task → Submit) with a back button and persistent bottom tab bar.
3. Cluttered info → redesigned mission card with clear hierarchy: hero image, title, brand, distance/duration/reward, badges (photos required, receipt required, questions count).
4. Flat question list → questions grouped into **sections** (from template) with progress, section chips, and per-question guidance.
5. Photo capture guidance → each photo task shows a **sample/reference frame**, framing tips, do/don't list, and retake option.
6. Purchase safety → dedicated **Receipt Wallet** step: budget, amount spent, receipt photo with edge-detection guide, description, item breakdown, and a "reimbursement locked-in" confirmation card.
7. No history → new **My Missions** hub (accessible from bottom tab + profile) with tabs: Active · Under Review · Approved · Rejected · All, each with status timeline and payout state.

## Route structure

New standalone layout at `/agent-app` — does not use client dashboard chrome. Renders inside a mobile frame (max-w-[420px], rounded, shadow) on desktop; full-bleed on mobile.

```text
/agent-app
├── /                       Home  — map + mission feed
├── /mission/:id            Mission Detail (marketing card)
├── /mission/:id/brief      Mission Brief (rules, Q preview, accept gate)
├── /active/:visitId        Active Mission overview (tasks checklist)
├── /active/:visitId/section/:sectionId   Section runner (questions)
├── /active/:visitId/photo/:taskId        Photo capture with guidance
├── /active/:visitId/receipt              Receipt & purchase submission
├── /active/:visitId/review               Pre-submit review + submit
├── /active/:visitId/submitted            Success + timeline
├── /my-missions            History hub (tabs)
├── /my-missions/:visitId   Visit history detail (status timeline, payout)
├── /wallet                 Wallet
├── /notifications
└── /profile
```

Bottom tab bar: **Home · My Missions · Wallet · Profile**.

## Screens & key elements

### 1. Home (`/agent-app`)
- Sticky top: greeting, tier badge, wallet chip.
- Map preview (static image bg) with mission pins.
- "Missions near you" list — **new mission card**:
  - Brand logo + hero image (16:9)
  - Mission title, brand name, verified tick
  - Row: distance · duration · reward
  - Meta chips: `12 Questions` · `4 Photos required` · `Receipt · 200 EGP budget`
  - Primary CTA: "View Mission" (goes to detail, not directly to task)
- Filters: Sort by (recommended/nearest/highest reward), category chips (F&B, Retail, Service).

### 2. Mission Detail
- Hero image, brand, title, "Verified by Shadoo" badge.
- Key facts grid: reward · duration · distance · deadline · slots left.
- "What you'll do" summary (3 lines).
- Section: "Location" with mini map + address.
- Section: "Reward breakdown" — task fee + purchase reimbursement.
- CTA: "Read full brief" → Mission Brief.

### 3. Mission Brief (the acceptance gate)
- Tabs: **Overview · Rules · Questions · Photos · Purchase · Payout**
- **Overview**: story of the visit, cover story, do's/don'ts.
- **Rules**: numbered list (behave as normal customer, no photos of staff faces, complete within X minutes, arrival between HH-HH, etc.)
- **Questions**: shows all sections with question count + question titles preview (read-only). Uses template sections (TBS 5 sections, or Tamara F&B).
- **Photos**: each required photo shown with sample image + framing tips.
- **Purchase**: budget, items to purchase, receipt requirements, reimbursement policy.
- **Payout**: base fee, bonus, when paid, how paid.
- Bottom sticky: checkbox "I've read and understood the brief" → **Accept Mission** button (disabled until checked).

### 4. Active Mission overview
- Header: mission name, deadline countdown, cancel-window countdown.
- Progress ring: X / total tasks done.
- Task list grouped:
  - **Sections** (from questionnaire) — each with progress
  - **Photo tasks** — each with thumbnail placeholder
  - **Receipt** — status
- Bottom CTA: "Complete Mission" (disabled until all done).

### 5. Section runner
- Section chip nav at top (swipeable).
- One question per card with:
  - Question text + optional description (the "keywords" we added)
  - Input tailored to type (rating stars 1-5, single-select pills, multi-select, text, yes/no toggle)
  - "Why we ask" collapsible
- Progress dots + Prev/Next; Save & Exit.

### 6. Photo capture
- Full-screen frame with **sample reference overlay** (semi-transparent).
- Tips list below: lighting, angle, distance, what must be visible.
- Do's ✓ / Don'ts ✗ grid with tiny icons.
- Take Photo / Choose from Gallery.
- Preview → Retake / Use.

### 7. Receipt & purchase
- Budget card (allowed / spent / remaining).
- Receipt photo uploader with **edge guide** overlay.
- Amount spent (numeric, EGP).
- Item list (add rows).
- Description.
- "Reimbursement guarantee" info card — how funds are released.
- Submit Receipt.

### 8. Review & submit
- Summary of everything: questions answered, photos, receipt.
- Any missing item flagged red with jump-to link.
- Legal confirmation checkbox.
- Submit Mission.

### 9. Submitted
- Success animation.
- Timeline: Submitted → Under Review (24-48h) → Approved → Paid.
- CTA: "View in My Missions" / "Find another mission".

### 10. My Missions
- Tabs: **Active · Under Review · Approved · Rejected · All**
- Each row: mission name, brand, submitted date, status pill, payout amount/state.
- Detail view: full status timeline, submitted answers preview, payout state, contact support.

## Data

- Reuse existing seeded missions from Tamara + TBS demos (published missions in DB).
- For the prototype, use a lightweight mock layer (`src/lib/agentAppMock.ts`) with hard-coded active-visit state and history — no writes to DB. This keeps the demo self-contained and avoids affecting client/admin views.
- Photo & receipt "captures" use placeholder images from `/public/tamara-demo/` (already uploaded) as sample refs and captured previews.

## Design system

- Reuse existing tokens (orange primary, Posterama headers, Cairo/SF body).
- Mobile-first: everything sized for 375-420 px frame.
- On desktop, wrap in a phone-shaped frame with subtle shadow so the demo looks like a device.
- No dark mode. No gradients. Matches Shadoo brand.

## Files to add

```text
src/pages/agent/
  AgentAppLayout.tsx           (mobile frame + bottom tabs + outlet)
  AgentHome.tsx
  AgentMissionDetail.tsx
  AgentMissionBrief.tsx
  AgentActive.tsx
  AgentSectionRunner.tsx
  AgentPhotoCapture.tsx
  AgentReceipt.tsx
  AgentReview.tsx
  AgentSubmitted.tsx
  AgentMyMissions.tsx
  AgentVisitHistory.tsx
  AgentWallet.tsx
  AgentNotifications.tsx
  AgentProfile.tsx
src/components/agent/
  MissionCard.tsx
  BriefTabs.tsx
  TaskChecklistItem.tsx
  QuestionCard.tsx (rating/select/text/yes-no variants)
  PhotoGuideOverlay.tsx
  ReceiptUploader.tsx
  StatusTimeline.tsx
  StatusPill.tsx
  MobileFrame.tsx
  BottomTabs.tsx
src/lib/agentAppMock.ts
```

Route added in `src/App.tsx`.

## Out of scope (this pass)

- Real camera/gallery integration (uses file input + placeholders).
- GPS/geo-fence checks (mocked).
- Real payout logic (mocked timeline).
- Actual writes to the visits table (mock state only — this is a design prototype).
- Arabic RTL polish (structure supports it; strings kept English for the prototype). We can add AR in a follow-up.

## Deliverable

Open `/agent-app` in preview → full end-to-end agent journey clickable from Home → Accept Brief → Complete tasks → Submit → History.
