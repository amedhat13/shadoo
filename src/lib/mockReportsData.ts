// TODO: Remove this file and set USE_MOCK_DATA = false in useClientReports.ts when real data is available
import { TLAB_BRANCHES, TLAB_MISSIONS, TLAB_VISITS } from './tlabDemoData';

export const USE_MOCK_DATA = true;

const DEMO_BRANCHES = [
  // T-Lab Boba branches (real qualitative data — drives Branch Comparison view)
  { id: 'tlab-branch-yard', name: 'T-Lab Boba — The Yard', name_ar: 'تي لاب بوبا — ذا يارد', city: 'Cairo', status: 'verified' },
  { id: 'tlab-branch-arabella', name: 'T-Lab Boba — Arabella', name_ar: 'تي لاب بوبا — أرابيلا', city: 'Cairo', status: 'verified' },
  // Original synthetic branches
  { id: 'demo-branch-1', name: 'Nasr City Branch', name_ar: 'فرع مدينة نصر', city: 'Cairo', status: 'verified' },
  { id: 'demo-branch-2', name: 'Smouha Branch', name_ar: 'فرع سموحة', city: 'Alexandria', status: 'verified' },
  { id: 'demo-branch-3', name: 'Maadi Branch', name_ar: 'فرع المعادي', city: 'Cairo', status: 'verified' },
  { id: 'demo-branch-4', name: '6th October Branch', name_ar: 'فرع السادس من أكتوبر', city: 'Giza', status: 'verified' },
];

// Helper to generate question IDs
const qid = (prefix: string, n: number) => `${prefix}-q${n}`;

// NPS template questions
const npsQuestions = [
  { id: qid('nps', 1), type: 'rating', text: { en: 'How likely are you to recommend us?', ar: 'ما مدى احتمال أن توصي بنا؟' }, max_rating: 10 },
  { id: qid('nps', 2), type: 'multiple_choice', text: { en: 'Which area influenced your score most?', ar: 'أي مجال أثّر على تقييمك أكثر؟' }, options: [
      { text: { en: 'Staff', ar: 'الموظفون' } }, { text: { en: 'Product Quality', ar: 'جودة المنتج' } },
      { text: { en: 'Speed', ar: 'السرعة' } }, { text: { en: 'Cleanliness', ar: 'النظافة' } },
      { text: { en: 'Pricing', ar: 'الأسعار' } }, { text: { en: 'Other', ar: 'أخرى' } },
  ]},
  { id: qid('nps', 3), type: 'short_text', text: { en: 'Please tell us why you gave this score.', ar: 'يرجى إخبارنا لماذا أعطيت هذا التقييم.' } },
];

const csatQuestions = [
  { id: qid('csat', 1), type: 'rating', text: { en: 'How satisfied are you with your experience?', ar: 'ما مدى رضاك عن تجربتك؟' }, max_rating: 5 },
  { id: qid('csat', 2), type: 'rating', text: { en: 'Staff friendliness', ar: 'ودية الموظفين' }, max_rating: 5 },
  { id: qid('csat', 3), type: 'rating', text: { en: 'Speed of service', ar: 'سرعة الخدمة' }, max_rating: 5 },
  { id: qid('csat', 4), type: 'rating', text: { en: 'Cleanliness', ar: 'النظافة' }, max_rating: 5 },
  { id: qid('csat', 5), type: 'rating', text: { en: 'Product quality', ar: 'جودة المنتج' }, max_rating: 5 },
  { id: qid('csat', 6), type: 'rating', text: { en: 'Pricing', ar: 'الأسعار' }, max_rating: 5 },
  { id: qid('csat', 7), type: 'multiple_choice', text: { en: 'What was the best part?', ar: 'ما أفضل جزء؟' }, options: [
      { text: { en: 'Staff', ar: 'الموظفون' } }, { text: { en: 'Product Quality', ar: 'جودة المنتج' } },
      { text: { en: 'Cleanliness', ar: 'النظافة' } }, { text: { en: 'Speed', ar: 'السرعة' } }, { text: { en: 'Pricing', ar: 'الأسعار' } },
  ]},
  { id: qid('csat', 8), type: 'yes_no', text: { en: 'Did anything go wrong?', ar: 'هل حدث أي خطأ؟' } },
  { id: qid('csat', 9), type: 'multiple_choice', text: { en: 'What went wrong?', ar: 'ما الذي حدث؟' }, options: [
      { text: { en: 'Long wait', ar: 'انتظار طويل' } }, { text: { en: 'Wrong order', ar: 'طلب خاطئ' } },
      { text: { en: 'Dirty environment', ar: 'بيئة متسخة' } }, { text: { en: 'Product quality', ar: 'جودة المنتج' } }, { text: { en: 'Other', ar: 'أخرى' } },
  ]},
];

