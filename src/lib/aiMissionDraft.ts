/**
 * MOCKUP ENGINE — Shadoo AI Mission Builder
 *
 * This file fakes what the real model call will do so the flow can be demoed
 * end-to-end without a backend. The contract below (analyze -> ask once ->
 * build draft) is exactly what the production edge function should return, so
 * swapping this for a real call means replacing two functions only.
 *
 * See /mnt/documents/shadoo-docs/AI-Mission-Builder-Base-Prompt.md
 */
import { MissionFormData, Question, QuestionSection, VisitSchedule, BRIEF_SECTION_KEYS } from '@/types';

export interface AIAttachment {
  id: string;
  name: string;
  size: number;
  kind: 'pdf' | 'image' | 'sheet' | 'doc';
  /** What the model claims to have extracted from the file. */
  extracted: string[];
}

export interface ClarifyQuestion {
  id: string;
  question: string;
  hint?: string;
  type: 'choice' | 'text' | 'number';
  options?: string[];
  multi?: boolean;
  required?: boolean;
}

export interface AIAnalysis {
  /** Chain-of-thought summary shown in the collapsible "Reasoning" block. */
  reasoning: string[];
  /** Everything the model is confident about already. */
  understood: string[];
  /** All open points, asked in ONE batch. */
  questions: ClarifyQuestion[];
}

export interface PreflightCheck {
  id: string;
  label: string;
  detail: string;
  status: 'pass' | 'warn' | 'fail';
}

export interface AIDraftResult {
  draft: Partial<MissionFormData>;
  summary: { label: string; value: string }[];
  optionalFilled: { field: string; why: string }[];
  preflight: PreflightCheck[];
}

export interface BuilderContext {
  branches: { id: string; name: string; city?: string }[];
  walletBalance: number;
  visitsRemaining: number;
  category?: string;
}

const kw = (text: string, words: string[]) => words.some((w) => text.toLowerCase().includes(w));

export function detectAttachmentInsights(files: AIAttachment[]): string[] {
  return files.flatMap((f) => f.extracted.map((e) => `${f.name}: ${e}`));
}

/** Step 1 + 2 + 4 of the base prompt: reason, read attachments, ask everything at once. */
export function analyzeRequest(brief: string, files: AIAttachment[], ctx: BuilderContext): AIAnalysis {
  const wantsReceipt = kw(brief, ['buy', 'purchase', 'order', 'receipt', 'coffee', 'meal', 'product']);
  const mentionsAllBranches = kw(brief, ['all branches', 'every branch', 'all stores']);
  const visitHint = brief.match(/(\d+)\s*(visits?|shops?|calls?)/i);

  const reasoning = [
    'Goal extraction — read the request as a measurement objective, not a task list.',
    files.length
      ? `Parsed ${files.length} attachment${files.length > 1 ? 's' : ''} and mapped every scored line to a question type (rating / yes-no / choice).`
      : 'No attachments — will build the questionnaire from the stated objective and the closest standard methodology.',
    mentionsAllBranches
      ? `Branch scope resolved to all ${ctx.branches.length} verified branches on the account.`
      : 'Branch scope unclear from the text — needs confirmation.',
    visitHint
      ? `Visit volume taken from the request: ${visitHint[1]} visits.`
      : 'Visit volume not stated — needs confirmation against the remaining monthly allowance.',
    wantsReceipt
      ? 'Purchase detected, so receipt capture, a per-visit purchase budget and a wallet check are all required.'
      : 'No purchase detected — receipt capture stays off.',
    'Gap sweep — collect every unknown now and ask in a single batch instead of round-tripping.',
  ];

  const understood = [
    brief.trim().slice(0, 160) || 'Mystery shopping mission',
    files.length ? `${files.length} attachment(s) analysed` : 'Objective-driven questionnaire',
    wantsReceipt ? 'Purchase + receipt required' : 'Observation only, no purchase',
  ];

  const questions: ClarifyQuestion[] = [];

  if (!mentionsAllBranches) {
    questions.push({
      id: 'branches',
      question: 'Which branches should this run in?',
      hint: 'Only verified branches can receive visits.',
      type: 'choice',
      multi: true,
      options: ctx.branches.map((b) => (b.city ? `${b.name} — ${b.city}` : b.name)),
      required: true,
    });
  }

  questions.push({
    id: 'visits',
    question: 'How many visits per branch?',
    hint: `You have ${ctx.visitsRemaining} visits left in this month's plan.`,
    type: 'number',
    required: true,
  });

  questions.push({
    id: 'window',
    question: 'When should the visits happen?',
    type: 'choice',
    options: ['This week, any time', 'Next 2 weeks, weekdays only', 'Weekends only', 'Peak hours (12:00–15:00)'],
    required: true,
  });

  if (wantsReceipt) {
    questions.push({
      id: 'budget',
      question: 'What should the shopper spend per visit (EGP)?',
      hint: 'This is reimbursed from your wallet against the uploaded receipt.',
      type: 'number',
      required: true,
    });
  }

  questions.push({
    id: 'tier',
    question: 'Which shopper profile fits this audience?',
    type: 'choice',
    options: ['Tier A — Premium / experienced', 'Tier B — Standard', 'Tier C — Basic'],
    required: true,
  });

  questions.push({
    id: 'sensitive',
    question: 'Anything the shopper must NOT do?',
    hint: 'Optional — becomes a "Don\'t" rule in the brief.',
    type: 'text',
  });

  return { reasoning, understood, questions };
}

