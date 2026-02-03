import { useState } from 'react';
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
import { UserCheck, Users, Clock, Star, Award, Eye, Settings, ClipboardList } from 'lucide-react';
import { useAgents, useAgentStats, Agent } from '@/hooks/useAgents';
import { AgentApprovalDialog } from '@/components/admin/agents/AgentApprovalDialog';
import { AgentManageDialog } from '@/components/admin/agents/AgentManageDialog';
import { AgentQuestionnaireEditor } from '@/components/admin/agents/AgentQuestionnaireEditor';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';

const tierColors: Record<string, string> = {
  A: 'bg-amber-500 text-white',
  B: 'bg-slate-400 text-white',
  C: 'bg-amber-700 text-white',
};

export default function AdminAgentsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [questionnaireEditorOpen, setQuestionnaireEditorOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useAgentStats();
  const { data: agents, isLoading: agentsLoading } = useAgents(activeTab);

  const handleReviewAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setApprovalDialogOpen(true);
  };

  const handleManageAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setManageDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Agent Management"
          description="Approve, manage, and monitor mystery shopping agents."
          badge={
            stats?.pending ? (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                {stats.pending} Pending Approval
              </Badge>
            ) : null
          }
          actions={
            <Button variant="outline" onClick={() => setQuestionnaireEditorOpen(true)}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Edit Questionnaire
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <StatCard 
            title="Total Agents" 
            value={statsLoading ? '...' : stats?.total?.toString() || '0'} 
            icon={Users} 
          />
          <StatCard 
            title="Pending Approval" 
            value={statsLoading ? '...' : stats?.pending?.toString() || '0'} 
            variant="warning" 
            icon={Clock} 
          />
          <StatCard 
            title="Active" 
            value={statsLoading ? '...' : stats?.active?.toString() || '0'} 
            variant="success" 
            icon={UserCheck} 
          />
          <StatCard 
            title="Tier A Agents" 
            value={statsLoading ? '...' : stats?.tierA?.toString() || '0'} 
            icon={Award} 
          />
          <StatCard 
            title="Avg. Rating" 
            value={statsLoading ? '...' : stats?.avgRating || '0'} 
            icon={Star} 
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({stats?.pending || 0})
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
            <TabsTrigger value="all">All Agents</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {agentsLoading ? (
                  <LoadingState message="Loading pending agents..." />
                ) : !agents?.length ? (
                  <EmptyState
                    icon={<UserCheck className="h-7 w-7 text-muted-foreground" />}
                    title="No pending agents"
                    description="All agent applications have been reviewed."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.full_name}</TableCell>
                          <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                          <TableCell>{agent.phone}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {agent.created_at 
                              ? new Date(agent.created_at).toLocaleDateString()
                              : 'N/A'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              className="gap-1"
                              onClick={() => handleReviewAgent(agent)}
                            >
                              <Eye className="h-4 w-4" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Active Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {agentsLoading ? (
                  <LoadingState message="Loading active agents..." />
                ) : !agents?.length ? (
                  <EmptyState
                    icon={<Users className="h-7 w-7 text-muted-foreground" />}
                    title="No active agents"
                    description="There are no active agents at the moment."
                  />
                ) : (
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
                      {agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.full_name}</TableCell>
                          <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                          <TableCell>
                            <Badge className={tierColors[agent.tier || 'C']}>
                              Tier {agent.tier || 'C'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              {agent.rating_avg?.toFixed(1) || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>{agent.completed_visits || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleManageAgent(agent)}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suspended Tab */}
          <TabsContent value="suspended">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Suspended Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {agentsLoading ? (
                  <LoadingState message="Loading suspended agents..." />
                ) : !agents?.length ? (
                  <EmptyState
                    icon={<Users className="h-7 w-7 text-muted-foreground" />}
                    title="No suspended agents"
                    description="There are no suspended agents."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Visits</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.full_name}</TableCell>
                          <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                          <TableCell>
                            <Badge className={tierColors[agent.tier || 'C']}>
                              Tier {agent.tier || 'C'}
                            </Badge>
                          </TableCell>
                          <TableCell>{agent.completed_visits || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleManageAgent(agent)}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Agents Tab */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">All Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {agentsLoading ? (
                  <LoadingState message="Loading all agents..." />
                ) : !agents?.length ? (
                  <EmptyState
                    icon={<Users className="h-7 w-7 text-muted-foreground" />}
                    title="No agents"
                    description="No agents have registered yet."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Visits</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((agent) => (
                        <TableRow key={agent.id}>
                          <TableCell className="font-medium">{agent.full_name}</TableCell>
                          <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                agent.status === 'active'
                                  ? 'bg-success/10 text-success border-success/20'
                                  : agent.status === 'pending'
                                  ? 'bg-warning/10 text-warning border-warning/20'
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              }
                            >
                              {agent.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {agent.tier && (
                              <Badge className={tierColors[agent.tier]}>
                                Tier {agent.tier}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {agent.rating_avg ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-warning text-warning" />
                                {agent.rating_avg.toFixed(1)}
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>{agent.completed_visits || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                agent.status === 'pending'
                                  ? handleReviewAgent(agent)
                                  : handleManageAgent(agent)
                              }
                            >
                              {agent.status === 'pending' ? (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </>
                              ) : (
                                <>
                                  <Settings className="h-4 w-4 mr-1" />
                                  Manage
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AgentApprovalDialog
        agent={selectedAgent}
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
      />
      <AgentManageDialog
        agent={selectedAgent}
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
      />
      <AgentQuestionnaireEditor
        open={questionnaireEditorOpen}
        onOpenChange={setQuestionnaireEditorOpen}
      />
    </AdminLayout>
  );
}