const menuTryoutQuestions = [
  { id: qid('menu', 1), type: 'rating', text: { en: 'How likely are you to purchase this item?', ar: 'ما مدى احتمال شرائك لهذا المنتج؟' }, max_rating: 10 },
  { id: qid('menu', 2), type: 'rating', text: { en: 'How likely are you to order again?', ar: 'ما مدى احتمال طلبك مرة أخرى؟' }, max_rating: 10 },
  { id: qid('menu', 3), type: 'rating', text: { en: 'Overall satisfaction', ar: 'الرضا العام' }, max_rating: 5 },
  { id: qid('menu', 4), type: 'rating', text: { en: 'Uniqueness', ar: 'التفرد' }, max_rating: 5 },
  { id: qid('menu', 5), type: 'rating', text: { en: 'Perceived value', ar: 'القيمة المتوقعة' }, max_rating: 10 },
  { id: qid('menu', 6), type: 'multiple_choice', text: { en: 'Portion size?', ar: 'حجم الحصة؟' }, options: [
      { text: { en: 'Too small', ar: 'صغير جداً' } }, { text: { en: 'Just right', ar: 'مناسب' } }, { text: { en: 'Too big', ar: 'كبير جداً' } },
  ]},
  { id: qid('menu', 7), type: 'yes_no', text: { en: 'Did you experience any quality issues?', ar: 'هل واجهت أي مشاكل في الجودة؟' } },
  { id: qid('menu', 8), type: 'multiple_choice', text: { en: 'What issue?', ar: 'ما المشكلة؟' }, options: [
      { text: { en: 'Cold temperature', ar: 'درجة حرارة باردة' } }, { text: { en: 'Presentation', ar: 'العرض' } },
      { text: { en: 'Wrong ingredients', ar: 'مكونات خاطئة' } }, { text: { en: 'Other', ar: 'أخرى' } },
  ]},
  { id: qid('menu', 9), type: 'rating', text: { en: 'Taste', ar: 'الطعم' }, max_rating: 5 },
  { id: qid('menu', 10), type: 'rating', text: { en: 'Texture', ar: 'القوام' }, max_rating: 5 },
  { id: qid('menu', 11), type: 'rating', text: { en: 'Presentation', ar: 'العرض' }, max_rating: 5 },
  { id: qid('menu', 12), type: 'rating', text: { en: 'Aroma', ar: 'الرائحة' }, max_rating: 5 },
  { id: qid('menu', 13), type: 'short_text', text: { en: 'What is the #1 improvement you would suggest?', ar: 'ما التحسين الأول الذي تقترحه؟' } },
];

