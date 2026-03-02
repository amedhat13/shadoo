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
  questions: Question[];
  is_public?: boolean;
}

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
      });
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
