import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClipboardList, Search, MoreHorizontal, Eye, Pause, Archive, Filter } from 'lucide-react';

const mockMissions = [
  { id: '1', name: 'Customer Service Audit', client: 'Cairo Electronics Co.', branch: 'Mall of Arabia', status: 'published', visits: '8/10', budget: '2,500 EGP' },
  { id: '2', name: 'Store Cleanliness Check', client: 'Pharma Plus Egypt', branch: 'City Stars', status: 'published', visits: '15/20', budget: '4,000 EGP' },
  { id: '3', name: 'Product Availability', client: 'Fresh Foods Market', branch: 'Nasr City', status: 'paused', visits: '3/5', budget: '1,000 EGP' },
  { id: '4', name: 'Staff Behavior Review', client: 'Tech Solutions MENA', branch: 'Alex Downtown', status: 'completed', visits: '10/10', budget: '3,500 EGP' },
  { id: '5', name: 'Pricing Accuracy', client: 'Al-Ahram Retail', branch: 'Maadi Mall', status: 'draft', visits: '0/15', budget: '5,250 EGP' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-success text-success-foreground',
  paused: 'bg-warning text-warning-foreground',
  completed: 'bg-primary text-primary-foreground',
};

export default function AdminMissionsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Mission Monitoring"
          description="View and manage all missions across clients."
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Missions" value="342" icon={ClipboardList} />
          <StatCard title="Published" value="89" variant="success" />
          <StatCard title="Paused" value="12" variant="warning" />
          <StatCard title="Completed" value="241" />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search missions..." className="pl-9" />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Missions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">All Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mission</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMissions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium">{mission.name}</TableCell>
                    <TableCell className="text-muted-foreground">{mission.client}</TableCell>
                    <TableCell>{mission.branch}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[mission.status]}>
                        {mission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{mission.visits}</TableCell>
                    <TableCell className="text-right font-medium">{mission.budget}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Force Pause
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Force Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
