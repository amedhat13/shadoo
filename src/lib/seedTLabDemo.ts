// ============================================================================
// Seed T-Lab Boba demo data into the live database for the current user.
// Idempotent: if a T-Lab branch already exists for the user, this is a no-op.
// ============================================================================
import { supabase } from '@/integrations/supabase/client';
import {
  TLAB_BRANCHES,
  TLAB_MISSIONS,
  TLAB_VISITS,
  TLAB_PHOTO_REQUIREMENTS,
} from './tlabDemoData';

export interface SeedResult {
  ok: boolean;
  alreadySeeded?: boolean;
  branchesInserted?: number;
  missionsInserted?: number;
  visitsInserted?: number;
  error?: string;
}

export async function seedTLabDemo(): Promise<SeedResult> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: 'Not authenticated' };
  }
  const userId = userData.user.id;

  // ---- Idempotency check: any T-Lab branch already present for this user? ----
  const { data: existing, error: checkErr } = await supabase
    .from('branches')
    .select('id, name')
    .eq('user_id', userId)
    .ilike('name', 'T-Lab Boba%');
  if (checkErr) return { ok: false, error: checkErr.message };
  if (existing && existing.length > 0) {
    return { ok: true, alreadySeeded: true };
  }

  // ---- Insert branches ----
  const branchesInsert = TLAB_BRANCHES.map((b) => ({
    user_id: userId,
    name: b.name,
    name_ar: b.name_ar,
    address: b.address,
    address_ar: b.address_ar,
    city: b.city,
    district: b.district,
    google_maps_link: b.google_maps_link,
    latitude: b.latitude,
    longitude: b.longitude,
    status: b.status,
  }));

  const { data: insertedBranches, error: branchErr } = await supabase
    .from('branches')
    .insert(branchesInsert)
    .select('id, name');
  if (branchErr || !insertedBranches) {
    return { ok: false, error: branchErr?.message || 'Failed to insert branches' };
  }

  // Map demo branch ids -> real db branch ids by matching name
  const branchIdMap = new Map<string, string>();
  for (const demo of TLAB_BRANCHES) {
    const real = insertedBranches.find((r) => r.name === demo.name);
    if (real) branchIdMap.set(demo.id, real.id);
  }

  // ---- Insert missions ----
  const missionsInsert = TLAB_MISSIONS.map((m) => ({
    user_id: userId,
    name: m.name,
    name_ar: m.name_ar,
    branch_id: branchIdMap.get(m.branch_id) || null,
    methodology: m.methodology,
    status: m.status,
    agent_tier: 'C',
    questions: JSON.parse(JSON.stringify(m.questions)),
    photo_requirements: JSON.parse(JSON.stringify(TLAB_PHOTO_REQUIREMENTS)),
    number_of_visits: m.number_of_visits,
    purchase_budget_per_visit: m.purchase_budget_per_visit,
    total_purchase_budget: m.total_purchase_budget,
    visits_completed: m.visits_completed,
    visits_pending: m.visits_pending,
    budget_used: m.budget_used,
    published_at: m.published_at,
    is_geo_tagged: false,
  }));

  const { data: insertedMissions, error: missionErr } = await supabase
    .from('missions')
    .insert(missionsInsert as never)
    .select('id, name');
  if (missionErr || !insertedMissions) {
    return { ok: false, error: missionErr?.message || 'Failed to insert missions' };
  }

  const missionIdMap = new Map<string, string>();
  for (const demo of TLAB_MISSIONS) {
    const real = insertedMissions.find((r) => r.name === demo.name);
    if (real) missionIdMap.set(demo.id, real.id);
  }

  // ---- Insert visits (no agent_id; the seeded agent ids are not real) ----
  const visitsInsert = TLAB_VISITS.map((v) => ({
    mission_id: missionIdMap.get(v.mission_id) || null,
    agent_id: null,
    status: v.status,
    answers: JSON.parse(JSON.stringify(v.answers)),
    purchase_amount: v.purchase_amount,
    scheduled_date: v.scheduled_date,
    started_at: v.started_at,
    submitted_at: v.submitted_at,
    client_rating: v.client_rating,
    client_feedback: v.client_feedback,
    rated_at: v.submitted_at,
  }));

  const { error: visitErr } = await supabase
    .from('visits')
    .insert(visitsInsert as never);
  if (visitErr) {
    return { ok: false, error: visitErr.message };
  }

  return {
    ok: true,
    branchesInserted: insertedBranches.length,
    missionsInserted: insertedMissions.length,
    visitsInserted: visitsInsert.length,
  };
}
