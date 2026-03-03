# Shadoo Platform — Notification System & Email Templates

## Notification Architecture

```
┌──────────────────┐
│  Trigger Event   │  (visit submitted, branch verified, payout approved, etc.)
└────────┬─────────┘
         │
┌────────┴─────────┐
│ Notification Hub │  (Edge Function: send-notification)
│                  │
│ 1. Check user    │
│    preferences   │
│ 2. Load template │
│ 3. Render (EN/AR)│
│ 4. Dispatch      │
└──┬──────┬────────┘
   │      │
   │      └──── Email (Lovable Cloud Email)
   │
   └───── In-App (notifications table → Realtime)
   
   Future:
   ├──── Push (FCM for mobile app)
   └──── SMS (Twilio / local provider)
```

---

## Notification Channels

| Channel | Status | Technology | Use Case |
|---------|--------|-----------|----------|
| **In-App** | ✅ Ready | `notifications` table + Supabase Realtime | All non-urgent notifications |
| **Email** | 🔲 TODO | Lovable Cloud Email | Important actions, verifications, financial |
| **Push** | 🔲 Future | Firebase Cloud Messaging (FCM) | Mobile app: new missions, visit updates |
| **SMS** | 🔲 Future | Twilio / local provider | Critical alerts (payout processed, account suspended) |

---

## Notification Events & Recipients

### Client Notifications

| Event Key | Trigger | Channel | Priority |
|-----------|---------|---------|----------|
| `branch.verified` | Admin approves branch | Email + In-App | Medium |
| `branch.rejected` | Admin rejects branch | Email + In-App | High |
| `mission.published` | Mission goes live | In-App | Low |
| `visit.submitted` | Agent submits a visit | In-App | Medium |
| `visit.approved` | Admin approves visit | In-App | Low |
| `visit.rejected` | Admin rejects visit | In-App | Medium |
| `mission.completed` | All visits done | Email + In-App | High |
| `wallet.topup_success` | Payment confirmed | Email + In-App | High |
| `wallet.topup_failed` | Payment failed | Email + In-App | High |
| `wallet.low_balance` | Balance below threshold | Email + In-App | Medium |
| `subscription.renewed` | Auto-renewal success | Email + In-App | Medium |
| `subscription.expiring` | 7 days before expiry | Email + In-App | High |
| `subscription.expired` | Subscription expired | Email + In-App | Critical |
| `team.invite` | Team member invited | Email | High |
| `team.joined` | Member accepted invite | In-App | Low |
| `account.welcome` | New account created | Email | High |
| `account.password_reset` | Password reset requested | Email | Critical |

### Agent Notifications

| Event Key | Trigger | Channel | Priority |
|-----------|---------|---------|----------|
| `agent.approved` | Admin approves agent | Email + In-App + Push | High |
| `agent.rejected` | Admin rejects agent | Email + In-App | High |
| `agent.tier_changed` | Tier upgraded/downgraded | Email + In-App + Push | High |
| `agent.suspended` | Account suspended | Email + In-App | Critical |
| `mission.available` | New mission in agent's area | Push + In-App | Medium |
| `visit.assigned` | Agent assigned to visit | Push + In-App | High |
| `visit.approved` | Visit approved (earnings credited) | Push + In-App | High |
| `visit.rejected` | Visit rejected with reason | Push + In-App | High |
| `payout.approved` | Payout approved for processing | Push + In-App | High |
| `payout.completed` | Payout sent successfully | Email + Push + In-App | High |
| `payout.rejected` | Payout rejected with reason | Email + Push + In-App | High |

### Admin Notifications

| Event Key | Trigger | Channel | Priority |
|-----------|---------|---------|----------|
| `admin.new_client` | New client registered | In-App | Medium |
| `admin.branch_pending` | Branch awaiting verification | In-App | Medium |
| `admin.agent_pending` | Agent awaiting approval | In-App | Medium |
| `admin.visit_submitted` | Visit awaiting review | In-App | Medium |
| `admin.payout_requested` | Payout awaiting approval | In-App + Email | High |
| `admin.system_alert` | System issue detected | Email | Critical |

