import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ShieldCheck, Plus, MoreHorizontal, Edit2, UserX, Key } from 'lucide-react';

const mockAdmins = [
  { id: '1', name: 'Mohamed Sherif', email: 'sherif@shadoo.com', role: 'super_admin', status: 'active', lastLogin: '2 hours ago' },
  { id: '2', name: 'Sara Ahmed', email: 'sara@shadoo.com', role: 'support', status: 'active', lastLogin: '5 hours ago' },
  { id: '3', name: 'Ahmed Hassan', email: 'ahmed@shadoo.com', role: 'finance', status: 'active', lastLogin: '1 day ago' },
  { id: '4', name: 'Fatma Ibrahim', email: 'fatma@shadoo.com', role: 'operations', status: 'active', lastLogin: '3 days ago' },
  { id: '5', name: 'Omar Khaled', email: 'omar@shadoo.com', role: 'support', status: 'inactive', lastLogin: '2 weeks ago' },
];

const roleColors: Record<string, string> = {
  super_admin: 'bg-primary text-primary-foreground',
  admin: 'bg-foreground text-background',
  support: 'bg-muted text-muted-foreground',
  finance: 'bg-success/10 text-success border-success/20',
  operations: 'bg-warning/10 text-warning border-warning/20',
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  support: 'Support',
  finance: 'Finance',
  operations: 'Operations',
};

export default function AdminAdminsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Admin User Management"
          description="Manage admin accounts and permissions."
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Invite Admin
            </Button>
          }
        />

        {/* Role Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Super Admin</p>
                  <p className="text-2xl font-black">1</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Admin</p>
              <p className="text-2xl font-black">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Support</p>
              <p className="text-2xl font-black">2</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Finance</p>
              <p className="text-2xl font-black">1</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Operations</p>
              <p className="text-2xl font-black">1</p>
            </CardContent>
          </Card>
        </div>

        {/* Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">All Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[admin.role]}>
                        {roleLabels[admin.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{admin.lastLogin}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
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

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Permission</th>
                    <th className="text-center py-3 px-4 font-semibold">Super Admin</th>
                    <th className="text-center py-3 px-4 font-semibold">Admin</th>
                    <th className="text-center py-3 px-4 font-semibold">Support</th>
                    <th className="text-center py-3 px-4 font-semibold">Finance</th>
                    <th className="text-center py-3 px-4 font-semibold">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Manage Clients', super: true, admin: true, support: true, finance: false, ops: false },
                    { name: 'Verify Branches', super: true, admin: true, support: true, finance: false, ops: true },
                    { name: 'Manage Agents', super: true, admin: true, support: true, finance: false, ops: true },
                    { name: 'Process Payouts', super: true, admin: true, support: false, finance: true, ops: false },
                    { name: 'View Finances', super: true, admin: true, support: false, finance: true, ops: false },
                    { name: 'Manage Plans', super: true, admin: true, support: false, finance: false, ops: false },
                    { name: 'System Config', super: true, admin: false, support: false, finance: false, ops: false },
                    { name: 'Manage Admins', super: true, admin: false, support: false, finance: false, ops: false },
                  ].map((perm, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 px-4">{perm.name}</td>
                      <td className="text-center py-3 px-4">{perm.super ? '✓' : '–'}</td>
                      <td className="text-center py-3 px-4">{perm.admin ? '✓' : '–'}</td>
                      <td className="text-center py-3 px-4">{perm.support ? '✓' : '–'}</td>
                      <td className="text-center py-3 px-4">{perm.finance ? '✓' : '–'}</td>
                      <td className="text-center py-3 px-4">{perm.ops ? '✓' : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
