// ============================================================================
// Tamara — Lebanese Bistro pilot demo dataset
// 2 branches (Almaza City Center, Water Way) · 2 missions · 8 approved visits
// Question set + answers come from the 8 mystery shopper reports.
// ============================================================================

export const TAMARA_QUESTIONS = [
  { id: 'q-greeting', type: 'yes_no', text: { en: 'Greeting upon arrival', ar: 'الترحيب عند الوصول' } },
  { id: 'q-seating-eff', type: 'multiple_choice', text: { en: 'Seating efficiency', ar: 'كفاءة الإجلاس' }, options: [
    { text: { en: 'Immediate', ar: 'فوري' } },
    { text: { en: 'Short Wait', ar: 'انتظار قصير' } },
    { text: { en: 'Long Wait', ar: 'انتظار طويل' } },
  ]},
  { id: 'q-table-clean', type: 'rating', text: { en: 'Table cleanliness', ar: 'نظافة الطاولة' }, max_rating: 5 },
  { id: 'q-ambiance', type: 'rating', text: { en: 'Ambiance (lighting, music, mood)', ar: 'الأجواء (الإضاءة، الموسيقى، الجو)' }, max_rating: 5 },
  { id: 'q-menu-clarity', type: 'rating', text: { en: 'Menu clarity & variety', ar: 'وضوح القائمة وتنوعها' }, max_rating: 5 },
  { id: 'q-staff-assist', type: 'yes_no', text: { en: 'Staff assistance & recommendations', ar: 'مساعدة الموظفين والتوصيات' } },
  { id: 'q-friendliness', type: 'rating', text: { en: 'Friendliness', ar: 'اللطف' }, max_rating: 5 },
  { id: 'q-waiter-name', type: 'short_text', text: { en: 'Table waiter name', ar: 'اسم نادل الطاولة' } },
  { id: 'q-shisha-uniform', type: 'multiple_choice', text: { en: 'Shisha staff wearing Tamara uniform?', ar: 'هل يرتدي موظفو الشيشة زي تمارا؟' }, options: [
    { text: { en: 'Yes', ar: 'نعم' } },
    { text: { en: 'No', ar: 'لا' } },
    { text: { en: 'Not Available', ar: 'غير متوفر' } },
  ]},
  { id: 'q-delivery-timing', type: 'multiple_choice', text: { en: 'Delivery timing', ar: 'وقت التقديم' }, options: [
    { text: { en: 'Fast', ar: 'سريع' } },
    { text: { en: 'Acceptable', ar: 'مقبول' } },
    { text: { en: 'Slow', ar: 'بطيء' } },
  ]},
  { id: 'q-presentation', type: 'rating', text: { en: 'Food presentation', ar: 'تقديم الطعام' }, max_rating: 5 },
  { id: 'q-taste', type: 'rating', text: { en: 'Taste & authenticity', ar: 'الطعم والأصالة' }, max_rating: 5 },
  { id: 'q-temperature', type: 'multiple_choice', text: { en: 'Food temperature', ar: 'درجة حرارة الطعام' }, options: [
    { text: { en: 'Cold', ar: 'بارد' } },
    { text: { en: 'Warm', ar: 'دافئ' } },
    { text: { en: 'Perfect', ar: 'مثالي' } },
  ]},
  { id: 'q-accuracy', type: 'multiple_choice', text: { en: 'Order accuracy', ar: 'دقة الطلب' }, options: [
    { text: { en: 'Correct', ar: 'صحيح' } },
    { text: { en: 'Partially Correct', ar: 'صحيح جزئياً' } },
    { text: { en: 'Incorrect', ar: 'غير صحيح' } },
  ]},
  { id: 'q-checkins', type: 'yes_no', text: { en: 'Staff check-ins during meal', ar: 'متابعة الموظفين أثناء الوجبة' } },
  { id: 'q-cleanliness', type: 'rating', text: { en: 'Overall restaurant cleanliness', ar: 'نظافة المطعم العامة' }, max_rating: 5 },
  { id: 'q-restroom', type: 'rating', text: { en: 'Restroom condition', ar: 'حالة دورة المياه' }, max_rating: 5 },
  { id: 'q-payment-speed', type: 'rating', text: { en: 'Payment speed & process', ar: 'سرعة وعملية الدفع' }, max_rating: 5 },
  { id: 'q-bill-accuracy', type: 'multiple_choice', text: { en: 'Bill accuracy', ar: 'دقة الفاتورة' }, options: [
    { text: { en: 'Correct', ar: 'صحيح' } },
    { text: { en: 'Incorrect', ar: 'غير صحيح' } },
  ]},
  { id: 'q-satisfaction', type: 'rating', text: { en: 'Overall satisfaction', ar: 'الرضا العام' }, max_rating: 5 },
  { id: 'q-value', type: 'rating', text: { en: 'Value for money', ar: 'القيمة مقابل السعر' }, max_rating: 5 },
  { id: 'q-recommend', type: 'rating', text: { en: 'Likelihood to recommend', ar: 'احتمالية التوصية' }, max_rating: 10 },
  { id: 'q-stood-out', type: 'short_text', text: { en: 'What stood out most? And what should be improved?', ar: 'ما الذي تميز أكثر؟ وما الذي يجب تحسينه؟' } },
  { id: 'q-issues', type: 'short_text', text: { en: 'Did you face any issues during your visit?', ar: 'هل واجهت أي مشاكل خلال زيارتك؟' } },
];

