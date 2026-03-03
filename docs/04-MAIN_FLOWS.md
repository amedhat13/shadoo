# Shadoo Platform — Main Flows

Each flow describes the complete journey from trigger to completion, identifying which portal is responsible at each step.

---

## Flow 1: Client Onboarding

```
START → Client signs up on landing page

[Client Portal]
  1. Fill registration form (name, email, company, password)
  2. Submit → Supabase Auth creates account
  3. Trigger: handle_new_user() creates profile + wallet

[Email System]
  4. Verification email sent to client

[Client Portal]
  5. Client clicks verification link
  6. Redirected to dashboard
  7. Prompted to complete profile (phone, logo)
  8. Prompted to select subscription plan

END → Client has active account with profile, wallet, and subscription
```

---

## Flow 2: Admin Creates Client (Manual)

```
START → Admin needs to onboard a new client

[Admin Portal]
  1. Navigate to Clients → Create Client
  2. Fill: company name, contact name, email, phone
  3. Submit → calls create-client edge function

[Edge Function: create-client]
  4. Creates auth user with random password
  5. Sets must_change_password = true on profile
  6. Assigns client_admin role

[Email System]
  7. Welcome email with temporary credentials

[Client Portal]
  8. Client logs in → forced to change password
  9. Completes profile setup

END → Admin-created client is active
```

---

## Flow 3: Branch Creation & Verification

```
START → Client needs to add a location

[Client Portal]
  1. Navigate to Branches → Add Branch
  2. Fill: name (EN/AR), address, city, district, Google Maps link
  3. Submit → branch created with status = pending_verification
  4. (Optional) Bulk upload via CSV

[Admin Portal]
  5. Branch appears in Pending Verification queue
  6. Admin reviews: name, address, map preview, Google Maps link
  7a. APPROVE → status = verified, notification sent to client
  7b. REJECT → status = rejected with reason, notification sent

[Client Portal]
  8. Client sees updated branch status
  9. If rejected: client edits branch → resubmits for verification

END → Branch is verified and available for missions
```

---

## Flow 4: Mission Lifecycle

```
START → Client wants to evaluate a branch

[Client Portal]
  1. Create Mission (Draft)
     - Select verified branch
     - Choose agent tier (A/B/C)
     - Set number of visits
     - Build questionnaire (from template or custom, EN/AR)
     - Set photo requirements
     - Add purchase items + per-visit budget (optional)
     - Configure visit schedule (dates, times, duration)
     - Enable geo-tagging (optional)
  
  2. Review total cost calculation
  3. Publish Mission
     → System validates: branch verified, sufficient wallet, sufficient quota
     → Atomic transaction: deduct wallet + deduct visit quota
     → Status: draft → published

[Mobile App]
  4. Mission appears in agent's available missions feed
  5. Agent accepts → assigned to visit slot
  6. Agent travels to branch
  7. (If geo-tagged) Agent checks in → geo-fence validates location
  8. Agent performs visit following questionnaire
  9. Agent submits: answers, photos, receipt
     → Visit status: pending → submitted

[Admin Portal]
  10. Visit appears in review queue
  11. Admin reviews answers, photos, receipt
  12a. APPROVE → agent credited, mission counter incremented
  12b. REJECT → agent notified with reason

[Client Portal]
  13. Client views completed visits with all data
  14. Generates reports / exports data

[Client Portal] (Mission management)
  15a. PAUSE → stops new agent assignments (no refund)
  15b. RESUME → re-opens for agent assignments
  15c. ARCHIVE → releases remaining budget to wallet

END → Mission completed with all visits reviewed
```

---

## Flow 5: Agent Onboarding

```
START → Agent downloads mobile app

[Mobile App]
  1. Register: name, email, phone, national ID
  2. Upload verification documents (ID photos)
  3. Complete onboarding questionnaire
  4. Submit application → status = pending

[Admin Portal]
  5. Agent appears in Pending Approval queue
  6. Admin reviews: personal info, documents, questionnaire answers
  7a. APPROVE → assign tier (default C), status = active
  7b. REJECT → notification sent with reason

[Email System]
  8. Approval/rejection email sent to agent

[Mobile App]
  9. Agent can now browse and accept available missions

END → Agent is active and can receive mission assignments
```

---

## Flow 6: Visit Execution

