import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { LoadingState } from '@/components/common/LoadingState';

const FEATURE_FLAGS = [
  { key: 'feature_new_mission_builder', labelKey: 'new_mission_builder', descKey: 'new_mission_builder_desc' },
  { key: 'feature_agent_mobile_v2', labelKey: 'agent_mobile_v2', descKey: 'agent_mobile_v2_desc' },
  { key: 'feature_multi_language', labelKey: 'multi_language', descKey: 'multi_language_desc' },
  { key: 'feature_api_access', labelKey: 'api_access', descKey: 'api_access_desc' },
];

export function FeatureFlagsTab() {
  const { t } = useTranslation('admin');
  const { configs, configsLoading, updateConfig, getConfigValue } = useSystemConfig();

  if (configsLoading) return <LoadingState />;

  const handleToggle = async (key: string, enabled: boolean) => {
    const current = getConfigValue(key);
    await updateConfig({ key, value: { ...current, enabled } });
  };

  return (
    <Card>
      <CardHeader className="text-start">
        <CardTitle className="text-base font-bold uppercase">{t('config.feature_flags')}</CardTitle>
        <CardDescription>{t('config.feature_flags_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {FEATURE_FLAGS.map(flag => {
          const value = getConfigValue(flag.key);
          return (
            <div key={flag.key} className="flex items-center justify-between p-4 border rounded-md">
              <div className="text-start">
                <Label className="font-medium">{t(`config.flags.${flag.labelKey}`)}</Label>
                <p className="text-sm text-muted-foreground">{t(`config.flags.${flag.descKey}`)}</p>
              </div>
              <Switch
                checked={!!value?.enabled}
                onCheckedChange={(checked) => handleToggle(flag.key, checked)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
