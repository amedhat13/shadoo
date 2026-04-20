import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface ReportMission {
  id: string;
  name: string;
  name_ar: string | null;
  methodology: string | null;
  status: string;
  questions: any[];
  number_of_visits: number;
  visits_completed: number;
  purchase_budget_per_visit: number;
  total_purchase_budget: number;
  budget_used: number;
  branch_id: string | null;
  created_at: string;
  branch?: { id: string; name: string; name_ar: string | null; city: string; status: string } | null;
}

export interface ReportVisit {
  id: string;
  mission_id: string | null;
  agent_id: string | null;
  status: string | null;
  answers: any;
  purchase_amount: number | null;
  started_at: string | null;
  submitted_at: string | null;
  created_at: string | null;
  client_rating: number | null;
  client_feedback: string | null;
  scheduled_date: string | null;
  rejection_reason: string | null;
}

export interface ReportBranch {
  id: string;
  name: string;
  name_ar: string | null;
  city: string;
  status: string;
}

export function useClientReports() {
  const missionsQuery = useQuery({
    queryKey: ['client-reports-missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('id, name, name_ar, methodology, status, questions, number_of_visits, visits_completed, purchase_budget_per_visit, total_purchase_budget, budget_used, branch_id, created_at, branches(id, name, name_ar, city, status)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((m: any) => ({
        ...m,
        branch: m.branches || null,
      })) as ReportMission[];
    },
  });

  const visitsQuery = useQuery({
    queryKey: ['client-reports-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('id, mission_id, agent_id, status, answers, purchase_amount, started_at, submitted_at, created_at, client_rating, client_feedback, scheduled_date, rejection_reason')
        .in('status', ['submitted', 'approved', 'in_progress', 'pending', 'rejected']);
      if (error) throw error;
      return (data || []) as ReportVisit[];
    },
  });

  const branchesQuery = useQuery({
    queryKey: ['client-reports-branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, name_ar, city, status');
      if (error) throw error;
      return (data || []) as ReportBranch[];
    },
  });

  return {
    missions: missionsQuery.data || [],
    visits: visitsQuery.data || [],
    branches: branchesQuery.data || [],
    isLoading: missionsQuery.isLoading || visitsQuery.isLoading || branchesQuery.isLoading,
  };
}

// Utility functions for methodology calculations
export function getVisitsForMission(visits: ReportVisit[], missionId: string) {
  return visits.filter(v => v.mission_id === missionId && (v.status === 'submitted' || v.status === 'approved'));
}

export function getAnswersForQuestion(visits: ReportVisit[], questionId: string): any[] {
  const results: any[] = [];
  for (const visit of visits) {
    const answers = Array.isArray(visit.answers) ? visit.answers : [];
    for (const a of answers) {
      if (a.question_id === questionId && a.value !== undefined && a.value !== null) {
        results.push(a.value);
      }
    }
  }
  return results;
}

export function calcNPS(answers: number[]): { score: number; promoters: number; passives: number; detractors: number; total: number } {
  if (answers.length === 0) return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };
  const promoters = answers.filter(a => a >= 9).length;
  const passives = answers.filter(a => a >= 7 && a < 9).length;
  const detractors = answers.filter(a => a < 7).length;
  const total = answers.length;
  const score = Math.round(((promoters - detractors) / total) * 100);
  return { score, promoters, passives, detractors, total };
}

export function calcCSAT(answers: number[], maxRating: number = 5): number {
  if (answers.length === 0) return 0;
  const topTwo = answers.filter(a => a >= maxRating - 1).length;
  return Math.round((topTwo / answers.length) * 100);
}

export function calcAverage(answers: number[]): number {
  if (answers.length === 0) return 0;
  return answers.reduce((s, v) => s + v, 0) / answers.length;
}

export function calcTopBox(answers: number[], maxRating: number = 5): number {
  if (answers.length === 0) return 0;
  return Math.round((answers.filter(a => a >= maxRating).length / answers.length) * 100);
}

export function calcTop2Box(answers: number[], maxRating: number = 5): number {
  if (answers.length === 0) return 0;
  return Math.round((answers.filter(a => a >= maxRating - 1).length / answers.length) * 100);
}

