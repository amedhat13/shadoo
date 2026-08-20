// Client industry / category — set once on the client account (admin "Add client" or client Settings)
// and inherited by every mission that client creates. Missions no longer pick a category themselves.

export const INDUSTRY_OPTIONS = [
  { value: 'fnb', label: 'Food & Beverage', category: 'F&B' },
  { value: 'retail', label: 'Retail', category: 'Retail' },
  { value: 'banking', label: 'Banking & Finance', category: 'Banking' },
  { value: 'telecom', label: 'Telecom', category: 'Telecom' },
  { value: 'healthcare', label: 'Healthcare', category: 'Pharmacy' },
  { value: 'automotive', label: 'Automotive', category: 'Automotive' },
  { value: 'hospitality', label: 'Hospitality & Hotels', category: 'Hospitality' },
  { value: 'ecommerce', label: 'E-commerce', category: 'Retail' },
  { value: 'education', label: 'Education', category: 'Service' },
  { value: 'other', label: 'Other', category: 'Service' },
] as const;

const STORAGE_KEY = 'shadoo.client_industry';

export function getClientIndustry(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'fnb';
  } catch {
    return 'fnb';
  }
}

export function setClientIndustry(industry: string) {
  try {
    localStorage.setItem(STORAGE_KEY, industry);
  } catch {
    /* ignore */
  }
}

export function industryLabel(industry: string): string {
  return INDUSTRY_OPTIONS.find((o) => o.value === industry)?.label ?? 'Other';
}

/** Mission-card category badge derived from the client's account category. */
export function industryToMissionCategory(industry: string): string {
  return INDUSTRY_OPTIONS.find((o) => o.value === industry)?.category ?? 'Service';
}

export function getClientMissionCategory(): string {
  return industryToMissionCategory(getClientIndustry());
}
