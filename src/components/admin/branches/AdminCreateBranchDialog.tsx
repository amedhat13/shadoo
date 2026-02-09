import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EGYPT_CITIES, getDistrictsByCity } from '@/lib/egypt-locations';
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
import { MapPin, Link as LinkIcon, Plus, Loader2 } from 'lucide-react';
import { ClientSelector } from '@/components/admin/common/ClientSelector';
import { useTranslation } from 'react-i18next';

interface AdminBranchFormData {
  clientUserId: string;
  name: string;
  address: string;
  city: string;
  district: string;
  google_maps_link: string;
}

export function AdminCreateBranchDialog() {
  const { t } = useTranslation('branches');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AdminBranchFormData>({
    clientUserId: '',
    name: '',
    address: '',
    city: '',
    district: '',
    google_maps_link: '',
  });
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [errors, setErrors] = useState<Partial<AdminBranchFormData>>({});
  const queryClient = useQueryClient();

  const createBranchMutation = useMutation({
    mutationFn: async (data: AdminBranchFormData) => {
      const coords = extractCoordsFromLink(data.google_maps_link);
      
      const { error } = await supabase
        .from('branches')
        .insert({
          user_id: data.clientUserId,
          name: data.name,
          address: data.address,
          city: data.city,
          district: data.district || null,
          google_maps_link: data.google_maps_link,
          latitude: coords?.lat || null,
          longitude: coords?.lng || null,
          status: 'verified',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('toast.added'));
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleClose = () => {
    setOpen(false);
    setFormData({ clientUserId: '', name: '', address: '', city: '', district: '', google_maps_link: '' });
    setSelectedCityId('');
    setErrors({});
  };

  const handleCityChange = (cityId: string) => {
    const city = EGYPT_CITIES.find(c => c.id === cityId);
    setSelectedCityId(cityId);
    setFormData({ ...formData, city: city?.name || '', district: '' });
  };

  const districts = selectedCityId ? getDistrictsByCity(selectedCityId) : [];

  const validate = (): boolean => {
    const newErrors: Partial<AdminBranchFormData> = {};
    if (!formData.clientUserId) newErrors.clientUserId = t('validation.client_required', 'Client is required.');
    if (!formData.name.trim()) newErrors.name = t('validation.name_required');
    if (!formData.address.trim()) newErrors.address = t('validation.address_required');
    if (!formData.city.trim()) newErrors.city = t('validation.city_required');
    if (!formData.google_maps_link.trim()) {
      newErrors.google_maps_link = t('validation.maps_required');
    } else if (!formData.google_maps_link.includes('google.com/maps') && !formData.google_maps_link.includes('maps.google.com') && !formData.google_maps_link.includes('goo.gl/maps')) {
      newErrors.google_maps_link = t('validation.maps_invalid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createBranchMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('add_branch')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('form.add_dialog_title')}
          </DialogTitle>
          <DialogDescription>
            {t('form.add_dialog_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          <div className="space-y-2">
            <ClientSelector
              value={formData.clientUserId}
              onValueChange={(value) => setFormData({ ...formData, clientUserId: value })}
              required
            />
            {errors.clientUserId && <p className="text-xs text-destructive">{errors.clientUserId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('form.branch_name')}<span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder={t('form.branch_name_placeholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t('form.city')}<span className="text-destructive">*</span></Label>
              <Select value={selectedCityId} onValueChange={handleCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('form.city_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {EGYPT_CITIES.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">{t('form.district')}</Label>
              <Select 
                value={formData.district || ''} 
                onValueChange={(value) => setFormData({ ...formData, district: value })}
                disabled={!selectedCityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCityId ? t('form.district_placeholder') : t('form.district_placeholder_no_city')} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.name}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('form.address')}<span className="text-destructive">*</span></Label>
            <Input
              id="address"
              placeholder={t('form.address_placeholder')}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_maps_link" className="flex items-center gap-2">
              <LinkIcon className="h-3 w-3" />
              {t('form.google_maps_link')}<span className="text-destructive">*</span>
            </Label>
            <Input
              id="google_maps_link"
              placeholder={t('form.google_maps_placeholder')}
              value={formData.google_maps_link}
              onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })}
            />
            {errors.google_maps_link && <p className="text-xs text-destructive">{errors.google_maps_link}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={createBranchMutation.isPending}>
              {createBranchMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('add_branch')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function extractCoordsFromLink(link: string): { lat: number; lng: number } | null {
  try {
    const qMatch = link.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    const atMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    return null;
  } catch {
    return null;
  }
}
