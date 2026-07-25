// Mock data for the Agent App prototype. Self-contained — no DB writes.

export type AgentMissionStatus = 'available' | 'active' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface AgentQuestion {
  id: string;
  text: string;
  description?: string;
  type: 'rating' | 'single_select' | 'multi_select' | 'text' | 'yes_no';
  options?: string[];
  max_rating?: number;
  required?: boolean;
  /** Conditional photo trigger. If set, when the answer meets the condition, agent must attach a photo justifying it. */
  photoOn?: {
    /** rating <= threshold, or yes_no === 'No', or option match */
    ratingLte?: number;
    ifAnswer?: string;
    prompt: string; // guidance shown to the agent
  };
}

export interface AgentSection {
  id: string;
  title: string;
  description?: string;
  questions: AgentQuestion[];
}

export interface AgentPhotoTask {
  id: string;
  title: string;
  description: string;
  sample: string; // image url (placeholder)
  tips: string[];
  dos: string[];
  donts: string[];
}

export interface AgentMission {
  id: string;
  brand: string;
  brandLogo?: string;
  brandDomain?: string;
  brandColor?: string;
  title: string;
  hero: string;
  category: 'F&B' | 'Retail' | 'Service' | 'Banking' | 'Telecom' | 'Pharmacy' | 'Fashion' | 'Grocery' | 'Automotive' | 'Hospitality';
  distanceKm: number;
  durationMin: number;
  reward: number; // EGP
  purchaseBudget: number;
  address: string;
  city: string;
  slotsLeft: number;
  deadline: string; // ISO
  cancelWindowMin: number;
  coverStory: string;
  rules: string[];
  sections: AgentSection[];
  photoTasks: AgentPhotoTask[];
  requiresReceipt: boolean;
  itemsToPurchase: { name: string; budget: number }[];
  payoutBreakdown: { label: string; amount: number }[];
  payoutTiming: string;
}

export interface AgentVisit {
  id: string;
  missionId: string;
  status: AgentMissionStatus;
  acceptedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  paidAt?: string;
  amountSpent?: number;
  answers?: Record<string, any>;
  photos?: Record<string, string>;
  receiptPhoto?: string;
  receiptDescription?: string;
  timeline: { label: string; ts?: string; state: 'done' | 'current' | 'pending' }[];
}

import tbsLogoAsset from '@/assets/tbs-logo.png.asset.json';
import vodafoneLogoAsset from '@/assets/vodafone-logo.png.asset.json';
import cibLogoAsset from '@/assets/cib-logo.png.asset.json';
import zaraLogoAsset from '@/assets/zara-logo.png.asset.json';

const TAMARA_LOGO = '/tamara-demo/logo.png';
const TBS_LOGO = tbsLogoAsset.url;
const VODAFONE_LOGO = vodafoneLogoAsset.url;
const CIB_LOGO = cibLogoAsset.url;
const ZARA_LOGO = zaraLogoAsset.url;

