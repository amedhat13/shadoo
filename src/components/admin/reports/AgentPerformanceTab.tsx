import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Star } from 'lucide-react';

interface AgentPerformanceTabProps {
  agents: {
    id: string; name: string; tier: string; status: string;
    completedVisits: number; totalEarnings: number; rating: number;
    totalVisits: number; approvedVisits: number; rejectedVisits: number; completionRate: number;
  }[];
  tierDist: { name: string; value: number; color: string }[];
  statusDist: { name: string; value: number; color: string }[];
}

const tierColors: Record<string, string> = {
  A: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  B: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
  C: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};
const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function AgentPerformanceTab({ agents, tierDist, statusDist }: AgentPerformanceTabProps) {
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
  const { isRTL } = useLanguage();
  const currencyCode = tCommon('currency_code');

  const topAgents = agents.filter(a => a.status === 'active').slice(0, 10);
  const chartData = topAgents.slice(0, 8).map(a => ({
    name: a.name.length > 12 ? a.name.slice(0, 12) + '…' : a.name,
    approved: a.approvedVisits,
    rejected: a.rejectedVisits,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="text-start"><CardTitle className="text-base font-bold uppercase">{t('reports.agents.tier_distribution')}</CardTitle></CardHeader>
          <CardContent dir="ltr">
            {tierDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={tierDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {tierDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : <div className="h-[220px] flex items-center justify-center text-muted-foreground">{t('reports.agents.no_agents')}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-start"><CardTitle className="text-base font-bold uppercase">{t('reports.agents.status_distribution')}</CardTitle></CardHeader>
          <CardContent dir="ltr">
            {statusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : <div className="h-[220px] flex items-center justify-center text-muted-foreground">{t('reports.agents.no_agents')}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="text-start">
          <CardTitle className="text-base font-bold uppercase">{t('reports.agents.top_performance')}</CardTitle>
          <CardDescription>{t('reports.agents.top_performance_desc')}</CardDescription>
        </CardHeader>
        <CardContent dir="ltr">
          {chartData.length > 0 ? (
            <ChartContainer config={{
              approved: { label: t('reports.agents.chart_approved'), color: '#22C55E' },
              rejected: { label: t('reports.agents.chart_rejected'), color: '#EF4444' },
            }} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} angle={-20} textAnchor="end" height={50} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="approved" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">{t('reports.agents.no_active')}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-start"><CardTitle className="text-base font-bold uppercase">{t('reports.agents.details')}</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('reports.agents.col_agent')}</TableHead>
                  <TableHead className="text-center">{t('reports.agents.col_tier')}</TableHead>
                  <TableHead className="text-center">{t('reports.agents.col_status')}</TableHead>
                  <TableHead className="text-center">{t('reports.agents.col_visits')}</TableHead>
                  <TableHead className="text-center">{t('reports.agents.col_completion')}</TableHead>
                  <TableHead className="text-center">{t('reports.agents.col_rating')}</TableHead>
                  <TableHead className="text-end">{t('reports.agents.col_earnings')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('reports.agents.no_agents')}</TableCell></TableRow>
                ) : agents.slice(0, 15).map(agent => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium text-start">{agent.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={tierColors[agent.tier] || ''}>{agent.tier}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={statusColors[agent.status] || ''}>{agent.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{agent.approvedVisits} / {agent.totalVisits}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={agent.completionRate} className="h-2 w-16" />
                        <span className="text-xs">{agent.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {agent.rating > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {agent.rating.toFixed(1)}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-end">{agent.totalEarnings.toLocaleString(isRTL ? 'ar-EG' : 'en')} {currencyCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
