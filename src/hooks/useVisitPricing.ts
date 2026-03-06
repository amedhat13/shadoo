import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VisitDurationPricing {
  id: string;
  tier_code: string;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useVisitPricing(tierCode?: string) {
  return useQuery({
    queryKey: ['visit-pricing', tierCode],
    queryFn: async () => {
      let query = supabase
        .from('visit_duration_pricing' as any)
        .select('*')
        .eq('is_active', true)
        .order('tier_code')
        .order('duration_minutes');

      if (tierCode) {
        query = query.eq('tier_code', tierCode);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as VisitDurationPricing[];
    },
  });
}

export function useUpdateVisitPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await supabase
        .from('visit_duration_pricing' as any)
        .update({ price, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit-pricing'] });
      toast.success('Price updated');
    },
    onError: (e) => toast.error('Failed to update price: ' + e.message),
  });
}

export function useCreateVisitPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { tier_code: string; duration_minutes: number; price: number }) => {
      const { error } = await supabase
        .from('visit_duration_pricing' as any)
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit-pricing'] });
      toast.success('Duration added');
    },
    onError: (e) => toast.error('Failed to add: ' + e.message),
  });
}

export function useDeleteVisitPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('visit_duration_pricing' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit-pricing'] });
      toast.success('Duration removed');
    },
    onError: (e) => toast.error('Failed to remove: ' + e.message),
  });
}

export function lookupVisitPrice(
  pricing: VisitDurationPricing[],
  tierCode: string,
  durationMinutes: number
): number | null {
  const match = pricing.find(
    p => p.tier_code === tierCode && p.duration_minutes === durationMinutes
  );
  return match ? match.price : null;
}
