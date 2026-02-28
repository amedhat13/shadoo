import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowLeft, BarChart3, Users } from 'lucide-react';
import { ClientReportView } from './ClientReportView';

interface ClientData {
  id: string;
  name: string;
  missions: number;
  activeMissions: number;
  branches: number;
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  budgetAllocated: number;
  budgetUsed: number;
  walletBalance: number;
}

interface ClientAnalyticsTabProps {
  data: ClientData[];
}

export function ClientAnalyticsTab({ data }: ClientAnalyticsTabProps) {
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const currencyCode = tCommon('currency_code');

  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  if (selectedClient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => setSelectedClient(null)}>
          <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          {t('reports.back_to_all_clients')}
        </Button>
        <ClientReportView clientId={selectedClient.id} clientName={selectedClient.name} />
      </div>
    );
  }

  const topClients = data.slice(0, 10);
  const chartData = topClients.slice(0, 8).map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
    missions: c.missions,
    visits: c.totalVisits,
    approved: c.completedVisits,
  }));

  return (
    <div className="space-y-6">
      {/* Top Clients Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold uppercase">{t('reports.top_clients_activity')}</CardTitle>
          <CardDescription>{t('reports.top_clients_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={{
              missions: { label: t('reports.chart_missions'), color: '#F97316' },
              visits: { label: t('reports.chart_total_visits'), color: '#0EA5E9' },
              approved: { label: t('reports.chart_approved'), color: '#22C55E' },
            }} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} angle={-20} textAnchor="end" height={50} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="missions" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="visits" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">{t('reports.no_client_data')}</div>
          )}
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold uppercase">{t('reports.client_breakdown')}</CardTitle>
          <CardDescription>{t('reports.client_breakdown_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reports.col_client')}</TableHead>
                  <TableHead className="text-center">{t('reports.col_missions')}</TableHead>
                  <TableHead className="text-center">{t('reports.col_branches')}</TableHead>
                  <TableHead className="text-center">{t('reports.col_visits')}</TableHead>
                  <TableHead className="text-center">{t('reports.col_approved')}</TableHead>
                  <TableHead className="text-center">{t('reports.col_pending')}</TableHead>
                  <TableHead className="text-end">{t('reports.col_budget_used')}</TableHead>
                  <TableHead className="text-end">{t('reports.col_wallet')}</TableHead>
                  <TableHead className="text-center">{t('reports.col_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">{t('clients.no_clients')}</TableCell>
                  </TableRow>
                ) : topClients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{client.missions}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{client.branches}</TableCell>
                    <TableCell className="text-center">{client.totalVisits}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-success/10 text-success border-success/20">{client.completedVisits}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {client.pendingVisits > 0 ? (
                        <Badge variant="default" className="bg-warning/10 text-warning border-warning/20">{client.pendingVisits}</Badge>
                      ) : '0'}
                    </TableCell>
                    <TableCell className="text-end">{client.budgetUsed.toLocaleString(isRTL ? 'ar-EG' : 'en')} / {client.budgetAllocated.toLocaleString(isRTL ? 'ar-EG' : 'en')}</TableCell>
                    <TableCell className="text-end">{client.walletBalance.toLocaleString(isRTL ? 'ar-EG' : 'en')} {currencyCode}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedClient(client)}>
                        <BarChart3 className="h-3.5 w-3.5" />
                        {t('reports.view_report')}
                      </Button>
                    </TableCell>
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
