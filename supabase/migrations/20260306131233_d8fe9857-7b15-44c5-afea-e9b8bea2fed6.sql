ALTER TABLE visit_duration_pricing ALTER COLUMN currency SET DEFAULT 'EGP';
UPDATE visit_duration_pricing SET currency = 'EGP' WHERE currency = 'SAR';