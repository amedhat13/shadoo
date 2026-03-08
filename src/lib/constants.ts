// Application constants - i18n ready structure

export const MISSION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

export const MISSION_STATUS_DESCRIPTIONS: Record<string, string> = {
  draft: 'Mission is being created.',
  published: 'Mission is live and accepting visits.',
  paused: 'Mission is temporarily paused.',
  completed: 'All visits have been completed.',
  archived: 'Mission has been archived.',
};

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  rating: 'Rating',
  short_text: 'Short Text',
  yes_no: 'Yes / No',
};

export const CURRENCY = {
  code: 'EGP',
  symbol: 'EGP',
  locale: 'en-EG',
};

export const FORM_STEPS = [
  { id: 'basics', title: 'Basics', description: 'Mission name and branches.' },
  { id: 'agent-tier', title: 'Agent Tier', description: 'Select agent tier.' },
  { id: 'questions', title: 'Questions', description: 'Build questionnaire.' },
  { id: 'geo-settings', title: 'Geo Settings', description: 'Location verification.' },
  { id: 'funding', title: 'Visits & Funding', description: 'Budget configuration.' },
  { id: 'review', title: 'Review', description: 'Review and publish.' },
];

export const AGENT_DEMOGRAPHICS = {
  genders: ['male', 'female'] as const,
  education_levels: ['high_school', 'bachelors', 'masters', 'phd', 'other'] as const,
  marital_statuses: ['single', 'married', 'other'] as const,
  employment_statuses: ['employed', 'unemployed', 'student', 'freelancer', 'retired'] as const,
  languages: ['arabic', 'english', 'french', 'german', 'spanish', 'italian'] as const,
  specializations: [
    'food_and_beverage', 'retail', 'banking_finance', 'automotive',
    'healthcare', 'hospitality', 'telecom', 'real_estate',
    'education', 'government', 'fmcg', 'fashion', 'electronics'
  ] as const,
  egyptian_cities: [
    'Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Tanta',
    'Mansoura', 'Port Said', 'Suez', 'Ismailia', 'Faiyum',
    'Zagazig', 'Damietta', 'Beni Suef', 'Minya', 'Sohag',
    'Qena', 'Hurghada', 'Sharm El Sheikh', 'Marsa Alam',
    '6th of October', 'New Cairo', 'Obour', 'Shorouk', '10th of Ramadan'
  ] as const,
  tier_colors: [
    { value: '#f59e0b', label: 'Amber' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#22c55e', label: 'Green' },
    { value: '#ef4444', label: 'Red' },
    { value: '#a855f7', label: 'Purple' },
    { value: '#94a3b8', label: 'Slate' },
    { value: '#92400e', label: 'Brown' },
    { value: '#14b8a6', label: 'Teal' },
    { value: '#f97316', label: 'Orange' },
    { value: '#ec4899', label: 'Pink' },
  ] as const,
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { id: 'missions', label: 'Missions', href: '/missions', icon: 'ClipboardList' },
  { id: 'branches', label: 'Branches', href: '/branches', icon: 'Building2' },
  { id: 'wallet', label: 'Wallet', href: '/wallet', icon: 'Wallet' },
  { id: 'reports', label: 'Reports', href: '/reports', icon: 'BarChart3' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'Settings' },
];

export const EMPTY_STATES = {
  missions: {
    title: 'No missions yet',
    description: 'Create your first mission to start connecting with agents.',
    action: 'Create Mission',
  },
  branches: {
    title: 'No branches yet',
    description: 'Add your first branch to organize missions by location.',
    action: 'Add Branch',
  },
  questions: {
    title: 'No questions added',
    description: 'Add questions that agents will answer during each visit.',
    action: 'Add Question',
  },
};

export const MESSAGES = {
  publish: {
    confirmation: 'Publishing this mission will allocate {amount} EGP from your wallet to fund purchases across {visits} visits.',
    success: 'Mission published successfully!',
    error: 'Failed to publish mission. Please try again.',
  },
  funding: {
    insufficient_balance: 'Insufficient wallet balance. Please add funds to publish this mission.',
    insufficient_visits: "You've used all visits in your package this month. Upgrade your plan or wait until next month.",
    info: 'Funds will be allocated from your wallet when you publish this mission.',
  },
  visits: {
    consumption_warning: 'This mission will consume {count} visits from your monthly allowance.',
    none_remaining: "You've used all visits in your package this month. Upgrade your plan or wait until next month.",
  },
};
