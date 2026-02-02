import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BranchTable } from '@/components/branches/BranchTable';
import { BranchForm } from '@/components/branches/BranchForm';
import { BulkBranchForm } from '@/components/branches/BulkBranchForm';
import { BranchMapView } from '@/components/branches/BranchMapView';
import { useBranches, BranchFormData } from '@/hooks/useBranches';
import { Branch } from '@/types';
import { Plus, Upload, MapPin, List, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BranchesPage() {
  const { branches, isLoading, createBranch, createBulkBranches, updateBranch, deleteBranch } = useBranches();
  const { toast } = useToast();
  
  const [formOpen, setFormOpen] = useState(false);
  const [bulkFormOpen, setBulkFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedMapBranch, setSelectedMapBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // Stats
  const verifiedCount = branches.filter(b => b.status === 'verified').length;
  const pendingCount = branches.filter(b => b.status === 'pending_verification').length;
  const rejectedCount = branches.filter(b => b.status === 'rejected').length;

  const handleCreateBranch = async (data: BranchFormData) => {
    await createBranch(data);
    toast({
      title: 'Branch Added',
      description: 'Your branch has been submitted for verification.',
    });
  };

  const handleUpdateBranch = async (data: BranchFormData) => {
    if (!editingBranch) return;
    await updateBranch(editingBranch.id, data);
    setEditingBranch(null);
    toast({
      title: 'Branch Updated',
      description: 'The branch has been updated and submitted for re-verification.',
    });
  };

  const handleDeleteBranch = async (id: string) => {
    await deleteBranch(id);
    toast({
      title: 'Branch Deleted',
      description: 'The branch has been removed.',
    });
  };

  const handleBulkCreate = async (branchesData: BranchFormData[]) => {
    await createBulkBranches(branchesData);
    toast({
      title: 'Branches Added',
      description: `${branchesData.length} branches have been submitted for verification.`,
    });
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormOpen(true);
  };

  const handleViewOnMap = (branch: Branch) => {
    setSelectedMapBranch(branch);
    setActiveTab('map');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Branches"
          description="Manage your locations. Branches must be verified by Shadoo admin before use in missions."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBulkFormOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Add
              </Button>
              <Button onClick={() => { setEditingBranch(null); setFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{branches.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
              <p className="text-xs text-muted-foreground">Ready for missions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <Card className="border border-border">
              <CardContent className="pt-6">
                <BranchTable
                  branches={branches}
                  onEdit={handleEdit}
                  onDelete={handleDeleteBranch}
                  onViewOnMap={handleViewOnMap}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <BranchMapView
              branches={branches}
              selectedBranch={selectedMapBranch}
              onSelectBranch={setSelectedMapBranch}
            />
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <BranchForm
          open={formOpen}
          onOpenChange={setFormOpen}
          branch={editingBranch}
          onSubmit={editingBranch ? handleUpdateBranch : handleCreateBranch}
          isLoading={isLoading}
        />

        <BulkBranchForm
          open={bulkFormOpen}
          onOpenChange={setBulkFormOpen}
          onSubmit={handleBulkCreate}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