const deliveryQuestions = [
  { id: qid('del', 1), type: 'rating', text: { en: 'Overall satisfaction', ar: 'الرضا العام' }, max_rating: 5 },
  { id: qid('del', 2), type: 'rating', text: { en: 'Delivery speed', ar: 'سرعة التوصيل' }, max_rating: 10 },
  { id: qid('del', 3), type: 'rating', text: { en: 'Accuracy', ar: 'الدقة' }, max_rating: 10 },
  { id: qid('del', 4), type: 'rating', text: { en: 'Packaging', ar: 'التغليف' }, max_rating: 10 },
  { id: qid('del', 5), type: 'rating', text: { en: 'Condition', ar: 'الحالة' }, max_rating: 10 },
  { id: qid('del', 6), type: 'rating', text: { en: 'Professionalism', ar: 'الاحترافية' }, max_rating: 10 },
  { id: qid('del', 7), type: 'rating', text: { en: 'Ease', ar: 'السهولة' }, max_rating: 10 },
  { id: qid('del', 8), type: 'yes_no', text: { en: 'Was your order accurate?', ar: 'هل كان طلبك دقيقاً؟' } },
  { id: qid('del', 9), type: 'multiple_choice', text: { en: 'Delivery timing', ar: 'توقيت التوصيل' }, options: [
      { text: { en: 'Early', ar: 'مبكر' } }, { text: { en: 'On time', ar: 'في الوقت' } },
      { text: { en: 'Slightly late', ar: 'متأخر قليلاً' } }, { text: { en: 'Late', ar: 'متأخر' } }, { text: { en: 'Very late', ar: 'متأخر جداً' } },
  ]},
  { id: qid('del', 10), type: 'multiple_choice', text: { en: 'Who was at fault?', ar: 'من كان المسؤول؟' }, options: [
      { text: { en: 'Store/Restaurant', ar: 'المتجر/المطعم' } }, { text: { en: 'Delivery partner', ar: 'شريك التوصيل' } },
      { text: { en: 'App/Platform', ar: 'التطبيق/المنصة' } }, { text: { en: 'Not applicable', ar: 'لا ينطبق' } },
  ]},
  { id: qid('del', 11), type: 'multiple_choice', text: { en: 'What issue?', ar: 'ما المشكلة؟' }, options: [
      { text: { en: 'Late delivery', ar: 'توصيل متأخر' } }, { text: { en: 'Cold food', ar: 'طعام بارد' } },
      { text: { en: 'Missing items', ar: 'عناصر مفقودة' } }, { text: { en: 'Poor packaging', ar: 'تغليف سيء' } },
      { text: { en: 'Wrong items', ar: 'عناصر خاطئة' } }, { text: { en: 'No issue', ar: 'لا مشكلة' } },
  ]},
];

const appDigitalQuestions = [
  { id: qid('app', 1), type: 'rating', text: { en: 'How easy was it to complete your task?', ar: 'ما مدى سهولة إتمام مهمتك؟' }, max_rating: 7 },
  { id: qid('app', 2), type: 'yes_no', text: { en: 'Did you complete your task?', ar: 'هل أتممت مهمتك؟' } },
  { id: qid('app', 3), type: 'multiple_choice', text: { en: 'Where did you experience friction?', ar: 'أين واجهت صعوبة؟' }, options: [
      { text: { en: 'Checkout/Payment', ar: 'الدفع' } }, { text: { en: 'Search', ar: 'البحث' } },
      { text: { en: 'Login', ar: 'تسجيل الدخول' } }, { text: { en: 'Tracking', ar: 'التتبع' } }, { text: { en: 'No friction', ar: 'لا صعوبة' } },
  ]},
  { id: qid('app', 4), type: 'multiple_choice', text: { en: 'Any issues?', ar: 'أي مشاكل؟' }, options: [
      { text: { en: 'Slow loading', ar: 'تحميل بطيء' } }, { text: { en: 'Confusing interface', ar: 'واجهة مربكة' } },
      { text: { en: 'Bug/Error', ar: 'خطأ' } }, { text: { en: 'Feature not working', ar: 'ميزة لا تعمل' } }, { text: { en: 'None', ar: 'لا شيء' } },
  ]},
  { id: qid('app', 5), type: 'rating', text: { en: 'Feature satisfaction', ar: 'الرضا عن الميزات' }, max_rating: 5 },
  { id: qid('app', 6), type: 'rating', text: { en: 'Journey seamlessness', ar: 'سلاسة الرحلة' }, max_rating: 10 },
  { id: qid('app', 7), type: 'rating', text: { en: 'Trust in platform', ar: 'الثقة بالمنصة' }, max_rating: 10 },
];

