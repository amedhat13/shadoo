import { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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

  // Mobile Agent Card
  const AgentCard = ({ agent, showReview = false }: { agent: Agent; showReview?: boolean }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{agent.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
          </div>
          {agent.tier && (
            <Badge className={tierColors[agent.tier]}>
              Tier {agent.tier}
            </Badge>
          )}
          {agent.status && !agent.tier && (
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
          )}
        </div>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span>{agent.phone}</span>
          </div>
          {agent.rating_avg && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" />
                {agent.rating_avg.toFixed(1)}
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Visits</span>
            <span>{agent.completed_visits || 0}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t">
          <Button 
            size="sm" 
            className="w-full gap-1"
            variant={showReview ? "default" : "outline"}
            onClick={() => showReview ? handleReviewAgent(agent) : handleManageAgent(agent)}
          >
            {showReview ? (
              <>
                <Eye className="h-4 w-4" />
                Review
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                Manage
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Agent Management"
          description="Approve, manage, and monitor agents."
          badge={
            stats?.pending ? (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                {stats.pending} Pending
              </Badge>
            ) : null
          }
          actions={
            <Button variant="outline" size="sm" onClick={() => setQuestionnaireEditorOpen(true)}>
              <ClipboardList className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Edit </span>Questionnaire
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          <StatCard 
            title="Total Agents" 
            value={statsLoading ? '...' : stats?.total?.toString() || '0'} 
            icon={Users} 
          />
          <StatCard 
            title="Pending" 
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
            title="Avg. Rating" 
            value={statsLoading ? '...' : stats?.avgRating || '0'} 
            icon={Star} 
          />
          <StatCard 
            title="Avg. Rating" 
            value={statsLoading ? '...' : stats?.avgRating || '0'} 
            icon={Star} 
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto">
              <TabsTrigger value="pending" className="gap-1 text-xs md:text-sm">
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Pending</span> ({stats?.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs md:text-sm">Active</TabsTrigger>
              <TabsTrigger value="suspended" className="text-xs md:text-sm">Suspended</TabsTrigger>
              <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-sm md:text-base font-bold uppercase">Pending Approval</CardTitle>
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
                  <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} showReview />
                      ))}
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
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
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-sm md:text-base font-bold uppercase">Active Agents</CardTitle>
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
                  <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
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
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suspended Tab */}
          <TabsContent value="suspended">
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-sm md:text-base font-bold uppercase">Suspended Agents</CardTitle>
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
                  <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
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
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Agents Tab */}
          <TabsContent value="all">
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-sm md:text-base font-bold uppercase">All Agents</CardTitle>
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
                  <>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} showReview={agent.status === 'pending'} />
                      ))}
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
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
                    </div>
                  </>
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