export const TAMARA_PHOTO_REQUIREMENTS = {
  required_count: 2,
  instructions: 'Photo of order on the table + photo of receipt',
};

export const TAMARA_BRANCHES = [
  {
    id: 'tamara-branch-almaza',
    name: 'Tamara — Almaza City Center',
    name_ar: 'تمارا — ألماظة سيتي سنتر',
    address: 'Almaza City Center, Heliopolis, Cairo',
    address_ar: 'ألماظة سيتي سنتر، مصر الجديدة، القاهرة',
    city: 'Cairo',
    district: 'Heliopolis',
    google_maps_link: 'https://maps.google.com/?q=Almaza+City+Center+Cairo',
    latitude: 30.0911,
    longitude: 31.3669,
    status: 'verified' as const,
  },
  {
    id: 'tamara-branch-waterway',
    name: 'Tamara — Water Way',
    name_ar: 'تمارا — ووتر واي',
    address: 'Water Way, New Cairo, Cairo',
    address_ar: 'ووتر واي، القاهرة الجديدة، القاهرة',
    city: 'Cairo',
    district: 'New Cairo',
    google_maps_link: 'https://maps.google.com/?q=Water+Way+New+Cairo',
    latitude: 30.0177,
    longitude: 31.4906,
    status: 'verified' as const,
  },
];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const TAMARA_MISSIONS = [
  {
    id: 'tamara-mission-almaza',
    name: 'Tamara — Almaza City Center — Pilot Visit',
    name_ar: 'تمارا — ألماظة سيتي سنتر — زيارة تجريبية',
    branch_id: 'tamara-branch-almaza',
    methodology: 'custom',
    status: 'completed' as const,
    questions: TAMARA_QUESTIONS,
    photo_requirements: TAMARA_PHOTO_REQUIREMENTS,
    number_of_visits: 4,
    purchase_budget_per_visit: 600,
    total_purchase_budget: 2400,
    visits_completed: 4,
    visits_pending: 0,
    budget_used: 2400,
    published_at: daysAgo(10),
  },
  {
    id: 'tamara-mission-waterway',
    name: 'Tamara — Water Way — Pilot Visit',
    name_ar: 'تمارا — ووتر واي — زيارة تجريبية',
    branch_id: 'tamara-branch-waterway',
    methodology: 'custom',
    status: 'completed' as const,
    questions: TAMARA_QUESTIONS,
    photo_requirements: TAMARA_PHOTO_REQUIREMENTS,
    number_of_visits: 4,
    purchase_budget_per_visit: 600,
    total_purchase_budget: 2400,
    visits_completed: 4,
    visits_pending: 0,
    budget_used: 2400,
    published_at: daysAgo(8),
  },
];

type AnswerMap = Record<string, string | number | boolean>;
const A = (m: AnswerMap) => Object.entries(m).map(([question_id, value]) => ({ question_id, value }));

