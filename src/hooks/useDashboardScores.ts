import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calcNPS, calcNPSFromYesNo, calcOverallScore, isNPSLikeQuestion, getAnswersForQuestion } from './useClientReports';

export interface DashboardScores {
  nps: number | null;
  npsTotal: number;
  overallScore: number; // 0-10
  overallPercent: number;
  ratingsCount: number;
}

export function useDashboardScores() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  return useQuery({
    queryKey: ['dashboard-scores', userId],
    enabled: !!userId,
    queryFn: async (): Promise<DashboardScores> => {
      const { data: missions } = await supabase
        .from('missions')
        .select('id, questions')
        .eq('user_id', userId!);
      const missionIds = (missions || []).map((m: any) => m.id);
      if (missionIds.length === 0) {
        return { nps: null, npsTotal: 0, overallScore: 0, overallPercent: 0, ratingsCount: 0 };
      }
      const { data: visits } = await supabase
        .from('visits')
        .select('id, mission_id, answers, status')
        .in('mission_id', missionIds)
        .eq('status', 'approved');

      const allVisits = (visits || []) as any[];
      const allQuestions: any[] = [];
      for (const m of missions || []) {
        const qs = Array.isArray((m as any).questions) ? (m as any).questions : [];
        allQuestions.push(...qs);
      }

      // NPS — find first NPS-like question, gather its answers
      const npsQ = allQuestions.find(isNPSLikeQuestion);
      let nps: number | null = null;
      let npsTotal = 0;
      if (npsQ) {
        const kind = isNPSLikeQuestion(npsQ);
        const raw = getAnswersForQuestion(allVisits, npsQ.id);
        if (kind === 'rating10') {
          const nums = raw.map(Number).filter((n) => !isNaN(n));
          const r = calcNPS(nums);
          nps = r.score;
          npsTotal = r.total;
        } else if (kind === 'recommend_yesno') {
          const r = calcNPSFromYesNo(raw as any);
          nps = r.score;
          npsTotal = r.total;
        }
      }

      const overall = calcOverallScore(allVisits, allQuestions, 10);
      return {
        nps,
        npsTotal,
        overallScore: overall.score,
        overallPercent: overall.percent,
        ratingsCount: overall.count,
      };
    },
  });
}
