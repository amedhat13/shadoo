import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BranchTable } from '@/components/branches/BranchTable';
import { BranchForm } from '@/components/branches/BranchForm';
import { BulkBranchForm } from '@/components/branches/BulkBranchForm';
import { BranchMapView } from '@/components/branches/BranchMapView';
import { BranchFiltersBar, BranchFilters } from '@/components/branches/BranchFiltersBar';
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
  const [filters, setFilters] = useState<BranchFilters>({
    search: '',
    city: '',
    status: 'all',
  });

  // Stats
  const verifiedCount = branches.filter(b => b.status === 'verified').length;
  const pendingCount = branches.filter(b => b.status === 'pending_verification').length;
  const rejectedCount = branches.filter(b => b.status === 'rejected').length;

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          branch.name.toLowerCase().includes(searchLower) ||
          branch.address.toLowerCase().includes(searchLower) ||
          branch.city.toLowerCase().includes(searchLower) ||
          (branch.district?.toLowerCase().includes(searchLower) || false);
        if (!matchesSearch) return false;
      }

      // City filter
      if (filters.city && branch.city !== filters.city) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && branch.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [branches, filters]);

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
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Branches"
          description="Manage your locations. Branches must be verified by Shadoo admin before use in missions."
          actions={
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setBulkFormOpen(true)} className="flex-1 sm:flex-none">
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bulk Add</span>
                <span className="sm:hidden">Bulk</span>
              </Button>
              <Button onClick={() => { setEditingBranch(null); setFormOpen(true); }} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Branch</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{branches.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{verifiedCount}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Ready for missions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-red-600">{rejectedCount}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="list" className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <List className="h-4 w-4" />
              <span className="text-xs sm:text-sm">List</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <MapPin className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Map</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-3 sm:mt-4 space-y-4">
            <BranchFiltersBar filters={filters} onFiltersChange={setFilters} />
            
            <Card className="border border-border">
              <CardContent className="p-3 sm:p-4 md:pt-6">
                {filteredBranches.length === 0 && (filters.search || filters.city || filters.status !== 'all') ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No branches found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters or search terms.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setFilters({ search: '', city: '', status: 'all' })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <BranchTable
                    branches={filteredBranches}
                    onEdit={handleEdit}
                    onDelete={handleDeleteBranch}
                    onViewOnMap={handleViewOnMap}
                  />
                )}
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