const bilingual = (en: string, ar: string) => ({ en, ar });

function questionSet(brief: string, files: AIAttachment[]) {
  const sections: QuestionSection[] = [
    { id: 'sec-1', label: bilingual('Arrival & Greeting', 'الوصول والترحيب') },
    { id: 'sec-2', label: bilingual('Staff & Service', 'الموظفون والخدمة') },
    { id: 'sec-3', label: bilingual('Cleanliness & Store', 'النظافة والفرع') },
    { id: 'sec-4', label: bilingual('Checkout & Closing', 'الدفع والمغادرة') },
  ];

  const q = (
    section: string,
    type: Question['type'],
    en: string,
    ar: string,
    descEn: string,
    descAr: string,
    metric?: string
  ): Question => ({
    id: crypto.randomUUID(),
    section_id: section,
    type,
    text: bilingual(en, ar),
    description: bilingual(descEn, descAr),
    required: true,
    max_rating: type === 'rating' ? 5 : undefined,
    allowNA: true,
    commentMode: 'optional',
    metric_key: metric,
    suggestedComments: [
      bilingual('Fast and friendly', 'سريع وودود'),
      bilingual('Long wait', 'انتظار طويل'),
      bilingual('Staff was busy', 'الموظف كان مشغولاً'),
      bilingual('Very clean', 'نظيف جداً'),
    ],
  });

  const questions: Question[] = [
    q('sec-1', 'yes_no', 'Were you acknowledged within 30 seconds of entering?', 'هل تم الترحيب بك خلال ٣٠ ثانية من دخولك؟', 'greeting within 30 sec, eye contact, acknowledged while busy, felt welcomed', 'ترحيب خلال ٣٠ ثانية، تواصل بالعين، ترحيب أثناء الانشغال، إحساس بالترحيب', 'compliance_rate'),
    q('sec-1', 'rating', 'Rate the warmth of the welcome.', 'قيّم مستوى الترحيب.', 'smile, tone of voice, personal greeting, attentiveness', 'الابتسامة، نبرة الصوت، الترحيب الشخصي، الانتباه', 'overall_score'),
    q('sec-2', 'rating', 'How well did the staff understand your needs?', 'ما مدى فهم الموظف لاحتياجاتك؟', 'asked questions, suggested options, product knowledge, no pressure', 'طرح الأسئلة، اقتراح البدائل، معرفة المنتج، دون إلحاح', 'csat'),
    q('sec-2', 'yes_no', 'Did the staff suggest an add-on or upsell?', 'هل اقترح الموظف إضافة أو منتجاً آخر؟', 'suggested add-on, relevant to order, natural not pushy', 'اقتراح إضافة، ملائم للطلب، بشكل طبيعي', 'compliance_rate'),
    q('sec-3', 'rating', 'Rate the cleanliness of the store.', 'قيّم نظافة الفرع.', 'floors, tables, counters, restrooms, bins', 'الأرضيات، الطاولات، الكاونتر، دورات المياه، سلات المهملات', 'overall_score'),
    q('sec-3', 'photo', 'Photo of the service counter.', 'صورة لمنطقة الخدمة.', 'wide shot, staff not identifiable, natural light', 'صورة واسعة، دون إظهار الموظفين، إضاءة طبيعية'),
    q('sec-4', 'rating', 'How likely are you to recommend this branch to a friend?', 'ما مدى احتمالية أن ترشح هذا الفرع لصديق؟', 'overall feeling, would return, worth the price, would recommend', 'الإحساس العام، الرجوع مرة أخرى، يستحق السعر، الترشيح', 'nps'),
    q('sec-4', 'text', 'Describe the visit in your own words.', 'اكتب وصفاً للزيارة بكلماتك.', 'sequence of events, names if given, anything unusual', 'تسلسل الأحداث، الأسماء إن وُجدت، أي شيء غير معتاد'),
  ];

  if (files.length) {
    questions.push(
      q('sec-2', 'rating', 'Was the standard service script followed end to end?', 'هل تم اتباع نص الخدمة المعتمد بالكامل؟', 'greeting line, offer of the day, name usage, closing line, thank you', 'عبارة الترحيب، عرض اليوم، استخدام الاسم، عبارة الختام، الشكر', 'top_2_box')
    );
  }

  return { sections, questions };
}

