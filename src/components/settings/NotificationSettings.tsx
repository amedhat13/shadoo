import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface NotificationPrefs {
  email_mission_updates: boolean;
  email_visit_completed: boolean;
  email_weekly_digest: boolean;
  push_mission_updates: boolean;
  push_visit_completed: boolean;
  push_wallet_alerts: boolean;
  sms_critical_alerts: boolean;
}

const defaultPrefs: NotificationPrefs = {
  email_mission_updates: true,
  email_visit_completed: true,
  email_weekly_digest: false,
  push_mission_updates: true,
  push_visit_completed: false,
  push_wallet_alerts: true,
  sms_critical_alerts: false,
};

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [isLoading, setIsLoading] = useState(false);

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    setPrefs({ ...prefs, [key]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success('Notification preferences saved');
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what updates you receive via email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-mission" className="font-medium">Mission Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when mission status changes.
              </p>
            </div>
            <Switch
              id="email-mission"
              checked={prefs.email_mission_updates}
              onCheckedChange={(v) => updatePref('email_mission_updates', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-visit" className="font-medium">Visit Completed</Label>
              <p className="text-sm text-muted-foreground">
                Receive email when an agent completes a visit.
              </p>
            </div>
            <Switch
              id="email-visit"
              checked={prefs.email_visit_completed}
              onCheckedChange={(v) => updatePref('email_visit_completed', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-digest" className="font-medium">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Summary of all activity sent every Monday.
              </p>
            </div>
            <Switch
              id="email-digest"
              checked={prefs.email_weekly_digest}
              onCheckedChange={(v) => updatePref('email_weekly_digest', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Real-time alerts in your browser or mobile app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-mission" className="font-medium">Mission Updates</Label>
              <p className="text-sm text-muted-foreground">
                Instant notifications for mission changes.
              </p>
            </div>
            <Switch
              id="push-mission"
              checked={prefs.push_mission_updates}
              onCheckedChange={(v) => updatePref('push_mission_updates', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-visit" className="font-medium">Visit Completed</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when visits are submitted.
              </p>
            </div>
            <Switch
              id="push-visit"
              checked={prefs.push_visit_completed}
              onCheckedChange={(v) => updatePref('push_visit_completed', v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-wallet" className="font-medium">Wallet Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Low balance and transaction notifications.
              </p>
            </div>
            <Switch
              id="push-wallet"
              checked={prefs.push_wallet_alerts}
              onCheckedChange={(v) => updatePref('push_wallet_alerts', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Text messages for critical alerts only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-critical" className="font-medium">Critical Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Security issues, payment failures, and urgent matters.
              </p>
            </div>
            <Switch
              id="sms-critical"
              checked={prefs.sms_critical_alerts}
              onCheckedChange={(v) => updatePref('sms_critical_alerts', v)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