export function calcYesPercent(answers: (boolean | string)[]): number {
  if (answers.length === 0) return 0;
  const yesCount = answers.filter(a => a === true || a === 'true' || a === 'yes' || a === 'Yes').length;
  return Math.round((yesCount / answers.length) * 100);
}

// Detect "NPS-like" questions in custom missions: rating 0-10 OR recommend/nps yes/no
export function isNPSLikeQuestion(q: any): 'rating10' | 'recommend_yesno' | null {
  if (!q) return null;
  const id = String(q.id || '').toLowerCase();
  const txt = typeof q.text === 'object' ? `${q.text.en || ''} ${q.text.ar || ''}` : String(q.text || '');
  const txtLower = txt.toLowerCase();
  const isRecommend = id.includes('recommend') || id.includes('nps') || /recommend|نصح|تنصح/.test(txtLower);
  if (q.type === 'rating' && (q.max_rating === 10 || q.max_rating === 11) && isRecommend) return 'rating10';
  if (q.type === 'yes_no' && isRecommend) return 'recommend_yesno';
  return null;
}

// Convert yes/no recommend answers into an NPS-style breakdown.
// Yes = Promoter, No = Detractor (no Passives). Score = %Promoters - %Detractors.
export function calcNPSFromYesNo(answers: (boolean | string)[]): { score: number; promoters: number; detractors: number; total: number; promoterPct: number; detractorPct: number } {
  if (answers.length === 0) return { score: 0, promoters: 0, detractors: 0, total: 0, promoterPct: 0, detractorPct: 0 };
  const promoters = answers.filter(a => a === true || a === 'true' || a === 'yes' || a === 'Yes').length;
  const detractors = answers.length - promoters;
  const total = answers.length;
  const promoterPct = Math.round((promoters / total) * 100);
  const detractorPct = Math.round((detractors / total) * 100);
  return { score: promoterPct - detractorPct, promoters, detractors, total, promoterPct, detractorPct };
}

// Overall Score: average of all rating answers across given questions, normalized to a max.
// Returns score on 0-10 scale (or maxScale provided) and a percent equivalent.
export function calcOverallScore(visits: ReportVisit[], questions: any[], maxScale: number = 10): { score: number; percent: number; count: number; maxScale: number } {
  const ratingQs = (questions || []).filter((q: any) => q.type === 'rating');
  let total = 0;
  let count = 0;
  for (const q of ratingQs) {
    const max = q.max_rating || 5;
    const answers = getAnswersForQuestion(visits, q.id).map(Number).filter(n => !isNaN(n));
    for (const a of answers) {
      total += (a / max) * maxScale; // normalize each answer to maxScale
      count += 1;
    }
  }
  if (count === 0) return { score: 0, percent: 0, count: 0, maxScale };
  const score = Math.round((total / count) * 10) / 10;
  const percent = Math.round((score / maxScale) * 100);
  return { score, percent, count, maxScale };
}