// ---- Sections (drawn from Tamara F&B template style)
const tamaraSections: AgentSection[] = [
  {
    id: 'sec-greeting',
    title: 'Greeting & Welcome',
    description: 'How the staff acknowledged you on arrival.',
    questions: [
      { id: 'q1', text: 'Were you greeted within 30 seconds of entering?', description: 'Look for eye contact, verbal greeting, or acknowledgment even if staff were busy.', type: 'yes_no', required: true },
      { id: 'q2', text: 'Rate the warmth of the welcome', description: 'Smile, tone of voice, and body language all count.', type: 'rating', max_rating: 5, required: true },
    ],
  },
  {
    id: 'sec-order',
    title: 'Order Experience',
    description: 'How ordering felt from start to finish.',
    questions: [
      { id: 'q3', text: 'Did the server suggest any specials or upsells?', description: 'Recommendations, add-ons, or upgrades — any proactive upselling.', type: 'yes_no', required: true },
      { id: 'q4', text: 'Rate the accuracy of your order', description: 'Everything you ordered arrived exactly as requested.', type: 'rating', max_rating: 5, required: true,
        photoOn: { ratingLte: 3, prompt: 'You rated order accuracy 3★ or less. Please attach a photo of what was wrong (missing item, wrong dish, etc.).' } },
      { id: 'q5', text: 'How long did you wait for your food?', type: 'single_select', options: ['<5 min', '5–10 min', '10–20 min', '20+ min'], required: true },
    ],
  },
  {
    id: 'sec-food',
    title: 'Food Quality',
    questions: [
      { id: 'q6', text: 'Rate the food taste', type: 'rating', max_rating: 5, required: true,
        photoOn: { ratingLte: 3, prompt: 'You rated the taste 3★ or less. Please attach a photo of the dish so we can review.' } },
      { id: 'q7', text: 'Rate the food presentation', description: 'Plating, garnish, cleanliness of the plate edge.', type: 'rating', max_rating: 5, required: true },
      { id: 'q8', text: 'Was the food served at the right temperature?', type: 'yes_no', required: true,
        photoOn: { ifAnswer: 'No', prompt: 'You said the temperature was wrong. If safe to do so, attach a photo of the dish.' } },
    ],
  },
  {
    id: 'sec-cleanliness',
    title: 'Cleanliness',
    questions: [
      { id: 'q9', text: 'Rate the dining area cleanliness', type: 'rating', max_rating: 5, required: true,
        photoOn: { ratingLte: 2, prompt: 'You rated cleanliness 2★ or less. Please attach a photo showing the issue.' } },
      { id: 'q10', text: 'Rate the restroom cleanliness', description: 'Only if you visited the restroom.', type: 'rating', max_rating: 5 },
    ],
  },
  {
    id: 'sec-overall',
    title: 'Overall Experience',
    questions: [
      { id: 'q11', text: 'How likely are you to recommend this branch? (0–10)', type: 'rating', max_rating: 10, required: true },
      { id: 'q12', text: 'Any additional comments?', type: 'text' },
    ],
  },
];

const tamaraPhotos: AgentPhotoTask[] = [
  {
    id: 'p1',
    title: 'Storefront',
    description: 'A clear shot of the branch entrance from outside.',
    sample: '/tamara-demo/almaza-1-food.jpg',
    tips: ['Stand 3–5 meters back', 'Make sure the sign is readable', 'Shoot in landscape'],
    dos: ['Whole storefront visible', 'Good daylight'],
    donts: ['No people faces', 'No blur'],
  },
  {
    id: 'p2',
    title: 'Your food',
    description: 'Top-down shot of your ordered dish.',
    sample: '/tamara-demo/waterway-1-food.jpg',
    tips: ['Shoot directly above the plate', 'Use natural light if possible', 'Fill the frame with the dish'],
    dos: ['Whole dish visible', 'Sharp focus'],
    donts: ['No shadows over food', 'No half-eaten shots'],
  },
  {
    id: 'p3',
    title: 'Dining area',
    description: 'Wide angle of the seating area during your visit.',
    sample: '/tamara-demo/almaza-2-food.jpg',
    tips: ['Capture 3+ tables', 'Show the floor and ceiling if possible'],
    dos: ['Landscape orientation'],
    donts: ['Do not photograph customer faces'],
  },
  {
    id: 'p4',
    title: 'Receipt (close-up)',
    description: 'A close, sharp shot of your receipt.',
    sample: '/tamara-demo/waterway-1-receipt.jpg',
    tips: ['Flatten the receipt', 'Include total and date clearly'],
    dos: ['All text readable'],
    donts: ['No glare', 'No cropped edges'],
  },
];

