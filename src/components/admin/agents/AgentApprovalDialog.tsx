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
  XCircle,
  Crown,
  Star,
  Users
} from 'lucide-react';
import { Agent, useApproveAgent, useRejectAgent } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';

interface AgentApprovalDialogProps {
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

export function AgentApprovalDialog({ agent, open, onOpenChange }: AgentApprovalDialogProps) {
  const [selectedTier, setSelectedTier] = useState<string>('C');
  const approveAgent = useApproveAgent();
  const rejectAgent = useRejectAgent();

  if (!agent) return null;

  const questionnaire = Array.isArray(agent.questionnaire_answers) 
    ? agent.questionnaire_answers 
    : [];

  const documents = Array.isArray(agent.verification_docs) 
    ? agent.verification_docs 
    : [];

  const handleApprove = () => {
    approveAgent.mutate(
      { agentId: agent.id, tier: selectedTier },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleReject = () => {
    rejectAgent.mutate(
      { agentId: agent.id },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Agent Verification</DialogTitle>
          <DialogDescription>
            Review agent details, questionnaire responses, and assign a tier.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Basic Information
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
                {agent.national_id && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>National ID: {agent.national_id}</span>
                  </div>
                )}
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

            {/* Documents */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Verification Documents
              </Label>
              {documents.length > 0 ? (
                <div className="grid gap-2">
                  {documents.map((doc: any, index: number) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents uploaded</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Tier Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Assign Agent Tier
              </Label>
              <div className="grid gap-2">
                {tierOptions.map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = selectedTier === tier.code;
                  
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={rejectAgent.isPending}
            className="text-destructive hover:text-destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approveAgent.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve as Tier {selectedTier}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
