import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ReportPin {
  id: string;
  user_id: string;
  question_key: string;
  label: string;
  label_ar: string | null;
  sort_order: number;
}

/**
 * Questions pinned to the Reports overview.
 * Pass `ownerId` to read another account's pins (admin per-client view).
 */
export function useReportPins(ownerId?: string) {
  const { user } = useAuth();
  const effectiveOwner = ownerId ?? user?.id ?? null;
  const queryClient = useQueryClient();
  const canEdit = !ownerId || ownerId === user?.id;

  const query = useQuery({
    queryKey: ['report-pins', effectiveOwner],
    enabled: !!effectiveOwner,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_pins')
        .select('*')
        .eq('user_id', effectiveOwner as string)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as ReportPin[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['report-pins'] });

  const pin = useMutation({
    mutationFn: async (input: { question_key: string; label: string; label_ar?: string | null }) => {
      if (!effectiveOwner) throw new Error('Not signed in');
      const { error } = await supabase.from('report_pins').upsert(
        {
          user_id: effectiveOwner,
          question_key: input.question_key,
          label: input.label,
          label_ar: input.label_ar ?? null,
          sort_order: (query.data?.length ?? 0) + 1,
        },
        { onConflict: 'user_id,question_key' },
      );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const unpin = useMutation({
    mutationFn: async (questionKey: string) => {
      if (!effectiveOwner) throw new Error('Not signed in');
      const { error } = await supabase
        .from('report_pins')
        .delete()
        .eq('user_id', effectiveOwner)
        .eq('question_key', questionKey);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const isPinned = (questionKey: string) => (query.data || []).some(p => p.question_key === questionKey);

  const toggle = (input: { question_key: string; label: string; label_ar?: string | null }) => {
    if (isPinned(input.question_key)) unpin.mutate(input.question_key);
    else pin.mutate(input);
  };

  return {
    pins: query.data || [],
    isLoading: query.isLoading,
    canEdit,
    isPinned,
    pin,
    unpin,
    toggle,
  };
}
