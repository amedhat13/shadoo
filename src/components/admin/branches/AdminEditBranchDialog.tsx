import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { EGYPT_CITIES, getCityByName, getDistrictsByCity } from '@/lib/egypt-locations';
import { useTranslation } from 'react-i18next';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string | null;
  google_maps_link: string;
}

interface AdminEditBranchDialogProps {
  branch: Branch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminEditBranchDialog({ branch, open, onOpenChange }: AdminEditBranchDialogProps) {
  const { t } = useTranslation('branches');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    district: '',
    google_maps_link: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (branch) {
      const cityObj = getCityByName(branch.city);
      setFormData({
        name: branch.name,
        address: branch.address,
        city: cityObj?.id || '',
        district: branch.district || '',
        google_maps_link: branch.google_maps_link,
      });
    }
  }, [branch]);

  const updateBranchMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!branch) throw new Error('No branch selected');
      const city = EGYPT_CITIES.find(c => c.id === data.city);
      const { error } = await supabase
        .from('branches')
        .update({
          name: data.name,
          address: data.address,
          city: city?.name || data.city,
          district: data.district || null,
          google_maps_link: data.google_maps_link,
          updated_at: new Date().toISOString(),
        })
        .eq('id', branch.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('toast.updated'));
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('validation.name_required');
    if (!formData.address.trim()) newErrors.address = t('validation.address_required');
    if (!formData.city) newErrors.city = t('validation.city_required');
    if (!formData.google_maps_link.trim()) newErrors.google_maps_link = t('validation.maps_required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    updateBranchMutation.mutate(formData);
  };

  const districts = getDistrictsByCity(formData.city);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <DialogTitle>{t('form.edit_dialog_title')}</DialogTitle>
          <DialogDescription>{t('form.edit_dialog_desc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.branch_name')}<span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('form.address')}<span className="text-destructive">*</span></Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('form.city')}<span className="text-destructive">*</span></Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value, district: '' })}
              >
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
              <Label>{t('form.district')}</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => setFormData({ ...formData, district: value })}
                disabled={!formData.city}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.district_placeholder')} />
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
            <Label htmlFor="maps">{t('form.google_maps_link')}<span className="text-destructive">*</span></Label>
            <Input
              id="maps"
              value={formData.google_maps_link}
              onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })}
            />
            {errors.google_maps_link && <p className="text-xs text-destructive">{errors.google_maps_link}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={updateBranchMutation.isPending}>
              {updateBranchMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('form.update_branch')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
