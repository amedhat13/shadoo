import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Building2, Camera, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { seedTLabDemo } from '@/lib/seedTLabDemo';
import { seedTamaraDemo } from '@/lib/seedTamaraDemo';
import { seedAIDemo } from '@/lib/seedAIDemo';
import { seedTBSDemo } from '@/lib/seedTBSDemo';


interface AccountData {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  industry?: string;
  avatar_url?: string;
}

const INDUSTRY_OPTIONS = [
  { value: 'fnb', label: 'Food & Beverage' },
  { value: 'retail', label: 'Retail' },
  { value: 'banking', label: 'Banking & Finance' },
  { value: 'telecom', label: 'Telecom' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'hospitality', label: 'Hospitality & Hotels' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

const mockAccount: AccountData = {
  full_name: 'Ahmed Hassan',
  email: 'ahmed@shadoo.com',
  phone: '+20 100 123 4567',
  company_name: 'Shadoo Inc.',
  industry: 'fnb',
  avatar_url: '',
};

export function AccountSettings() {
  const [account, setAccount] = useState<AccountData>(mockAccount);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingTamara, setIsSeedingTamara] = useState(false);
  const [isSeedingAI, setIsSeedingAI] = useState(false);
  const [isSeedingTBS, setIsSeedingTBS] = useState(false);

  const handleSeedTBS = async () => {
    setIsSeedingTBS(true);
    try {
      const result = await seedTBSDemo();
      if (!result.ok) {
        toast.error(`Failed to seed TBS demo. ${result.error || ''}`);
      } else if (result.alreadySeeded) {
        toast.info('TBS demo already seeded.');
      } else {
        toast.success(`TBS demo loaded: ${result.branchesInserted} branch, ${result.missionsInserted} mission, ${result.visitsInserted} visits.`);
        queryClient.invalidateQueries({ queryKey: ['branches'] });
        queryClient.invalidateQueries({ queryKey: ['missions'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-missions'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-visits'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-branches'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-scores'] });
      }
    } catch (e) {
      toast.error(`Failed to seed TBS demo. ${(e as Error).message}`);
    } finally {
      setIsSeedingTBS(false);
    }
  };

  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const result = await seedTLabDemo();
      if (!result.ok) {
        toast.error(`${t('account.seed_demo_error')} ${result.error || ''}`);
      } else if (result.alreadySeeded) {
        toast.info(t('account.seed_demo_already'));
      } else {
        toast.success(t('account.seed_demo_success'));
        queryClient.invalidateQueries({ queryKey: ['branches'] });
        queryClient.invalidateQueries({ queryKey: ['missions'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-missions'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-visits'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-branches'] });
      }
    } catch (e) {
      toast.error(`${t('account.seed_demo_error')} ${(e as Error).message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedTamara = async () => {
    setIsSeedingTamara(true);
    try {
      const result = await seedTamaraDemo();
      if (!result.ok) {
        toast.error(`Failed to seed Tamara demo. ${result.error || ''}`);
      } else if (result.alreadySeeded) {
        toast.info('Tamara demo already seeded.');
      } else {
        toast.success(`Tamara demo loaded: ${result.branchesInserted} branches, ${result.missionsInserted} missions, ${result.visitsInserted} visits.`);
        queryClient.invalidateQueries({ queryKey: ['branches'] });
        queryClient.invalidateQueries({ queryKey: ['missions'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-missions'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-visits'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-branches'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-scores'] });
      }
    } catch (e) {
      toast.error(`Failed to seed Tamara demo. ${(e as Error).message}`);
    } finally {
      setIsSeedingTamara(false);
    }
  };

  const handleSeedAI = async () => {
    setIsSeedingAI(true);
    try {
      const result = await seedAIDemo();
      if (!result.ok) {
        toast.error(`Failed to seed Test Account. ${result.error || ''}`);
      } else if (result.alreadySeeded) {
        toast.info('Test Account already seeded.');
      } else {
        toast.success(`Test Account loaded: ${result.branchesInserted} branches, ${result.missionsInserted} missions, ${result.visitsInserted} visits.`);

        queryClient.invalidateQueries({ queryKey: ['branches'] });
        queryClient.invalidateQueries({ queryKey: ['missions'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-missions'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-visits'] });
        queryClient.invalidateQueries({ queryKey: ['client-reports-branches'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-scores'] });
      }
    } catch (e) {
      toast.error(`Failed to seed AI demo. ${(e as Error).message}`);
    } finally {
      setIsSeedingAI(false);
    }
  };


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
            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Industry / Category
              </Label>
              <select
                id="industry"
                value={account.industry || ''}
                onChange={(e) => setAccount({ ...account, industry: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select an industry…</option>
                {INDUSTRY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Drives default mission templates and cover-story suggestions.</p>
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

      {/* Demo Data */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('account.demo_data_title')}
          </CardTitle>
          <CardDescription>{t('account.demo_data_description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleSeedDemo} disabled={isSeeding} variant="outline" className="gap-2">
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('account.seed_demo_loading')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('account.seed_demo')}
              </>
            )}
          </Button>
          <Button onClick={handleSeedTamara} disabled={isSeedingTamara} variant="outline" className="gap-2">
            {isSeedingTamara ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Tamara demo…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Load Tamara Demo
              </>
            )}
          </Button>
          <Button onClick={handleSeedAI} disabled={isSeedingAI} variant="outline">
            {isSeedingAI ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Loading Test account…
              </>
            ) : (
              'Load Test Account'
            )}
          </Button>
          <Button onClick={handleSeedTBS} disabled={isSeedingTBS} variant="outline" className="gap-2">
            {isSeedingTBS ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading TBS demo…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Load TBS Demo
              </>
            )}
          </Button>


        </CardContent>
      </Card>
    </div>
  );
}