const almaza1: AnswerMap = {
  'q-greeting': true, 'q-seating-eff': 'Immediate', 'q-table-clean': 2, 'q-ambiance': 3,
  'q-menu-clarity': 5, 'q-staff-assist': true, 'q-friendliness': 5, 'q-waiter-name': 'Mohamed',
  'q-shisha-uniform': 'Not Available', 'q-delivery-timing': 'Acceptable', 'q-presentation': 5,
  'q-taste': 5, 'q-temperature': 'Perfect', 'q-accuracy': 'Correct', 'q-checkins': true,
  'q-cleanliness': 3, 'q-restroom': 4, 'q-payment-speed': 3, 'q-bill-accuracy': 'Correct',
  'q-satisfaction': 5, 'q-value': 4, 'q-recommend': 8,
  'q-stood-out': 'Friendliness, And taste, but the tables were super dusty, and the music in the mall was loud',
  'q-issues': 'Nothing',
};

const almaza2: AnswerMap = {
  'q-greeting': true, 'q-seating-eff': 'Immediate', 'q-table-clean': 2, 'q-ambiance': 3,
  'q-menu-clarity': 5, 'q-staff-assist': true, 'q-friendliness': 5, 'q-waiter-name': 'Mohamed',
  'q-shisha-uniform': 'Not Available', 'q-delivery-timing': 'Acceptable', 'q-presentation': 5,
  'q-taste': 5, 'q-temperature': 'Perfect', 'q-accuracy': 'Correct', 'q-checkins': true,
  'q-cleanliness': 3, 'q-restroom': 4, 'q-payment-speed': 2, 'q-bill-accuracy': 'Correct',
  'q-satisfaction': 5, 'q-value': 5, 'q-recommend': 10,
  'q-stood-out': 'Loved the taste, nothing was striking that needed improvement only the tables were dusty',
  'q-issues': 'Not available',
};

const almaza3: AnswerMap = {
  'q-greeting': true, 'q-seating-eff': 'Immediate', 'q-table-clean': 3, 'q-ambiance': 2,
  'q-menu-clarity': 5, 'q-staff-assist': true, 'q-friendliness': 5, 'q-waiter-name': 'عبد الحميد',
  'q-shisha-uniform': 'Yes', 'q-delivery-timing': 'Acceptable', 'q-presentation': 5,
  'q-taste': 4, 'q-temperature': 'Perfect', 'q-accuracy': 'Correct', 'q-checkins': true,
  'q-cleanliness': 4, 'q-restroom': 4, 'q-payment-speed': 4, 'q-bill-accuracy': 'Correct',
  'q-satisfaction': 5, 'q-value': 5, 'q-recommend': 10,
  'q-stood-out': 'تجربة حلوة المكان جميل بس المزيكا عالي شوية. الأكل حلو جدا بس البطاطا الحارة جات مش مقرمشة وأول ما قلنا غيروها على طول، ولكن كانت قعدة حلوة',
  'q-issues': 'لا يوجد',
};

const almaza4: AnswerMap = {
  'q-greeting': true, 'q-seating-eff': 'Immediate', 'q-table-clean': 3, 'q-ambiance': 3,
  'q-menu-clarity': 4, 'q-staff-assist': true, 'q-friendliness': 5, 'q-waiter-name': 'Abdelhamid',
  'q-shisha-uniform': 'Not Available', 'q-delivery-timing': 'Fast', 'q-presentation': 4,
  'q-taste': 3, 'q-temperature': 'Perfect', 'q-accuracy': 'Correct', 'q-checkins': true,
  'q-cleanliness': 3, 'q-restroom': 4, 'q-payment-speed': 3, 'q-bill-accuracy': 'Correct',
  'q-satisfaction': 4, 'q-value': 5, 'q-recommend': 8,
  'q-stood-out': "The Hummos was amazing, the only thing that didn't really suit my taste was the oregano on the Fattoush, I don't think it was necessary in the salad, and when I asked, I was told that it's a garnish only.",
  'q-issues': 'Nothing',
};

