import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Building2, CheckCircle, XCircle, Clock, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { AdminCreateBranchDialog } from '@/components/admin/branches/AdminCreateBranchDialog';
import { useAdminBranches } from '@/hooks/useAdminData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminBranchesPage() {
  const { data: branches, isLoading } = useAdminBranches();
  const queryClient = useQueryClient();

  const pendingBranches = branches?.filter(b => b.status === 'pending_verification') || [];
  const verifiedBranches = branches?.filter(b => b.status === 'verified') || [];
  const rejectedBranches = branches?.filter(b => b.status === 'rejected') || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const { error } = await supabase
        .from('branches')
        .update({ 
          status, 
          rejection_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Branch ${variables.status === 'verified' ? 'verified' : 'rejected'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleVerify = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'verified' });
  };

  const handleReject = (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      updateStatusMutation.mutate({ id, status: 'rejected', reason });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Branch Management"
          description="Verify and manage client branches."
          actions={<AdminCreateBranchDialog />}
          badge={
            pendingBranches.length > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                {pendingBranches.length} Pending
              </Badge>
            )
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Branches" value={String(branches?.length || 0)} icon={Building2} />
          <StatCard title="Pending Verification" value={String(pendingBranches.length)} variant="warning" icon={Clock} />
          <StatCard title="Verified" value={String(verifiedBranches.length)} variant="success" icon={CheckCircle} />
          <StatCard title="Rejected" value={String(rejectedBranches.length)} variant="destructive" icon={XCircle} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingBranches.length})
            </TabsTrigger>
            <TabsTrigger value="verified">Verified ({verifiedBranches.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedBranches.length})</TabsTrigger>
            <TabsTrigger value="all">All Branches</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Pending Verification</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingBranches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No branches pending verification.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Branch Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBranches.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{branch.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{branch.clientName}</TableCell>
                          <TableCell>{branch.city}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(branch.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1"
                                asChild
                              >
                                <a href={branch.google_maps_link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                  View Map
                                </a>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive"
                                onClick={() => handleReject(branch.id)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handleVerify(branch.id)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Verify
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Verified Branches</CardTitle>
              </CardHeader>
              <CardContent>
                {verifiedBranches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No verified branches yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Branch Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verifiedBranches.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell className="font-medium">{branch.name}</TableCell>
                          <TableCell className="text-muted-foreground">{branch.clientName}</TableCell>
                          <TableCell>{branch.city}</TableCell>
                          <TableCell className="text-muted-foreground">{branch.address}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Rejected Branches</CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedBranches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rejected branches.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Branch Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedBranches.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell className="font-medium">{branch.name}</TableCell>
                          <TableCell className="text-muted-foreground">{branch.clientName}</TableCell>
                          <TableCell className="text-muted-foreground">{branch.rejection_reason || 'No reason provided'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">All Branches</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Branch Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches?.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell className="font-medium">{branch.name}</TableCell>
                          <TableCell className="text-muted-foreground">{branch.clientName}</TableCell>
                          <TableCell>{branch.city}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                branch.status === 'verified' ? 'default' : 
                                branch.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {branch.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
