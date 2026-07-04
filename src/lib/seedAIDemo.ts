// ============================================================================
// Seed "AI Account" demo — a lightweight AI/tech retail brand dataset.
// Reuses the Tamara question/visit templates with AI-branded naming so the
// account has meaningful reporting data without duplicating large fixtures.
// Idempotent: if AI branches/missions/visits already exist, recreates cleanly.
// ============================================================================
import { supabase } from '@/integrations/supabase/client';
import {
  TAMARA_MISSIONS,
  TAMARA_VISITS,
  TAMARA_PHOTO_REQUIREMENTS,
} from './tamaraDemoData';

export interface SeedResult {
  ok: boolean;
  alreadySeeded?: boolean;
  branchesInserted?: number;
  missionsInserted?: number;
  visitsInserted?: number;
  error?: string;
}

const AI_BRAND = 'Test Account';

const AI_BRANCHES = [
  {
    id: 'ai-branch-downtown',
    name: `${AI_BRAND} — Downtown Cairo`,
    name_ar: 'حساب تجريبي — وسط البلد',
    address: '15 Talaat Harb St, Downtown, Cairo',
    address_ar: '١٥ شارع طلعت حرب، وسط البلد، القاهرة',
    city: 'Cairo',
    district: 'Downtown',
    google_maps_link: 'https://maps.google.com/?q=Talaat+Harb+Cairo',
    latitude: 30.0489,
    longitude: 31.2402,
    status: 'verified' as const,
  },
  {
    id: 'ai-branch-newcairo',
    name: `${AI_BRAND} — Point 90 Mall`,
    name_ar: 'حساب تجريبي — بوينت ٩٠ مول',
    address: 'Point 90 Mall, New Cairo',
    address_ar: 'بوينت ٩٠ مول، القاهرة الجديدة',
    city: 'Cairo',
    district: 'New Cairo',
    google_maps_link: 'https://maps.google.com/?q=Point+90+Mall+New+Cairo',
    latitude: 30.0225,
    longitude: 31.4913,
    status: 'verified' as const,
  },
];

// Rebrand Tamara missions / visits so names, mapping, and idempotency prefix
// all live under an "Aida AI" namespace.
const branchIdRemap: Record<string, string> = {
  'tamara-branch-almaza': 'ai-branch-downtown',
  'tamara-branch-waterway': 'ai-branch-newcairo',
};

const AI_MISSIONS = TAMARA_MISSIONS.map((m) => ({
  ...m,
  id: m.id.replace('tamara', 'ai'),
  name: m.name.replace(/^Tamara/i, AI_BRAND),
  name_ar: m.name_ar.replace(/^تمارا/, 'حساب تجريبي'),
  branch_id: branchIdRemap[m.branch_id] || m.branch_id,
}));

const AI_VISITS = TAMARA_VISITS.map((v) => ({
  ...v,
  mission_id: v.mission_id.replace('tamara', 'ai'),
}));

const LIKE_PREFIX = `${AI_BRAND}%`;

