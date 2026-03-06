import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Question } from '@/types';

export interface QuestionTemplate {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  category: string | null;
  methodology: string | null;
  questions: Question[];
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateTemplateInput {
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  category?: string;
  methodology?: string;
  questions: Question[];
  is_public?: boolean;
}

export const METHODOLOGY_CATEGORIES = [
  'NPS', 'CSAT', 'CES', 'Overall Score',
  'Top 2 Box', 'Top Box', 'Menu Try-Out', 'Buy & Try',
  'Delivery CX', 'Call Center CX', 'App/Digital CX', 'In-Store CX',
  'Custom'
] as const;

export const METHODOLOGY_KEYS: Record<string, string> = {
  'NPS': 'nps',
  'CSAT': 'csat',
  'CES': 'ces',
  'Overall Score': 'overall_score',
  'Top 2 Box': 'top_2_box',
  'Top Box': 'top_box',
  'Menu Try-Out': 'menu_tryout',
  'Buy & Try': 'buy_and_try',
  'Delivery CX': 'delivery_cx',
  'Call Center CX': 'call_center_cx',
  'App/Digital CX': 'app_digital_cx',
  'In-Store CX': 'in_store_cx',
  'Custom': 'custom',
};

export const TEMPLATE_GROUPS = {
  core: { key: 'core_cx_methodologies', categories: ['NPS', 'CSAT', 'CES', 'Overall Score', 'Top 2 Box', 'Top Box'] },
  product: { key: 'product_intelligence', categories: ['Menu Try-Out', 'Buy & Try'] },
  channel: { key: 'channel_specific_cx', categories: ['Delivery CX', 'Call Center CX', 'App/Digital CX', 'In-Store CX'] },
  custom: { key: 'custom', categories: ['Custom'] },
};

export function useQuestionTemplates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['question-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(d => ({
        ...d,
        questions: (d.questions || []) as Question[],
        is_public: d.is_public ?? true,
        methodology: d.methodology || null,
      })) as QuestionTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('question_templates').insert({
        name: input.name,
        name_ar: input.name_ar || null,
        description: input.description || null,
        description_ar: input.description_ar || null,
        category: input.category || null,
        questions: input.questions as any,
        is_public: input.is_public ?? true,
        created_by: user?.id || null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-templates'] });
      toast({ title: 'Template created' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create template', variant: 'destructive' }),
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateTemplateInput> & { id: string }) => {
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.name_ar !== undefined) payload.name_ar = data.name_ar || null;
      if (data.description !== undefined) payload.description = data.description || null;
      if (data.description_ar !== undefined) payload.description_ar = data.description_ar || null;
      if (data.category !== undefined) payload.category = data.category || null;
      if (data.methodology !== undefined) payload.methodology = data.methodology || null;
      if (data.questions !== undefined) payload.questions = data.questions as any;
      if (data.is_public !== undefined) payload.is_public = data.is_public;
      const { error } = await supabase.from('question_templates').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-templates'] });
      toast({ title: 'Template updated' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update template', variant: 'destructive' }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('question_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-templates'] });
      toast({ title: 'Template deleted' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' }),
  });

  const categoryStats = templates.reduce((acc, t) => {
    const cat = t.category || 'Custom';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    templates,
    isLoading,
    categoryStats,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
}
