import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClipboardList, Search, MoreHorizontal, Eye, Pause, Play, Archive, Filter, Loader2, Plus } from 'lucide-react';
import { useAdminMissions } from '@/hooks/useAdminData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-success text-success-foreground',
  paused: 'bg-warning text-warning-foreground',
  completed: 'bg-primary text-primary-foreground',
  archived: 'bg-muted text-muted-foreground',
};

export default function AdminMissionsPage() {
  const { data: missions, isLoading } = useAdminMissions();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const filteredMissions = missions?.filter((mission) => {
    const search = searchQuery.toLowerCase();
    return (
      mission.name.toLowerCase().includes(search) ||
      mission.clientName?.toLowerCase().includes(search) ||
      mission.branchName?.toLowerCase().includes(search)
    );
  }) || [];

  const publishedCount = missions?.filter(m => m.status === 'published').length || 0;
  const pausedCount = missions?.filter(m => m.status === 'paused').length || 0;
  const completedCount = missions?.filter(m => m.status === 'completed').length || 0;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('missions').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(t('missions.status_updated', { status: variables.status }));
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
    },
    onError: (error: Error) => { toast.error(error.message); },
  });

  const handlePause = (id: string) => updateStatusMutation.mutate({ id, status: 'paused' });
  const handleResume = (id: string) => updateStatusMutation.mutate({ id, status: 'published' });
  const handleArchive = (id: string) => updateStatusMutation.mutate({ id, status: 'archived' });

  const MissionCard = ({ mission }: { mission: any }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{mission.name}</p>
            <p className="text-xs text-muted-foreground truncate">{mission.clientName}</p>
          </div>
          <Badge className={statusColors[mission.status] || ''}>{String(tc(`statuses.${mission.status}`, mission.status))}</Badge>
        </div>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{t('missions.branch')}</span><span className="truncate ms-2">{mission.branchName || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('missions.progress')}</span><span>{mission.visits_completed}/{mission.number_of_visits}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('missions.budget')}</span><span className="font-medium">{mission.total_purchase_budget?.toLocaleString()} {tc('currency_code')}</span></div>
        </div>
        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" className="flex-1"><Eye className="h-4 w-4 me-1" />{t('missions.view')}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border">
              {mission.status === 'published' && <DropdownMenuItem onClick={() => handlePause(mission.id)}><Pause className="me-2 h-4 w-4" />{t('missions.force_pause')}</DropdownMenuItem>}
              {mission.status === 'paused' && <DropdownMenuItem onClick={() => handleResume(mission.id)}><Play className="me-2 h-4 w-4" />{t('missions.resume')}</DropdownMenuItem>}
              <DropdownMenuItem onClick={() => handleArchive(mission.id)}><Archive className="me-2 h-4 w-4" />{t('missions.force_archive')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <AdminPageHeader
          title={t('missions.title')}
          description={t('missions.description')}
          actions={<Button asChild className="gap-2"><Link to="/admin/missions/create"><Plus className="h-4 w-4" />{t('missions.create_mission')}</Link></Button>}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard title={t('missions.total_missions')} value={String(missions?.length || 0)} icon={ClipboardList} />
          <StatCard title={t('missions.published')} value={String(publishedCount)} variant="success" />
          <StatCard title={t('missions.paused')} value={String(pausedCount)} variant="warning" />
          <StatCard title={t('missions.completed')} value={String(completedCount)} />
        </div>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={t('missions.search_placeholder')} className="ps-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-2 w-full md:w-auto"><Filter className="h-4 w-4" />{t('missions.filters')}</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3 md:pb-6"><CardTitle className="text-sm md:text-base font-bold uppercase">{t('missions.all_missions')}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filteredMissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">{searchQuery ? t('missions.no_missions_search') : t('missions.no_missions')}</div>
            ) : (
              <>
                <div className="md:hidden space-y-3">{filteredMissions.map((m) => <MissionCard key={m.id} mission={m} />)}</div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('missions.mission_label')}</TableHead>
                        <TableHead>{t('missions.client')}</TableHead>
                        <TableHead>{t('missions.branch')}</TableHead>
                        <TableHead>{t('missions.status')}</TableHead>
                        <TableHead>{t('missions.progress')}</TableHead>
                        <TableHead className="text-end">{t('missions.budget')}</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMissions.map((mission) => (
                        <TableRow key={mission.id}>
                          <TableCell className="font-medium">{mission.name}</TableCell>
                          <TableCell className="text-muted-foreground">{mission.clientName}</TableCell>
                          <TableCell>{mission.branchName || 'N/A'}</TableCell>
                          <TableCell><Badge className={statusColors[mission.status] || ''}>{tc(`statuses.${mission.status}`, mission.status)}</Badge></TableCell>
                          <TableCell>{mission.visits_completed}/{mission.number_of_visits}</TableCell>
                          <TableCell className="text-end font-medium">{mission.total_purchase_budget?.toLocaleString()} {tc('currency_code')}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background border">
                                <DropdownMenuItem><Eye className="me-2 h-4 w-4" />{t('missions.view_details')}</DropdownMenuItem>
                                {mission.status === 'published' && <DropdownMenuItem onClick={() => handlePause(mission.id)}><Pause className="me-2 h-4 w-4" />{t('missions.force_pause')}</DropdownMenuItem>}
                                {mission.status === 'paused' && <DropdownMenuItem onClick={() => handleResume(mission.id)}><Play className="me-2 h-4 w-4" />{t('missions.resume')}</DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => handleArchive(mission.id)}><Archive className="me-2 h-4 w-4" />{t('missions.force_archive')}</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
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
    </AdminLayout>
  );
}