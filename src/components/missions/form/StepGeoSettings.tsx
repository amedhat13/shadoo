import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MissionFormData } from '@/types';

interface StepGeoSettingsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

export function StepGeoSettings({ data, onChange }: StepGeoSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 border rounded-lg">
        <div className="p-2 rounded-lg bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="geo-tagged" className="text-base font-semibold cursor-pointer">
              Geo-Tagged Mission
            </Label>
            <Switch
              id="geo-tagged"
              checked={data.is_geo_tagged ?? false}
              onCheckedChange={(checked) => onChange({ is_geo_tagged: checked })}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            When enabled, agents must be within the branch's location to submit their visit. 
            This ensures physical presence at the designated location.
          </p>
        </div>
      </div>

      {data.is_geo_tagged && (
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <h4 className="text-sm font-medium">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Agent's GPS location is verified when submitting the visit</li>
            <li>A tolerance radius of ~100 meters is allowed</li>
            <li>Visits from outside the area will be flagged for review</li>
            <li>Branch must have valid coordinates (latitude/longitude)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
