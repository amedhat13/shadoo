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
import { useBranchesData } from '@/hooks/useBranchesData';
import { Branch, BranchStatus } from '@/types';
import { Plus, Upload, MapPin, List, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface BranchFormData {
  name: string;
  address: string;
  city: string;
  district?: string;
  google_maps_link: string;
  latitude?: number;
  longitude?: number;
}

// Helper to extract coordinates from Google Maps link
function extractCoordsFromLink(link: string): { lat: number; lng: number } | null {
  try {
    const qMatch = link.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }
    const atMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }
    return null;
  } catch {
    return null;
  }
}

export default function BranchesPage() {
  const { branches, isLoading, createBranch, updateBranch, deleteBranch } = useBranchesData();
  const { toast } = useToast();
  const { t } = useTranslation('branches');
  
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
    const coords = extractCoordsFromLink(data.google_maps_link);
    await createBranch({
      name: data.name,
      address: data.address,
      city: data.city,
      district: data.district,
      google_maps_link: data.google_maps_link,
      latitude: coords?.lat,
      longitude: coords?.lng,
    });
    toast({
      title: t('toast.added'),
      description: t('toast.added_description'),
    });
  };

  const handleUpdateBranch = async (data: BranchFormData) => {
    if (!editingBranch) return;
    const coords = extractCoordsFromLink(data.google_maps_link);
    await updateBranch(editingBranch.id, {
      name: data.name,
      address: data.address,
      city: data.city,
      district: data.district,
      google_maps_link: data.google_maps_link,
      latitude: coords?.lat,
      longitude: coords?.lng,
      status: 'pending_verification' as BranchStatus,
    });
    setEditingBranch(null);
    toast({
      title: t('toast.updated'),
      description: t('toast.updated_description'),
    });
  };

  const handleDeleteBranch = async (id: string) => {
    await deleteBranch(id);
    toast({
      title: t('toast.deleted'),
      description: t('toast.deleted_description'),
    });
  };

  const handleBulkCreate = async (branchesData: BranchFormData[]) => {
    // Create branches one by one since we don't have bulk insert in the data hook
    for (const data of branchesData) {
      const coords = extractCoordsFromLink(data.google_maps_link);
      await createBranch({
        name: data.name,
        address: data.address,
        city: data.city,
        district: data.district,
        google_maps_link: data.google_maps_link,
        latitude: coords?.lat,
        longitude: coords?.lng,
      });
    }
    toast({
      title: t('toast.added'),
      description: `${branchesData.length} ${t('toast.added_description')}`,
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
          title={t('title')}
          description={t('description')}
          actions={
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setBulkFormOpen(true)} className="flex-1 sm:flex-none">
                <Upload className="h-4 w-4 me-2" />
                <span className="hidden sm:inline">{t('bulk_add')}</span>
                <span className="sm:hidden">{t('bulk_add')}</span>
              </Button>
              <Button onClick={() => { setEditingBranch(null); setFormOpen(true); }} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 me-2" />
                <span className="hidden sm:inline">{t('add_branch')}</span>
                <span className="sm:hidden">{t('add_branch')}</span>
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('stats.total')}</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{branches.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('stats.verified')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-success">{verifiedCount}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('stats.ready_for_missions')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('stats.pending')}</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-primary">{pendingCount}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('stats.awaiting_verification')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('stats.rejected')}</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-destructive">{rejectedCount}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('stats.need_attention')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="list" className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <List className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t('list')}</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <MapPin className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t('map')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-3 sm:mt-4 space-y-4">
            <BranchFiltersBar filters={filters} onFiltersChange={setFilters} />
            
            <Card className="border border-border">
              <CardContent className="p-3 sm:p-4 md:pt-6">
                {filteredBranches.length === 0 && (filters.search || filters.city || filters.status !== 'all') ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">{t('no_branches_found')}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('no_branches_found_description')}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setFilters({ search: '', city: '', status: 'all' })}
                    >
                      {t('clear_filters')}
                    </Button>
                  </div>
                ) : (
                  <BranchTable
                    branches={filteredBranches}
                    onEdit={handleEdit}
                    onDelete={handleDeleteBranch}
                    onViewOnMap={handleViewOnMap}
                    isDemo={true}
                    demoBranchIds={['demo-branch-1', 'demo-branch-2', 'demo-branch-3', 'demo-branch-4']}
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