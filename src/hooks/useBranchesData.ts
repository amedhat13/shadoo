import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Branch, BranchStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DbBranch {
  id: string;
  user_id: string;
  name: string;
  address: string;
  city: string;
  district: string | null;
  google_maps_link: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbBranchToBranch(dbBranch: DbBranch): Branch {
  return {
    id: dbBranch.id,
    name: dbBranch.name,
    address: dbBranch.address,
    city: dbBranch.city,
    district: dbBranch.district || undefined,
    google_maps_link: dbBranch.google_maps_link,
    latitude: dbBranch.latitude || undefined,
    longitude: dbBranch.longitude || undefined,
    status: dbBranch.status as BranchStatus,
    rejection_reason: dbBranch.rejection_reason || undefined,
    created_at: dbBranch.created_at,
    updated_at: dbBranch.updated_at,
  };
}

export function useBranchesData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all branches
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapDbBranchToBranch);
    },
  });

  // Create branch
  const createBranchMutation = useMutation({
    mutationFn: async (data: Omit<Branch, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: branch, error } = await supabase
        .from('branches')
        .insert({
          user_id: user.id,
          name: data.name,
          address: data.address,
          city: data.city,
          district: data.district,
          google_maps_link: data.google_maps_link,
          latitude: data.latitude,
          longitude: data.longitude,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbBranchToBranch(branch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Branch created',
        description: 'Your branch has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create branch. Please try again.',
        variant: 'destructive',
      });
      console.error('Create branch error:', error);
    },
  });

  // Update branch
  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Branch> }) => {
      const { error } = await supabase
        .from('branches')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });

  // Delete branch
  const deleteBranchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Branch deleted',
        description: 'The branch has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete branch. It may have associated missions.',
        variant: 'destructive',
      });
      console.error('Delete branch error:', error);
    },
  });

  return {
    branches,
    isLoading,
    createBranch: createBranchMutation.mutateAsync,
    updateBranch: (id: string, data: Partial<Branch>) => 
      updateBranchMutation.mutateAsync({ id, data }),
    deleteBranch: deleteBranchMutation.mutateAsync,
  };
}
