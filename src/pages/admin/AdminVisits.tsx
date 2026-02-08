import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Eye, Search, CheckCircle, XCircle, Clock, Loader2, FileCheck, Calendar } from 'lucide-react';
import { useAdminVisits, useVisitStats } from '@/hooks/useAdminVisits';
import { VisitReviewDialog } from '@/components/admin/visits/VisitReviewDialog';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/10 text-blue-600',
  submitted: 'bg-warning text-warning-foreground',
  approved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
};

export default function AdminVisitsPage() {
  const [activeTab, setActiveTab] = useState('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const { data: visits, isLoading } = useAdminVisits(activeTab === 'all' ? undefined : activeTab);
  const { data: stats } = useVisitStats();

  const filteredVisits = visits?.filter((visit) => {
    const search = searchQuery.toLowerCase();
    return (
      visit.mission?.name?.toLowerCase().includes(search) ||
      visit.agent?.full_name?.toLowerCase().includes(search) ||
      visit.client?.company_name?.toLowerCase().includes(search)
    );
  }) || [];

  const selectedVisitData = visits?.find(v => v.id === selectedVisit);

  const VisitCard = ({ visit }: { visit: any }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{visit.mission?.name || 'Unknown Mission'}</p>
            <p className="text-xs text-muted-foreground truncate">{visit.agent?.full_name || 'Unknown'}</p>
          </div>
          <Badge className={statusColors[visit.status] || ''}>{tc(`statuses.${visit.status}`, visit.status?.replace('_', ' '))}</Badge>
        </div>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{t('visits.client_col')}</span><span className="truncate ms-2">{visit.client?.company_name || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('visits.amount')}</span><span className="font-medium">{visit.purchase_amount?.toLocaleString() || 0} {tc('currency_code')}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('visits.submitted')}</span><span className="text-xs">{visit.submitted_at ? format(new Date(visit.submitted_at), 'MMM d, HH:mm') : '-'}</span></div>
        </div>
        <div className="mt-4 pt-3 border-t">
          <Button size="sm" className="w-full gap-1" onClick={() => setSelectedVisit(visit.id)}><Eye className="h-4 w-4" />{t('visits.review')}</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <AdminPageHeader title={t('visits.title')} description={t('visits.description')} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          <StatCard title={t('visits.pending_review')} value={String(stats?.submitted || 0)} icon={Clock} variant="warning" />
          <StatCard title={t('visits.in_progress')} value={String(stats?.inProgress || 0)} icon={FileCheck} />
          <StatCard title={t('visits.approved')} value={String(stats?.approved || 0)} icon={CheckCircle} variant="success" />
          <StatCard title={t('visits.rejected')} value={String(stats?.rejected || 0)} icon={XCircle} variant="destructive" />
          <StatCard title={t('visits.total')} value={String(stats?.total || 0)} />
        </div>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('visits.search_placeholder')} className="ps-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <ScrollArea className="w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="inline-flex w-auto">
                  <TabsTrigger value="submitted" className="gap-1 text-xs md:text-sm">
                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">{tc('statuses.pending')}</span>
                    {stats?.submitted ? <Badge variant="secondary" className="ms-1 text-xs">{stats.submitted}</Badge> : null}
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="text-xs md:text-sm">{t('visits.approved')}</TabsTrigger>
                  <TabsTrigger value="rejected" className="text-xs md:text-sm">{t('visits.rejected')}</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs md:text-sm">{tc('all')}</TabsTrigger>
                </TabsList>
              </Tabs>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filteredVisits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">{searchQuery ? t('visits.no_visits_search') : t('visits.no_visits')}</div>
            ) : (
              <>
                <div className="md:hidden space-y-3">{filteredVisits.map((visit) => <VisitCard key={visit.id} visit={visit} />)}</div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('visits.mission_col')}</TableHead>
                        <TableHead>{t('visits.agent_col')}</TableHead>
                        <TableHead>{t('visits.client_col')}</TableHead>
                        <TableHead>{t('visits.scheduled')}</TableHead>
                        <TableHead>{t('visits.submitted')}</TableHead>
                        <TableHead>{t('visits.status')}</TableHead>
                        <TableHead className="text-end">{t('visits.amount')}</TableHead>
                        <TableHead className="w-[100px]">{tc('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="font-medium">{visit.mission?.name || 'Unknown Mission'}</TableCell>
                          <TableCell><div><div className="font-medium">{visit.agent?.full_name || 'Unknown'}</div><div className="text-xs text-muted-foreground">Tier {visit.agent?.tier || 'C'}</div></div></TableCell>
                          <TableCell className="text-muted-foreground">{visit.client?.company_name || 'N/A'}</TableCell>
                          <TableCell>
                            {visit.scheduled_date ? (
                              <div className="flex items-center gap-1 text-sm"><Calendar className="h-3 w-3 text-muted-foreground" /><span>{format(parseISO(visit.scheduled_date), 'MMM d')}</span>{visit.scheduled_time && <span className="text-muted-foreground">@ {visit.scheduled_time}</span>}</div>
                            ) : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>{visit.submitted_at ? format(new Date(visit.submitted_at), 'MMM d, yyyy HH:mm') : '-'}</TableCell>
                          <TableCell><Badge className={statusColors[visit.status] || ''}>{tc(`statuses.${visit.status}`, visit.status?.replace('_', ' '))}</Badge></TableCell>
                          <TableCell className="text-end font-medium">{visit.purchase_amount?.toLocaleString() || 0} {tc('currency_code')}</TableCell>
                          <TableCell><Button variant="outline" size="sm" onClick={() => setSelectedVisit(visit.id)} className="gap-2"><Eye className="h-4 w-4" />{t('visits.review')}</Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <VisitReviewDialog visit={selectedVisitData || null} open={!!selectedVisit} onOpenChange={(open) => !open && setSelectedVisit(null)} />
    </AdminLayout>
  );
}