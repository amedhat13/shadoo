
-- Clean up T-Lab demo data: keep only 2 verified branches (The Yard, Arabella) and 2 missions

-- 1. Delete duplicate Arabella mission (and its visits) — keep canonical one with branch 74258ceb
DELETE FROM public.visits WHERE mission_id = '47dfa80a-1111-4222-8333-444455556666';
DELETE FROM public.missions WHERE id = '47dfa80a-1111-4222-8333-444455556666';

-- 2. Delete all leftover test/validation missions for T-Lab user (and their visits)
DELETE FROM public.visits WHERE mission_id IN (
  SELECT m.id FROM public.missions m
  JOIN public.profiles p ON p.user_id = m.user_id
  WHERE p.company_name ILIKE '%t-lab%'
    AND m.id NOT IN ('47dfa80a-4bdf-4c0e-96e8-24904b74b370', 'e72323db-1545-4035-8c77-ce8e9b47ac02')
);
DELETE FROM public.missions
WHERE user_id IN (SELECT user_id FROM public.profiles WHERE company_name ILIKE '%t-lab%')
  AND id NOT IN ('47dfa80a-4bdf-4c0e-96e8-24904b74b370', 'e72323db-1545-4035-8c77-ce8e9b47ac02');

-- 3. Delete all T-Lab branches that are NOT one of the 2 canonical branches
DELETE FROM public.branches
WHERE user_id IN (SELECT user_id FROM public.profiles WHERE company_name ILIKE '%t-lab%')
  AND id NOT IN ('74258ceb-35e1-4510-bd1d-d4f0fa1c04e0', '10ee937e-ccf1-4e76-9e3d-60bc47548fb8');

-- 4. Ensure the 2 canonical branches are verified
UPDATE public.branches
SET status = 'verified', updated_at = now()
WHERE id IN ('74258ceb-35e1-4510-bd1d-d4f0fa1c04e0', '10ee937e-ccf1-4e76-9e3d-60bc47548fb8');
