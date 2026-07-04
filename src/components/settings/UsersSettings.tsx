import { useState } from 'react';
import { Users, Plus, MoreHorizontal, Mail, Shield, Trash2, Loader2, Info, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const MAX_USERS = 3;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer' | 'ai';
  status: 'active' | 'pending';
  joined_at: string;
  isAI?: boolean;
}

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Ahmed Hassan', email: 'ahmed@shadoo.com', role: 'admin', status: 'active', joined_at: '2024-01-15' },
  { id: '2', name: 'Sara Mohamed', email: 'sara@shadoo.com', role: 'manager', status: 'active', joined_at: '2024-02-20' },
  { id: '3', name: 'AI Account', email: 'ai@shadoo.com', role: 'ai', status: 'active', joined_at: '2026-07-04', isAI: true },
];


export function UsersSettings() {
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const { t } = useTranslation('settings');

  const isAtLimit = team.length >= MAX_USERS;

  const ROLE_CONFIG = {
    admin: { label: t('users.roles.admin'), description: t('users.roles.admin_description'), variant: 'default' as const },
    manager: { label: t('users.roles.manager'), description: t('users.roles.manager_description'), variant: 'secondary' as const },
    viewer: { label: t('users.roles.viewer'), description: t('users.roles.viewer_description'), variant: 'outline' as const },
    ai: { label: 'Shadoo AI', description: 'Automated AI assistant with read access to reports and analytics.', variant: 'secondary' as const },
  };


  const handleInvite = async () => {
    if (!inviteEmail || isAtLimit) return;
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
    toast.success(t('users.invitation_sent'));
  };

  const handleRemove = (id: string) => {
    setTeam(team.filter((m) => m.id !== id));
    toast.success(t('users.member_removed'));
  };

  const handleRoleChange = (id: string, newRole: 'admin' | 'manager' | 'viewer') => {
    setTeam(team.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    toast.success(t('users.role_updated'));
  };

  return (
    <div className="space-y-6">
      {isAtLimit && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>{t('users.limit_reached')}</span>
            <Button variant="outline" size="sm" className="gap-1 w-fit" asChild>
              <a href="mailto:support@shadoo.com">
                <MessageSquare className="h-3 w-3" />
                {t('users.contact_support')}
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('users.team_title')}
            </CardTitle>
            <CardDescription>{t('users.team_description')}</CardDescription>
          </div>
          {!isAtLimit && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('users.invite_user')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('users.invite_title')}</DialogTitle>
                  <DialogDescription>{t('users.invite_description')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">{t('users.email_address')}</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder={t('users.email_placeholder')}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">{t('users.role')}</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('users.admin_full')}</SelectItem>
                        <SelectItem value="manager">{t('users.manager_missions')}</SelectItem>
                        <SelectItem value="viewer">{t('users.viewer_readonly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleInvite} disabled={!inviteEmail || isInviting} className="w-full">
                    {isInviting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                    {t('users.send_invitation')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {team.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role];
              const initials = member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div key={member.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar className={`h-10 w-10 border ${member.isAI ? 'border-primary' : 'border-border'}`}>
                      <AvatarFallback className={member.isAI ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground text-sm font-medium'}>
                        {member.isAI ? <Sparkles className="h-4 w-4" /> : initials}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {member.status === 'pending' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-help">{t('users.pending')}</Badge>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('users.pending_tooltip')}</p></TooltipContent>
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
                      <TooltipContent><p>{roleConfig.description}</p></TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                          <Shield className="me-2 h-4 w-4" />{t('users.make_admin')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'manager')}>
                          <Users className="me-2 h-4 w-4" />{t('users.make_manager')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'viewer')}>
                          <Users className="me-2 h-4 w-4" />{t('users.make_viewer')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRemove(member.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="me-2 h-4 w-4" />{t('users.remove')}
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