---

## Email Templates

### Template Structure

Each template has:
- **template_key**: Unique identifier
- **name / name_ar**: Display name (EN/AR)
- **subject / subject_ar**: Email subject line (EN/AR)
- **body / body_ar**: Email body with `{{variable}}` placeholders (EN/AR)
- **channel**: `email`
- **variables**: JSON array of available placeholders

---

### Template 1: Welcome Email
```
template_key: account.welcome
channel: email

Subject (EN): Welcome to Shadoo, {{company_name}}!
Subject (AR): مرحباً بك في شادو، {{company_name}}!

Variables: [company_name, full_name, login_url]
```

**Body (EN):**
```
Hi {{full_name}},

Welcome to Shadoo! Your account for {{company_name}} has been created successfully.

You can now log in and start setting up your mystery shopping missions:
- Add your branch locations
- Create your first mission
- Fund your wallet

Get started: {{login_url}}

If you have any questions, our support team is here to help.

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

أهلاً بك في شادو! تم إنشاء حسابك لشركة {{company_name}} بنجاح.

يمكنك الآن تسجيل الدخول والبدء في إعداد مهام التسوق الخفي:
- أضف مواقع فروعك
- أنشئ أول مهمة
- اشحن محفظتك

ابدأ الآن: {{login_url}}

إذا كان لديك أي أسئلة، فريق الدعم لدينا هنا للمساعدة.

مع أطيب التحيات،
فريق شادو
```

---

### Template 2: Admin-Created Account
```
template_key: account.admin_created
channel: email

Subject (EN): Your Shadoo Account Has Been Created
Subject (AR): تم إنشاء حسابك في شادو

Variables: [full_name, company_name, email, temporary_password, login_url]
```

**Body (EN):**
```
Hi {{full_name}},

An account has been created for you on Shadoo for {{company_name}}.

Your login credentials:
Email: {{email}}
Temporary Password: {{temporary_password}}

You will be asked to change your password on first login.

Log in here: {{login_url}}

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

تم إنشاء حساب لك على شادو لشركة {{company_name}}.

بيانات تسجيل الدخول:
البريد الإلكتروني: {{email}}
كلمة المرور المؤقتة: {{temporary_password}}

سيُطلب منك تغيير كلمة المرور عند تسجيل الدخول لأول مرة.

سجّل الدخول هنا: {{login_url}}

مع أطيب التحيات،
فريق شادو
```

---

### Template 3: Branch Verified
```
template_key: branch.verified
channel: email

Subject (EN): Your Branch "{{branch_name}}" Has Been Verified ✓
Subject (AR): تم التحقق من فرع "{{branch_name}}" ✓

Variables: [full_name, branch_name, branch_address, dashboard_url]
```

**Body (EN):**
```
Hi {{full_name}},

Great news! Your branch has been verified and is now ready for missions.

Branch Details:
Name: {{branch_name}}
Address: {{branch_address}}

You can now create missions targeting this branch.

Go to Dashboard: {{dashboard_url}}

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

أخبار رائعة! تم التحقق من فرعك وهو الآن جاهز للمهام.

تفاصيل الفرع:
الاسم: {{branch_name}}
العنوان: {{branch_address}}

يمكنك الآن إنشاء مهام تستهدف هذا الفرع.

اذهب إلى لوحة التحكم: {{dashboard_url}}

مع أطيب التحيات،
فريق شادو
```

---

### Template 4: Branch Rejected
```
template_key: branch.rejected
channel: email

Subject (EN): Your Branch "{{branch_name}}" Needs Attention
Subject (AR): فرع "{{branch_name}}" يحتاج إلى مراجعة

Variables: [full_name, branch_name, rejection_reason, dashboard_url]
```

