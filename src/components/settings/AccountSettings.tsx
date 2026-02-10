import { useState } from 'react';
import { User, Mail, Phone, Building2, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface AccountData {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  avatar_url?: string;
}

const mockAccount: AccountData = {
  full_name: 'Ahmed Hassan',
  email: 'ahmed@shadoo.com',
  phone: '+20 100 123 4567',
  company_name: 'Shadoo Inc.',
  avatar_url: '',
};

export function AccountSettings() {
  const [account, setAccount] = useState<AccountData>(mockAccount);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const { t } = useTranslation('settings');

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success(t('account.profile_updated'));
  };

  const handleChangePassword = async () => {
    setIsPasswordLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsPasswordLoading(false);
    toast.success(t('account.password_reset_sent'));
  };

  const initials = account.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('account.profile_title')}
          </CardTitle>
          <CardDescription>
            {t('account.profile_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={account.avatar_url} alt={account.full_name} />
              <AvatarFallback className="bg-foreground text-background text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                {t('account.change_photo')}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('account.photo_hint')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.full_name')}
              </Label>
              <Input
                id="full_name"
                value={account.full_name}
                onChange={(e) => setAccount({ ...account, full_name: e.target.value })}
                placeholder={t('account.full_name_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.email_address')}
              </Label>
              <Input
                id="email"
                type="email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                placeholder={t('account.email_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.phone_number')}
              </Label>
              <Input
                id="phone"
                value={account.phone}
                onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                placeholder="+20 100 000 0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name" className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {t('account.company_name')}
              </Label>
              <Input
                id="company_name"
                value={account.company_name}
                onChange={(e) => setAccount({ ...account, company_name: e.target.value })}
                placeholder={t('account.company_placeholder')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('account.save_changes')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>{t('account.password_title')}</CardTitle>
          <CardDescription>
            {t('account.password_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{t('account.current_password')}</p>
              <p className="text-sm text-muted-foreground">••••••••••••</p>
            </div>
            <Button variant="outline" onClick={handleChangePassword} disabled={isPasswordLoading}>
              {isPasswordLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('account.change_password')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}