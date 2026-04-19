// ============================================================================
// T-Lab Boba — Shared demo dataset
// Single source of truth for the T-Lab Boba seed: 2 branches, 2 missions,
// 4 approved visits + the shared 25-question set. Used both by:
//   - mockReportsData.ts (so Reports page renders without real DB writes)
//   - seedTLabDemo.ts    (so the same data can be inserted into the live DB)
// ============================================================================

export const TLAB_QUESTIONS = [
  // 1. Cleanliness
  { id: 'q-cleanliness', type: 'rating', text: { en: 'How would you rate the cleanliness of the branch?', ar: 'كيف تقيم نظافة الفرع؟' }, max_rating: 4 },
  // 2. Ambiance
  { id: 'q-ambiance', type: 'rating', text: { en: 'How would you rate the overall ambiance?', ar: 'كيف تقيم الأجواء العامة؟' }, max_rating: 4 },
  // 3. Background music / song
  { id: 'q-song', type: 'short_text', text: { en: 'Which song was playing? (or note "No Music")', ar: 'ما الأغنية التي كانت تُعزف؟ (أو اكتب "لا توجد موسيقى")' } },
  // 4. Seating comfort
  { id: 'q-comfort', type: 'multiple_choice', text: { en: 'How was the seating comfort?', ar: 'كيف كانت راحة الجلوس؟' }, options: [
      { text: { en: 'Very Comfortable', ar: 'مريح جداً' } },
      { text: { en: 'Acceptable', ar: 'مقبول' } },
      { text: { en: 'Uncomfortable', ar: 'غير مريح' } },
  ]},
  // 5. Menu ease of reading
  { id: 'q-menu-ease', type: 'rating', text: { en: 'How easy was the menu to read?', ar: 'ما مدى سهولة قراءة القائمة؟' }, max_rating: 4 },
  // 6. Prices displayed
  { id: 'q-prices-displayed', type: 'yes_no', text: { en: 'Were the prices clearly displayed?', ar: 'هل كانت الأسعار معروضة بوضوح؟' } },
  // 7. Unavailable items
  { id: 'q-unavailable', type: 'short_text', text: { en: 'Were any items unavailable? List them.', ar: 'هل كانت هناك عناصر غير متوفرة؟ اذكرها.' } },
  // 8. Promotion communicated
  { id: 'q-promotion', type: 'yes_no', text: { en: 'Was any promotion communicated?', ar: 'هل تم الإبلاغ عن أي عرض ترويجي؟' } },
  // 9. Greeting on arrival
  { id: 'q-greeting', type: 'multiple_choice', text: { en: 'How were you greeted on arrival?', ar: 'كيف تم استقبالك عند الوصول؟' }, options: [
      { text: { en: 'Immediate', ar: 'فوري' } },
      { text: { en: 'Delayed', ar: 'متأخر' } },
      { text: { en: 'No greeting', ar: 'لا يوجد ترحيب' } },
  ]},
  // 10. Staff assistance
  { id: 'q-staff-assist', type: 'yes_no', text: { en: 'Did staff assist you with your order?', ar: 'هل ساعدك الموظفون في طلبك؟' } },
  // 11. Gloves used
  { id: 'q-gloves', type: 'yes_no', text: { en: 'Did staff use gloves while preparing the order?', ar: 'هل استخدم الموظفون قفازات أثناء تحضير الطلب؟' } },
  // 12. Upsell attempt
  { id: 'q-upsell', type: 'yes_no', text: { en: 'Did staff attempt an upsell?', ar: 'هل حاول الموظفون اقتراح إضافات؟' } },
  // 13. Preparation time
  { id: 'q-prep-time', type: 'multiple_choice', text: { en: 'How long did preparation take?', ar: 'كم استغرق وقت التحضير؟' }, options: [
      { text: { en: '<3 min', ar: 'أقل من 3 دقائق' } },
      { text: { en: '3–5 min', ar: '3 إلى 5 دقائق' } },
      { text: { en: '5–10 min', ar: '5 إلى 10 دقائق' } },
      { text: { en: '>10 min', ar: 'أكثر من 10 دقائق' } },
  ]},
  // 14. Order accuracy
  { id: 'q-accuracy', type: 'multiple_choice', text: { en: 'Was the order accurate?', ar: 'هل كان الطلب دقيقاً؟' }, options: [
      { text: { en: 'Correct', ar: 'صحيح' } },
      { text: { en: 'Partially correct', ar: 'صحيح جزئياً' } },
      { text: { en: 'Incorrect', ar: 'غير صحيح' } },
  ]},
  // 15. Drink ordered
  { id: 'q-drink', type: 'short_text', text: { en: 'Which drink did you order?', ar: 'ما المشروب الذي طلبته؟' } },
  // 16. Taste
  { id: 'q-taste', type: 'rating', text: { en: 'How would you rate the taste?', ar: 'كيف تقيم الطعم؟' }, max_rating: 4 },
  // 17. Satisfaction
  { id: 'q-satisfaction', type: 'rating', text: { en: 'Overall satisfaction', ar: 'الرضا العام' }, max_rating: 4 },
  // 18. Return intent
  { id: 'q-return', type: 'yes_no', text: { en: 'Would you return to this branch?', ar: 'هل ستعود إلى هذا الفرع؟' } },
  // 19. Recommend
  { id: 'q-recommend', type: 'yes_no', text: { en: 'Would you recommend this branch?', ar: 'هل تنصح بهذا الفرع؟' } },
  // 20. What stood out most
  { id: 'q-stood-out', type: 'short_text', text: { en: 'What stood out most during your visit?', ar: 'ما الأكثر تميزاً خلال زيارتك؟' } },
  // 21. Improvement suggestion
  { id: 'q-improvement', type: 'short_text', text: { en: 'What needs improvement?', ar: 'ما الذي يحتاج إلى تحسين؟' } },
  // 22-25: keep array length aligned with the spec's "shared 25-question set"
  { id: 'q-temperature', type: 'multiple_choice', text: { en: 'Drink temperature', ar: 'درجة حرارة المشروب' }, options: [
      { text: { en: 'Too cold', ar: 'بارد جداً' } },
      { text: { en: 'Just right', ar: 'مناسب' } },
      { text: { en: 'Too warm', ar: 'دافئ جداً' } },
  ]},
  { id: 'q-portion', type: 'multiple_choice', text: { en: 'Portion size', ar: 'حجم الحصة' }, options: [
      { text: { en: 'Small', ar: 'صغير' } },
      { text: { en: 'Just right', ar: 'مناسب' } },
      { text: { en: 'Large', ar: 'كبير' } },
  ]},
  { id: 'q-value', type: 'rating', text: { en: 'Value for money', ar: 'القيمة مقابل السعر' }, max_rating: 4 },
  { id: 'q-receipt', type: 'yes_no', text: { en: 'Did you receive a receipt?', ar: 'هل استلمت الفاتورة؟' } },
];