**Body (EN):**
```
Hi {{full_name}},

Unfortunately, your branch could not be verified at this time.

Branch: {{branch_name}}
Reason: {{rejection_reason}}

Please update the branch details and resubmit for verification.

Update Branch: {{dashboard_url}}

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

للأسف، لم نتمكن من التحقق من فرعك في الوقت الحالي.

الفرع: {{branch_name}}
السبب: {{rejection_reason}}

يرجى تحديث تفاصيل الفرع وإعادة تقديمه للتحقق.

تحديث الفرع: {{dashboard_url}}

مع أطيب التحيات،
فريق شادو
```

---

### Template 5: Mission Completed
```
template_key: mission.completed
channel: email

Subject (EN): Mission "{{mission_name}}" is Complete!
Subject (AR): اكتملت مهمة "{{mission_name}}"!

Variables: [full_name, mission_name, branch_name, total_visits, reports_url]
```

**Body (EN):**
```
Hi {{full_name}},

All visits for your mission have been completed and reviewed.

Mission: {{mission_name}}
Branch: {{branch_name}}
Total Visits Completed: {{total_visits}}

View the full results and download your report.

View Report: {{reports_url}}

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

تم إكمال ومراجعة جميع الزيارات الخاصة بمهمتك.

المهمة: {{mission_name}}
الفرع: {{branch_name}}
إجمالي الزيارات المكتملة: {{total_visits}}

اطلع على النتائج الكاملة وحمّل تقريرك.

عرض التقرير: {{reports_url}}

مع أطيب التحيات،
فريق شادو
```

---

### Template 6: Wallet Top-Up Success
```
template_key: wallet.topup_success
channel: email

Subject (EN): Wallet Top-Up Confirmed — {{amount}} {{currency}}
Subject (AR): تم تأكيد شحن المحفظة — {{amount}} {{currency}}

Variables: [full_name, amount, currency, new_balance, transaction_ref, dashboard_url]
```

**Body (EN):**
```
Hi {{full_name}},

Your wallet has been topped up successfully.

Amount Added: {{amount}} {{currency}}
New Balance: {{new_balance}} {{currency}}
Transaction Reference: {{transaction_ref}}

You can now use this balance to publish missions.

Go to Wallet: {{dashboard_url}}

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

تم شحن محفظتك بنجاح.

المبلغ المضاف: {{amount}} {{currency}}
الرصيد الجديد: {{new_balance}} {{currency}}
مرجع المعاملة: {{transaction_ref}}

يمكنك الآن استخدام هذا الرصيد لنشر المهام.

اذهب إلى المحفظة: {{dashboard_url}}

مع أطيب التحيات،
فريق شادو
```

---

### Template 7: Low Wallet Balance
```
template_key: wallet.low_balance
channel: email

Subject (EN): Low Wallet Balance Alert
Subject (AR): تنبيه: رصيد المحفظة منخفض

Variables: [full_name, current_balance, currency, topup_url]
```

**Body (EN):**
```
Hi {{full_name}},

Your wallet balance is running low.

Current Balance: {{current_balance}} {{currency}}

Top up your wallet to ensure your missions continue running without interruption.

Top Up Now: {{topup_url}}

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

رصيد محفظتك منخفض.

الرصيد الحالي: {{current_balance}} {{currency}}

اشحن محفظتك لضمان استمرار مهامك دون انقطاع.

اشحن الآن: {{topup_url}}

مع أطيب التحيات،
فريق شادو
```

---

### Template 8: Subscription Expiring
```
template_key: subscription.expiring
channel: email

Subject (EN): Your Shadoo Subscription Expires in {{days_remaining}} Days
Subject (AR): ينتهي اشتراكك في شادو خلال {{days_remaining}} أيام

Variables: [full_name, plan_name, expiry_date, days_remaining, renewal_url]
```

**Body (EN):**
```
Hi {{full_name}},

Your {{plan_name}} subscription will expire on {{expiry_date}}.

After expiry, you will no longer be able to create new missions or access premium features.

Renew your subscription to continue without interruption.

Renew Now: {{renewal_url}}

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

سينتهي اشتراكك في خطة {{plan_name}} في {{expiry_date}}.

بعد انتهاء الاشتراك، لن تتمكن من إنشاء مهام جديدة أو الوصول إلى الميزات المتقدمة.

جدّد اشتراكك للاستمرار دون انقطاع.

جدّد الآن: {{renewal_url}}

مع أطيب التحيات،
فريق شادو
```

