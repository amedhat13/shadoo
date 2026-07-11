// ============================================================================
// Seed TBS Mystery Shopping Pilot demo into the current user's account.
// Creates 1 branch, 1 mission (14-question TBS Pilot template) and 10 completed
// visits with random 1-5 ratings so Reports & Reports AI render the scorecard.
// Idempotent: if TBS data already exists, recreates cleanly.
// ============================================================================
import { supabase } from '@/integrations/supabase/client';
import { TBS_QUESTIONS, TBS_VISITS } from './tbsDemoData';

export interface SeedResult {
  ok: boolean;
  alreadySeeded?: boolean;
  branchesInserted?: number;
  missionsInserted?: number;
  visitsInserted?: number;
  error?: string;
}

const BRANCH_NAME = 'TBS Downtown Cairo';
const MISSION_NAME = 'TBS Pilot — Downtown Cairo (Demo)';

export async function seedTBSDemo(): Promise<SeedResult> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return { ok: false, error: 'Not authenticated' };
  const userId = userData.user.id;

  // Rebrand profile to TBS
  await supabase.from('profiles').update({
    company_name: 'TBS — The Bakery Shop',
    full_name: 'TBS Demo',
    phone: '+20 100 555 0100',
  }).eq('user_id', userId);

  // Clear any prior TBS seed for this user
  const { data: prevMissions } = await supabase
    .from('missions').select('id').eq('user_id', userId).ilike('name', 'TBS%');
  if (prevMissions && prevMissions.length > 0) {
    const ids = prevMissions.map((m) => m.id);
    await supabase.from('visits').delete().in('mission_id', ids);
    await supabase.from('missions').delete().in('id', ids);
  }
  await supabase.from('branches').delete().eq('user_id', userId).ilike('name', 'TBS%');

  // Branch
  const { data: branch, error: branchErr } = await supabase
    .from('branches').insert([{
      user_id: userId,
      name: BRANCH_NAME,
      name_ar: 'تي بي إس — وسط القاهرة',
      address: '15 Talaat Harb St, Downtown',
      address_ar: '١٥ شارع طلعت حرب، وسط البلد',
      city: 'Cairo',
      district: 'Downtown',
      google_maps_link: 'https://maps.google.com/?q=30.0489,31.2394',
      latitude: 30.0489,
      longitude: 31.2394,
      status: 'active',
    }]).select('id').single();
  if (branchErr || !branch) return { ok: false, error: branchErr?.message || 'Branch insert failed' };

  // Mission
  const { data: mission, error: missionErr } = await supabase
    .from('missions').insert({
      user_id: userId,
      name: MISSION_NAME,
      name_ar: 'برنامج TBS التجريبي — وسط القاهرة',
      branch_id: branch.id,
      methodology: 'tbs_pilot',
      status: 'completed',
      agent_tier: 'GENERAL',
      questions: JSON.parse(JSON.stringify(TBS_QUESTIONS)),
      number_of_visits: 10,
      purchase_budget_per_visit: 250,
      total_purchase_budget: 2500,
      visits_completed: 10,
      visits_pending: 0,
      budget_used: 2500,
      published_at: new Date().toISOString(),
      is_geo_tagged: false,
    } as never).select('id').single();
  if (missionErr || !mission) return { ok: false, error: missionErr?.message || 'Mission insert failed' };

  // Visits
  const visitsInsert = TBS_VISITS.map((v) => ({
    mission_id: mission.id,
    agent_id: null,
    status: v.status,
    answers: JSON.parse(JSON.stringify(v.answers)),
    purchase_amount: v.purchase_amount,
    scheduled_date: v.scheduled_date,
    scheduled_time: v.scheduled_time,
    scheduled_duration: v.scheduled_duration,
    started_at: v.started_at,
    submitted_at: v.submitted_at,
    client_rating: v.client_rating,
  }));
  const { error: visitErr } = await supabase.from('visits').insert(visitsInsert as never);
  if (visitErr) return { ok: false, error: visitErr.message };

  return {
    ok: true,
    branchesInserted: 1,
    missionsInserted: 1,
    visitsInserted: visitsInsert.length,
  };
}
