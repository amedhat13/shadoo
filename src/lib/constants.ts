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
  { id: 'basics', title: 'Basics', description: 'Mission details.' },
  { id: 'questions', title: 'Questions & Photos', description: 'Build questionnaire.' },
  { id: 'funding', title: 'Visits & Funding', description: 'Budget configuration.' },
  { id: 'review', title: 'Review', description: 'Review and publish.' },
];

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