```
START → Agent has accepted a mission visit

[Mobile App]
  1. View visit details: branch info, questionnaire, photo requirements
  2. Navigate to branch location
  3. (If geo-tagged) Check-in at branch
     → GPS validates agent is within geo-fence radius
  4. Start visit timer
  5. Answer each questionnaire question
  6. Take required photos (storefront, interior, products, etc.)
  7. Make required purchase (if applicable)
  8. Photograph receipt
  9. Submit visit
     → Upload all data: answers, photos, receipt
     → Status: in_progress → submitted

[Admin Portal]
  10. Visit in review queue
  11. Admin reviews quality of submission
  12a. APPROVE → Visit status = approved
  12b. REJECT → Visit status = rejected, reason provided

[Mobile App]
  13. Agent sees visit result
  14. If rejected: can resubmit (if allowed) or dispute

END → Visit data available to client in reports
```

---

## Flow 7: Wallet & Payments

```
START → Client needs funds for missions

[Client Portal]
  1. Navigate to Wallet → Top Up
  2. Select amount
  3. Choose payment method (credit card, mobile wallet)
  4. Redirect to PayMob payment page

[PayMob]
  5. Client completes payment
  6. PayMob sends webhook callback

[Edge Function: wallet-topup-callback]
  7. Verify payment signature
  8. Credit wallet balance
  9. Create wallet_transaction record
  10. Send confirmation notification

[Client Portal]
  11. Wallet balance updated in real-time
  12. Transaction appears in history

END → Client has funds to publish missions
```

---

## Flow 8: Agent Payout

```
START → Agent wants to withdraw earnings

[Mobile App]
  1. View available balance
  2. Request Payout: amount + method (bank transfer / mobile wallet)
  3. Confirm payment details
  4. Submit → payout status = pending

[Admin Portal]
  5. Payout appears in Pending Payouts queue
  6. Finance admin reviews: amount, bank details, agent history
  7a. APPROVE → status = processing
  7b. REJECT → reason provided, balance restored

[Finance Admin]
  8. Process payment externally (bank transfer / mobile wallet)
  9. Mark as completed with transaction reference

[Mobile App]
  10. Agent notified of payout completion
  11. Transaction appears in earnings history

END → Agent receives payment
```

---

## Flow 9: Subscription Management

```
START → Client wants to change plan

[Client Portal]
  1. Navigate to Settings → Subscription
  2. View current plan and usage
  3. Select new plan (upgrade/downgrade)
  4. Confirm change

[Backend]
  5. If upgrade: immediate effect, prorated billing
  6. If downgrade: effective next billing cycle
  7. Update user_subscriptions record
  8. Send confirmation notification

[Admin Portal] (Override)
  9. Admin can manually change any client's subscription
  10. Admin can extend trials, override visit counts
  11. All changes logged in audit_logs

END → Subscription updated
```

---

## Flow 10: Reporting & Analytics

```
START → Client or Admin needs insights

[Client Portal]
  1. Navigate to Reports
  2. Filter by: date range, branches, missions
  3. View dashboards: visit trends, budget usage, completion rates
  4. Drill into mission-level response data
  5. Export to CSV/Excel

[Admin Portal]
  1. Navigate to Reports & Analytics
  2. Platform Overview: clients, revenue, missions, agents
  3. Client Analytics: per-client activity and spending
  4. Agent Performance: completion rates, ratings, tier distribution
  5. Geographic Distribution: branches and missions by city
  6. Mission Analytics: creation and completion trends
  7. Financial Reports: revenue, payouts, MRR
  8. Export any report

END → Stakeholder has actionable insights
```

---

## Flow Summary Matrix

| Flow | Client Portal | Admin Portal | Mobile App | Edge Functions |
|------|:---:|:---:|:---:|:---:|
| Client Onboarding | ● | ○ | — | ○ |
| Admin Creates Client | — | ● | — | ● |
| Branch Verification | ● | ● | — | ○ |
| Mission Lifecycle | ● | ● | ● | ● |
| Agent Onboarding | — | ● | ● | ○ |
| Visit Execution | — | ● | ● | ○ |
| Wallet & Payments | ● | ○ | — | ● |
| Agent Payout | — | ● | ● | ○ |
| Subscription Mgmt | ● | ● | — | ○ |
| Reporting | ● | ● | — | ○ |

● = Primary role  ○ = Supporting role  — = Not involved