export const TLAB_PHOTO_REQUIREMENTS = {
  required_count: 4,
  instructions: 'Menu board, product, receipt, extra journey photos',
};

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------
export const TLAB_BRANCHES = [
  {
    id: 'tlab-branch-yard',
    name: 'T-Lab Boba — The Yard',
    name_ar: 'تي لاب بوبا — ذا يارد',
    address: 'The Yard, New Cairo, Cairo',
    address_ar: 'ذا يارد، القاهرة الجديدة، القاهرة',
    city: 'Cairo',
    district: 'New Cairo',
    google_maps_link: 'https://maps.google.com/?q=The+Yard+New+Cairo',
    latitude: 30.0254,
    longitude: 31.4913,
    status: 'verified' as const,
  },
  {
    id: 'tlab-branch-arabella',
    name: 'T-Lab Boba — Arabella',
    name_ar: 'تي لاب بوبا — أرابيلا',
    address: 'Arabella Plaza, New Cairo, Cairo',
    address_ar: 'أرابيلا بلازا، القاهرة الجديدة، القاهرة',
    city: 'Cairo',
    district: 'New Cairo',
    google_maps_link: 'https://maps.google.com/?q=Arabella+Plaza+New+Cairo',
    latitude: 30.0344,
    longitude: 31.4625,
    status: 'verified' as const,
  },
];

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const TLAB_MISSIONS = [
  {
    id: 'tlab-mission-yard',
    name: 'T-Lab Boba — The Yard — In-Store Visit',
    name_ar: 'تي لاب بوبا — ذا يارد — زيارة فرع',
    branch_id: 'tlab-branch-yard',
    methodology: 'custom',
    status: 'completed' as const,
    questions: TLAB_QUESTIONS,
    photo_requirements: TLAB_PHOTO_REQUIREMENTS,
    number_of_visits: 2,
    purchase_budget_per_visit: 250,
    total_purchase_budget: 500,
    visits_completed: 2,
    visits_pending: 0,
    budget_used: 500,
    published_at: daysAgo(21),
    created_at: daysAgo(21),
  },
  {
    id: 'tlab-mission-arabella',
    name: 'T-Lab Boba — Arabella — In-Store Visit',
    name_ar: 'تي لاب بوبا — أرابيلا — زيارة فرع',
    branch_id: 'tlab-branch-arabella',
    methodology: 'custom',
    status: 'completed' as const,
    questions: TLAB_QUESTIONS,
    photo_requirements: TLAB_PHOTO_REQUIREMENTS,
    number_of_visits: 2,
    purchase_budget_per_visit: 250,
    total_purchase_budget: 500,
    visits_completed: 2,
    visits_pending: 0,
    budget_used: 500,
    published_at: daysAgo(14),
    created_at: daysAgo(14),
  },
];

