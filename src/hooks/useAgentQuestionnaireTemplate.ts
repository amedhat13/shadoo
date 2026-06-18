import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AgentQuestionOption {
  en: string;
  ar?: string;
}

export interface AgentQuestion {
  id: string;
  type: 'select' | 'multiselect' | string;
  label: { en: string; ar?: string };
  options: AgentQuestionOption[];
  required?: boolean;
}

/**
 * Loads the `agent_registration_questionnaire` template so the same questions
 * (age group, gender, area, education, income, industry, spending style,
 * transport, tech comfort, mission interests, availability, etc.) can drive
 * tier definitions and mission custom-tiering filters.
 */
export function useAgentQuestionnaireTemplate() {
  return useQuery({
    queryKey: ['agent-questionnaire-template'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AgentQuestion[]> => {
      const { data, error } = await supabase
        .from('question_templates')
        .select('questions')
        .eq('name', 'agent_registration_questionnaire')
        .maybeSingle();
      if (error) throw error;
      const raw = (data?.questions as unknown as AgentQuestion[]) || [];
      return raw.filter(q => Array.isArray(q.options) && q.options.length > 0);
    },
  });
}
