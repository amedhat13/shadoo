import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollText, Search, Filter, Download, Calendar } from 'lucide-react';

const mockLogs = [
  { id: '1', actor: 'Super Admin', action: 'branch.verify', resource: 'Mall of Arabia', details: 'Approved branch', time: '5 min ago', ip: '192.168.1.1' },
  { id: '2', actor: 'Super Admin', action: 'agent.approve', resource: 'Ahmed Mohamed', details: 'Approved as Tier C', time: '12 min ago', ip: '192.168.1.1' },
  { id: '3', actor: 'Support', action: 'client.wallet.adjust', resource: 'Cairo Electronics Co.', details: '+5,000 EGP manual credit', time: '1 hour ago', ip: '192.168.1.2' },
  { id: '4', actor: 'Finance', action: 'payout.approve', resource: 'Mohamed Ali', details: '2,500 EGP bank transfer', time: '2 hours ago', ip: '192.168.1.3' },
  { id: '5', actor: 'Super Admin', action: 'plan.update', resource: 'Pro Plan', details: 'Updated price to 2,499 EGP', time: '1 day ago', ip: '192.168.1.1' },
  { id: '6', actor: 'System', action: 'subscription.renew', resource: 'Tech Solutions MENA', details: 'Auto-renewed Business plan', time: '2 days ago', ip: 'system' },
];

const actionColors: Record<string, string> = {
  'branch.verify': 'bg-success/10 text-success border-success/20',
  'agent.approve': 'bg-success/10 text-success border-success/20',
  'client.wallet.adjust': 'bg-primary/10 text-primary border-primary/20',
  'payout.approve': 'bg-primary/10 text-primary border-primary/20',
  'plan.update': 'bg-muted text-muted-foreground border-muted',
  'subscription.renew': 'bg-muted text-muted-foreground border-muted',
};

export default function AdminAuditPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Audit Logs"
          description="Track all admin and system actions."
          actions={
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
          }
        />

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search logs..." className="pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="branch">Branch Actions</SelectItem>
                  <SelectItem value="agent">Agent Actions</SelectItem>
                  <SelectItem value="client">Client Actions</SelectItem>
                  <SelectItem value="payout">Payout Actions</SelectItem>
                  <SelectItem value="system">System Actions</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actors</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.actor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionColors[log.action] || ''}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell className="text-muted-foreground">{log.details}</TableCell>
                    <TableCell className="text-muted-foreground">{log.time}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
