import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface NotificationPrefs {
  email_mission_updates: boolean;
  email_visit_completed: boolean;
  email_weekly_digest: boolean;
  push_mission_updates: boolean;
  push_visit_completed: boolean;
  push_wallet_alerts: boolean;
}

const defaultPrefs: NotificationPrefs = {
  email_mission_updates: true,
  email_visit_completed: true,
  email_weekly_digest: false,
  push_mission_updates: true,
  push_visit_completed: false,
  push_wallet_alerts: true,
};

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('settings');

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    setPrefs({ ...prefs, [key]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success(t('notifications.preferences_saved'));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('notifications.email_title')}
          </CardTitle>
          <CardDescription>{t('notifications.email_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-mission" className="font-medium">{t('notifications.mission_updates')}</Label>
              <p className="text-sm text-muted-foreground">{t('notifications.mission_updates_description')}</p>
            </div>
            <Switch id="email-mission" checked={prefs.email_mission_updates} onCheckedChange={(v) => updatePref('email_mission_updates', v)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-visit" className="font-medium">{t('notifications.visit_completed')}</Label>
              <p className="text-sm text-muted-foreground">{t('notifications.visit_completed_email_description')}</p>
            </div>
            <Switch id="email-visit" checked={prefs.email_visit_completed} onCheckedChange={(v) => updatePref('email_visit_completed', v)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-digest" className="font-medium">{t('notifications.weekly_digest')}</Label>
              <p className="text-sm text-muted-foreground">{t('notifications.weekly_digest_description')}</p>
            </div>
            <Switch id="email-digest" checked={prefs.email_weekly_digest} onCheckedChange={(v) => updatePref('email_weekly_digest', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notifications.push_title')}
          </CardTitle>
          <CardDescription>{t('notifications.push_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-mission" className="font-medium">{t('notifications.mission_updates')}</Label>
              <p className="text-sm text-muted-foreground">{t('notifications.push_mission_description')}</p>
            </div>
            <Switch id="push-mission" checked={prefs.push_mission_updates} onCheckedChange={(v) => updatePref('push_mission_updates', v)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-visit" className="font-medium">{t('notifications.visit_completed')}</Label>
              <p className="text-sm text-muted-foreground">{t('notifications.push_visit_description')}</p>
            </div>
            <Switch id="push-visit" checked={prefs.push_visit_completed} onCheckedChange={(v) => updatePref('push_visit_completed', v)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-wallet" className="font-medium">{t('notifications.wallet_alerts')}</Label>
              <p className="text-sm text-muted-foreground">{t('notifications.wallet_alerts_description')}</p>
            </div>
            <Switch id="push-wallet" checked={prefs.push_wallet_alerts} onCheckedChange={(v) => updatePref('push_wallet_alerts', v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {t('notifications.save_preferences')}
        </Button>
      </div>
    </div>
  );
}