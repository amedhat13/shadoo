import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { UsersSettings } from '@/components/settings/UsersSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { BillingSettings } from '@/components/settings/BillingSettings';
import { User, Users, Bell, Shield, CreditCard } from 'lucide-react';

const SETTINGS_TABS = [
  { id: 'account', icon: User },
  { id: 'users', icon: Users },
  { id: 'notifications', icon: Bell },
  { id: 'security', icon: Shield },
  { id: 'billing', icon: CreditCard },
];

export default function SettingsPage() {
  const { t } = useTranslation('settings');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title={t('title')} description={t('description')} />

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-2 border border-transparent data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                  {t(`tabs.${tab.id}`)}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="account" className="mt-6"><AccountSettings /></TabsContent>
          <TabsContent value="users" className="mt-6"><UsersSettings /></TabsContent>
          <TabsContent value="notifications" className="mt-6"><NotificationSettings /></TabsContent>
          <TabsContent value="security" className="mt-6"><SecuritySettings /></TabsContent>
          <TabsContent value="billing" className="mt-6"><BillingSettings /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