const inStoreQuestions = [
  { id: qid('store', 1), type: 'rating', text: { en: 'Overall experience', ar: 'التجربة العامة' }, max_rating: 10 },
  { id: qid('store', 2), type: 'rating', text: { en: 'Overall satisfaction', ar: 'الرضا العام' }, max_rating: 5 },
  { id: qid('store', 3), type: 'rating', text: { en: 'Staff', ar: 'الموظفون' }, max_rating: 10 },
  { id: qid('store', 4), type: 'rating', text: { en: 'Speed/queue', ar: 'السرعة/الطابور' }, max_rating: 10 },
  { id: qid('store', 5), type: 'rating', text: { en: 'Cleanliness', ar: 'النظافة' }, max_rating: 10 },
  { id: qid('store', 6), type: 'rating', text: { en: 'Product availability', ar: 'توفر المنتج' }, max_rating: 10 },
  { id: qid('store', 7), type: 'rating', text: { en: 'Product quality', ar: 'جودة المنتج' }, max_rating: 10 },
  { id: qid('store', 8), type: 'rating', text: { en: 'Pricing', ar: 'الأسعار' }, max_rating: 10 },
  { id: qid('store', 9), type: 'rating', text: { en: 'Atmosphere', ar: 'الأجواء' }, max_rating: 10 },
  { id: qid('store', 10), type: 'rating', text: { en: 'Checkout', ar: 'الدفع' }, max_rating: 10 },
  { id: qid('store', 11), type: 'multiple_choice', text: { en: 'Wait time?', ar: 'وقت الانتظار؟' }, options: [
      { text: { en: '<5 min', ar: 'أقل من 5 دقائق' } }, { text: { en: '5-10 min', ar: '5-10 دقائق' } },
      { text: { en: '10-20 min', ar: '10-20 دقيقة' } }, { text: { en: '20+ min', ar: 'أكثر من 20 دقيقة' } },
  ]},
  { id: qid('store', 12), type: 'multiple_choice', text: { en: 'Any issues?', ar: 'أي مشاكل؟' }, options: [
      { text: { en: 'Long wait', ar: 'انتظار طويل' } }, { text: { en: 'Out of stock', ar: 'نفاد المخزون' } },
      { text: { en: 'Pricing confusion', ar: 'لبس في الأسعار' } }, { text: { en: 'No issues', ar: 'لا مشاكل' } },
  ]},
  { id: qid('store', 13), type: 'rating', text: { en: 'How likely to return?', ar: 'ما مدى احتمال عودتك؟' }, max_rating: 10 },
];

// Generate random answers
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length - 1)]; }

function genNPSAnswers(count: number, branchId: string) {
  // NPS +42 target: ~45% promoters, ~30% passives, ~25% detractors
  const branchBias: Record<string, number> = { 'demo-branch-1': 1.5, 'demo-branch-2': 0, 'demo-branch-3': -1, 'demo-branch-4': 0.8 };
  const bias = branchBias[branchId] || 0;
  const visits: any[] = [];
  const textResponses = [
    'Staff was incredibly helpful', 'Long wait time but good food', 'Average experience, nothing special',
    'Exceeded my expectations!', 'The quality has improved a lot', 'Needs improvement in speed',
    'Very clean and well organized', 'Pricing is a bit high for what you get', 'Best branch experience',
    'Would definitely come back', 'The staff needs better training', 'Great atmosphere and service',
    'Product quality was inconsistent', 'Quick and efficient service', 'Disappointing experience overall',
    'Friendly staff but slow service', 'Everything was perfect', 'Good value for money',
    'The new menu items are excellent', 'Parking was a nightmare',
  ];
  const drivers = ['Staff', 'Product Quality', 'Speed', 'Cleanliness', 'Pricing', 'Other'];
  const driverWeights = [35, 25, 20, 10, 5, 5];

  for (let i = 0; i < count; i++) {
    const r = Math.random() * 100;
    let npsScore: number;
    if (r < 45 + bias * 5) npsScore = randInt(9, 10); // promoter
    else if (r < 75 + bias * 3) npsScore = randInt(7, 8); // passive
    else npsScore = randInt(0, 6); // detractor

    // Weighted driver pick
    const dRand = Math.random() * 100;
    let cumulative = 0;
    let driverPick = 'Staff';
    for (let d = 0; d < drivers.length; d++) {
      cumulative += driverWeights[d];
      if (dRand < cumulative) { driverPick = drivers[d]; break; }
    }

    visits.push({
      id: `mock-nps-visit-${branchId}-${i}`,
      mission_id: 'mock-mission-1',
      branch_id: branchId,
      agent_id: `mock-agent-${randInt(1, 5)}`,
      status: 'approved',
      answers: [
        { question_id: qid('nps', 1), value: npsScore },
        { question_id: qid('nps', 2), value: driverPick },
        { question_id: qid('nps', 3), value: pick(textResponses) },
      ],
      purchase_amount: randInt(50, 200),
      started_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(9, 17)).toISOString(),
      submitted_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(10, 18)).toISOString(),
      created_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      client_rating: null,
      client_feedback: null,
      scheduled_date: null,
      rejection_reason: null,
    });
  }
  return visits;
}

