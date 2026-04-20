import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, ReferenceLine,
} from 'recharts';
import {
  getAnswersForQuestion,
  getPrimaryScore,
  calcNPS,
  calcCSAT,
  calcAverage,
  calcTop2Box,
  calcTopBox,
  calcYesPercent,
  identifyQuestionRoles,
  calcOverallScore,
  ReportMission,
  ReportVisit,
} from '@/hooks/useClientReports';

const COLORS = ['#F97316', '#22C55E', '#F59E0B', '#06B6D4', '#A855F7', '#EF4444', '#6366F1', '#14B8A6'];
const METHODOLOGY_LABELS: Record<string, string> = {
  nps: 'NPS', csat: 'CSAT', ces: 'CES', overall_score: 'Overall Score',
  top_2_box: 'Top 2 Box', top_box: 'Top Box', menu_tryout: 'Menu Try-Out',
  buy_and_try: 'Buy & Try', delivery_cx: 'Delivery CX', call_center_cx: 'Call Center CX',
  app_digital_cx: 'App/Digital CX', in_store_cx: 'In-Store CX', custom: 'Custom',
};

interface BranchComparisonTabProps {
  missions: ReportMission[];
  visits: ReportVisit[];
  branches: any[];
  allVisits: ReportVisit[];
  language: string;
}

function getVisitBranchId(visit: any, missions: ReportMission[]): string | null {
  if (visit.branch_id) return visit.branch_id;
  const mission = missions.find(m => m.id === visit.mission_id);
  return mission?.branch_id || null;
}

function calcBranchScore(methodology: string, questions: any[], branchVisits: ReportVisit[]): { score: number; label: string } {
  if (branchVisits.length === 0) return { score: 0, label: '-' };
  const result = getPrimaryScore(methodology, questions, branchVisits);
  return { score: result.score, label: `${result.score}` };
}

