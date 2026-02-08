import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MissionFormData } from '@/types';
import { useTranslation } from 'react-i18next';

interface StepGeoSettingsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

export function StepGeoSettings({ data, onChange }: StepGeoSettingsProps) {
  const { t } = useTranslation('missions');

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 border rounded-lg">
        <div className="p-2 rounded-lg bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="geo-tagged" className="text-base font-semibold cursor-pointer">
              {t('geo.title')}
            </Label>
            <Switch
              id="geo-tagged"
              checked={data.is_geo_tagged ?? false}
              onCheckedChange={(checked) => onChange({ is_geo_tagged: checked })}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('geo.description')}
          </p>
        </div>
      </div>

      {data.is_geo_tagged && (
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <h4 className="text-sm font-medium">{t('geo.how_it_works')}</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{t('geo.gps_verified')}</li>
            <li>{t('geo.tolerance')}</li>
            <li>{t('geo.flagged')}</li>
            <li>{t('geo.valid_coords')}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