---

### Template 9: Agent Approved
```
template_key: agent.approved
channel: email

Subject (EN): You're Approved! Start Earning with Shadoo
Subject (AR): تمت الموافقة! ابدأ الكسب مع شادو

Variables: [full_name, tier_name, app_url]
```

**Body (EN):**
```
Hi {{full_name}},

Congratulations! Your agent application has been approved.

You've been assigned to Tier {{tier_name}}.

You can now browse available missions in your area and start earning.

Open the App: {{app_url}}

Welcome aboard!
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

تهانينا! تمت الموافقة على طلب الانضمام الخاص بك.

تم تعيينك في المستوى {{tier_name}}.

يمكنك الآن تصفح المهام المتاحة في منطقتك والبدء في الكسب.

افتح التطبيق: {{app_url}}

أهلاً بك معنا!
فريق شادو
```

---

### Template 10: Agent Rejected
```
template_key: agent.rejected
channel: email

Subject (EN): Update on Your Shadoo Application
Subject (AR): تحديث بشأن طلبك في شادو

Variables: [full_name, rejection_reason]
```

**Body (EN):**
```
Hi {{full_name}},

Thank you for your interest in joining Shadoo as an agent.

Unfortunately, we were unable to approve your application at this time.

Reason: {{rejection_reason}}

You're welcome to reapply after addressing the above.

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

شكراً لاهتمامك بالانضمام إلى شادو كوكيل.

للأسف، لم نتمكن من الموافقة على طلبك في الوقت الحالي.

السبب: {{rejection_reason}}

يسعدنا أن تعيد التقديم بعد معالجة ما ذُكر أعلاه.

مع أطيب التحيات،
فريق شادو
```

---

### Template 11: Payout Completed
```
template_key: payout.completed
channel: email

Subject (EN): Payout of {{amount}} {{currency}} Processed
Subject (AR): تم تحويل {{amount}} {{currency}}

Variables: [full_name, amount, currency, method, transaction_ref]
```

**Body (EN):**
```
Hi {{full_name}},

Your payout has been processed successfully.

Amount: {{amount}} {{currency}}
Method: {{method}}
Reference: {{transaction_ref}}

The funds should arrive within 1-3 business days depending on your payment method.

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

تم تحويل مستحقاتك بنجاح.

المبلغ: {{amount}} {{currency}}
طريقة الدفع: {{method}}
المرجع: {{transaction_ref}}

ستصل الأموال خلال 1-3 أيام عمل حسب طريقة الدفع.

مع أطيب التحيات،
فريق شادو
```

---

### Template 12: Payout Rejected
```
template_key: payout.rejected
channel: email

Subject (EN): Payout Request Update
Subject (AR): تحديث بشأن طلب التحويل

Variables: [full_name, amount, currency, rejection_reason]
```

**Body (EN):**
```
Hi {{full_name}},

Your payout request for {{amount}} {{currency}} could not be processed.

Reason: {{rejection_reason}}

The amount has been returned to your available balance. Please update your payment details if needed and try again.

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

لم نتمكن من معالجة طلب التحويل الخاص بك بمبلغ {{amount}} {{currency}}.

السبب: {{rejection_reason}}

تم إعادة المبلغ إلى رصيدك المتاح. يرجى تحديث تفاصيل الدفع إذا لزم الأمر والمحاولة مرة أخرى.

مع أطيب التحيات،
فريق شادو
```

---

### Template 13: Team Invitation
```
template_key: team.invite
channel: email

Subject (EN): You've Been Invited to Join {{company_name}} on Shadoo
Subject (AR): تمت دعوتك للانضمام إلى {{company_name}} على شادو

Variables: [invitee_name, company_name, inviter_name, role, invite_url]
```

