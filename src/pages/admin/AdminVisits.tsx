import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Search, CheckCircle, XCircle, Clock, Loader2, FileCheck } from 'lucide-react';
import { useAdminVisits, useVisitStats } from '@/hooks/useAdminVisits';
import { VisitReviewDialog } from '@/components/admin/visits/VisitReviewDialog';
import { format } from 'date-fns';

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Visit Review"
          description="Review and approve agent visit submissions."
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <StatCard 
            title="Pending Review" 
            value={String(stats?.submitted || 0)} 
            icon={Clock}
            variant="warning"
          />
          <StatCard 
            title="In Progress" 
            value={String(stats?.inProgress || 0)} 
            icon={FileCheck}
          />
          <StatCard 
            title="Approved" 
            value={String(stats?.approved || 0)} 
            icon={CheckCircle}
            variant="success"
          />
          <StatCard 
            title="Rejected" 
            value={String(stats?.rejected || 0)} 
            icon={XCircle}
            variant="destructive"
          />
          <StatCard 
            title="Total" 
            value={String(stats?.total || 0)} 
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search by mission, agent, or client..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs & Table */}
        <Card>
          <CardHeader className="pb-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="submitted" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Review
                  {stats?.submitted ? (
                    <Badge variant="secondary" className="ml-1">
                      {stats.submitted}
                    </Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No visits found matching your search.' : 'No visits in this category.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mission</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">
                        {visit.mission?.name || 'Unknown Mission'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{visit.agent?.full_name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">
                            Tier {visit.agent?.tier || 'C'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {visit.client?.company_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {visit.submitted_at 
                          ? format(new Date(visit.submitted_at), 'MMM d, yyyy HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[visit.status] || ''}>
                          {visit.status?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {visit.purchase_amount?.toLocaleString() || 0} EGP
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVisit(visit.id)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <VisitReviewDialog
        visit={selectedVisitData || null}
        open={!!selectedVisit}
        onOpenChange={(open) => !open && setSelectedVisit(null)}
      />
    </AdminLayout>
  );
}
