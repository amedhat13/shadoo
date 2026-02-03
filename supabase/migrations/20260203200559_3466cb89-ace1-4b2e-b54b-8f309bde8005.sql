-- Add is_geo_tagged column to missions table
ALTER TABLE public.missions 
ADD COLUMN is_geo_tagged BOOLEAN NOT NULL DEFAULT false;