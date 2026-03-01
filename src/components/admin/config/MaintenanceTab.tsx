import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { LoadingState } from '@/components/common/LoadingState';

export function MaintenanceTab() {
  const { t } = useTranslation('admin');
  const { configsLoading, updateConfig, getConfigValue } = useSystemConfig();

  const [form, setForm] = useState({
    enabled: false,
    message: '',
    start_time: '',
    end_time: '',
  });

  const maintenanceConfig = getConfigValue('maintenance_mode');

  useEffect(() => {
    if (maintenanceConfig) {
      setForm({
        enabled: maintenanceConfig.enabled || false,
        message: maintenanceConfig.message || '',
        start_time: maintenanceConfig.start_time || '',
        end_time: maintenanceConfig.end_time || '',
      });
    }
  }, [maintenanceConfig?.enabled, maintenanceConfig?.message, maintenanceConfig?.start_time, maintenanceConfig?.end_time]);

  if (configsLoading) return <LoadingState />;

  const handleSave = async () => {
    await updateConfig({ key: 'maintenance_mode', value: form });
  };

  return (
    <Card>
      <CardHeader className="text-start">
        <CardTitle className="text-base font-bold uppercase">{t('config.maintenance_mode')}</CardTitle>
        <CardDescription>{t('config.maintenance_mode_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-md bg-destructive/5">
          <div className="text-start">
            <Label className="font-medium text-destructive">{t('config.enable_maintenance')}</Label>
            <p className="text-sm text-muted-foreground">{t('config.enable_maintenance_desc')}</p>
          </div>
          <Switch
            checked={form.enabled}
            onCheckedChange={v => setForm(p => ({ ...p, enabled: v }))}
          />
        </div>
        <div className="space-y-4">
          <div className="text-start">
            <Label>{t('config.maintenance_message')}</Label>
            <Input
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder={t('config.maintenance_message_placeholder')}
              className="mt-2"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-start">
              <Label>{t('config.start_time')}</Label>
              <Input
                type="datetime-local"
                value={form.start_time}
                onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div className="text-start">
              <Label>{t('config.end_time')}</Label>
              <Input
                type="datetime-local"
                value={form.end_time}
                onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {t('config.save_settings')}
        </Button>
      </CardContent>
    </Card>
  );
}
