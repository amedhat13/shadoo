# Mobile App Business Rules

This document contains critical business rules that must be implemented in the mobile agent app.

---

## Agent Branch Cooldown Rule

**Rule:** The same agent cannot see or be assigned a new mission at the same branch unless at least **14 days** have passed since the submission date of their previous visit at that branch. This ensures mystery shopping integrity.

**Implementation:**
When building the mobile app, filter available missions for an agent by checking the `visits` table:
- Exclude missions at branches where the agent has a visit with status `"submitted"` or `"approved"` and `submitted_at` within the last 14 days.

**SQL filter example:**
```sql
-- Get branches the agent should NOT see
SELECT DISTINCT m.branch_id
FROM visits v
JOIN missions m ON v.mission_id = m.id
WHERE v.agent_id = :agent_id
  AND v.status IN ('submitted', 'approved')
  AND v.submitted_at > NOW() - INTERVAL '14 days';
```

**Rationale:** Mystery shopping relies on agents being anonymous. If the same agent visits the same branch too frequently, staff may recognize them, compromising the evaluation's integrity.

---

## Agent Identity Confidentiality

**Rule:** Agent identifying information (name, email, phone) must **never** be exposed to clients in any view, export, or API response.

**Implementation:**
- Client-facing views must display "Mystery Shopper" / "المتسوق السري" instead of agent names.
- Admin views retain full agent information for operational purposes.
- Excel/CSV exports from the client portal must not include agent identity fields.
- API responses to client roles must strip agent identity before returning data.

**Rationale:** Protecting agent identity is a core business principle that ensures agents can provide honest, unbiased evaluations without fear of identification by the businesses they evaluate.

---

## Visit Time Constraints

### Minimum Lead Time
- Visits must be scheduled at least **2 hours from the current time**.
- Validation is enforced at mission creation time.
- Error message: "Visit time must be at least 2 hours from now" / "يجب أن يكون وقت الزيارة بعد ساعتين على الأقل من الآن"

### Urgent Missions
- If any visit is scheduled within **24 hours** (but still valid ≥ 2 hours), the mission is automatically flagged as **urgent**.
- Urgent missions display an "Urgent" / "عاجل" badge in all views.
- This flag helps prioritize agent assignment.