function genCSATAnswers(count: number, branchId: string) {
  const branchCSAT: Record<string, number> = { 'demo-branch-1': 0.88, 'demo-branch-2': 0.80, 'demo-branch-3': 0.75, 'demo-branch-4': 0.85 };
  const targetCSAT = branchCSAT[branchId] || 0.82;
  const visits: any[] = [];

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let mainRating: number;
    if (r < targetCSAT * 0.48) mainRating = 5;
    else if (r < targetCSAT) mainRating = 4;
    else if (r < targetCSAT + 0.12) mainRating = 3;
    else if (r < targetCSAT + 0.16) mainRating = 2;
    else mainRating = 1;

    const attrBase = [4.3, 3.8, 4.5, 4.1, 3.6];
    const attrs = attrBase.map(b => Math.max(1, Math.min(5, Math.round(b + (Math.random() - 0.5) * 2))));

    const drivers = ['Staff', 'Product Quality', 'Cleanliness', 'Speed', 'Pricing'];
    const issues = ['Long wait', 'Wrong order', 'Dirty environment', 'Product quality', 'Other'];
    const hadProblem = Math.random() < 0.25;

    visits.push({
      id: `mock-csat-visit-${branchId}-${i}`, mission_id: 'mock-mission-2',
      branch_id: branchId,
      agent_id: `mock-agent-${randInt(1, 5)}`, status: 'approved',
      answers: [
        { question_id: qid('csat', 1), value: mainRating },
        ...attrs.map((v, j) => ({ question_id: qid('csat', j + 2), value: v })),
        { question_id: qid('csat', 7), value: pick(drivers) },
        { question_id: qid('csat', 8), value: hadProblem },
        { question_id: qid('csat', 9), value: hadProblem ? pick(issues) : 'Other' },
      ],
      purchase_amount: randInt(40, 180),
      started_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(9, 17)).toISOString(),
      submitted_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(10, 18)).toISOString(),
      created_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      client_rating: null, client_feedback: null, scheduled_date: null, rejection_reason: null,
    });
  }
  return visits;
}

function genMenuTryoutAnswers(count: number, branchId: string) {
  const visits: any[] = [];
  const improvements = ['Needs more seasoning', 'Portion could be bigger', 'Sauce was too sweet', 'Great as is', 'Better temperature control needed', 'Add more spice'];

  for (let i = 0; i < count; i++) {
    const pi = randInt(5, 10), ri = randInt(4, 10), like = randInt(3, 5), uniq = randInt(2, 5), val = randInt(5, 10);
    const portions = ['Too small', 'Just right', 'Too big'];
    const portionWeights = [20, 70, 10];
    const pRand = Math.random() * 100;
    const portion = pRand < portionWeights[0] ? portions[0] : pRand < portionWeights[0] + portionWeights[1] ? portions[1] : portions[2];
    const hadProblem = Math.random() < 0.15;
    const issueTypes = ['Cold temperature', 'Presentation', 'Wrong ingredients', 'Other'];

    visits.push({
      id: `mock-menu-visit-${branchId}-${i}`, mission_id: 'mock-mission-3',
      branch_id: branchId,
      agent_id: `mock-agent-${randInt(1, 5)}`, status: 'approved',
      answers: [
        { question_id: qid('menu', 1), value: pi },
        { question_id: qid('menu', 2), value: ri },
        { question_id: qid('menu', 3), value: like },
        { question_id: qid('menu', 4), value: uniq },
        { question_id: qid('menu', 5), value: val },
        { question_id: qid('menu', 6), value: portion },
        { question_id: qid('menu', 7), value: hadProblem },
        { question_id: qid('menu', 8), value: hadProblem ? pick(issueTypes) : 'Other' },
        { question_id: qid('menu', 9), value: randInt(3, 5) },
        { question_id: qid('menu', 10), value: randInt(3, 5) },
        { question_id: qid('menu', 11), value: randInt(3, 5) },
        { question_id: qid('menu', 12), value: randInt(3, 5) },
        { question_id: qid('menu', 13), value: pick(improvements) },
      ],
      purchase_amount: randInt(30, 120),
      started_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(9, 17)).toISOString(),
      submitted_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(10, 18)).toISOString(),
      created_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      client_rating: null, client_feedback: null, scheduled_date: null, rejection_reason: null,
    });
  }
  return visits;
}