export const agentMissions: AgentMission[] = [
  {
    id: 'm-tamara-almaza',
    brand: 'Tamara — Lebanese Bistro',
    brandLogo: TAMARA_LOGO,
    brandDomain: 'tamararestaurant.com',
    brandColor: '#8B1E2D',
    title: 'F&B Service Review — Almaza City Centre',
    hero: TAMARA_LOGO,
    category: 'F&B',
    distanceKm: 4.2,
    durationMin: 45,
    reward: 250,
    purchaseBudget: 400,
    address: 'Almaza City Centre, Heliopolis, Cairo',
    city: 'Cairo',
    slotsLeft: 2,
    deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    cancelWindowMin: 5,
    coverStory: 'Visit as a normal customer around lunch or dinner. Order a main course and a drink, take your time, and evaluate the experience honestly.',
    rules: [
      'Behave exactly like a regular customer — do not identify yourself as a mystery shopper.',
      'Complete your visit within 45 minutes from entering the branch.',
      'Take all required photos discreetly. Never photograph staff faces or other customers.',
      'Keep your original receipt — you must upload it to get reimbursed.',
      'Submit your report within 2 hours of leaving the branch.',
    ],
    sections: tamaraSections,
    photoTasks: tamaraPhotos,
    requiresReceipt: true,
    itemsToPurchase: [
      { name: 'One main dish', budget: 250 },
      { name: 'One beverage', budget: 80 },
      { name: 'One dessert (optional)', budget: 70 },
    ],
    payoutBreakdown: [
      { label: 'Base fee', amount: 250 },
      { label: 'Purchase reimbursement', amount: 400 },
    ],
    payoutTiming: 'Reimbursement is released within 24 hours of approval, directly to your Shadoo wallet.',
  },
  {
    id: 'm-tbs-korba',
    brand: 'TBS — The Bakery Shop',
    brandLogo: TBS_LOGO,
    brandDomain: 'tbsholding.com',
    brandColor: '#5B2C1B',
    title: 'Service Review — TBS Korba',
    hero: TBS_LOGO,
    category: 'F&B',
    distanceKm: 6.8,
    durationMin: 30,
    reward: 180,
    purchaseBudget: 200,
    address: 'Korba, Heliopolis, Cairo',
    city: 'Cairo',
    slotsLeft: 4,
    deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    cancelWindowMin: 5,
    coverStory: 'Visit TBS as a regular customer, order a pastry and a hot drink, and evaluate service, product quality, and cleanliness.',
    rules: [
      'Order at least one pastry and one drink.',
      'Observe if staff offer any upsells.',
      'Keep the receipt for reimbursement.',
      'Complete within 30 minutes.',
    ],
    sections: tamaraSections.slice(0, 4),
    photoTasks: tamaraPhotos.slice(0, 3),
    requiresReceipt: true,
    itemsToPurchase: [
      { name: 'One pastry', budget: 100 },
      { name: 'One drink', budget: 100 },
    ],
    payoutBreakdown: [
      { label: 'Base fee', amount: 180 },
      { label: 'Purchase reimbursement', amount: 200 },
    ],
    payoutTiming: 'Reimbursement within 24 hours of approval.',
  },
  {
    id: 'm-vodafone',
    brand: 'Vodafone Egypt',
    brandLogo: VODAFONE_LOGO,
    brandDomain: 'vodafone.com.eg',
    brandColor: '#E60000',
    title: 'Store Experience — City Stars',
    hero: VODAFONE_LOGO,
    category: 'Retail',
    distanceKm: 8.1,
    durationMin: 25,
    reward: 150,
    purchaseBudget: 0,
    address: 'City Stars Mall, Nasr City, Cairo',
    city: 'Cairo',
    slotsLeft: 3,
    deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    cancelWindowMin: 5,
    coverStory: 'Enter the store and ask about upgrading to a new post-paid line. Evaluate how the rep handled you.',
    rules: [
      'You are not required to buy anything.',
      'Ask about at least 2 plans and one device.',
      'Complete within 25 minutes.',
    ],
    sections: tamaraSections.slice(0, 3),
    photoTasks: [tamaraPhotos[0], tamaraPhotos[2]],
    requiresReceipt: false,
    itemsToPurchase: [],
    payoutBreakdown: [{ label: 'Base fee', amount: 150 }],
    payoutTiming: 'Paid within 24 hours of approval.',
  },
  {
    id: 'm-cib',
    brand: 'CIB — Commercial International Bank',
    brandLogo: CIB_LOGO,
    brandDomain: 'cibeg.com',
    brandColor: '#6E1E3A',
    title: 'Branch Visit — Zamalek',
    hero: CIB_LOGO,
    category: 'Banking',
    distanceKm: 3.4,
    durationMin: 35,
    reward: 220,
    purchaseBudget: 0,
    address: '26th July St., Zamalek, Cairo',
    city: 'Cairo',
    slotsLeft: 2,
    deadline: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    cancelWindowMin: 5,
    coverStory: 'Enter as a walk-in customer inquiring about opening a savings account. Evaluate wait time, staff knowledge, and branch cleanliness.',
    rules: [
      'Do not submit any real documents.',
      'Ask about at least 2 account types.',
      'Take discreet photos of the branch entrance and waiting area.',
    ],
    sections: tamaraSections.slice(0, 3),
    photoTasks: [tamaraPhotos[0], tamaraPhotos[2]],
    requiresReceipt: false,
    itemsToPurchase: [],
    payoutBreakdown: [{ label: 'Base fee', amount: 220 }],
    payoutTiming: 'Paid within 24 hours of approval.',
  },
  {
    id: 'm-zara',
    brand: 'ZARA',
    brandLogo: ZARA_LOGO,
    brandDomain: 'zara.com',
    brandColor: '#000000',
    title: 'Fitting Room Experience — Mall of Egypt',
    hero: ZARA_LOGO,
    category: 'Retail',
    distanceKm: 12.5,
    durationMin: 40,
    reward: 200,
    purchaseBudget: 0,
    address: 'Mall of Egypt, 6th of October',
    city: 'Giza',
    slotsLeft: 5,
    deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    cancelWindowMin: 5,
    coverStory: 'Browse the store, try at least 3 items in the fitting room, and evaluate the overall retail experience.',
    rules: [
      'Try at least 3 items.',
      'No purchase required.',
      'Photograph the storefront and fitting-room signage only.',
    ],
    sections: tamaraSections.slice(0, 4),
    photoTasks: tamaraPhotos.slice(0, 3),
    requiresReceipt: false,
    itemsToPurchase: [],
    payoutBreakdown: [{ label: 'Base fee', amount: 200 }],
    payoutTiming: 'Paid within 24 hours of approval.',
  },
];


