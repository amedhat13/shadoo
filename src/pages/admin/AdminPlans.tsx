import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreditCard, Plus, Edit2, Users, CheckCircle2 } from 'lucide-react';

const mockPlans = [
  { id: '1', name: 'Starter', price: 999, visits: 25, subscribers: 45, active: true },
  { id: '2', name: 'Pro', price: 2499, visits: 75, subscribers: 52, active: true },
  { id: '3', name: 'Business', price: 4999, visits: 200, subscribers: 27, active: true },
  { id: '4', name: 'Enterprise', price: 9999, visits: 500, subscribers: 8, active: true },
  { id: '5', name: 'Legacy Basic', price: 499, visits: 10, subscribers: 12, active: false },
];

export default function AdminPlansPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Subscription Plans"
          description="Configure pricing plans and features."
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          }
        />

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-black">4</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Total Subscribers</p>
                  <p className="text-2xl font-black">132</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">MRR</p>
                  <p className="text-2xl font-black text-success">298,500 EGP</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Avg. Plan Value</p>
                  <p className="text-2xl font-black">2,261 EGP</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">All Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Visits/Month</TableHead>
                  <TableHead className="text-right">Subscribers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="text-right font-bold">{plan.price.toLocaleString()} EGP</TableCell>
                    <TableCell className="text-right">{plan.visits}</TableCell>
                    <TableCell className="text-right">{plan.subscribers}</TableCell>
                    <TableCell>
                      <Badge variant={plan.active ? 'default' : 'secondary'}>
                        {plan.active ? 'Active' : 'Archived'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Plan Feature Flags</CardTitle>
            <CardDescription>Configure which features are available per plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <Label className="font-medium">Tier A Agent Access</Label>
                  <p className="text-sm text-muted-foreground">Allow access to premium agents.</p>
                </div>
                <Badge>Business+</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <Label className="font-medium">Multi-branch Missions</Label>
                  <p className="text-sm text-muted-foreground">Create missions across multiple branches.</p>
                </div>
                <Badge>Pro+</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <Label className="font-medium">Advanced Reports</Label>
                  <p className="text-sm text-muted-foreground">Access detailed analytics and exports.</p>
                </div>
                <Badge>Pro+</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <Label className="font-medium">API Access</Label>
                  <p className="text-sm text-muted-foreground">Programmatic access to mission data.</p>
                </div>
                <Badge>Enterprise</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
