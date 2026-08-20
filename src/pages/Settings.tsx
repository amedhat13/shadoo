import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { UsersSettings } from '@/components/settings/UsersSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { ReportMetricsSettings } from '@/components/settings/ReportMetricsSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { BillingSettings } from '@/components/settings/BillingSettings';
import { User, Users, Bell, Shield, CreditCard, BarChart3 } from 'lucide-react';

const SETTINGS_TABS = [
  { id: 'account', icon: User },
  { id: 'users', icon: Users },
  { id: 'notifications', icon: Bell },
  { id: 'reports', icon: BarChart3 },
  { id: 'security', icon: Shield },
  { id: 'billing', icon: CreditCard },
];

export default function SettingsPage() {
  const { t } = useTranslation('settings');
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const activeTab = SETTINGS_TABS.some((s) => s.id === tab) ? (tab as string) : 'account';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title={t('title')} description={t('description')} />

        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value }, { replace: true })}
          className="space-y-6"
        >
          <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
            {SETTINGS_TABS.map((tabItem) => {
              const Icon = tabItem.icon;
              return (
                <TabsTrigger
                  key={tabItem.id}
                  value={tabItem.id}
                  className="gap-2 border border-transparent data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                  {t(`tabs.${tabItem.id}`)}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="account" className="mt-6"><AccountSettings /></TabsContent>
          <TabsContent value="users" className="mt-6"><UsersSettings /></TabsContent>
          <TabsContent value="notifications" className="mt-6"><NotificationSettings /></TabsContent>
          <TabsContent value="reports" className="mt-6"><ReportMetricsSettings /></TabsContent>
          <TabsContent value="security" className="mt-6"><SecuritySettings /></TabsContent>
          <TabsContent value="billing" className="mt-6"><BillingSettings /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
