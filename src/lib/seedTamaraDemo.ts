// ============================================================================
// Seed Tamara Lebanese Bistro demo into the live database for the current user.
// Idempotent: if Tamara branches/missions/visits already exist, recreates cleanly.
// ============================================================================
import { supabase } from '@/integrations/supabase/client';
import {
  TAMARA_BRANCHES,
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

export async function seedTamaraDemo(): Promise<SeedResult> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return { ok: false, error: 'Not authenticated' };
  const userId = userData.user.id;

  // Customize the demo account profile to Tamara branding
  await supabase.from('profiles').update({
    company_name: 'Tamara — Lebanese Bistro',
    full_name: 'Tamara Demo',
    phone: '+961 1 234 567',
  }).eq('user_id', userId);

  // Clear any T-Lab demo data so Reports only shows Tamara
  const { data: tlabMissions } = await supabase
    .from('missions').select('id').eq('user_id', userId).ilike('name', 'T-Lab%');
  if (tlabMissions && tlabMissions.length > 0) {
    const ids = tlabMissions.map((m) => m.id);
    await supabase.from('visits').delete().in('mission_id', ids);
    await supabase.from('missions').delete().in('id', ids);
  }
  await supabase.from('branches').delete().eq('user_id', userId).ilike('name', 'T-Lab%');

  const { data: existingBranches, error: checkErr } = await supabase
    .from('branches').select('id, name').eq('user_id', userId).ilike('name', 'Tamara%');
  if (checkErr) return { ok: false, error: checkErr.message };

  const { data: existingMissions } = await supabase
    .from('missions').select('id, name').eq('user_id', userId).ilike('name', 'Tamara%');

  let existingVisitCount = 0;
  if (existingMissions && existingMissions.length > 0) {
    const ids = existingMissions.map((m) => m.id);
    const { count } = await supabase
      .from('visits').select('id', { count: 'exact', head: true }).in('mission_id', ids);
    existingVisitCount = count || 0;
  }

  if (
    (existingBranches?.length || 0) >= TAMARA_BRANCHES.length &&
    (existingMissions?.length || 0) >= TAMARA_MISSIONS.length &&
    existingVisitCount >= TAMARA_VISITS.length
  ) {
    return { ok: true, alreadySeeded: true };
  }

  // Cleanup any partial seed
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

  // Branches
  const branchesInsert = TAMARA_BRANCHES.map((b) => ({
    user_id: userId, name: b.name, name_ar: b.name_ar,
    address: b.address, address_ar: b.address_ar, city: b.city, district: b.district,
    google_maps_link: b.google_maps_link, latitude: b.latitude, longitude: b.longitude, status: b.status,
  }));
  const { data: insertedBranches, error: branchErr } = await supabase
    .from('branches').insert(branchesInsert).select('id, name');
  if (branchErr || !insertedBranches) return { ok: false, error: branchErr?.message || 'Failed to insert branches' };

  const branchIdMap = new Map<string, string>();
  for (const demo of TAMARA_BRANCHES) {
    const real = insertedBranches.find((r) => r.name === demo.name);
    if (real) branchIdMap.set(demo.id, real.id);
  }

  // Missions
  const missionsInsert = TAMARA_MISSIONS.map((m) => ({
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
  for (const demo of TAMARA_MISSIONS) {
    const real = insertedMissions.find((r) => r.name === demo.name);
    if (real) missionIdMap.set(demo.id, real.id);
  }

  // Visits — include photos + receipt_photo
  const visitsInsert = TAMARA_VISITS.map((v) => ({
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
