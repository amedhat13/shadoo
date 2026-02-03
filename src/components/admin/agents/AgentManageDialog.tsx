import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  FileText, 
  CheckCircle,
  Crown,
  Star,
  Users,
  Ban,
  RefreshCw
} from 'lucide-react';
import { Agent, useUpdateAgentTier, useSuspendAgent, useReactivateAgent } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';

interface AgentManageDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tierOptions = [
  { 
    code: 'C', 
    name: 'Entry Agent', 
    description: 'New agents building their reputation',
    icon: Users,
    color: 'bg-amber-700'
  },
  { 
    code: 'B', 
    name: 'Standard Agent', 
    description: 'Experienced agents with good performance',
    icon: Star,
    color: 'bg-slate-400'
  },
  { 
    code: 'A', 
    name: 'Premium Agent', 
    description: 'Top-tier agents with excellent track record',
    icon: Crown,
    color: 'bg-amber-500'
  },
];

export function AgentManageDialog({ agent, open, onOpenChange }: AgentManageDialogProps) {
  const [selectedTier, setSelectedTier] = useState<string>(agent?.tier || 'C');
  const updateTier = useUpdateAgentTier();
  const suspendAgent = useSuspendAgent();
  const reactivateAgent = useReactivateAgent();

  if (!agent) return null;

  const questionnaire = Array.isArray(agent.questionnaire_answers) 
    ? agent.questionnaire_answers 
    : [];

  const hasChangedTier = selectedTier !== agent.tier;

  const handleSaveTier = () => {
    updateTier.mutate(
      { agentId: agent.id, tier: selectedTier },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleSuspend = () => {
    suspendAgent.mutate(agent.id, {
      onSuccess: () => onOpenChange(false)
    });
  };

  const handleReactivate = () => {
    reactivateAgent.mutate(agent.id, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Manage Agent
            <Badge 
              variant="outline" 
              className={cn(
                agent.status === 'active' && 'bg-success/10 text-success border-success/20',
                agent.status === 'suspended' && 'bg-destructive/10 text-destructive border-destructive/20'
              )}
            >
              {agent.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View agent details, update tier, or change status.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info & Stats */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Agent Information
              </Label>
              <div className="grid gap-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{agent.full_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{agent.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{agent.phone}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-2xl font-bold">{agent.completed_visits || 0}</p>
                  <p className="text-xs text-muted-foreground">Completed Visits</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    {agent.rating_avg ? (
                      <>
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        {agent.rating_avg.toFixed(1)}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-2xl font-bold text-success">
                    {agent.total_earnings?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Earnings (EGP)</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Questionnaire Answers */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Questionnaire Responses
              </Label>
              {questionnaire.length > 0 ? (
                <div className="space-y-3">
                  {questionnaire.map((item: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="text-sm font-medium mb-1">{item.question}</p>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No questionnaire responses available</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Tier Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Agent Tier
              </Label>
              <div className="grid gap-2">
                {tierOptions.map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = selectedTier === tier.code;
                  const isCurrent = agent.tier === tier.code;
                  
                  return (
                    <button
                      key={tier.code}
                      type="button"
                      onClick={() => setSelectedTier(tier.code)}
                      className={cn(
                        'flex items-center gap-3 p-3 border rounded-lg text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'hover:border-primary/50'
                      )}
                    >
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded text-white',
                        tier.color
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Tier {tier.code}</span>
                          <Badge variant="outline" className="text-xs">
                            {tier.name}
                          </Badge>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{tier.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 mr-auto">
            {agent.status === 'active' ? (
              <Button
                variant="outline"
                onClick={handleSuspend}
                disabled={suspendAgent.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspend Agent
              </Button>
            ) : agent.status === 'suspended' ? (
              <Button
                variant="outline"
                onClick={handleReactivate}
                disabled={reactivateAgent.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reactivate
              </Button>
            ) : null}
          </div>
          <Button
            onClick={handleSaveTier}
            disabled={!hasChangedTier || updateTier.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {hasChangedTier ? `Change to Tier ${selectedTier}` : 'No Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
