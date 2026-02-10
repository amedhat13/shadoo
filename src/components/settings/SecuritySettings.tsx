import { useState } from 'react';
import { Shield, Key, Smartphone, History, AlertTriangle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Session {
  id: string;
  device: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

const mockSessions: Session[] = [
  { id: '1', device: 'Chrome on MacOS', location: 'Cairo, Egypt', last_active: 'Active now', is_current: true },
  { id: '2', device: 'Safari on iPhone', location: 'Alexandria, Egypt', last_active: '2 hours ago', is_current: false },
  { id: '3', device: 'Firefox on Windows', location: 'Cairo, Egypt', last_active: '3 days ago', is_current: false },
];

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');

  const handleToggle2FA = async () => {
    setIsEnabling2FA(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTwoFactorEnabled(!twoFactorEnabled);
    setIsEnabling2FA(false);
    toast.success(twoFactorEnabled ? t('security.two_factor_disabled') : t('security.two_factor_enabled'));
  };

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    toast.success(t('security.session_revoked'));
  };

  const handleRevokeAll = () => {
    setSessions(sessions.filter((s) => s.is_current));
    toast.success(t('security.all_sessions_revoked'));
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('security.two_factor_title')}
          </CardTitle>
          <CardDescription>{t('security.two_factor_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center ${twoFactorEnabled ? 'bg-success/10' : 'bg-muted'}`}>
                {twoFactorEnabled ? <Check className="h-5 w-5 text-success" /> : <Smartphone className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('security.authenticator_app')}</span>
                  {twoFactorEnabled && <Badge variant="default" className="bg-success">{t('security.enabled')}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{t('security.authenticator_description')}</p>
              </div>
            </div>
            <Button variant={twoFactorEnabled ? 'outline' : 'default'} onClick={handleToggle2FA} disabled={isEnabling2FA}>
              {isEnabling2FA && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {twoFactorEnabled ? t('security.disable') : t('security.enable')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('security.active_sessions_title')}
            </CardTitle>
            <CardDescription>{t('security.active_sessions_description')}</CardDescription>
          </div>
          {sessions.filter((s) => !s.is_current).length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">{t('security.revoke_all_others')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('security.revoke_all_confirm_title')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('security.revoke_all_confirm_description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevokeAll}>{t('security.revoke_all')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-muted">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.device}</span>
                      {session.is_current && <Badge variant="secondary" className="text-xs">{t('security.current')}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{session.location} · {session.last_active}</p>
                  </div>
                </div>
                {!session.is_current && (
                  <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)}>{t('security.revoke')}</Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('security.danger_zone_title')}
          </CardTitle>
          <CardDescription>{t('security.danger_zone_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.delete_account')}</p>
              <p className="text-sm text-muted-foreground">{t('security.delete_account_description')}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">{t('security.delete_account')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('security.delete_confirm_title')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('security.delete_confirm_description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => toast.error(t('security.delete_disabled_demo'))}
                  >
                    {t('security.delete_account')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}