function genDeliveryAnswers(count: number, branchId: string) {
  const visits: any[] = [];
  for (let i = 0; i < count; i++) {
    const timing = ['Early', 'On time', 'Slightly late', 'Late', 'Very late'];
    const tw = [10, 62, 18, 7, 3];
    const tRand = Math.random() * 100;
    let cumT = 0, timePick = 'On time';
    for (let j = 0; j < timing.length; j++) { cumT += tw[j]; if (tRand < cumT) { timePick = timing[j]; break; } }

    const faults = ['Store/Restaurant', 'Delivery partner', 'App/Platform', 'Not applicable'];
    const issues = ['Late delivery', 'Cold food', 'Missing items', 'Poor packaging', 'Wrong items', 'No issue'];
    const accurate = Math.random() < 0.88;

    visits.push({
      id: `mock-del-visit-${branchId}-${i}`, mission_id: 'mock-mission-4',
      branch_id: branchId,
      agent_id: `mock-agent-${randInt(1, 5)}`, status: 'approved',
      answers: [
        { question_id: qid('del', 1), value: randInt(3, 5) },
        { question_id: qid('del', 2), value: randInt(5, 10) },
        { question_id: qid('del', 3), value: randInt(6, 10) },
        { question_id: qid('del', 4), value: randInt(6, 10) },
        { question_id: qid('del', 5), value: randInt(6, 10) },
        { question_id: qid('del', 6), value: randInt(5, 10) },
        { question_id: qid('del', 7), value: randInt(6, 10) },
        { question_id: qid('del', 8), value: accurate },
        { question_id: qid('del', 9), value: timePick },
        { question_id: qid('del', 10), value: pick(faults) },
        { question_id: qid('del', 11), value: pick(issues) },
      ],
      purchase_amount: randInt(50, 200),
      started_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(9, 17)).toISOString(),
      submitted_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(10, 18)).toISOString(),
      created_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      client_rating: null, client_feedback: null, scheduled_date: null, rejection_reason: null,
    });
  }
  return visits;
}

function genAppDigitalAnswers(count: number) {
  const visits: any[] = [];
  for (let i = 0; i < count; i++) {
    const completed = Math.random() < 0.85;
    visits.push({
      id: `mock-app-visit-${i}`, mission_id: 'mock-mission-5',
      branch_id: pick(DEMO_BRANCHES).id,
      agent_id: `mock-agent-${randInt(1, 5)}`, status: 'approved',
      answers: [
        { question_id: qid('app', 1), value: randInt(3, 7) },
        { question_id: qid('app', 2), value: completed },
        { question_id: qid('app', 3), value: pick(['Checkout/Payment', 'Search', 'Login', 'Tracking', 'No friction']) },
        { question_id: qid('app', 4), value: pick(['Slow loading', 'Confusing interface', 'Bug/Error', 'Feature not working', 'None']) },
        { question_id: qid('app', 5), value: randInt(3, 5) },
        { question_id: qid('app', 6), value: randInt(5, 10) },
        { question_id: qid('app', 7), value: randInt(6, 10) },
      ],
      purchase_amount: 0,
      started_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(9, 17)).toISOString(),
      submitted_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(10, 18)).toISOString(),
      created_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      client_rating: null, client_feedback: null, scheduled_date: null, rejection_reason: null,
    });
  }
  return visits;
}