const water1: AnswerMap = {
  'q-greeting': true, 'q-seating-eff': 'Immediate', 'q-table-clean': 4, 'q-ambiance': 4,
  'q-menu-clarity': 3, 'q-staff-assist': true, 'q-friendliness': 3, 'q-waiter-name': 'Ahmed',
  'q-shisha-uniform': 'Yes', 'q-delivery-timing': 'Slow', 'q-presentation': 3,
  'q-taste': 3, 'q-temperature': 'Perfect', 'q-accuracy': 'Correct', 'q-checkins': false,
  'q-cleanliness': 3, 'q-restroom': 2, 'q-payment-speed': 4, 'q-bill-accuracy': 'Correct',
  'q-satisfaction': 3, 'q-value': 4, 'q-recommend': 6,
  'q-stood-out': 'Slow service.',
  'q-issues': 'It took very long for the staff to take the order. Over 20 minutes. And they never communicated that the menu was QR code until I asked for the menu.',
};

const water2: AnswerMap = {
  'q-greeting': true, 'q-seating-eff': 'Immediate', 'q-table-clean': 3, 'q-ambiance': 2,
  'q-menu-clarity': 4, 'q-staff-assist': false, 'q-friendliness': 2, 'q-waiter-name': 'Ahmed',
  'q-shisha-uniform': 'Yes', 'q-delivery-timing': 'Slow', 'q-presentation': 3,
  'q-taste': 3, 'q-temperature': 'Perfect', 'q-accuracy': 'Correct', 'q-checkins': false,
  'q-cleanliness': 3, 'q-restroom': 3, 'q-payment-speed': 4, 'q-bill-accuracy': 'Correct',
  'q-satisfaction': 3, 'q-value': 3, 'q-recommend': 8,
  'q-stood-out': "Staff doesn't pass by the tables, doesn't check in.",
  'q-issues': 'No Issues',
};

const water3: AnswerMap = {
  'q-greeting': false, 'q-seating-eff': 'Immediate', 'q-table-clean': 5, 'q-ambiance': 5,
  'q-menu-clarity': 4, 'q-staff-assist': true, 'q-friendliness': 4, 'q-waiter-name': 'Ahmed (curly hair)',
  'q-shisha-uniform': 'Yes', 'q-delivery-timing': 'Slow', 'q-presentation': 5,
  'q-taste': 4, 'q-temperature': 'Cold', 'q-accuracy': 'Correct', 'q-checkins': true,
  'q-cleanliness': 5, 'q-restroom': 4, 'q-payment-speed': 5, 'q-bill-accuracy': 'Correct',
  'q-satisfaction': 3, 'q-value': 3, 'q-recommend': 6,
  'q-stood-out': "What needs improvement is the speed of food serving and it's temperature",
  'q-issues': 'Moderate: the food came relatively late and more importantly it was cold. I found out from the manager that was due to a broken suction hood in the kitchen (they couldn\'t grill all orders at once due to the smoke).',
};

const water4: AnswerMap = {
  'q-greeting': true, 'q-seating-eff': 'Immediate', 'q-table-clean': 3, 'q-ambiance': 3,
  'q-menu-clarity': 4, 'q-staff-assist': true, 'q-friendliness': 5, 'q-waiter-name': 'Ahmed',
  'q-shisha-uniform': 'Yes', 'q-delivery-timing': 'Slow', 'q-presentation': 4,
  'q-taste': 4, 'q-temperature': 'Cold', 'q-accuracy': 'Correct', 'q-checkins': true,
  'q-cleanliness': 4, 'q-restroom': 3, 'q-payment-speed': 3, 'q-bill-accuracy': 'Correct',
  'q-satisfaction': 4, 'q-value': 3, 'q-recommend': 6,
  'q-stood-out': 'The food range overall, as a regular customer, I feel like new items should be added',
  'q-issues': "Moderate: the food came cold so the manager suggested to fix the food. I informed him that there is no need for all the order except for the 'Haloumi' cheese, we did give it back and it was replaced quickly with a hot one. The manager afterwards provided a complementary Konafa desert (which was delicious). Also the menu on iOS was glitching. The waiter was aware of the issue.",
};

