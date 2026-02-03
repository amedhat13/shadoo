import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Search, MoreHorizontal, Eye, UserX, Wallet, Filter, Building2, ClipboardList, Loader2 } from 'lucide-react';
import { CreateClientDialog } from '@/components/admin/clients/CreateClientDialog';
import { useAdminClients } from '@/hooks/useAdminClients';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminClientsPage() {
  const { data: clients, isLoading } = useAdminClients();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Client Management"
          description="View and manage all registered clients."
          actions={<CreateClientDialog />}
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Clients" value={String(clients?.length || 0)} icon={Users} />
          <StatCard title="Active" value={String(activeCount)} variant="success" />
          <StatCard title="Suspended" value={String(suspendedCount)} variant="destructive" />
          <StatCard title="Total Balance" value={`${totalBalance.toLocaleString()} EGP`} icon={Wallet} />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search by company name or email..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No clients found matching your search.' : 'No clients yet. Create your first client.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-center" title="Branches">
                      <Building2 className="h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="text-center" title="Missions">
                      <ClipboardList className="h-4 w-4 inline" />
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.companyName || 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{client.fullName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{client.plan || 'No Plan'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'active' ? 'default' : 'destructive'}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {client.balance.toLocaleString()} EGP
                      </TableCell>
                      <TableCell className="text-center">{client.branchesCount}</TableCell>
                      <TableCell className="text-center">{client.missionsCount}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/clients/${client.userId}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Wallet className="mr-2 h-4 w-4" />
                              Adjust Wallet
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