function genInStoreAnswers(count: number, branchId: string) {
  const visits: any[] = [];
  for (let i = 0; i < count; i++) {
    visits.push({
      id: `mock-store-visit-${branchId}-${i}`, mission_id: 'mock-mission-6',
      branch_id: branchId,
      agent_id: `mock-agent-${randInt(1, 5)}`, status: 'approved',
      answers: [
        { question_id: qid('store', 1), value: randInt(6, 10) },
        { question_id: qid('store', 2), value: randInt(3, 5) },
        { question_id: qid('store', 3), value: randInt(6, 10) },
        { question_id: qid('store', 4), value: randInt(5, 10) },
        { question_id: qid('store', 5), value: randInt(7, 10) },
        { question_id: qid('store', 6), value: randInt(5, 10) },
        { question_id: qid('store', 7), value: randInt(6, 10) },
        { question_id: qid('store', 8), value: randInt(5, 10) },
        { question_id: qid('store', 9), value: randInt(7, 10) },
        { question_id: qid('store', 10), value: randInt(5, 10) },
        { question_id: qid('store', 11), value: pick(['<5 min', '5-10 min', '10-20 min', '20+ min']) },
        { question_id: qid('store', 12), value: pick(['Long wait', 'Out of stock', 'Pricing confusion', 'No issues']) },
        { question_id: qid('store', 13), value: randInt(6, 10) },
      ],
      purchase_amount: randInt(60, 250),
      started_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(9, 17)).toISOString(),
      submitted_at: new Date(2026, randInt(0, 5), randInt(1, 28), randInt(10, 18)).toISOString(),
      created_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      client_rating: null, client_feedback: null, scheduled_date: null, rejection_reason: null,
    });
  }
  return visits;
}

// Build mock missions
export const MOCK_MISSIONS = [
  {
    id: 'mock-mission-1', name: 'Q1 Customer Experience Survey', name_ar: 'استبيان تجربة العملاء الربع الأول',
    methodology: 'nps', status: 'completed', questions: npsQuestions,
    number_of_visits: 85, visits_completed: 78, purchase_budget_per_visit: 100,
    total_purchase_budget: 8500, budget_used: 7200, branch_id: null,
    created_at: '2026-01-15T00:00:00Z',
    branch: null,
  },
  {
    id: 'mock-mission-2', name: 'Service Quality Assessment', name_ar: 'تقييم جودة الخدمة',
    methodology: 'csat', status: 'completed', questions: csatQuestions,
    number_of_visits: 62, visits_completed: 55, purchase_budget_per_visit: 80,
    total_purchase_budget: 4960, budget_used: 4100, branch_id: 'demo-branch-1',
    created_at: '2026-02-01T00:00:00Z',
    branch: DEMO_BRANCHES[0],
  },
  {
    id: 'mock-mission-3', name: 'New Burger Launch Test', name_ar: 'اختبار إطلاق البرغر الجديد',
    methodology: 'menu_tryout', status: 'completed', questions: menuTryoutQuestions,
    number_of_visits: 45, visits_completed: 42, purchase_budget_per_visit: 120,
    total_purchase_budget: 5400, budget_used: 4800, branch_id: 'demo-branch-4',
    created_at: '2026-02-15T00:00:00Z',
    branch: DEMO_BRANCHES[3],
  },
  {
    id: 'mock-mission-4', name: 'Delivery Experience Audit', name_ar: 'تدقيق تجربة التوصيل',
    methodology: 'delivery_cx', status: 'published', questions: deliveryQuestions,
    number_of_visits: 50, visits_completed: 38, purchase_budget_per_visit: 150,
    total_purchase_budget: 7500, budget_used: 5400, branch_id: null,
    created_at: '2026-03-01T00:00:00Z',
    branch: null,
  },
  {
    id: 'mock-mission-5', name: 'App Usability Study', name_ar: 'دراسة سهولة استخدام التطبيق',
    methodology: 'app_digital_cx', status: 'completed', questions: appDigitalQuestions,
    number_of_visits: 38, visits_completed: 35, purchase_budget_per_visit: 0,
    total_purchase_budget: 0, budget_used: 0, branch_id: null,
    created_at: '2026-01-20T00:00:00Z',
    branch: null,
  },
  {
    id: 'mock-mission-6', name: 'Store Standards Check', name_ar: 'فحص معايير المتجر',
    methodology: 'in_store_cx', status: 'completed', questions: inStoreQuestions,
    number_of_visits: 70, visits_completed: 65, purchase_budget_per_visit: 90,
    total_purchase_budget: 6300, budget_used: 5600, branch_id: null,
    created_at: '2026-02-20T00:00:00Z',
    branch: null,
  },
];