export function BranchComparisonTab({ missions, visits, branches, allVisits, language }: BranchComparisonTabProps) {
  const { t } = useTranslation('reports');
  const verifiedBranches = branches.filter(b => b.status === 'verified');
  
  const [selectedMissionId, setSelectedMissionId] = useState<string>('all');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>(verifiedBranches.map(b => b.id));

  const selectedMission = useMemo(() => {
    if (selectedMissionId === 'all') return null;
    return missions.find(m => m.id === selectedMissionId) || null;
  }, [selectedMissionId, missions]);

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds(prev =>
      prev.includes(branchId) ? prev.filter(id => id !== branchId) : [...prev, branchId]
    );
  };

  const toggleAll = () => {
    if (selectedBranchIds.length === verifiedBranches.length) {
      setSelectedBranchIds([]);
    } else {
      setSelectedBranchIds(verifiedBranches.map(b => b.id));
    }
  };

  const branchVisitsMap = useMemo(() => {
    const map: Record<string, ReportVisit[]> = {};
    verifiedBranches.forEach(b => { map[b.id] = []; });

    const relevantVisits = selectedMission
      ? allVisits.filter(v => v.mission_id === selectedMission.id && (v.status === 'submitted' || v.status === 'approved'))
      : allVisits.filter(v => v.status === 'submitted' || v.status === 'approved');

    relevantVisits.forEach(v => {
      const branchId = getVisitBranchId(v, missions);
      if (branchId && map[branchId]) {
        map[branchId].push(v);
      }
    });
    return map;
  }, [selectedMission, allVisits, missions, verifiedBranches]);

  const activeBranches = verifiedBranches.filter(b => selectedBranchIds.includes(b.id));
  const hasEnoughBranches = activeBranches.length >= 2;

  // Aggregate questions across all selected missions, deduped by id (so the same
  // question reused in multiple branch missions only appears once in the comparison)
  const aggregatedQuestions = useMemo(() => {
    const sourceMissions = selectedMission ? [selectedMission] : missions;
    const seen = new Map<string, any>();
    sourceMissions.forEach(m => {
      (m.questions || []).forEach((q: any) => {
        if (!q?.id) return;
        if (!seen.has(q.id)) seen.set(q.id, q);
      });
    });
    return Array.from(seen.values());
  }, [selectedMission, missions]);

  // Effective methodology for the branch primary score. When comparing across
  // missions with different methodologies we fall back to 'custom' (avg ratings).
  const effectiveMethodology = useMemo(() => {
    if (selectedMission) return selectedMission.methodology || 'custom';
    const set = new Set(missions.map(m => m.methodology || 'custom'));
    if (set.size === 1) return Array.from(set)[0];
    return 'custom';
  }, [selectedMission, missions]);



  const scoreComparisonData = useMemo(() => {
    if (!hasEnoughBranches) return null;
    const methodology = effectiveMethodology;

    const data = activeBranches.map(branch => {
      const bVisits = branchVisitsMap[branch.id] || [];
      const result = calcBranchScore(methodology, aggregatedQuestions, bVisits);
      return {
        name: language === 'ar' && branch.name_ar ? branch.name_ar : branch.name,
        branchId: branch.id,
        score: result.score,
        visits: bVisits.length,
      };
    });

    const allScores = data.filter(d => d.visits > 0).map(d => d.score);
    const average = allScores.length > 0 ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length * 10) / 10 : 0;
    const label = METHODOLOGY_LABELS[methodology] || methodology;
    const titleSuffix = selectedMission
      ? (language === 'ar' && selectedMission.name_ar ? selectedMission.name_ar : selectedMission.name)
      : t('branch_comparison.all_missions', { defaultValue: 'All Missions' });

    return { data, average, methodology, label, titleSuffix };
  }, [selectedMission, activeBranches, branchVisitsMap, language, hasEnoughBranches, effectiveMethodology, aggregatedQuestions, t]);

  const questionComparison = useMemo(() => {
    if (!hasEnoughBranches) return null;
    const questions = aggregatedQuestions.filter((q: any) => q.type !== 'short_text');
    if (questions.length === 0) return null;

    return questions.map((q: any) => {
      const qText = typeof q.text === 'object' ? (language === 'ar' ? q.text.ar : q.text.en) : q.text;
      const branchResults = activeBranches.map(branch => {
        const bVisits = branchVisitsMap[branch.id] || [];
        const answers = getAnswersForQuestion(bVisits, q.id);
        const branchName = language === 'ar' && branch.name_ar ? branch.name_ar : branch.name;

        if (q.type === 'rating') {
          const nums = answers.map(Number).filter(n => !isNaN(n));
          const avg = nums.length > 0 ? Math.round(calcAverage(nums) * 10) / 10 : 0;
          return { branchName, branchId: branch.id, value: avg, count: nums.length, maxRating: q.max_rating || 5 };
        }
        if (q.type === 'yes_no') {
          return { branchName, branchId: branch.id, value: answers.length > 0 ? calcYesPercent(answers) : 0, count: answers.length, maxRating: 100 };
        }
        if (q.type === 'multiple_choice') {
          const optTexts = (q.options || []).map((o: any) => typeof o.text === 'object' ? (language === 'ar' ? o.text.ar : o.text.en) : o.text);
          const optValues = (q.options || []).map((o: any) => typeof o.text === 'object' ? o.text.en : o.text);
          const total = answers.length;
          const dist = optValues.map((ov: string, i: number) => ({
            option: optTexts[i],
            count: answers.filter(a => a === ov || a === optTexts[i]).length,
            percent: total > 0 ? Math.round((answers.filter(a => a === ov || a === optTexts[i]).length / total) * 100) : 0,
          }));
          return { branchName, branchId: branch.id, value: 0, count: total, maxRating: 0, distribution: dist };
        }
        return { branchName, branchId: branch.id, value: 0, count: 0, maxRating: 0 };
      });

      const allValues = branchResults.filter(r => r.count > 0 && !('distribution' in r)).map(r => r.value);
      const average = allValues.length > 0 ? Math.round(allValues.reduce((s, v) => s + v, 0) / allValues.length * 10) / 10 : 0;

      return { question: q, questionText: qText, branchResults, average };
    });
  }, [activeBranches, branchVisitsMap, language, hasEnoughBranches, aggregatedQuestions]);

  const rankingData = useMemo(() => {
    return activeBranches.map((branch, _i) => {
      const bVisits = branchVisitsMap[branch.id] || [];
      const branchName = language === 'ar' && branch.name_ar ? branch.name_ar : branch.name;

      let primaryScoreText = '-';
      let primaryScoreValue = 0;
      if (bVisits.length > 0) {
        const result = getPrimaryScore(effectiveMethodology, aggregatedQuestions, bVisits);
        primaryScoreText = `${result.score} (${METHODOLOGY_LABELS[effectiveMethodology] || effectiveMethodology})`;
        primaryScoreValue = result.score;
      }

      // Overall Score: avg of all rating answers normalized to 0-10
      const overall = calcOverallScore(bVisits, aggregatedQuestions, 10);

      const branchMissions = missions.filter(m => m.branch_id === branch.id);
      const totalPlanned = branchMissions.reduce((s, m) => s + m.number_of_visits, 0);
      const totalCompleted = bVisits.length;
      const completionRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

      const responseTimes = bVisits
        .filter(v => v.started_at && v.submitted_at)
        .map(v => (new Date(v.submitted_at!).getTime() - new Date(v.started_at!).getTime()) / (1000 * 60 * 60));
      const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length * 10) / 10
        : 0;

      return {
        branchId: branch.id,
        name: branchName,
        city: branch.city,
        primaryScoreText,
        primaryScoreValue,
        overallScore: overall.score,
        overallPercent: overall.percent,
        overallCount: overall.count,
        totalVisits: totalCompleted,
        completionRate,
        avgResponseTime,
      };
    }).sort((a, b) => b.primaryScoreValue - a.primaryScoreValue);
  }, [activeBranches, branchVisitsMap, missions, language, effectiveMethodology, aggregatedQuestions]);

  const operationalSummary = useMemo(() => {
    const withData = activeBranches.filter(b => (branchVisitsMap[b.id] || []).length > 0);
    if (withData.length === 0) return null;

    const bestCompletion = rankingData.length > 0
      ? [...rankingData].sort((a, b) => b.completionRate - a.completionRate)[0]
      : null;
    const fastestResponse = rankingData.filter(r => r.avgResponseTime > 0).length > 0
      ? [...rankingData].filter(r => r.avgResponseTime > 0).sort((a, b) => a.avgResponseTime - b.avgResponseTime)[0]
      : null;

    return { branchesWithData: withData.length, bestCompletion, fastestResponse };
  }, [activeBranches, branchVisitsMap, rankingData]);

  if (verifiedBranches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t('branch_comparison.empty_state', { defaultValue: 'Create missions and assign them to branches to start comparing.' })}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              {t('branch_comparison.select_mission', { defaultValue: 'Select Mission' })}
            </label>
            <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
              <SelectTrigger className="w-full sm:w-96">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('branch_comparison.all_missions', { defaultValue: 'All Missions' })}</SelectItem>
                {missions.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex items-center gap-2">
                      {language === 'ar' && m.name_ar ? m.name_ar : m.name}
                      {m.methodology && m.methodology !== 'custom' && (
                        <Badge variant="outline" className="text-[10px] ml-1">{METHODOLOGY_LABELS[m.methodology] || m.methodology}</Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('branch_comparison.select_branches', { defaultValue: 'Select Branches' })}
              </label>
              <span className="text-xs text-muted-foreground">
                {t('branch_comparison.branches_selected', { count: selectedBranchIds.length, total: verifiedBranches.length, defaultValue: `${selectedBranchIds.length} of ${verifiedBranches.length} branches selected` })}
              </span>
            </div>
            <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  checked={selectedBranchIds.length === verifiedBranches.length}
                  onCheckedChange={toggleAll}
                  id="select-all-branches"
                />
                <label htmlFor="select-all-branches" className="text-sm font-medium cursor-pointer">
                  {t('branch_comparison.select_all', { defaultValue: 'Select All' })}
                </label>
              </div>
              {verifiedBranches.map(branch => (
                <div key={branch.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedBranchIds.includes(branch.id)}
                    onCheckedChange={() => toggleBranch(branch.id)}
                    id={`branch-${branch.id}`}
                  />
                  <label htmlFor={`branch-${branch.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                    {language === 'ar' && branch.name_ar ? branch.name_ar : branch.name}
                    <span className="text-xs text-muted-foreground">({branch.city})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasEnoughBranches && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-3 text-sm text-amber-700 dark:text-amber-400">
            {t('branch_comparison.min_branches', { defaultValue: 'Select at least 2 branches to compare' })}
          </CardContent>
        </Card>
      )}

      {hasEnoughBranches && (
        <>
          {scoreComparisonData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('branch_comparison.score_comparison', { defaultValue: 'CX Score Comparison' })}</CardTitle>
                <CardDescription>{scoreComparisonData.label} — {scoreComparisonData.titleSuffix}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreComparisonData.data} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={10} />
                      <YAxis type="category" dataKey="name" fontSize={10} width={120} tick={{ width: 110 }} />
                      <RechartsTooltip formatter={(value: number) => [value, scoreComparisonData.label]} />
                      <ReferenceLine x={scoreComparisonData.average} stroke="#888" strokeDasharray="3 3" label={{ value: `${t('branch_comparison.overall_average', { defaultValue: 'Avg' })}: ${scoreComparisonData.average}`, position: 'top', fontSize: 10 }} />
                      <Bar dataKey="score" name={scoreComparisonData.label}>
                        {scoreComparisonData.data.map((entry, i) => (
                          <Cell key={i} fill={entry.visits === 0 ? '#D1D5DB' : entry.score >= scoreComparisonData.average ? '#22C55E' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground justify-center">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> {t('branch_comparison.above_average', { defaultValue: 'Above Average' })}</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> {t('branch_comparison.below_average', { defaultValue: 'Below Average' })}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {questionComparison && questionComparison.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t('branch_comparison.question_breakdown', { defaultValue: 'Question-Level Comparison' })}</h3>
              {questionComparison.map((qc, qi) => (
                <Card key={qc.question.id || qi}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{qc.questionText}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">{qc.question.type === 'yes_no' ? 'Yes/No' : qc.question.type === 'rating' ? `Rating 1-${qc.question.max_rating || 5}` : 'Choice'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(qc.question.type === 'rating' || qc.question.type === 'yes_no') && (
                      <div className="space-y-2">
                        {qc.branchResults.map((br, bi) => {
                          const maxVal = qc.question.type === 'yes_no' ? 100 : (qc.question.max_rating || 5);
                          const pct = maxVal > 0 ? (br.value / maxVal) * 100 : 0;
                          const isAbove = br.value >= qc.average;
                          return (
                            <div key={br.branchId} className="space-y-0.5">
                              <div className="flex justify-between text-xs">
                                <span className="truncate">{br.branchName}</span>
                                <span className="font-medium flex items-center gap-1">
                                  {br.count === 0 ? (
                                    <span className="text-muted-foreground">{t('branch_comparison.no_data', { defaultValue: 'No data' })}</span>
                                  ) : (
                                    <>
                                      {br.value}{qc.question.type === 'yes_no' ? '%' : ''}
                                      {isAbove ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                                    </>
                                  )}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(pct, 100)}%`,
                                    backgroundColor: br.count === 0 ? '#D1D5DB' : COLORS[bi % COLORS.length],
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        <div className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                          <Minus className="h-3 w-3" />
                          {t('branch_comparison.overall_average', { defaultValue: 'Overall Average' })}: {qc.average}{qc.question.type === 'yes_no' ? '%' : ''}
                        </div>
                      </div>
                    )}
                    {qc.question.type === 'multiple_choice' && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-start p-1.5 font-medium text-muted-foreground">{t('option', { defaultValue: 'Option' })}</th>
                              {qc.branchResults.map(br => (
                                <th key={br.branchId} className="text-end p-1.5 font-medium text-muted-foreground truncate max-w-[80px]">{br.branchName}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(qc.branchResults[0] as any)?.distribution?.map((d: any, di: number) => (
                              <tr key={di} className="border-b last:border-0">
                                <td className="p-1.5">{d.option}</td>
                                {qc.branchResults.map(br => {
                                  const dist = (br as any).distribution?.[di];
                                  return (
                                    <td key={br.branchId} className="text-end p-1.5">
                                      {dist ? `${dist.percent}%` : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {rankingData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('branch_comparison.ranking', { defaultValue: 'Branch Ranking' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-2 font-medium text-muted-foreground">{t('branch_comparison.rank', { defaultValue: 'Rank' })}</th>
                        <th className="text-start p-2 font-medium text-muted-foreground">{t('export.branch', { defaultValue: 'Branch' })}</th>
                        <th className="text-end p-2 font-medium text-muted-foreground">{t('branch_comparison.primary_score', { defaultValue: 'Primary Score' })}</th>
                        <th className="text-end p-2 font-medium text-muted-foreground">{t('branch_comparison.overall_score', { defaultValue: 'Overall Score' })}</th>
                        <th className="text-end p-2 font-medium text-muted-foreground">{t('performance_tab.visits', { defaultValue: 'Visits' })}</th>
                        <th className="text-end p-2 font-medium text-muted-foreground">{t('export.completion_rate', { defaultValue: 'Completion' })}</th>
                        <th className="text-end p-2 font-medium text-muted-foreground">{t('avg_response_time', { defaultValue: 'Avg Time' })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingData.map((row, i) => {
                        const isTop = i === 0 && row.primaryScoreValue > 0;
                        const isBottom = i === rankingData.length - 1 && rankingData.length > 1 && row.primaryScoreValue > 0;
                        const overallColor = row.overallCount === 0
                          ? 'text-muted-foreground'
                          : row.overallPercent >= 80 ? 'text-green-600'
                          : row.overallPercent >= 60 ? 'text-amber-500'
                          : 'text-destructive';
                        return (
                          <tr key={row.branchId} className={`border-b last:border-0 hover:bg-muted/50 ${isTop ? 'bg-green-50 dark:bg-green-950/20' : isBottom ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                            <td className="p-2 font-bold text-muted-foreground">{i + 1}</td>
                            <td className="p-2">
                              <span className="font-medium">{row.name}</span>
                              <span className="text-xs text-muted-foreground ml-1">({row.city})</span>
                            </td>
                            <td className="p-2 text-end font-semibold">{row.primaryScoreText}</td>
                            <td className={`p-2 text-end font-bold ${overallColor}`}>
                              {row.overallCount === 0 ? '-' : (
                                <>
                                  {row.overallScore}<span className="text-xs text-muted-foreground">/10</span>
                                  <span className="text-[10px] text-muted-foreground ml-1">({row.overallPercent}%)</span>
                                </>
                              )}
                            </td>
                            <td className="p-2 text-end">{row.totalVisits}</td>
                            <td className="p-2 text-end">
                              <Badge variant={row.completionRate >= 80 ? 'default' : row.completionRate >= 50 ? 'secondary' : 'destructive'} className="text-xs">
                                {row.completionRate}%
                              </Badge>
                            </td>
                            <td className="p-2 text-end">{row.avgResponseTime > 0 ? `${row.avgResponseTime}h` : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {operationalSummary && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">{t('total_branches', { defaultValue: 'Branches with Data' })}</p>
                  <p className="text-2xl font-bold">{operationalSummary.branchesWithData}</p>
                </CardContent>
              </Card>
              {operationalSummary.bestCompletion && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground">{t('best_completion', { defaultValue: 'Best Completion' })}</p>
                    <p className="text-2xl font-bold text-green-600">{operationalSummary.bestCompletion.completionRate}%</p>
                    <p className="text-xs text-muted-foreground truncate">{operationalSummary.bestCompletion.name}</p>
                  </CardContent>
                </Card>
              )}
              {operationalSummary.fastestResponse && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground">{t('fastest_response', { defaultValue: 'Fastest Response' })}</p>
                    <p className="text-2xl font-bold text-primary">{operationalSummary.fastestResponse.avgResponseTime}h</p>
                    <p className="text-xs text-muted-foreground truncate">{operationalSummary.fastestResponse.name}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
