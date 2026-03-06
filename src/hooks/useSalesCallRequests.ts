import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SalesCallRequest {
  id: string;
  user_id: string;
  current_plan: string | null;
  request_type: string;
  preferred_time: string | null;
  phone_number: string | null;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export function useSalesCallRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['sales-call-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_call_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SalesCallRequest[];
    },
    enabled: !!user,
  });

  const submitRequest = useMutation({
    mutationFn: async (req: {
      current_plan: string;
      request_type: string;
      preferred_time: string;
      phone_number: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('sales_call_requests' as any)
        .insert({
          user_id: user.id,
          current_plan: req.current_plan,
          request_type: req.request_type,
          preferred_time: req.preferred_time,
          phone_number: req.phone_number,
          notes: req.notes || null,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-call-requests'] });
    },
  });

  return {
    requests,
    isLoading,
    submitRequest: submitRequest.mutateAsync,
    isSubmitting: submitRequest.isPending,
  };
}

export function useAdminSalesCallRequests() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-sales-call-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_call_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SalesCallRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const updates: any = { status };
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      if (status === 'resolved') updates.resolved_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('sales_call_requests' as any)
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sales-call-requests'] });
    },
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return {
    requests,
    isLoading,
    updateStatus: updateStatus.mutateAsync,
    pendingCount,
  };
}