export function calcOptionDistribution(answers: string[], options: string[]): { option: string; count: number; percent: number }[] {
  const total = answers.length;
  return options.map(opt => {
    const count = answers.filter(a => a === opt).length;
    return { option: opt, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
  });
}

export function getRatingDistribution(answers: number[], maxRating: number): { rating: number; count: number }[] {
  const dist: { rating: number; count: number }[] = [];
  for (let i = 1; i <= maxRating; i++) {
    dist.push({ rating: i, count: answers.filter(a => Math.round(a) === i).length });
  }
  return dist;
}

// Identify question roles by position and type for each methodology
export function identifyQuestionRoles(methodology: string, questions: any[]): Record<string, any> {
  const roles: Record<string, any> = {};
  
  const ratingQuestions = questions.filter(q => q.type === 'rating');
  const mcQuestions = questions.filter(q => q.type === 'multiple_choice');
  const textQuestions = questions.filter(q => q.type === 'short_text');
  const yesNoQuestions = questions.filter(q => q.type === 'yes_no');

  switch (methodology) {
    case 'nps':
      if (ratingQuestions[0]) roles.npsQuestion = ratingQuestions[0];
      if (textQuestions[0]) roles.openFeedback = textQuestions[0];
      if (mcQuestions[0]) roles.driverTag = mcQuestions[0];
      break;
    case 'csat':
      if (ratingQuestions[0]) roles.mainCSAT = ratingQuestions[0];
      roles.attributeRatings = ratingQuestions.slice(1);
      if (mcQuestions[0]) roles.driverTag = mcQuestions[0];
      if (yesNoQuestions[0]) roles.problemDetection = yesNoQuestions[0];
      if (mcQuestions[1]) roles.issueClassification = mcQuestions[1];
      break;
    case 'ces':
      if (ratingQuestions[0]) roles.cesQuestion = ratingQuestions[0];
      if (yesNoQuestions[0]) roles.taskCompletion = yesNoQuestions[0];
      if (mcQuestions[0]) roles.frictionPoints = mcQuestions[0];
      if (mcQuestions[1]) roles.issueType = mcQuestions[1];
      break;
    case 'overall_score':
      roles.attributeRatings = ratingQuestions;
      if (textQuestions[0]) roles.comments = textQuestions[0];
      break;
    case 'top_2_box':
      roles.attributeRatings = ratingQuestions;
      if (mcQuestions[0]) roles.driverTag = mcQuestions[0];
      break;
    case 'top_box':
      if (ratingQuestions[0]) roles.mainRating = ratingQuestions[0];
      if (yesNoQuestions[0]) roles.perfectVisit = yesNoQuestions[0];
      if (mcQuestions[0]) roles.preventionFactors = mcQuestions[0];
      if (textQuestions[0]) roles.improvementSuggestion = textQuestions[0];
      break;
    case 'menu_tryout':
      if (ratingQuestions[0]) roles.purchaseIntent = ratingQuestions[0];
      if (ratingQuestions[1]) roles.repeatIntent = ratingQuestions[1];
      if (ratingQuestions[2]) roles.likeability = ratingQuestions[2];
      if (ratingQuestions[3]) roles.uniqueness = ratingQuestions[3];
      if (ratingQuestions[4]) roles.value = ratingQuestions[4];
      if (mcQuestions[0]) roles.portionSize = mcQuestions[0];
      if (yesNoQuestions[0]) roles.qualityIssue = yesNoQuestions[0];
      if (mcQuestions[1]) roles.issueType = mcQuestions[1];
      roles.sensoryRatings = ratingQuestions.slice(5, 9);
      if (textQuestions[0]) roles.improvement = textQuestions[0];
      break;
    case 'buy_and_try':
      if (ratingQuestions[0]) roles.purchaseIntent = ratingQuestions[0];
      if (ratingQuestions[1]) roles.repeatIntent = ratingQuestions[1];
      if (ratingQuestions[2]) roles.satisfaction = ratingQuestions[2];
      if (mcQuestions[0]) roles.expectationGap = mcQuestions[0];
      if (mcQuestions[1]) roles.wouldBuy = mcQuestions[1];
      if (ratingQuestions[3]) roles.easeOfUse = ratingQuestions[3];
      if (yesNoQuestions[0]) roles.qualityIssue = yesNoQuestions[0];
      if (mcQuestions[2]) roles.issueType = mcQuestions[2];
      if (mcQuestions[3]) roles.trustShift = mcQuestions[3];
      if (textQuestions[0]) roles.improvement = textQuestions[0];
      break;
    case 'delivery_cx':
      if (ratingQuestions[0]) roles.overallSatisfaction = ratingQuestions[0];
      roles.attributeRatings = ratingQuestions.slice(1);
      if (yesNoQuestions[0]) roles.orderAccuracy = yesNoQuestions[0];
      if (mcQuestions[0]) roles.timing = mcQuestions[0];
      if (mcQuestions[1]) roles.faultLocation = mcQuestions[1];
      if (mcQuestions[2]) roles.issueType = mcQuestions[2];
      break;
    case 'call_center_cx':
      if (ratingQuestions[0]) roles.supportCSAT = ratingQuestions[0];
      if (yesNoQuestions[0]) roles.fcr = yesNoQuestions[0];
      if (ratingQuestions[1]) roles.cesQuestion = ratingQuestions[1];
      if (yesNoQuestions[1]) roles.repeatInfo = yesNoQuestions[1];
      if (mcQuestions[0]) roles.transfers = mcQuestions[0];
      roles.agentAttributes = ratingQuestions.slice(2, 7);
      if (mcQuestions[1]) roles.emotion = mcQuestions[1];
      if (mcQuestions[2]) roles.contactReason = mcQuestions[2];
      break;
    case 'app_digital_cx':
      if (ratingQuestions[0]) roles.cesQuestion = ratingQuestions[0];
      if (yesNoQuestions[0]) roles.taskCompletion = yesNoQuestions[0];
      if (mcQuestions[0]) roles.frictionPoints = mcQuestions[0];
      if (mcQuestions[1]) roles.issueType = mcQuestions[1];
      if (ratingQuestions[1]) roles.featureSatisfaction = ratingQuestions[1];
      if (ratingQuestions[2]) roles.journeyScore = ratingQuestions[2];
      if (ratingQuestions[3]) roles.trustScore = ratingQuestions[3];
      break;
    case 'in_store_cx':
      if (ratingQuestions[0]) roles.overallScore = ratingQuestions[0];
      if (ratingQuestions[1]) roles.satisfaction = ratingQuestions[1];
      roles.attributeRatings = ratingQuestions.slice(2, 10);
      if (mcQuestions[0]) roles.waitTime = mcQuestions[0];
      if (mcQuestions[1]) roles.issues = mcQuestions[1];
      if (ratingQuestions[10]) roles.returnIntent = ratingQuestions[10];
      break;
  }
  
  return roles;
}

// Get primary score for a mission based on methodology
export function getPrimaryScore(
  methodology: string,
  questions: any[],
  visits: ReportVisit[]
): { score: number; label: string; maxScore: number; benchmark?: string; color?: string } {
  const roles = identifyQuestionRoles(methodology, questions);
  
  switch (methodology) {
    case 'nps': {
      const q = roles.npsQuestion;
      if (!q) return { score: 0, label: 'NPS', maxScore: 100 };
      const answers = getAnswersForQuestion(visits, q.id).map(Number).filter(n => !isNaN(n));
      const { score } = calcNPS(answers);
      const color = score < 0 ? 'text-destructive' : score < 30 ? 'text-amber-500' : score < 50 ? 'text-green-500' : 'text-green-700';
      const benchmark = score >= 70 ? 'World-class' : score >= 50 ? 'Excellent' : score >= 30 ? 'Good' : 'Needs Work';
      return { score, label: 'NPS', maxScore: 100, color, benchmark };
    }
    case 'csat': {
      const q = roles.mainCSAT;
      if (!q) return { score: 0, label: 'CSAT%', maxScore: 100 };
      const answers = getAnswersForQuestion(visits, q.id).map(Number).filter(n => !isNaN(n));
      const score = calcCSAT(answers, q.max_rating || 5);
      const benchmark = score >= 85 ? 'Best-in-class' : score >= 80 ? 'Strong' : score >= 75 ? 'Good' : 'Needs Work';
      return { score, label: 'CSAT%', maxScore: 100, benchmark };
    }
    case 'ces': {
      const q = roles.cesQuestion;
      if (!q) return { score: 0, label: 'CES', maxScore: 7 };
      const answers = getAnswersForQuestion(visits, q.id).map(Number).filter(n => !isNaN(n));
      const score = Math.round(calcAverage(answers) * 10) / 10;
      return { score, label: 'CES', maxScore: q.max_rating || 7 };
    }
    case 'overall_score': {
      const ratings = roles.attributeRatings || [];
      let allAnswers: number[] = [];
      for (const q of ratings) {
        allAnswers.push(...getAnswersForQuestion(visits, q.id).map(Number).filter(n => !isNaN(n)));
      }
      const score = Math.round(calcAverage(allAnswers) * 10) / 10;
      return { score, label: 'Overall', maxScore: 10 };
    }
    case 'top_2_box': {
      const ratings = roles.attributeRatings || [];
      let allAnswers: number[] = [];
      for (const q of ratings) {
        allAnswers.push(...getAnswersForQuestion(visits, q.id).map(Number).filter(n => !isNaN(n)));
      }
      const score = calcTop2Box(allAnswers, 5);
      const benchmark = score >= 80 ? 'Strong' : score >= 70 ? 'Competitive' : 'Needs Work';
      return { score, label: 'T2B%', maxScore: 100, benchmark };
    }
    case 'top_box': {
      const q = roles.mainRating;
      if (!q) return { score: 0, label: 'TB%', maxScore: 100 };
      const answers = getAnswersForQuestion(visits, q.id).map(Number).filter(n => !isNaN(n));
      const score = calcTopBox(answers, q.max_rating || 5);
      const benchmark = score >= 60 ? 'Elite' : score >= 50 ? 'Strong' : 'Needs Work';
      return { score, label: 'TB%', maxScore: 100, benchmark };
    }
    case 'menu_tryout':
    case 'buy_and_try': {
      // LRS / Product Launch Score
      const pi = roles.purchaseIntent;
      const ri = roles.repeatIntent;
      const like = roles.likeability || roles.satisfaction;
      const unique = roles.uniqueness || roles.easeOfUse;
      const val = roles.value;
      const qi = roles.qualityIssue;
      
      let piScore = 0, riScore = 0, likeScore = 0, uniqueScore = 0, valScore = 0, qualScore = 100;
      
      if (pi) {
        const a = getAnswersForQuestion(visits, pi.id).map(Number).filter(n => !isNaN(n));
        piScore = calcTop2Box(a, pi.max_rating || 10);
      }
      if (ri) {
        const a = getAnswersForQuestion(visits, ri.id).map(Number).filter(n => !isNaN(n));
        riScore = calcTop2Box(a, ri.max_rating || 10);
      }
      if (like) {
        const a = getAnswersForQuestion(visits, like.id).map(Number).filter(n => !isNaN(n));
        likeScore = calcCSAT(a, like.max_rating || 5);
      }
      if (unique) {
        const a = getAnswersForQuestion(visits, unique.id).map(Number).filter(n => !isNaN(n));
        uniqueScore = Math.round((calcAverage(a) / (unique.max_rating || 5)) * 100);
      }
      if (val) {
        const a = getAnswersForQuestion(visits, val.id).map(Number).filter(n => !isNaN(n));
        valScore = Math.round((calcAverage(a) / (val.max_rating || 10)) * 100);
      }
      if (qi) {
        const a = getAnswersForQuestion(visits, qi.id);
        const yesRate = calcYesPercent(a);
        qualScore = 100 - yesRate;
      }
      
      const lrs = Math.round(piScore * 0.30 + riScore * 0.25 + likeScore * 0.15 + uniqueScore * 0.10 + valScore * 0.10 + qualScore * 0.10);
      const label = methodology === 'menu_tryout' ? 'LRS' : 'PLS';
      const benchmark = lrs >= 75 ? 'LAUNCH' : lrs >= 60 ? 'ITERATE' : 'KILL/HOLD';
      const color = lrs >= 75 ? 'text-green-600' : lrs >= 60 ? 'text-amber-500' : 'text-destructive';
      return { score: lrs, label, maxScore: 100, benchmark, color };
    }
    default: {
      // Custom or other - average of all ratings
      const ratingQs = questions.filter(q => q.type === 'rating');
      let allAnswers: number[] = [];
      for (const q of ratingQs) {
        allAnswers.push(...getAnswersForQuestion(visits, q.id).map(Number).filter(n => !isNaN(n)));
      }
      if (allAnswers.length === 0) return { score: 0, label: 'Score', maxScore: 10 };
      const maxR = Math.max(...ratingQs.map(q => q.max_rating || 5));
      const score = Math.round(calcAverage(allAnswers) * 10) / 10;
      return { score, label: 'Avg', maxScore: maxR };
    }
  }
}
