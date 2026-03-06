# Template System & CX Methodologies

## Overview

The platform provides 12 pre-built CX methodology question templates, seeded as **system templates** in the `question_templates` table. These are read-only for clients and editable only by admins.

## System Templates

System templates are identified by `created_by = NULL` and `is_public = true`. They are seeded via a database migration and are skipped if they already exist (matched by `methodology` field).

### Template List

| # | Methodology Key | Name (EN) | Category | Questions |
|---|----------------|-----------|----------|-----------|
| 1 | `nps` | NPS (Net Promoter Score) | NPS | 3 |
| 2 | `csat` | CSAT (Customer Satisfaction) | CSAT | 8 |
| 3 | `ces` | CES (Customer Effort Score) | CES | 4 |
| 4 | `overall_score` | Overall Score | Overall Score | 9 |
| 5 | `top_2_box` | Top 2 Box | Top 2 Box | 6 |
| 6 | `top_box` | Top Box | Top Box | 4 |
| 7 | `menu_tryout` | Menu Try-Out | Menu Try-Out | 13 |
| 8 | `buy_and_try` | Buy & Try | Buy & Try | 10 |
| 9 | `delivery_cx` | Delivery CX | Delivery CX | 12 |
| 10 | `call_center_cx` | Call Center CX | Call Center CX | 12 |
| 11 | `app_digital_cx` | App/Digital CX | App/Digital CX | 7 |
| 12 | `in_store_cx` | In-Store CX | In-Store CX | 13 |

### Template Grouping

Templates are organized into logical groups for the client template selection UI:

- **Core CX Methodologies**: NPS, CSAT, CES, Overall Score, Top 2 Box, Top Box
- **Product Intelligence**: Menu Try-Out, Buy & Try
- **Channel-Specific CX**: Delivery CX, Call Center CX, App/Digital CX, In-Store CX
- **Custom**: User-created templates

## Mission Methodology Flow

1. **Template Selection**: When a client or admin selects a template during mission creation, the template's questions are copied into the mission.
2. **Auto-Set Methodology**: The mission's `methodology` field is automatically set to match the template's methodology key (e.g., `nps`, `csat`).
3. **Manual Questions**: If the user builds questions manually without a template, methodology defaults to `"custom"`.
4. **Clear Template**: Users can clear the methodology tag, reverting to `"custom"`.
5. **Database Storage**: The `methodology` column on the `missions` table stores the active methodology key.

## Category & Methodology Mapping

| Category | Methodology Key | Analytics Dashboard |
|----------|----------------|-------------------|
| NPS | `nps` | NPS Score calculation (Promoters - Detractors) |
| CSAT | `csat` | Satisfaction % (4-5 ratings / total) |
| CES | `ces` | Effort Score average (1-7 scale) |
| Overall Score | `overall_score` | Weighted average across dimensions |
| Top 2 Box | `top_2_box` | % rating 4 or 5 out of 5 |
| Top Box | `top_box` | % rating 5 out of 5 |
| Menu Try-Out | `menu_tryout` | Purchase intent, repeat intent, quality scores |
| Buy & Try | `buy_and_try` | Purchase intent, satisfaction, expectation gap |
| Delivery CX | `delivery_cx` | Speed, accuracy, condition, professionalism |
| Call Center CX | `call_center_cx` | FCR, effort, agent attributes |
| App/Digital CX | `app_digital_cx` | Task completion, friction, trust |
| In-Store CX | `in_store_cx` | Staff, speed, cleanliness, availability |
| Custom | `custom` | Generic aggregation |

## Question Structure

All questions use bilingual format:

```json
{
  "id": "uuid",
  "type": "rating | short_text | multiple_choice | yes_no",
  "text": { "en": "English text", "ar": "Arabic text" },
  "required": true,
  "max_rating": 10,
  "options": [
    { "id": "uuid", "text": { "en": "Option EN", "ar": "Option AR" } }
  ]
}
```

## Admin Management

- Admins can create, edit, and delete any template via the Admin Templates page.
- System templates show a "System" badge and are editable only by admins.
- The template form includes a `methodology` dropdown that auto-populates based on the selected category.
- 13 categories are supported: NPS, CSAT, CES, Overall Score, Top 2 Box, Top Box, Menu Try-Out, Buy & Try, Delivery CX, Call Center CX, App/Digital CX, In-Store CX, Custom.