**Body (EN):**
```
Hi {{invitee_name}},

{{inviter_name}} has invited you to join {{company_name}} on Shadoo as a {{role}}.

Shadoo is a mystery shopping platform that helps organizations evaluate service quality across their branches.

Accept Invitation: {{invite_url}}

This invitation will expire in 7 days.

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{invitee_name}}،

قام {{inviter_name}} بدعوتك للانضمام إلى {{company_name}} على شادو بصفة {{role}}.

شادو هي منصة تسوق خفي تساعد المؤسسات في تقييم جودة الخدمة عبر فروعها.

قبول الدعوة: {{invite_url}}

ستنتهي صلاحية هذه الدعوة خلال 7 أيام.

مع أطيب التحيات،
فريق شادو
```

---

### Template 14: Visit Approved (Agent)
```
template_key: visit.approved_agent
channel: email

Subject (EN): Visit Approved — {{earnings}} {{currency}} Earned!
Subject (AR): تمت الموافقة على الزيارة — ربحت {{earnings}} {{currency}}!

Variables: [full_name, mission_name, branch_name, earnings, currency, balance]
```

**Body (EN):**
```
Hi {{full_name}},

Your visit has been approved!

Mission: {{mission_name}}
Branch: {{branch_name}}
Earnings: {{earnings}} {{currency}}
Updated Balance: {{balance}} {{currency}}

Keep up the great work!

Best regards,
The Shadoo Team
```

**Body (AR):**
```
مرحباً {{full_name}}،

تمت الموافقة على زيارتك!

المهمة: {{mission_name}}
الفرع: {{branch_name}}
الأرباح: {{earnings}} {{currency}}
الرصيد المحدث: {{balance}} {{currency}}

استمر في العمل الرائع!

مع أطيب التحيات،
فريق شادو
```

---

## Notification Templates Database Seed

The following SQL seeds all 14 email templates into the `notification_templates` table:

