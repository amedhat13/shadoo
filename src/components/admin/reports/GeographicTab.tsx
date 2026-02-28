import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface GeographicTabProps {
  geographicData: { city: string; branches: number; visits: number; missions: number }[];
  branchStatusDist: { name: string; value: number; color: string }[];
}

export function GeographicTab({ geographicData, branchStatusDist }: GeographicTabProps) {
  const { t } = useTranslation('admin');
  const { isRTL } = useLanguage();
  const chartData = geographicData.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('reports.geographic.branches_by_city')}</CardTitle>
            <CardDescription>{t('reports.geographic.branches_by_city_desc')}</CardDescription>
          </CardHeader>
          <CardContent dir="ltr">
            {chartData.length > 0 ? (
              <ChartContainer config={{
                branches: { label: t('reports.geographic.chart_branches'), color: '#F97316' },
                missions: { label: t('reports.geographic.chart_missions'), color: '#0EA5E9' },
                visits: { label: t('reports.geographic.chart_visits'), color: '#22C55E' },
              }} className="h-[300px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" fontSize={11} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="branches" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missions" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="visits" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">{t('reports.geographic.no_branch_data')}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-start"><CardTitle className="text-base font-bold uppercase">{t('reports.geographic.branch_verification')}</CardTitle></CardHeader>
          <CardContent dir="ltr">
            {branchStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px] w-full">
                <PieChart>
                  <Pie data={branchStatusDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {branchStatusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">{t('reports.geographic.no_branches')}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="text-start"><CardTitle className="text-base font-bold uppercase">{t('reports.geographic.city_breakdown')}</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('reports.geographic.col_city')}</TableHead>
                  <TableHead className="text-center">{t('reports.geographic.col_branches')}</TableHead>
                  <TableHead className="text-center">{t('reports.geographic.col_missions')}</TableHead>
                  <TableHead className="text-center">{t('reports.geographic.col_visits')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {geographicData.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">{t('reports.geographic.no_geographic_data')}</TableCell></TableRow>
                ) : geographicData.map(row => (
                  <TableRow key={row.city}>
                    <TableCell className="font-medium text-start">{row.city}</TableCell>
                    <TableCell className="text-center">{row.branches}</TableCell>
                    <TableCell className="text-center">{row.missions}</TableCell>
                    <TableCell className="text-center">{row.visits}</TableCell>
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
