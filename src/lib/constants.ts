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

export const AGENT_TIERS = [
  {
    tier: 'C' as const,
    name: 'Class C',
    description: 'Standard agents for routine mystery shopping tasks.',
    features: ['Basic training', 'Standard response time', 'Cost-effective'],
    available: true,
    requiresUpgrade: false,
  },
  {
    tier: 'B' as const,
    name: 'Class B',
    description: 'Experienced agents with proven track records.',
    features: ['Advanced training', 'Faster response time', 'Detailed reports'],
    available: true,
    requiresUpgrade: false,
  },
  {
    tier: 'A' as const,
    name: 'Class A',
    description: 'Premium agents for high-stakes evaluations.',
    features: ['Expert level', 'Priority response', 'Executive reports', 'Dedicated support'],
    available: false,
    requiresUpgrade: true,
  },
];

export const QUESTION_TEMPLATES = [
  {
    id: 'nps' as const,
    name: 'NPS (Net Promoter Score)',
    description: 'Measure customer loyalty and likelihood to recommend.',
    questions: [
      {
        type: 'rating' as const,
        text: 'How likely are you to recommend this location to a friend or colleague?',
        required: true,
        max_rating: 10,
      },
      {
        type: 'short_text' as const,
        text: 'What is the primary reason for your score?',
        required: false,
      },
    ],
  },
  {
    id: 'csat' as const,
    name: 'CSAT (Customer Satisfaction)',
    description: 'Measure overall customer satisfaction with the experience.',
    questions: [
      {
        type: 'rating' as const,
        text: 'How satisfied were you with your overall experience today?',
        required: true,
        max_rating: 5,
      },
      {
        type: 'multiple_choice' as const,
        text: 'Which aspect of the service impressed you the most?',
        required: false,
        options: [
          { id: 'staff', text: 'Staff friendliness' },
          { id: 'speed', text: 'Speed of service' },
          { id: 'cleanliness', text: 'Cleanliness' },
          { id: 'product', text: 'Product quality' },
        ],
      },
    ],
  },
  {
    id: 'top_2_boxes' as const,
    name: 'TOP 2 Boxes',
    description: 'Measure strong positive responses (4-5 on a 5-point scale).',
    questions: [
      {
        type: 'rating' as const,
        text: 'How would you rate the quality of service?',
        required: true,
        max_rating: 5,
      },
      {
        type: 'rating' as const,
        text: 'How would you rate the staff professionalism?',
        required: true,
        max_rating: 5,
      },
      {
        type: 'rating' as const,
        text: 'How would you rate the overall value for money?',
        required: true,
        max_rating: 5,
      },
    ],
  },
  {
    id: 'top_box' as const,
    name: 'TOP Box',
    description: 'Measure the strongest positive response (5 on a 5-point scale).',
    questions: [
      {
        type: 'rating' as const,
        text: 'Did this experience exceed your expectations?',
        required: true,
        max_rating: 5,
      },
      {
        type: 'yes_no' as const,
        text: 'Would you consider this a perfect visit?',
        required: true,
      },
    ],
  },
  {
    id: 'overall_score' as const,
    name: 'Overall Score',
    description: 'Comprehensive evaluation across multiple dimensions.',
    questions: [
      {
        type: 'rating' as const,
        text: 'Rate the cleanliness of the location.',
        required: true,
        max_rating: 5,
      },
      {
        type: 'rating' as const,
        text: 'Rate the staff knowledge and helpfulness.',
        required: true,
        max_rating: 5,
      },
      {
        type: 'rating' as const,
        text: 'Rate the wait time and efficiency.',
        required: true,
        max_rating: 5,
      },
      {
        type: 'rating' as const,
        text: 'Rate the product/service quality.',
        required: true,
        max_rating: 5,
      },
      {
        type: 'short_text' as const,
        text: 'Additional comments or observations.',
        required: false,
      },
    ],
  },
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