```sql
INSERT INTO notification_templates (template_key, name, name_ar, description, description_ar, subject, subject_ar, body, body_ar, channel, variables, is_active) VALUES
('account.welcome', 'Welcome Email', 'بريد الترحيب', 'Sent when a new client signs up', 'يُرسل عند تسجيل عميل جديد', 'Welcome to Shadoo, {{company_name}}!', 'مرحباً بك في شادو، {{company_name}}!', '...', '...', 'email', '["company_name","full_name","login_url"]', true),
('account.admin_created', 'Admin-Created Account', 'حساب أنشأه المسؤول', 'Sent when admin creates a client account', 'يُرسل عندما ينشئ المسؤول حساب عميل', 'Your Shadoo Account Has Been Created', 'تم إنشاء حسابك في شادو', '...', '...', 'email', '["full_name","company_name","email","temporary_password","login_url"]', true),
('branch.verified', 'Branch Verified', 'تم التحقق من الفرع', 'Sent when a branch is approved', 'يُرسل عند الموافقة على الفرع', 'Your Branch "{{branch_name}}" Has Been Verified ✓', 'تم التحقق من فرع "{{branch_name}}" ✓', '...', '...', 'email', '["full_name","branch_name","branch_address","dashboard_url"]', true),
('branch.rejected', 'Branch Rejected', 'تم رفض الفرع', 'Sent when a branch is rejected', 'يُرسل عند رفض الفرع', 'Your Branch "{{branch_name}}" Needs Attention', 'فرع "{{branch_name}}" يحتاج إلى مراجعة', '...', '...', 'email', '["full_name","branch_name","rejection_reason","dashboard_url"]', true),
('mission.completed', 'Mission Completed', 'اكتملت المهمة', 'Sent when all mission visits are done', 'يُرسل عند اكتمال جميع زيارات المهمة', 'Mission "{{mission_name}}" is Complete!', 'اكتملت مهمة "{{mission_name}}"!', '...', '...', 'email', '["full_name","mission_name","branch_name","total_visits","reports_url"]', true),
('wallet.topup_success', 'Wallet Top-Up Success', 'نجاح شحن المحفظة', 'Sent after successful wallet top-up', 'يُرسل بعد نجاح شحن المحفظة', 'Wallet Top-Up Confirmed — {{amount}} {{currency}}', 'تم تأكيد شحن المحفظة — {{amount}} {{currency}}', '...', '...', 'email', '["full_name","amount","currency","new_balance","transaction_ref","dashboard_url"]', true),
('wallet.low_balance', 'Low Balance Alert', 'تنبيه رصيد منخفض', 'Sent when wallet balance is low', 'يُرسل عندما يكون رصيد المحفظة منخفضاً', 'Low Wallet Balance Alert', 'تنبيه: رصيد المحفظة منخفض', '...', '...', 'email', '["full_name","current_balance","currency","topup_url"]', true),
('subscription.expiring', 'Subscription Expiring', 'اشتراك ينتهي قريباً', 'Sent 7 days before subscription expires', 'يُرسل قبل 7 أيام من انتهاء الاشتراك', 'Your Shadoo Subscription Expires in {{days_remaining}} Days', 'ينتهي اشتراكك في شادو خلال {{days_remaining}} أيام', '...', '...', 'email', '["full_name","plan_name","expiry_date","days_remaining","renewal_url"]', true),
('agent.approved', 'Agent Approved', 'تمت الموافقة على الوكيل', 'Sent when agent is approved', 'يُرسل عند الموافقة على الوكيل', 'You''re Approved! Start Earning with Shadoo', 'تمت الموافقة! ابدأ الكسب مع شادو', '...', '...', 'email', '["full_name","tier_name","app_url"]', true),
('agent.rejected', 'Agent Rejected', 'تم رفض الوكيل', 'Sent when agent application is rejected', 'يُرسل عند رفض طلب الوكيل', 'Update on Your Shadoo Application', 'تحديث بشأن طلبك في شادو', '...', '...', 'email', '["full_name","rejection_reason"]', true),
('payout.completed', 'Payout Completed', 'تم التحويل', 'Sent when payout is processed', 'يُرسل عند معالجة التحويل', 'Payout of {{amount}} {{currency}} Processed', 'تم تحويل {{amount}} {{currency}}', '...', '...', 'email', '["full_name","amount","currency","method","transaction_ref"]', true),
('payout.rejected', 'Payout Rejected', 'تم رفض التحويل', 'Sent when payout is rejected', 'يُرسل عند رفض التحويل', 'Payout Request Update', 'تحديث بشأن طلب التحويل', '...', '...', 'email', '["full_name","amount","currency","rejection_reason"]', true),
('team.invite', 'Team Invitation', 'دعوة فريق', 'Sent when inviting a team member', 'يُرسل عند دعوة عضو فريق', 'You''ve Been Invited to Join {{company_name}} on Shadoo', 'تمت دعوتك للانضمام إلى {{company_name}} على شادو', '...', '...', 'email', '["invitee_name","company_name","inviter_name","role","invite_url"]', true),
('visit.approved_agent', 'Visit Approved (Agent)', 'تمت الموافقة على الزيارة (وكيل)', 'Sent to agent when visit is approved', 'يُرسل للوكيل عند الموافقة على الزيارة', 'Visit Approved — {{earnings}} {{currency}} Earned!', 'تمت الموافقة على الزيارة — ربحت {{earnings}} {{currency}}!', '...', '...', 'email', '["full_name","mission_name","branch_name","earnings","currency","balance"]', true);
```

---

## User Notification Preferences

Users can configure per-channel preferences:

```json
{
  "email": {
    "branch_updates": true,
    "mission_updates": true,
    "wallet_alerts": true,
    "subscription_alerts": true,
    "team_updates": true
  },
  "in_app": {
    "all": true
  },
  "push": {
    "new_missions": true,
    "visit_updates": true,
    "payout_updates": true
  }
}
```

Stored in `profiles.notification_preferences` (JSONB column, to be added).
