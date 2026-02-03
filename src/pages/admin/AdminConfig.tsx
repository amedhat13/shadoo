import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, MapPin, Bell, Flag, AlertTriangle, Save } from 'lucide-react';

export default function AdminConfigPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="System Configuration"
          description="Platform-wide settings and configurations."
        />

        {/* Config Tabs */}
        <Tabs defaultValue="locations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Flag className="h-4 w-4" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Cities & Districts</CardTitle>
                <CardDescription>Manage location hierarchy for branches.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-md">
                    <p className="font-bold">Cairo</p>
                    <p className="text-sm text-muted-foreground">15 districts</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <p className="font-bold">Alexandria</p>
                    <p className="text-sm text-muted-foreground">8 districts</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <p className="font-bold">Giza</p>
                    <p className="text-sm text-muted-foreground">10 districts</p>
                  </div>
                </div>
                <Button variant="outline">Manage Locations</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Notification Templates</CardTitle>
                <CardDescription>Configure email and SMS notification templates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">Welcome Email</p>
                      <p className="text-sm text-muted-foreground">Sent to new client signups.</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">Branch Verified</p>
                      <p className="text-sm text-muted-foreground">Sent when admin verifies a branch.</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">Low Balance Alert</p>
                      <p className="text-sm text-muted-foreground">Sent when wallet balance is low.</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">Visit Completed (Agent)</p>
                      <p className="text-sm text-muted-foreground">Sent to agent after visit submission.</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features globally.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label className="font-medium">New Mission Builder</Label>
                      <p className="text-sm text-muted-foreground">Enhanced mission creation flow with AI suggestions.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label className="font-medium">Agent Mobile App V2</Label>
                      <p className="text-sm text-muted-foreground">New mobile app experience for agents.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label className="font-medium">Multi-language Support</Label>
                      <p className="text-sm text-muted-foreground">Arabic/English interface toggle.</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Label className="font-medium">API Access (Beta)</Label>
                      <p className="text-sm text-muted-foreground">Allow enterprise clients API access.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Maintenance Mode</CardTitle>
                <CardDescription>Schedule downtime and display maintenance notices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-md bg-destructive/5">
                  <div>
                    <Label className="font-medium text-destructive">Enable Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">All users will see a maintenance page.</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Maintenance Message</Label>
                    <Input 
                      placeholder="We're performing scheduled maintenance. Please check back soon." 
                      className="mt-2"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Start Time</Label>
                      <Input type="datetime-local" className="mt-2" />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input type="datetime-local" className="mt-2" />
                    </div>
                  </div>
                </div>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
