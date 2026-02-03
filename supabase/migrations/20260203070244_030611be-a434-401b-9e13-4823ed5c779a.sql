-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  google_maps_link TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending_verification',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for branches
CREATE POLICY "Users can view their own branches"
  ON public.branches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own branches"
  ON public.branches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branches"
  ON public.branches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branches"
  ON public.branches FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at on branches
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  agent_tier TEXT NOT NULL DEFAULT 'C',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  photo_requirements JSONB NOT NULL DEFAULT '{"required_count": 0}'::jsonb,
  number_of_visits INTEGER NOT NULL DEFAULT 0,
  purchase_budget_per_visit NUMERIC NOT NULL DEFAULT 0,
  purchase_item_name TEXT,
  total_purchase_budget NUMERIC NOT NULL DEFAULT 0,
  visits_completed INTEGER NOT NULL DEFAULT 0,
  visits_pending INTEGER NOT NULL DEFAULT 0,
  budget_used NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for missions
CREATE POLICY "Users can view their own missions"
  ON public.missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions"
  ON public.missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions"
  ON public.missions FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at on missions
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_missions_user_id ON public.missions(user_id);
CREATE INDEX idx_missions_branch_id ON public.missions(branch_id);
CREATE INDEX idx_missions_status ON public.missions(status);
CREATE INDEX idx_branches_user_id ON public.branches(user_id);