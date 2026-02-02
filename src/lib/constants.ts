// Application constants - i18n ready structure

export const MISSION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  ready_for_funding: 'Ready for Funding',
  published: 'Published',
  paused: 'Paused',
  expired: 'Expired',
  archived: 'Archived',
};

export const MISSION_STATUS_DESCRIPTIONS: Record<string, string> = {
  draft: 'Mission is being created',
  ready_for_funding: 'Mission is complete and awaiting funding',
  published: 'Mission is live and accepting agents',
  paused: 'Mission is temporarily paused',
  expired: 'Mission has passed its end date',
  archived: 'Mission has been archived',
};

export const CURRENCY = {
  code: 'EGP',
  symbol: 'EGP',
  locale: 'en-EG',
};

export const FORM_STEPS = [
  { id: 'basics', title: 'Basics', description: 'Mission details' },
  { id: 'requirements', title: 'Requirements', description: 'Agent requirements' },
  { id: 'reward', title: 'Reward & Funding', description: 'Payment configuration' },
  { id: 'review', title: 'Review', description: 'Review and publish' },
];

export const NAV_ITEMS = [
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
};

export const MESSAGES = {
  publish: {
    confirmation: 'Publishing this mission will place a hold of {amount} on your wallet.',
    success: 'Mission published successfully!',
    error: 'Failed to publish mission. Please try again.',
  },
  funding: {
    insufficient: 'Insufficient wallet balance. Please add funds to publish this mission.',
    info: 'Funds will be placed on hold when you publish this mission.',
  },
};