// ---------------------------------------------------------------------------
// Visits — answers map directly to the 4 source reports
// ---------------------------------------------------------------------------
type AnswerMap = Record<string, string | number | boolean>;

function answersFromMap(map: AnswerMap) {
  return Object.entries(map).map(([question_id, value]) => ({ question_id, value }));
}

const yardVisit1Answers: AnswerMap = {
  'q-cleanliness': 3,
  'q-ambiance': 3,
  'q-song': 'No Music',
  'q-comfort': 'Acceptable',
  'q-menu-ease': 3,
  'q-prices-displayed': true,
  'q-unavailable': 'No',
  'q-promotion': true,
  'q-greeting': 'Immediate',
  'q-staff-assist': true,
  'q-gloves': true,
  'q-upsell': false,
  'q-prep-time': '3–5 min',
  'q-accuracy': 'Correct',
  'q-drink': 'Blueberry Boba with Blueberry Popping Boba',
  'q-taste': 3,
  'q-satisfaction': 3,
  'q-return': true,
  'q-recommend': true,
  'q-stood-out': 'The Drink',
  'q-improvement': 'More Flavors',
  'q-temperature': 'Just right',
  'q-portion': 'Just right',
  'q-value': 3,
  'q-receipt': true,
};

const yardVisit2Answers: AnswerMap = {
  'q-cleanliness': 2,
  'q-ambiance': 2,
  'q-song': 'No songs were played, it was mute and it felt off',
  'q-comfort': 'Acceptable',
  'q-menu-ease': 3,
  'q-prices-displayed': true,
  'q-unavailable': 'No',
  'q-promotion': true,
  'q-greeting': 'No greeting',
  'q-staff-assist': true,
  'q-gloves': true,
  'q-upsell': false,
  'q-prep-time': '3–5 min',
  'q-accuracy': 'Correct',
  'q-drink': 'Milk Taro',
  'q-taste': 4,
  'q-satisfaction': 3,
  'q-return': true,
  'q-recommend': true,
  'q-stood-out': 'Taro Flavor',
  'q-improvement':
    'The place itself, the mood was off, and it needs more attention to cleanliness, but I can always take out or order it online if I were in rehab, as the flavor is good.',
  'q-temperature': 'Just right',
  'q-portion': 'Just right',
  'q-value': 3,
  'q-receipt': true,
};

const arabella1Answers: AnswerMap = {
  'q-cleanliness': 1,
  'q-ambiance': 1,
  'q-song': 'No Music',
  'q-comfort': 'Acceptable',
  'q-menu-ease': 3,
  'q-prices-displayed': true,
  'q-unavailable': 'No',
  'q-promotion': false,
  'q-greeting': 'Delayed',
  'q-staff-assist': false,
  'q-gloves': true,
  'q-upsell': false,
  'q-prep-time': '3–5 min',
  'q-accuracy': 'Correct',
  'q-drink': 'Blueberry Boba with Blueberry Popping Boba',
  'q-taste': 3,
  'q-satisfaction': 1,
  'q-return': false,
  'q-recommend': false,
  'q-stood-out':
    'Asked the employee for two separate receipts because we made two different orders and paid separately and he said he couldn\'t give me two different receipts although my friend already had her individual receipt for her order. So he gave me one receipt with the 2 orders although he had already given her one receipt with her order. He wasn\'t friendly at all.',
  'q-improvement': "The place didn't look very clean.",
  'q-temperature': 'Just right',
  'q-portion': 'Just right',
  'q-value': 2,
  'q-receipt': true,
};

