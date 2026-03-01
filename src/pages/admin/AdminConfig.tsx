import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Bell, Flag, AlertTriangle } from 'lucide-react';
import { LocationsTab } from '@/components/admin/config/LocationsTab';
import { NotificationsTab } from '@/components/admin/config/NotificationsTab';
import { FeatureFlagsTab } from '@/components/admin/config/FeatureFlagsTab';
import { MaintenanceTab } from '@/components/admin/config/MaintenanceTab';

export default function AdminConfigPage() {
  const { t } = useTranslation('admin');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('config.title')}
          description={t('config.description')}
        />

        <Tabs defaultValue="locations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              {t('config.tab_locations')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              {t('config.tab_notifications')}
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Flag className="h-4 w-4" />
              {t('config.tab_features')}
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('config.tab_maintenance')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations">
            <LocationsTab />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="features">
            <FeatureFlagsTab />
          </TabsContent>
          <TabsContent value="maintenance">
            <MaintenanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
