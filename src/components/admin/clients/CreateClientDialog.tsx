import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Plus, Loader2, Copy, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateClientFormData {
  email: string;
  companyName: string;
  fullName: string;
  phone: string;
  planId: string;
}

interface CreateClientResponse {
  success: boolean;
  userId: string;
  email: string;
  companyName: string;
  emailSent: boolean;
  tempPassword?: string;
  message: string;
}

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateClientFormData>({
    email: '',
    companyName: '',
    fullName: '',
    phone: '',
    planId: '',
  });
  const [result, setResult] = useState<CreateClientResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: CreateClientFormData) => {
      const { data: response, error } = await supabase.functions.invoke('create-client', {
        body: {
          email: data.email,
          companyName: data.companyName,
          fullName: data.fullName,
          phone: data.phone || undefined,
          planId: data.planId || undefined,
        },
      });
      if (error) throw error;
      if (!response.success) throw new Error(response.error || 'Failed to create client');
      return response as CreateClientResponse;
    },
    onSuccess: (response) => {
      setResult(response);
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      if (response.emailSent) {
        toast.success('Client created and credentials sent via email');
      } else {
        toast.warning('Client created but email not sent - save the temporary password');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(formData);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      email: '',
      companyName: '',
      fullName: '',
      phone: '',
      planId: '',
    });
    setResult(null);
    setCopied(false);
  };

  const copyPassword = async () => {
    if (result?.tempPassword) {
      await navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
          <DialogDescription>
            Create a new client account. They will receive an email with their login credentials.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <Alert variant={result.emailSent ? 'default' : 'destructive'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {result.emailSent 
                  ? `Credentials sent to ${result.email}` 
                  : 'Email not sent - RESEND_API_KEY not configured'}
              </AlertDescription>
            </Alert>

            {result.tempPassword && (
              <div className="space-y-2">
                <Label>Temporary Password (save this!)</Label>
                <div className="flex gap-2">
                  <Input value={result.tempPassword} readOnly className="font-mono" />
                  <Button variant="outline" size="icon" onClick={copyPassword}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Cairo Electronics Co."
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullName">Contact Person Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Ahmed Mohamed"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@company.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+20 123 456 7890"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="plan">Subscription Plan</Label>
                <Select
                  value={formData.planId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, planId: value }))}
                >
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Select a plan (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.price} {plan.currency}/{plan.billing_period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createClientMutation.isPending}>
                {createClientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Client
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