// ---- Visits state (single active + history, kept in memory)
let mockVisits: AgentVisit[] = [
  {
    id: 'v-history-1',
    missionId: 'm-tamara-almaza',
    status: 'approved',
    submittedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    amountSpent: 380,
    timeline: [
      { label: 'Submitted', ts: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), state: 'done' },
      { label: 'Under review', ts: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), state: 'done' },
      { label: 'Approved', ts: new Date(Date.now() - 5.5 * 24 * 3600 * 1000).toISOString(), state: 'done' },
      { label: 'Paid to wallet', ts: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), state: 'done' },
    ],
  },
  {
    id: 'v-history-2',
    missionId: 'm-tbs-korba',
    status: 'under_review',
    submittedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    amountSpent: 175,
    timeline: [
      { label: 'Submitted', ts: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), state: 'done' },
      { label: 'Under review', state: 'current' },
      { label: 'Approved', state: 'pending' },
      { label: 'Paid to wallet', state: 'pending' },
    ],
  },
  {
    id: 'v-history-3',
    missionId: 'm-vodafone',
    status: 'rejected',
    submittedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(),
    timeline: [
      { label: 'Submitted', ts: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(), state: 'done' },
      { label: 'Rejected — photos unclear', ts: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(), state: 'done' },
    ],
  },
];

// Simple pub-sub so screens re-render on updates
const listeners = new Set<() => void>();
export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function emit() { listeners.forEach((fn) => fn()); }

export function getMissions() { return agentMissions; }
export function getMission(id: string) { return agentMissions.find((m) => m.id === id); }
export function getVisits() { return mockVisits; }
export function getVisit(id: string) { return mockVisits.find((v) => v.id === id); }
export function getActiveVisit() { return mockVisits.find((v) => v.status === 'active'); }

export function acceptMission(missionId: string): AgentVisit {
  const existing = mockVisits.find((v) => v.missionId === missionId && v.status === 'active');
  if (existing) return existing;
  const visit: AgentVisit = {
    id: `v-${Date.now()}`,
    missionId,
    status: 'active',
    acceptedAt: new Date().toISOString(),
    answers: {},
    photos: {},
    timeline: [
      { label: 'Accepted', ts: new Date().toISOString(), state: 'done' },
      { label: 'In progress', state: 'current' },
      { label: 'Submitted', state: 'pending' },
      { label: 'Under review', state: 'pending' },
      { label: 'Approved', state: 'pending' },
      { label: 'Paid to wallet', state: 'pending' },
    ],
  };
  mockVisits = [visit, ...mockVisits];
  emit();
  return visit;
}

export function updateVisit(id: string, patch: Partial<AgentVisit>) {
  mockVisits = mockVisits.map((v) => (v.id === id ? { ...v, ...patch } : v));
  emit();
}

export function submitVisit(id: string) {
  updateVisit(id, {
    status: 'under_review',
    submittedAt: new Date().toISOString(),
    timeline: [
      { label: 'Accepted', ts: new Date().toISOString(), state: 'done' },
      { label: 'Submitted', ts: new Date().toISOString(), state: 'done' },
      { label: 'Under review', state: 'current' },
      { label: 'Approved', state: 'pending' },
      { label: 'Paid to wallet', state: 'pending' },
    ],
  });
}

export function cancelVisit(id: string) {
  mockVisits = mockVisits.filter((v) => v.id !== id);
  emit();
}
