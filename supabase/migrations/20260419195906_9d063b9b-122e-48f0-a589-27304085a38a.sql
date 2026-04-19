-- Delete visits from duplicate T-Lab missions (keep e72323db for Yard, 47dfa80a for Arabella)
DELETE FROM public.visits WHERE mission_id IN ('9e6c5837-aa23-4811-bc33-87ab02c42a51', '2bbe1b0d-81c7-47ae-b7fe-3ac6080fb513');
-- Delete the duplicate missions themselves
DELETE FROM public.missions WHERE id IN ('9e6c5837-aa23-4811-bc33-87ab02c42a51', '2bbe1b0d-81c7-47ae-b7fe-3ac6080fb513');
-- Delete obsolete "Mission test" missions and their visits
DELETE FROM public.visits WHERE mission_id IN (SELECT id FROM public.missions WHERE name LIKE 'Mission test%');
DELETE FROM public.missions WHERE name LIKE 'Mission test%';