const visitDate = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const TAMARA_VISITS = [
  {
    id: 'tamara-visit-almaza-1', mission_id: 'tamara-mission-almaza', branch_id: 'tamara-branch-almaza',
    status: 'approved' as const, purchase_amount: 695.86, scheduled_date: visitDate(7),
    started_at: daysAgo(7), submitted_at: daysAgo(7),
    client_rating: 4, client_feedback: 'Friendly staff and great taste — dusty tables noted.',
    photos: ['/tamara-demo/almaza-1-food.jpg'], receipt_photo: '/tamara-demo/almaza-1-receipt.jpg',
    answers: A(almaza1),
  },
  {
    id: 'tamara-visit-almaza-2', mission_id: 'tamara-mission-almaza', branch_id: 'tamara-branch-almaza',
    status: 'approved' as const, purchase_amount: 206.84, scheduled_date: visitDate(7),
    started_at: daysAgo(7), submitted_at: daysAgo(7),
    client_rating: 5, client_feedback: 'Loved the taste — only the tables were dusty.',
    photos: ['/tamara-demo/almaza-2-food.jpg'], receipt_photo: '/tamara-demo/almaza-2-receipt.jpg',
    answers: A(almaza2),
  },
  {
    id: 'tamara-visit-almaza-3', mission_id: 'tamara-mission-almaza', branch_id: 'tamara-branch-almaza',
    status: 'approved' as const, purchase_amount: 350, scheduled_date: visitDate(6),
    started_at: daysAgo(6), submitted_at: daysAgo(6),
    client_rating: 5, client_feedback: 'تجربة حلوة، الأكل ممتاز والمكان جميل.',
    photos: ['/tamara-demo/almaza-3-food.jpg'], receipt_photo: '/tamara-demo/almaza-3-receipt.jpg',
    answers: A(almaza3),
  },
  {
    id: 'tamara-visit-almaza-4', mission_id: 'tamara-mission-almaza', branch_id: 'tamara-branch-almaza',
    status: 'approved' as const, purchase_amount: 601, scheduled_date: visitDate(6),
    started_at: daysAgo(6), submitted_at: daysAgo(6),
    client_rating: 4, client_feedback: 'Hummus was amazing; oregano on the Fattoush was unexpected.',
    photos: ['/tamara-demo/almaza-4-food.jpg'], receipt_photo: '/tamara-demo/almaza-4-receipt.jpg',
    answers: A(almaza4),
  },
  {
    id: 'tamara-visit-waterway-1', mission_id: 'tamara-mission-waterway', branch_id: 'tamara-branch-waterway',
    status: 'approved' as const, purchase_amount: 480, scheduled_date: visitDate(5),
    started_at: daysAgo(5), submitted_at: daysAgo(5),
    client_rating: 3, client_feedback: 'Slow service — over 20 minutes to take the order.',
    photos: ['/tamara-demo/waterway-1-food.jpg'], receipt_photo: '/tamara-demo/waterway-1-receipt.jpg',
    answers: A(water1),
  },
  {
    id: 'tamara-visit-waterway-2', mission_id: 'tamara-mission-waterway', branch_id: 'tamara-branch-waterway',
    status: 'approved' as const, purchase_amount: 320, scheduled_date: visitDate(5),
    started_at: daysAgo(5), submitted_at: daysAgo(5),
    client_rating: 3, client_feedback: 'Staff did not check in on the table.',
    photos: ['/tamara-demo/waterway-2-food.png'], receipt_photo: '/tamara-demo/waterway-2-receipt.png',
    answers: A(water2),
  },
  {
    id: 'tamara-visit-waterway-3', mission_id: 'tamara-mission-waterway', branch_id: 'tamara-branch-waterway',
    status: 'approved' as const, purchase_amount: 540, scheduled_date: visitDate(4),
    started_at: daysAgo(4), submitted_at: daysAgo(4),
    client_rating: 3, client_feedback: 'Beautiful place but the food arrived cold and late.',
    photos: ['/tamara-demo/waterway-3-food.jpg'], receipt_photo: '/tamara-demo/waterway-3-receipt.jpg',
    answers: A(water3),
  },
  {
    id: 'tamara-visit-waterway-4', mission_id: 'tamara-mission-waterway', branch_id: 'tamara-branch-waterway',
    status: 'approved' as const, purchase_amount: 620, scheduled_date: visitDate(4),
    started_at: daysAgo(4), submitted_at: daysAgo(4),
    client_rating: 4, client_feedback: 'Manager handled the cold-food issue well; menu app was glitching.',
    photos: ['/tamara-demo/waterway-4-food.jpg'], receipt_photo: '/tamara-demo/waterway-4-receipt.jpg',
    answers: A(water4),
  },
];
