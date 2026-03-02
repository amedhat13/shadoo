import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  visits_per_month: number;
  currency: string;
  billing_period: string;
  features: any;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface PlanInput {
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  price: number;
  visits_per_month: number;
  currency?: string;
  billing_period?: string;
  features?: string[];
  is_active?: boolean;
  sort_order?: number;
}

export function useSubscriptionPlans() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as unknown as SubscriptionPlan[];
    },
  });

  const createPlan = useMutation({
    mutationFn: async (input: PlanInput) => {
      const { error } = await supabase.from('subscription_plans').insert({
        name: input.name,
        name_ar: input.name_ar || null,
        description: input.description || null,
        description_ar: input.description_ar || null,
        price: input.price,
        visits_per_month: input.visits_per_month,
        currency: input.currency || 'EGP',
        billing_period: input.billing_period || 'monthly',
        features: input.features || [],
        is_active: input.is_active ?? true,
        sort_order: input.sort_order ?? plans.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast({ title: 'Plan created' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create plan', variant: 'destructive' }),
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...data }: Partial<PlanInput> & { id: string }) => {
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.name_ar !== undefined) payload.name_ar = data.name_ar || null;
      if (data.description !== undefined) payload.description = data.description || null;
      if (data.description_ar !== undefined) payload.description_ar = data.description_ar || null;
      if (data.price !== undefined) payload.price = data.price;
      if (data.visits_per_month !== undefined) payload.visits_per_month = data.visits_per_month;
      if (data.currency !== undefined) payload.currency = data.currency;
      if (data.billing_period !== undefined) payload.billing_period = data.billing_period;
      if (data.features !== undefined) payload.features = data.features;
      if (data.is_active !== undefined) payload.is_active = data.is_active;
      if (data.sort_order !== undefined) payload.sort_order = data.sort_order;
      const { error } = await supabase.from('subscription_plans').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast({ title: 'Plan updated' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update plan', variant: 'destructive' }),
  });

  const activePlans = plans.filter(p => p.is_active);
  const totalSubscribers = 0; // Would need a join query in real usage

  return {
    plans,
    isLoading,
    activePlans,
    createPlan: createPlan.mutateAsync,
    updatePlan: updatePlan.mutateAsync,
    isCreating: createPlan.isPending,
    isUpdating: updatePlan.isPending,
  };
}