const arabella2Answers: AnswerMap = {
  'q-cleanliness': 1,
  'q-ambiance': 2,
  'q-song': 'None',
  'q-comfort': 'Acceptable',
  'q-menu-ease': 3,
  'q-prices-displayed': true,
  'q-unavailable': 'No',
  'q-promotion': false,
  'q-greeting': 'Delayed',
  'q-staff-assist': false,
  'q-gloves': true,
  'q-upsell': false,
  'q-prep-time': '5–10 min',
  'q-accuracy': 'Correct',
  'q-drink': 'Blueberry Boba with Blueberry Popping Boba',
  'q-taste': 3,
  'q-satisfaction': 2,
  'q-return': false,
  'q-recommend': false,
  'q-stood-out':
    'As soon as I started making my order, the employee told me that there is a buy 1 get 1 free offer today, so I asked him about it and he said it\'s for every Sunday. I told him it wasn\'t Sunday and he asked what day of the week it was. It was Thursday.',
  'q-improvement': 'Employees',
  'q-temperature': 'Just right',
  'q-portion': 'Just right',
  'q-value': 2,
  'q-receipt': true,
};

export const TLAB_VISITS = [
  {
    id: 'tlab-visit-yard-1',
    mission_id: 'tlab-mission-yard',
    branch_id: 'tlab-branch-yard',
    agent_id: 'tlab-agent-1',
    status: 'approved' as const,
    purchase_amount: 405,
    scheduled_date: '2026-04-16',
    started_at: '2026-04-16T16:30:00Z',
    submitted_at: '2026-04-16T16:52:00Z',
    created_at: '2026-04-16T16:00:00Z',
    client_rating: 4,
    client_feedback: 'The drink stood out. More flavors would be nice.',
    rejection_reason: null,
    answers: answersFromMap(yardVisit1Answers),
  },
  {
    id: 'tlab-visit-yard-2',
    mission_id: 'tlab-mission-yard',
    branch_id: 'tlab-branch-yard',
    agent_id: 'tlab-agent-2',
    status: 'approved' as const,
    purchase_amount: 405,
    scheduled_date: '2026-04-16',
    started_at: '2026-04-16T16:20:00Z',
    submitted_at: '2026-04-16T16:45:00Z',
    created_at: '2026-04-16T16:00:00Z',
    client_rating: 3,
    client_feedback: 'Taro flavor was excellent, but the ambiance and cleanliness felt off.',
    rejection_reason: null,
    answers: answersFromMap(yardVisit2Answers),
  },
  {
    id: 'tlab-visit-arabella-1',
    mission_id: 'tlab-mission-arabella',
    branch_id: 'tlab-branch-arabella',
    agent_id: 'tlab-agent-1',
    status: 'approved' as const,
    purchase_amount: 420,
    scheduled_date: '2026-04-16',
    started_at: '2026-04-16T18:25:00Z',
    submitted_at: '2026-04-16T18:50:00Z',
    created_at: '2026-04-16T18:00:00Z',
    client_rating: 1,
    client_feedback: "Unfriendly staff, receipt issues, and the place didn't look clean.",
    rejection_reason: null,
    answers: answersFromMap(arabella1Answers),
  },
  {
    id: 'tlab-visit-arabella-2',
    mission_id: 'tlab-mission-arabella',
    branch_id: 'tlab-branch-arabella',
    agent_id: 'tlab-agent-2',
    status: 'approved' as const,
    purchase_amount: 210,
    scheduled_date: '2026-04-16',
    started_at: '2026-04-16T18:30:00Z',
    submitted_at: '2026-04-16T18:55:00Z',
    created_at: '2026-04-16T18:00:00Z',
    client_rating: 2,
    client_feedback: 'Drink was good but the staff were confused about their own promotions.',
    rejection_reason: null,
    answers: answersFromMap(arabella2Answers),
  },
];
