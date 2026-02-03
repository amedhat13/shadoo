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
import { Building2, CheckCircle, XCircle, Clock, MapPin, ExternalLink } from 'lucide-react';

const mockBranches = [
  { id: '1', name: 'Mall of Arabia - Ground Floor', client: 'Cairo Electronics Co.', city: 'Giza', status: 'pending_verification', created: '2 hours ago' },
  { id: '2', name: 'City Stars - Level 2', client: 'Pharma Plus Egypt', city: 'Cairo', status: 'pending_verification', created: '5 hours ago' },
  { id: '3', name: 'Nasr City Branch', client: 'Fresh Foods Market', city: 'Cairo', status: 'pending_verification', created: '1 day ago' },
  { id: '4', name: 'Alexandria Downtown', client: 'Tech Solutions MENA', city: 'Alexandria', status: 'verified', created: '3 days ago' },
  { id: '5', name: 'Maadi Grand Mall', client: 'Al-Ahram Retail', city: 'Cairo', status: 'rejected', created: '1 week ago' },
];

export default function AdminBranchesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Branch Management"
          description="Verify and manage client branches."
          badge={
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              12 Pending
            </Badge>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Branches" value="256" icon={Building2} />
          <StatCard title="Pending Verification" value="12" variant="warning" icon={Clock} />
          <StatCard title="Verified" value="238" variant="success" icon={CheckCircle} />
          <StatCard title="Rejected" value="6" variant="destructive" icon={XCircle} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending (12)
            </TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Branches</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Pending Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBranches.filter(b => b.status === 'pending_verification').map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{branch.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{branch.client}</TableCell>
                        <TableCell>{branch.city}</TableCell>
                        <TableCell className="text-muted-foreground">{branch.created}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              View Map
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Verify
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

          <TabsContent value="verified">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Verified branches list will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Rejected branches list will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                All branches list with filters will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