function schedules(branchIds: string[], perBranch: number, window: string): VisitSchedule[] {
  const out: VisitSchedule[] = [];
  const weekendsOnly = window.toLowerCase().includes('weekend');
  const peak = window.toLowerCase().includes('peak');
  let cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);

  branchIds.forEach((branchId) => {
    for (let i = 0; i < perBranch; i++) {
      const d = new Date(cursor);
      d.setDate(d.getDate() + i * 2);
      if (weekendsOnly) while (d.getDay() !== 5 && d.getDay() !== 6) d.setDate(d.getDate() + 1);
      out.push({
        id: crypto.randomUUID(),
        branch_id: branchId,
        date: d.toISOString().slice(0, 10),
        time: peak ? '13:00' : i % 2 === 0 ? '11:30' : '18:00',
        duration: 30,
      });
    }
  });

  return out;
}

/** Steps 3 + 5 of the base prompt: pick the optional fields worth filling, then emit the full draft. */
export function buildDraft(
  brief: string,
  files: AIAttachment[],
  answers: Record<string, string | string[] | number>,
  ctx: BuilderContext
): AIDraftResult {
  const selectedLabels = (answers.branches as string[] | undefined) ?? ctx.branches.map((b) => (b.city ? `${b.name} — ${b.city}` : b.name));
  const branchIds = ctx.branches
    .filter((b) => selectedLabels.some((l) => l.startsWith(b.name)))
    .map((b) => b.id);
  const perBranch = Math.max(1, Number(answers.visits) || 2);
  const window = String(answers.window || 'This week, any time');
  const budget = Number(answers.budget) || 0;
  const tierAnswer = String(answers.tier || 'Tier B — Standard');
  const tier = tierAnswer.includes('A') ? 'A' : tierAnswer.includes('C') ? 'C' : 'B';
  const dont = String(answers.sensitive || '').trim();

  const { sections, questions } = questionSet(brief, files);
  const visitSchedules = schedules(branchIds, perBranch, window);
  const totalVisits = visitSchedules.length;
  const totalBudget = totalVisits * budget;

  const name = brief.trim().split(/[.\n]/)[0].slice(0, 60) || 'Customer Experience Audit';

  const draft: Partial<MissionFormData> = {
    name,
    name_ar: 'تقييم تجربة العميل',
    branch_ids: branchIds,
    category: ctx.category,
    agent_selection_mode: 'tier',
    agent_tier: tier,
    methodology: 'custom',
    expected_minutes: budget > 0 ? 35 : 25,
    completion_deadline_min: 120,
    cancel_window_min: 10,
    review_sla_hours: 48,
    cover_story: bilingual(
      'You are a regular customer visiting on your own. Behave naturally, take your time and do not reveal that you are evaluating the branch.',
      'أنت عميل عادي يزور الفرع بمفرده. تصرّف بشكل طبيعي وخذ وقتك ولا تُظهر أنك تقوم بتقييم الفرع.'
    ),
    rules: [
      { en: 'Arrive within the scheduled visit window.', ar: 'الوصول في وقت الزيارة المحدد.', kind: 'do' },
      { en: 'Answer every question before leaving the branch.', ar: 'أجب عن كل الأسئلة قبل مغادرة الفرع.', kind: 'do' },
      { en: 'Do not photograph staff faces.', ar: 'لا تصوّر وجوه الموظفين.', kind: 'dont' },
      ...(dont ? [{ en: dont, ar: dont, kind: 'dont' as const }] : []),
    ],
    checklist: [
      bilingual('Note the time you walked in.', 'سجّل وقت دخولك الفرع.'),
      bilingual('Observe the greeting and waiting time.', 'راقب الترحيب ووقت الانتظار.'),
      ...(budget > 0 ? [bilingual('Place your order and keep the receipt.', 'اطلب واحتفظ بالفاتورة.')] : []),
      bilingual('Complete the questionnaire before leaving.', 'أكمل الاستبيان قبل المغادرة.'),
    ],
    require_brief_ack: true,
    brief_sections: [...BRIEF_SECTION_KEYS],
    question_sections: sections,
    questions,
    photo_requirements: {
      required_count: budget > 0 ? 3 : 2,
      instructions: bilingual(
        'Shoot discreetly, no faces, good light.',
        'صوّر بتحفظ، بدون وجوه، وبإضاءة جيدة.'
      ),
      slots: [
        {
          id: crypto.randomUUID(),
          label: bilingual('Storefront', 'واجهة الفرع'),
          hint: bilingual('Include the sign', 'أظهر اللافتة'),
          required: true,
          frame_hint: bilingual('Shoot from across the entrance', 'صوّر من أمام المدخل'),
        },
        {
          id: crypto.randomUUID(),
          label: bilingual('Service area', 'منطقة الخدمة'),
          hint: bilingual('Wide shot, no faces', 'صورة واسعة بدون وجوه'),
          required: true,
        },
        ...(budget > 0
          ? [
              {
                id: crypto.randomUUID(),
                label: bilingual('Receipt', 'الفاتورة'),
                hint: bilingual('Flat, all lines readable', 'مسطحة وكل السطور واضحة'),
                required: true,
              },
            ]
          : []),
      ],
    },
    visit_schedules: visitSchedules,
    number_of_visits: totalVisits,
    purchase_budget_per_visit: budget,
    purchase_items:
      budget > 0
        ? [{ id: crypto.randomUUID(), name: 'Order for one person', name_ar: 'طلب لشخص واحد', budget }]
        : [{ id: crypto.randomUUID(), name: '', budget: 0 }],
    receipt: {
      enabled: budget > 0,
      capEGP: budget,
      ruleText: bilingual(
        'Upload a clear photo of the receipt. Amounts above the cap are not reimbursed.',
        'ارفع صورة واضحة للفاتورة. المبالغ الزائدة عن الحد لا تُسترد.'
      ),
    },
    is_geo_tagged: true,
  };

  const summary = [
    { label: 'Mission name', value: `${name} / تقييم تجربة العميل` },
    { label: 'Branches', value: `${branchIds.length} selected` },
    { label: 'Visits', value: `${totalVisits} (${perBranch} per branch)` },
    { label: 'Questions', value: `${questions.length} across ${sections.length} sections, EN + AR` },
    { label: 'Photos', value: `${draft.photo_requirements?.slots?.length} named slots` },
    { label: 'Shopper profile', value: `Tier ${tier}` },
    { label: 'Purchase', value: budget > 0 ? `${budget} EGP per visit, receipt required` : 'None' },
    { label: 'Total wallet hold', value: `${totalBudget.toLocaleString()} EGP` },
  ];

  const optionalFilled = [
    { field: 'Cover story (EN/AR)', why: 'Shoppers behave more naturally with a persona; nothing in your request contradicted it.' },
    { field: 'Do / Don\'t rules', why: 'Prevents the two mistakes that most often void a visit.' },
    { field: 'Question descriptions', why: 'Each scored line gets its evaluation keywords so scoring is consistent.' },
    { field: 'Cancel window 10 min / SLA 48 h', why: 'Platform defaults that fit a 35-minute visit.' },
    { field: 'Geo-tagging on', why: 'Confirms the shopper was physically inside the branch.' },
  ];

  const preflight: PreflightCheck[] = [
    {
      id: 'visits',
      label: 'Monthly visit allowance',
      detail: `${totalVisits} needed · ${ctx.visitsRemaining} remaining`,
      status: totalVisits > ctx.visitsRemaining ? 'fail' : totalVisits > ctx.visitsRemaining * 0.8 ? 'warn' : 'pass',
    },
    {
      id: 'wallet',
      label: budget > 0 ? 'Wallet balance for purchases' : 'Wallet balance (no purchase needed)',
      detail:
        budget > 0
          ? `${totalBudget.toLocaleString()} EGP hold · ${ctx.walletBalance.toLocaleString()} EGP available`
          : 'No purchase budget required for this mission',
      status: totalBudget > ctx.walletBalance ? 'fail' : 'pass',
    },
    {
      id: 'receipt',
      label: 'Receipt rule consistency',
      detail: budget > 0 ? 'Receipt on and a funded purchase item exists' : 'Receipt off, no funded item needed',
      status: 'pass',
    },
    {
      id: 'branches',
      label: 'Verified branches',
      detail: `${branchIds.length} verified branch(es) selected`,
      status: branchIds.length ? 'pass' : 'fail',
    },
  ];

  return { draft, summary, optionalFilled, preflight };
}

export const AI_SAMPLE_PROMPTS = [
  'Audit the greeting and speed of service in all my branches this month',
  'Run a coffee purchase visit and check upselling at the counter',
  'Use the attached brand standards PDF as the questionnaire',
  'Compare weekend vs weekday service in my two busiest branches',
];

export const AI_MOCK_ATTACHMENTS: AIAttachment[] = [
  {
    id: 'file-1',
    name: 'Brand-Standards-2026.pdf',
    size: 482_112,
    kind: 'pdf',
    extracted: [
      '14 scored sections detected (greeting, product knowledge, cleanliness, closing)',
      'Weighting table on page 12 mapped to Overall Score',
      'Three mandatory photos referenced (storefront, counter, receipt)',
    ],
  },
];
