import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserCheck, Users, Clock, Star, CheckCircle, XCircle, Award } from 'lucide-react';

const mockAgents = [
  { id: '1', name: 'Ahmed Mohamed', email: 'ahmed@email.com', phone: '+20 100 123 4567', tier: 'C', status: 'pending', rating: null, visits: 0 },
  { id: '2', name: 'Sara Hassan', email: 'sara@email.com', phone: '+20 101 234 5678', tier: 'C', status: 'pending', rating: null, visits: 0 },
  { id: '3', name: 'Mohamed Ali', email: 'mali@email.com', phone: '+20 102 345 6789', tier: 'B', status: 'active', rating: 4.8, visits: 45 },
  { id: '4', name: 'Fatma Ibrahim', email: 'fatma@email.com', phone: '+20 103 456 7890', tier: 'A', status: 'active', rating: 4.9, visits: 120 },
  { id: '5', name: 'Omar Khaled', email: 'omar@email.com', phone: '+20 104 567 8901', tier: 'C', status: 'suspended', rating: 3.2, visits: 15 },
];

const tierColors: Record<string, string> = {
  A: 'bg-amber-500 text-white',
  B: 'bg-slate-400 text-white',
  C: 'bg-amber-700 text-white',
};

export default function AdminAgentsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Agent Management"
          description="Approve, manage, and monitor mystery shopping agents."
          badge={
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              8 Pending Approval
            </Badge>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <StatCard title="Total Agents" value="456" icon={Users} />
          <StatCard title="Pending Approval" value="8" variant="warning" icon={Clock} />
          <StatCard title="Active" value="342" variant="success" icon={UserCheck} />
          <StatCard title="Tier A Agents" value="28" icon={Award} />
          <StatCard title="Avg. Rating" value="4.6" icon={Star} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending (8)
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
            <TabsTrigger value="all">All Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAgents.filter(a => a.status === 'pending').map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                        <TableCell>{agent.phone}</TableCell>
                        <TableCell>
                          <Button variant="link" className="p-0 h-auto text-primary">
                            View Documents
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Active Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Visits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAgents.filter(a => a.status === 'active').map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                        <TableCell>
                          <Badge className={tierColors[agent.tier]}>Tier {agent.tier}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            {agent.rating}
                          </div>
                        </TableCell>
                        <TableCell>{agent.visits}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suspended">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Suspended agents list will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                All agents list with filters will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