// Generate all mock visits
let _cachedVisits: any[] | null = null;
export function getMockVisits() {
  if (_cachedVisits) return _cachedVisits;
  const visits: any[] = [];
  // NPS visits across all branches
  DEMO_BRANCHES.forEach(b => visits.push(...genNPSAnswers(20, b.id)));
  // CSAT visits across all branches
  DEMO_BRANCHES.forEach(b => visits.push(...genCSATAnswers(15, b.id)));
  // Menu tryout across branches 1, 3, 4
  visits.push(...genMenuTryoutAnswers(15, 'demo-branch-1'));
  visits.push(...genMenuTryoutAnswers(12, 'demo-branch-3'));
  visits.push(...genMenuTryoutAnswers(15, 'demo-branch-4'));
  // Delivery across all
  DEMO_BRANCHES.forEach(b => visits.push(...genDeliveryAnswers(12, b.id)));
  // App digital
  visits.push(...genAppDigitalAnswers(35));
  // In-store across all
  DEMO_BRANCHES.forEach(b => visits.push(...genInStoreAnswers(16, b.id)));

  // Add some rejected visits for realism
  for (let i = 0; i < 8; i++) {
    const branchId = pick(DEMO_BRANCHES).id;
    visits.push({
      id: `mock-rejected-${i}`, mission_id: pick(MOCK_MISSIONS).id,
      branch_id: branchId,
      agent_id: `mock-agent-${randInt(1, 5)}`, status: 'rejected',
      answers: [], purchase_amount: 0,
      started_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      submitted_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      created_at: new Date(2026, randInt(0, 5), randInt(1, 28)).toISOString(),
      client_rating: null, client_feedback: null, scheduled_date: null,
      rejection_reason: 'Photos not clear enough',
    });
  }

  _cachedVisits = visits;
  return visits;
}

export const MOCK_BRANCHES = DEMO_BRANCHES;

// Apply date/branch filters to mock data
export function filterMockData(
  visits: any[],
  missions: any[],
  dateFrom?: Date | null,
  dateTo?: Date | null,
  selectedBranchIds?: string[] | null,
) {
  let filteredVisits = [...visits];
  let filteredMissions = [...missions];

  if (dateFrom) {
    filteredVisits = filteredVisits.filter(v => new Date(v.created_at) >= dateFrom);
  }
  if (dateTo) {
    const endOfDay = new Date(dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    filteredVisits = filteredVisits.filter(v => new Date(v.created_at) <= endOfDay);
  }

  if (selectedBranchIds && selectedBranchIds.length > 0) {
    // Filter visits to only those from missions linked to selected branches
    const branchMissionIds = new Set(
      filteredMissions
        .filter(m => m.branch_id && selectedBranchIds.includes(m.branch_id))
        .map(m => m.id)
    );
    // For missions with null branch_id (all branches), keep visits that match any branch
    const allBranchMissionIds = new Set(filteredMissions.filter(m => !m.branch_id).map(m => m.id));
    filteredVisits = filteredVisits.filter(v =>
      branchMissionIds.has(v.mission_id) || allBranchMissionIds.has(v.mission_id)
    );
  }

  return { visits: filteredVisits, missions: filteredMissions };
}