export async function seedAIDemo(): Promise<SeedResult> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return { ok: false, error: 'Not authenticated' };
  const userId = userData.user.id;

  // Rebrand profile
  await supabase.from('profiles').update({
    company_name: 'Test Account',
    full_name: 'Test Account',
    phone: '+20 100 000 0000',
    logo_url: null,
  }).eq('user_id', userId);



  // Clear other demo brands so Reports reflects only the active demo
  for (const prefix of ['T-Lab%', 'Tamara%']) {
    const { data: otherMissions } = await supabase
      .from('missions').select('id').eq('user_id', userId).ilike('name', prefix);
    if (otherMissions && otherMissions.length > 0) {
      const ids = otherMissions.map((m) => m.id);
      await supabase.from('visits').delete().in('mission_id', ids);
      await supabase.from('missions').delete().in('id', ids);
    }
    await supabase.from('branches').delete().eq('user_id', userId).ilike('name', prefix);
  }

  const { data: existingBranches, error: checkErr } = await supabase
    .from('branches').select('id, name').eq('user_id', userId).ilike('name', LIKE_PREFIX);
  if (checkErr) return { ok: false, error: checkErr.message };

  const { data: existingMissions } = await supabase
    .from('missions').select('id, name').eq('user_id', userId).ilike('name', LIKE_PREFIX);

  let existingVisitCount = 0;
  if (existingMissions && existingMissions.length > 0) {
    const ids = existingMissions.map((m) => m.id);
    const { count } = await supabase
      .from('visits').select('id', { count: 'exact', head: true }).in('mission_id', ids);
    existingVisitCount = count || 0;
  }

  if (
    (existingBranches?.length || 0) >= AI_BRANCHES.length &&
    (existingMissions?.length || 0) >= AI_MISSIONS.length &&
    existingVisitCount >= AI_VISITS.length
  ) {
    return { ok: true, alreadySeeded: true };
  }

  // Cleanup partial seed
  if ((existingBranches?.length || 0) > 0 || (existingMissions?.length || 0) > 0) {
    if (existingMissions && existingMissions.length > 0) {
      const ids = existingMissions.map((m) => m.id);
      await supabase.from('visits').delete().in('mission_id', ids);
      await supabase.from('missions').delete().in('id', ids);
    }
    if (existingBranches && existingBranches.length > 0) {
      await supabase.from('branches').delete().in('id', existingBranches.map((b) => b.id));
    }
  }

  const branchesInsert = AI_BRANCHES.map((b) => ({
    user_id: userId, name: b.name, name_ar: b.name_ar,
    address: b.address, address_ar: b.address_ar, city: b.city, district: b.district,
    google_maps_link: b.google_maps_link, latitude: b.latitude, longitude: b.longitude, status: b.status,
  }));
  const { data: insertedBranches, error: branchErr } = await supabase
    .from('branches').insert(branchesInsert).select('id, name');
  if (branchErr || !insertedBranches) return { ok: false, error: branchErr?.message || 'Failed to insert branches' };

  const branchIdMap = new Map<string, string>();
  for (const demo of AI_BRANCHES) {
    const real = insertedBranches.find((r) => r.name === demo.name);
    if (real) branchIdMap.set(demo.id, real.id);
  }

  const missionsInsert = AI_MISSIONS.map((m) => ({
    user_id: userId, name: m.name, name_ar: m.name_ar,
    branch_id: branchIdMap.get(m.branch_id) || null,
    methodology: m.methodology, status: m.status, agent_tier: 'C',
    questions: JSON.parse(JSON.stringify(m.questions)),
    photo_requirements: JSON.parse(JSON.stringify(TAMARA_PHOTO_REQUIREMENTS)),
    number_of_visits: m.number_of_visits,
    purchase_budget_per_visit: m.purchase_budget_per_visit,
    total_purchase_budget: m.total_purchase_budget,
    visits_completed: m.visits_completed, visits_pending: m.visits_pending,
    budget_used: m.budget_used, published_at: m.published_at, is_geo_tagged: false,
  }));
  const { data: insertedMissions, error: missionErr } = await supabase
    .from('missions').insert(missionsInsert as never).select('id, name');
  if (missionErr || !insertedMissions) return { ok: false, error: missionErr?.message || 'Failed to insert missions' };

  const missionIdMap = new Map<string, string>();
  for (const demo of AI_MISSIONS) {
    const real = insertedMissions.find((r) => r.name === demo.name);
    if (real) missionIdMap.set(demo.id, real.id);
  }

  const visitsInsert = AI_VISITS.map((v) => ({
    mission_id: missionIdMap.get(v.mission_id) || null,
    agent_id: null, status: v.status,
    answers: JSON.parse(JSON.stringify(v.answers)),
    purchase_amount: v.purchase_amount,
    scheduled_date: v.scheduled_date,
    started_at: v.started_at, submitted_at: v.submitted_at,
    client_rating: v.client_rating, client_feedback: v.client_feedback,
    rated_at: v.submitted_at,
    photos: v.photos, receipt_photo: v.receipt_photo,
  }));

  const { error: visitErr } = await supabase.from('visits').insert(visitsInsert as never);
  if (visitErr) return { ok: false, error: visitErr.message };

  return {
    ok: true,
    branchesInserted: insertedBranches.length,
    missionsInserted: insertedMissions.length,
    visitsInserted: visitsInsert.length,
  };
}
