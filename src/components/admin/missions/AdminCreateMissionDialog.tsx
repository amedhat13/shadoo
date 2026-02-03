import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Plus, Loader2 } from 'lucide-react';
import { ClientSelector } from '@/components/admin/common/ClientSelector';
import { useClientBranches } from '@/hooks/useAdminData';

interface AdminMissionFormData {
  clientUserId: string;
  name: string;
  branchId: string;
  numberOfVisits: number;
  purchaseBudgetPerVisit: number;
  agentTier: string;
}

export function AdminCreateMissionDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AdminMissionFormData>({
    clientUserId: '',
    name: '',
    branchId: '',
    numberOfVisits: 10,
    purchaseBudgetPerVisit: 100,
    agentTier: 'C',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AdminMissionFormData, string>>>({});
  const queryClient = useQueryClient();

  const { data: clientBranches, isLoading: branchesLoading } = useClientBranches(formData.clientUserId || null);

  const createMissionMutation = useMutation({
    mutationFn: async (data: AdminMissionFormData) => {
      const totalPurchaseBudget = data.numberOfVisits * data.purchaseBudgetPerVisit;
      
      const { error } = await supabase
        .from('missions')
        .insert({
          user_id: data.clientUserId,
          name: data.name,
          branch_id: data.branchId,
          number_of_visits: data.numberOfVisits,
          purchase_budget_per_visit: data.purchaseBudgetPerVisit,
          total_purchase_budget: totalPurchaseBudget,
          agent_tier: data.agentTier,
          status: 'draft',
          questions: [],
          photo_requirements: { required_count: 3, instructions: '' },
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Mission created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleClose = () => {
    setOpen(false);
    setFormData({
      clientUserId: '',
      name: '',
      branchId: '',
      numberOfVisits: 10,
      purchaseBudgetPerVisit: 100,
      agentTier: 'C',
    });
    setErrors({});
  };

  const handleClientChange = (clientUserId: string) => {
    setFormData({ ...formData, clientUserId, branchId: '' }); // Reset branch when client changes
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AdminMissionFormData, string>> = {};
    
    if (!formData.clientUserId) {
      newErrors.clientUserId = 'Client is required.';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Mission name is required.';
    }
    if (!formData.branchId) {
      newErrors.branchId = 'Branch is required.';
    }
    if (formData.numberOfVisits < 1) {
      newErrors.numberOfVisits = 'At least 1 visit is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createMissionMutation.mutate(formData);
  };

  const totalBudget = formData.numberOfVisits * formData.purchaseBudgetPerVisit;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Mission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Create Mission for Client
          </DialogTitle>
          <DialogDescription>
            Create a new mission for a client. It will be saved as a draft.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <ClientSelector
              value={formData.clientUserId}
              onValueChange={handleClientChange}
              required
            />
            {errors.clientUserId && <p className="text-xs text-destructive">{errors.clientUserId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Mission Name<span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="e.g., Customer Service Audit"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label>Branch<span className="text-destructive">*</span></Label>
            <Select 
              value={formData.branchId} 
              onValueChange={(value) => setFormData({ ...formData, branchId: value })}
              disabled={!formData.clientUserId || branchesLoading}
            >
              <SelectTrigger>
                {branchesLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading branches...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={formData.clientUserId ? "Select branch" : "Select client first"} />
                )}
              </SelectTrigger>
              <SelectContent>
                {clientBranches?.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No verified branches for this client</div>
                ) : (
                  clientBranches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.city}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.branchId && <p className="text-xs text-destructive">{errors.branchId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visits">Number of Visits</Label>
              <Input
                id="visits"
                type="number"
                min={1}
                value={formData.numberOfVisits}
                onChange={(e) => setFormData({ ...formData, numberOfVisits: parseInt(e.target.value) || 1 })}
              />
              {errors.numberOfVisits && <p className="text-xs text-destructive">{errors.numberOfVisits}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget per Visit (EGP)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                value={formData.purchaseBudgetPerVisit}
                onChange={(e) => setFormData({ ...formData, purchaseBudgetPerVisit: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Agent Tier</Label>
            <Select value={formData.agentTier} onValueChange={(value) => setFormData({ ...formData, agentTier: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Tier A (Premium)</SelectItem>
                <SelectItem value="B">Tier B (Standard)</SelectItem>
                <SelectItem value="C">Tier C (Basic)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Total Budget: <span className="font-semibold text-foreground">{totalBudget.toLocaleString()} EGP</span>
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMissionMutation.isPending}>
              {createMissionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Mission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
