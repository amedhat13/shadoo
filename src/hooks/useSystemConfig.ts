import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Cities & Districts
interface DbCity {
  id: string;
  code: string;
  name: string;
  name_ar: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface DbDistrict {
  id: string;
  city_id: string;
  code: string;
  name: string;
  name_ar: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// Notification templates
interface DbNotificationTemplate {
  id: string;
  template_key: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  subject: string;
  subject_ar: string | null;
  body: string;
  body_ar: string | null;
  channel: string;
  is_active: boolean;
  variables: any;
  created_at: string;
  updated_at: string;
}

// System config
interface DbSystemConfig {
  id: string;
  config_key: string;
  config_value: any;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export function useSystemConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Cities ──
  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as DbCity[];
    },
  });

  const createCity = useMutation({
    mutationFn: async (city: { code: string; name: string; name_ar?: string; sort_order?: number }) => {
      const { error } = await supabase.from('cities').insert(city);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      toast({ title: 'City added' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to add city', variant: 'destructive' }),
  });

  const updateCity = useMutation({
    mutationFn: async ({ id, ...data }: Partial<DbCity> & { id: string }) => {
      const { error } = await supabase.from('cities').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      toast({ title: 'City updated' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update city', variant: 'destructive' }),
  });

  const deleteCity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      toast({ title: 'City deleted' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete city. It may have districts.', variant: 'destructive' }),
  });

  // ── Districts ──
  const { data: districts = [], isLoading: districtsLoading } = useQuery({
    queryKey: ['admin-districts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as DbDistrict[];
    },
  });

  const createDistrict = useMutation({
    mutationFn: async (district: { city_id: string; code: string; name: string; name_ar?: string; sort_order?: number }) => {
      const { error } = await supabase.from('districts').insert(district);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
      toast({ title: 'District added' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to add district', variant: 'destructive' }),
  });

  const updateDistrict = useMutation({
    mutationFn: async ({ id, ...data }: Partial<DbDistrict> & { id: string }) => {
      const { error } = await supabase.from('districts').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
      toast({ title: 'District updated' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update district', variant: 'destructive' }),
  });

  const deleteDistrict = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('districts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-districts'] });
      toast({ title: 'District deleted' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete district', variant: 'destructive' }),
  });

  // ── Notification Templates ──
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['admin-notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at');
      if (error) throw error;
      return data as DbNotificationTemplate[];
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: Partial<DbNotificationTemplate> & { id: string }) => {
      const { error } = await supabase.from('notification_templates').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notification-templates'] });
      toast({ title: 'Template updated' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update template', variant: 'destructive' }),
  });

  // ── System Config (feature flags, maintenance) ──
  const { data: configs = [], isLoading: configsLoading } = useQuery({
    queryKey: ['admin-system-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .order('config_key');
      if (error) throw error;
      return data as DbSystemConfig[];
    },
  });

  const updateConfig = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('system_config')
        .update({ config_value: value })
        .eq('config_key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-config'] });
      toast({ title: 'Configuration saved' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to save configuration', variant: 'destructive' }),
  });

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.config_key === key);
    return config?.config_value || {};
  };

  return {
    // Cities
    cities, citiesLoading,
    createCity: createCity.mutateAsync,
    updateCity: updateCity.mutateAsync,
    deleteCity: deleteCity.mutateAsync,
    // Districts
    districts, districtsLoading,
    createDistrict: createDistrict.mutateAsync,
    updateDistrict: updateDistrict.mutateAsync,
    deleteDistrict: deleteDistrict.mutateAsync,
    // Notification templates
    templates, templatesLoading,
    updateTemplate: updateTemplate.mutateAsync,
    // System config
    configs, configsLoading,
    updateConfig: updateConfig.mutateAsync,
    getConfigValue,
  };
}
