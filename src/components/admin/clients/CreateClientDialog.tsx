import { useState, useRef } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Copy, Check, AlertTriangle, Upload, X, Image } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateClientFormData {
  email: string;
  companyName: string;
  fullName: string;
  phone: string;
  industry: string;
  subCategory: string;
  planId: string;
  logoFile: File | null;
  isFreeTrial: boolean;
  trialDays: number;
  trialVisits: number;
}

const INDUSTRY_OPTIONS: { value: string; label: string; subCategories: { value: string; label: string }[] }[] = [
  {
    value: 'fnb',
    label: 'Food & Beverage',
    subCategories: [
      { value: 'qsr', label: 'Quick Service (QSR)' },
      { value: 'casual_dining', label: 'Casual Dining' },
      { value: 'fine_dining', label: 'Fine Dining' },
      { value: 'cafe', label: 'Café & Bakery' },
      { value: 'cloud_kitchen', label: 'Cloud Kitchen / Delivery' },
      { value: 'food_truck', label: 'Food Truck' },
    ],
  },
  {
    value: 'retail',
    label: 'Retail',
    subCategories: [
      { value: 'fashion', label: 'Fashion & Apparel' },
      { value: 'electronics', label: 'Electronics' },
      { value: 'grocery', label: 'Grocery & Supermarket' },
      { value: 'furniture', label: 'Furniture & Home' },
      { value: 'beauty', label: 'Beauty & Cosmetics' },
      { value: 'pharmacy', label: 'Pharmacy' },
      { value: 'jewelry', label: 'Jewelry & Watches' },
      { value: 'toys', label: 'Toys & Kids' },
    ],
  },
  {
    value: 'banking',
    label: 'Banking & Finance',
    subCategories: [
      { value: 'retail_bank', label: 'Retail Banking' },
      { value: 'corporate_bank', label: 'Corporate Banking' },
      { value: 'insurance', label: 'Insurance' },
      { value: 'exchange', label: 'Currency Exchange' },
      { value: 'fintech', label: 'Fintech / Digital Wallet' },
      { value: 'microfinance', label: 'Microfinance' },
    ],
  },
  {
    value: 'telecom',
    label: 'Telecom',
    subCategories: [
      { value: 'mobile_operator', label: 'Mobile Operator Store' },
      { value: 'isp', label: 'Internet Service Provider' },
      { value: 'device_retail', label: 'Device Retail' },
      { value: 'call_center', label: 'Call Center / Support' },
    ],
  },
  {
    value: 'healthcare',
    label: 'Healthcare',
    subCategories: [
      { value: 'hospital', label: 'Hospital' },
      { value: 'clinic', label: 'Clinic / Polyclinic' },
      { value: 'dental', label: 'Dental' },
      { value: 'lab', label: 'Lab & Diagnostics' },
      { value: 'pharmacy_chain', label: 'Pharmacy Chain' },
      { value: 'wellness', label: 'Wellness & Spa' },
    ],
  },
  {
    value: 'automotive',
    label: 'Automotive',
    subCategories: [
      { value: 'showroom', label: 'Showroom / Dealership' },
      { value: 'service_center', label: 'Service Center' },
      { value: 'spare_parts', label: 'Spare Parts' },
      { value: 'car_rental', label: 'Car Rental' },
      { value: 'fuel_station', label: 'Fuel Station' },
    ],
  },
  {
    value: 'hospitality',
    label: 'Hospitality & Hotels',
    subCategories: [
      { value: 'hotel', label: 'Hotel' },
      { value: 'resort', label: 'Resort' },
      { value: 'serviced_apartment', label: 'Serviced Apartment' },
      { value: 'travel_agency', label: 'Travel Agency' },
      { value: 'tour_operator', label: 'Tour Operator' },
    ],
  },
  {
    value: 'ecommerce',
    label: 'E-commerce',
    subCategories: [
      { value: 'marketplace', label: 'Marketplace' },
      { value: 'd2c', label: 'D2C Brand' },
      { value: 'q_commerce', label: 'Q-commerce / Groceries' },
      { value: 'fulfillment', label: 'Fulfillment / Last-mile' },
    ],
  },
  {
    value: 'education',
    label: 'Education',
    subCategories: [
      { value: 'k12', label: 'K-12 School' },
      { value: 'university', label: 'University' },
      { value: 'training_center', label: 'Training Center' },
      { value: 'nursery', label: 'Nursery / Pre-K' },
      { value: 'edtech', label: 'EdTech Platform' },
    ],
  },
  {
    value: 'real_estate',
    label: 'Real Estate',
    subCategories: [
      { value: 'developer', label: 'Developer / Sales Office' },
      { value: 'brokerage', label: 'Brokerage' },
      { value: 'property_mgmt', label: 'Property Management' },
      { value: 'coworking', label: 'Co-working Space' },
    ],
  },
  {
    value: 'entertainment',
    label: 'Entertainment & Leisure',
    subCategories: [
      { value: 'cinema', label: 'Cinema' },
      { value: 'gaming', label: 'Gaming / Arcade' },
      { value: 'gym', label: 'Gym & Fitness' },
      { value: 'theme_park', label: 'Theme Park' },
      { value: 'events', label: 'Events & Venues' },
    ],
  },
  {
    value: 'government',
    label: 'Government & Public Services',
    subCategories: [
      { value: 'service_center', label: 'Service Center' },
      { value: 'utilities', label: 'Utilities (Water/Electricity)' },
      { value: 'post', label: 'Postal Services' },
      { value: 'transport', label: 'Public Transport' },
    ],
  },
  {
    value: 'other',
    label: 'Other',
    subCategories: [
      { value: 'general', label: 'General / Custom' },
    ],
  },
];


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
    industry: '',
    logoFile: null,
    isFreeTrial: false,
    trialDays: 14,
    trialVisits: 10,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [result, setResult] = useState<CreateClientResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      // Upload logo if provided
      let logoUrl: string | undefined;
      if (data.logoFile) {
        const fileExt = data.logoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('client-logos')
          .upload(fileName, data.logoFile);
        
        if (uploadError) {
          console.error('Logo upload failed:', uploadError);
        } else {
          const { data: publicUrl } = supabase.storage
            .from('client-logos')
            .getPublicUrl(fileName);
          logoUrl = publicUrl.publicUrl;
        }
      }

      const { data: response, error } = await supabase.functions.invoke('create-client', {
        body: {
          email: data.email,
          companyName: data.companyName,
          fullName: data.fullName,
          phone: data.phone || undefined,
          industry: data.industry || undefined,
          planId: data.isFreeTrial ? undefined : (data.planId || undefined),
          logoUrl,
          isFreeTrial: data.isFreeTrial,
          trialDays: data.isFreeTrial ? data.trialDays : undefined,
          trialVisits: data.isFreeTrial ? data.trialVisits : undefined,
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      setFormData((prev) => ({ ...prev, logoFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logoFile: null }));
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    industry: '',
      logoFile: null,
      isFreeTrial: false,
      trialDays: 14,
      trialVisits: 10,
    });
    setLogoPreview(null);
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
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
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="h-16 w-16 rounded-lg object-cover border"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                  >
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 2MB. PNG, JPG, or SVG.
                  </p>
                </div>
              </div>
            </div>

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
                <Label htmlFor="industry">Industry / Category</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select an industry (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Drives default mission templates and cover-story suggestions for this client.
                </p>
              </div>


              {/* Free Trial Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="free-trial">Free Trial</Label>
                  <p className="text-xs text-muted-foreground">
                    Give this client a free trial period
                  </p>
                </div>
                <Switch
                  id="free-trial"
                  checked={formData.isFreeTrial}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFreeTrial: checked }))}
                />
              </div>

              {formData.isFreeTrial ? (
                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 bg-muted/30">
                  <div className="grid gap-2">
                    <Label htmlFor="trialDays">Trial Period (days)</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      min={1}
                      max={365}
                      value={formData.trialDays}
                      onChange={(e) => setFormData((prev) => ({ ...prev, trialDays: parseInt(e.target.value) || 14 }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="trialVisits">Visits Allowed</Label>
                    <Input
                      id="trialVisits"
                      type="number"
                      min={1}
                      max={1000}
                      value={formData.trialVisits}
                      onChange={(e) => setFormData((prev) => ({ ...prev, trialVisits: parseInt(e.target.value) || 10 }))}
                    />
                  </div>
                  <p className="col-span-2 text-xs text-muted-foreground">
                    After the trial ends, the client will need to upgrade to a paid plan.
                  </p>
                </div>
              ) : (
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
              )}
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
