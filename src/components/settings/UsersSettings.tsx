import { useState } from 'react';
import { Users, Plus, MoreHorizontal, Mail, Shield, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  status: 'active' | 'pending';
  joined_at: string;
}

const mockTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    email: 'ahmed@shadoo.com',
    role: 'admin',
    status: 'active',
    joined_at: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sara Mohamed',
    email: 'sara@shadoo.com',
    role: 'manager',
    status: 'active',
    joined_at: '2024-02-20',
  },
  {
    id: '3',
    name: 'Omar Ali',
    email: 'omar@shadoo.com',
    role: 'viewer',
    status: 'pending',
    joined_at: '2024-03-10',
  },
];

const ROLE_CONFIG = {
  admin: { label: 'Admin', description: 'Full access to all features and settings.', variant: 'default' as const },
  manager: { label: 'Manager', description: 'Can create and manage missions.', variant: 'secondary' as const },
  viewer: { label: 'Viewer', description: 'Read-only access to view data.', variant: 'outline' as const },
};

export function UsersSettings() {
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    setIsInviting(true);
    await new Promise((r) => setTimeout(r, 1000));
    
    const newMember: TeamMember = {
      id: `new-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      joined_at: new Date().toISOString(),
    };
    
    setTeam([...team, newMember]);
    setInviteEmail('');
    setInviteRole('viewer');
    setInviteOpen(false);
    setIsInviting(false);
    toast.success('Invitation sent successfully');
  };

  const handleRemove = (id: string) => {
    setTeam(team.filter((m) => m.id !== id));
    toast.success('Team member removed');
  };

  const handleRoleChange = (id: string, newRole: 'admin' | 'manager' | 'viewer') => {
    setTeam(team.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    toast.success('Role updated');
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              Manage who has access to your organization.
            </CardDescription>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                      <SelectItem value="manager">Manager - Can manage missions</SelectItem>
                      <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite} disabled={!inviteEmail || isInviting} className="w-full">
                  {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {team.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role];
              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {member.status === 'pending' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-help">Pending</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Invitation sent, awaiting acceptance.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={roleConfig.variant} className="cursor-help">{roleConfig.label}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{roleConfig.description}</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'manager')}>
                          <Users className="mr-2 h-4 w-4" />
                          Make Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'viewer')}>
                          <Users className="mr-2 h-4 w-4" />
                          Make Viewer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemove(member.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
