import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building2, 
  ClipboardList, 
  UserCheck, 
  Wallet, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Admin Dashboard"
          description="Platform overview and key metrics."
        />

        {/* Key Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clients"
            value="124"
            description="12 active this week"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Active Missions"
            value="89"
            description="23 published today"
            icon={ClipboardList}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Registered Agents"
            value="456"
            description="342 active"
            icon={UserCheck}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Revenue (MTD)"
            value="245,000 EGP"
            description="Subscriptions + Topups"
            icon={Wallet}
            variant="success"
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Action Required */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Clock className="h-4 w-4 text-warning" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Branch Verifications</span>
                <span className="font-bold text-warning">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Agent Approvals</span>
                <span className="font-bold text-warning">8</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Pending Payouts</span>
                <span className="font-bold text-warning">15</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/30 bg-success/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Visits Completed</span>
                <span className="font-bold text-success">47</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Missions Published</span>
                <span className="font-bold text-success">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>New Signups</span>
                <span className="font-bold text-success">5</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <TrendingUp className="h-4 w-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Total Visits</span>
                <span className="font-bold">312</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Budget Processed</span>
                <span className="font-bold">78,500 EGP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Agent Payouts</span>
                <span className="font-bold">23,400 EGP</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New client registered', detail: 'Cairo Electronics Co.', time: '5 min ago', type: 'info' },
                { action: 'Branch verified', detail: 'Mall of Arabia - Ground Floor', time: '12 min ago', type: 'success' },
                { action: 'Agent approved', detail: 'Ahmed Mohamed (Tier C)', time: '25 min ago', type: 'success' },
                { action: 'Payout processed', detail: '2,500 EGP to Mohamed Ali', time: '1 hour ago', type: 'success' },
                { action: 'Mission paused', detail: 'Customer Service Check - Nasr City', time: '2 hours ago', type: 'warning' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      item.type === 'success' ? 'bg-success' : 
                      item.type === 'warning' ? 'bg-warning' : 'bg-primary'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
