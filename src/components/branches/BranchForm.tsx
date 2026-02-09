import { useState, useEffect } from 'react';
import { Branch } from '@/types';
import { BranchFormData } from '@/hooks/useBranches';
import { EGYPT_CITIES, getDistrictsByCity, getCityByName } from '@/lib/egypt-locations';
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
import { BilingualInput } from '@/components/common/BilingualInput';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BranchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null;
  onSubmit: (data: BranchFormData) => Promise<void>;
  isLoading?: boolean;
}

const initialFormState: BranchFormData = {
  name: '',
  name_ar: '',
  address: '',
  address_ar: '',
  city: '',
  district: '',
  google_maps_link: '',
};

export function BranchForm({ open, onOpenChange, branch, onSubmit, isLoading }: BranchFormProps) {
  const { t } = useTranslation('branches');
  const [formData, setFormData] = useState<BranchFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<BranchFormData>>({});
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  useEffect(() => {
    if (branch) {
      const city = getCityByName(branch.city);
      setSelectedCityId(city?.id || '');
      setFormData({
        name: branch.name,
        name_ar: branch.name_ar || '',
        address: branch.address,
        address_ar: branch.address_ar || '',
        city: branch.city,
        district: branch.district || '',
        google_maps_link: branch.google_maps_link,
      });
    } else {
      setFormData(initialFormState);
      setSelectedCityId('');
    }
    setErrors({});
  }, [branch, open]);

  const handleCityChange = (cityId: string) => {
    const city = EGYPT_CITIES.find(c => c.id === cityId);
    setSelectedCityId(cityId);
    setFormData({ 
      ...formData, 
      city: city?.name || '', 
      district: ''
    });
  };

  const handleDistrictChange = (districtName: string) => {
    setFormData({ ...formData, district: districtName });
  };

  const districts = selectedCityId ? getDistrictsByCity(selectedCityId) : [];

  const validate = (): boolean => {
    const newErrors: Partial<BranchFormData> = {};
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {branch ? t('form.edit_dialog_title') : t('form.add_dialog_title')}
          </DialogTitle>
          <DialogDescription>
            {branch ? t('form.edit_dialog_desc') : t('form.add_dialog_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          <BilingualInput
            label={t('form.branch_name')}
            value={{ en: formData.name, ar: formData.name_ar || '' }}
            onChange={(val) => setFormData({ ...formData, name: val.en, name_ar: val.ar })}
            placeholder={{ en: t('form.branch_name_placeholder'), ar: 'مثال: وسط القاهرة' }}
            required
          />
          {errors.name && <p className="text-xs text-destructive -mt-2">{errors.name}</p>}

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
                onValueChange={handleDistrictChange}
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

          <BilingualInput
            label={t('form.address')}
            value={{ en: formData.address, ar: formData.address_ar || '' }}
            onChange={(val) => setFormData({ ...formData, address: val.en, address_ar: val.ar })}
            placeholder={{ en: t('form.address_placeholder'), ar: 'مثال: 123 الشارع الرئيسي' }}
            required
          />
          {errors.address && <p className="text-xs text-destructive -mt-2">{errors.address}</p>}

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
            <p className="text-xs text-muted-foreground">
              {t('form.google_maps_help')}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : branch ? t('form.update_branch') : t('add_branch')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
