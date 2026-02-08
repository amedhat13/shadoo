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
import { Users, Search, MoreHorizontal, Eye, UserX, Wallet, Filter, Building2, ClipboardList, Loader2 } from 'lucide-react';
import { CreateClientDialog } from '@/components/admin/clients/CreateClientDialog';
import { useAdminClients } from '@/hooks/useAdminClients';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminClientsPage() {
  const { data: clients, isLoading } = useAdminClients();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const filteredClients = clients?.filter((client) => {
    const search = searchQuery.toLowerCase();
    return (
      client.companyName?.toLowerCase().includes(search) ||
      client.fullName?.toLowerCase().includes(search) ||
      client.email?.toLowerCase().includes(search)
    );
  }) || [];

  const totalBalance = clients?.reduce((sum, c) => sum + c.balance, 0) || 0;
  const activeCount = clients?.filter(c => c.status === 'active').length || 0;
  const suspendedCount = clients?.filter(c => c.status === 'suspended').length || 0;

  const ClientCard = ({ client }: { client: any }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{client.companyName || 'N/A'}</p>
            <p className="text-xs text-muted-foreground truncate">{client.fullName || 'N/A'}</p>
          </div>
          <Badge variant={client.status === 'active' ? 'default' : 'destructive'}>{String(tc(`statuses.${client.status}`, client.status))}</Badge>
        </div>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{t('clients.plan')}</span><Badge variant="outline">{client.plan || t('clients.no_plan')}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">{t('clients.balance')}</span><span className="font-medium">{client.balance.toLocaleString()} {tc('currency_code')}</span></div>
        </div>
        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/admin/clients/${client.userId}`)}><Eye className="h-4 w-4 me-1" />{t('clients.view')}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border">
              <DropdownMenuItem><Wallet className="me-2 h-4 w-4" />{t('clients.adjust_wallet')}</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive"><UserX className="me-2 h-4 w-4" />{t('clients.suspend_client')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <AdminPageHeader title={t('clients.title')} description={t('clients.description')} actions={<CreateClientDialog />} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard title={t('clients.total_clients')} value={String(clients?.length || 0)} icon={Users} />
          <StatCard title={t('clients.active')} value={String(activeCount)} variant="success" />
          <StatCard title={t('clients.suspended')} value={String(suspendedCount)} variant="destructive" />
          <StatCard title={t('clients.total_balance')} value={`${(totalBalance / 1000).toFixed(0)}K`} icon={Wallet} />
        </div>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={t('clients.search_placeholder')} className="ps-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-2 w-full md:w-auto"><Filter className="h-4 w-4" />{t('clients.filters')}</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3 md:pb-6"><CardTitle className="text-sm md:text-base font-bold uppercase">{t('clients.all_clients')}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">{searchQuery ? t('clients.no_clients_search') : t('clients.no_clients')}</div>
            ) : (
              <>
                <div className="md:hidden space-y-3">{filteredClients.map((client) => <ClientCard key={client.id} client={client} />)}</div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('clients.company')}</TableHead>
                        <TableHead>{t('clients.contact')}</TableHead>
                        <TableHead>{t('clients.plan')}</TableHead>
                        <TableHead>{t('clients.status')}</TableHead>
                        <TableHead className="text-end">{t('clients.balance')}</TableHead>
                        <TableHead className="text-center" title="Branches"><Building2 className="h-4 w-4 inline" /></TableHead>
                        <TableHead className="text-center" title="Missions"><ClipboardList className="h-4 w-4 inline" /></TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.companyName || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground">{client.fullName || 'N/A'}</TableCell>
                          <TableCell><Badge variant="outline">{client.plan || t('clients.no_plan')}</Badge></TableCell>
                          <TableCell><Badge variant={client.status === 'active' ? 'default' : 'destructive'}>{tc(`statuses.${client.status}`, client.status)}</Badge></TableCell>
                          <TableCell className="text-end font-medium">{client.balance.toLocaleString()} {tc('currency_code')}</TableCell>
                          <TableCell className="text-center">{client.branchesCount}</TableCell>
                          <TableCell className="text-center">{client.missionsCount}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-background border">
                                <DropdownMenuItem onClick={() => navigate(`/admin/clients/${client.userId}`)}><Eye className="me-2 h-4 w-4" />{t('clients.view_details')}</DropdownMenuItem>
                                <DropdownMenuItem><Wallet className="me-2 h-4 w-4" />{t('clients.adjust_wallet')}</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><UserX className="me-2 h-4 w-4" />{t('clients.suspend_client')}</DropdownMenuItem>
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