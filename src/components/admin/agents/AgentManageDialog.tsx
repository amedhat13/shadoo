import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, Phone, Mail, FileText, CheckCircle, Crown, Star, Users, Ban, RefreshCw,
} from 'lucide-react';
import { Agent, useUpdateAgentTier, useSuspendAgent, useReactivateAgent, parseTiers } from '@/hooks/useAgents';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AgentManageDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tierOptions = [
  { code: 'C', name: 'Entry Agent', icon: Users, color: 'bg-amber-700' },
  { code: 'B', name: 'Standard Agent', icon: Star, color: 'bg-slate-400' },
  { code: 'A', name: 'Premium Agent', icon: Crown, color: 'bg-amber-500' },
];

export function AgentManageDialog({ agent, open, onOpenChange }: AgentManageDialogProps) {
  const { t, i18n } = useTranslation('admin');
  const currentTiers = parseTiers(agent?.tier || 'C');
  const [selectedTiers, setSelectedTiers] = useState<string[]>(currentTiers);
  const updateTier = useUpdateAgentTier();
  const suspendAgent = useSuspendAgent();
  const reactivateAgent = useReactivateAgent();

  if (!agent) return null;

  const questionnaire = Array.isArray(agent.questionnaire_answers) ? agent.questionnaire_answers : [];
  const hasChangedTiers = JSON.stringify(selectedTiers.sort()) !== JSON.stringify(currentTiers.sort());

  const toggleTier = (code: string) => {
    setSelectedTiers(prev => 
      prev.includes(code) ? prev.filter(t => t !== code) : [...prev, code]
    );
  };

  const handleSaveTier = () => {
    if (selectedTiers.length === 0) return;
    updateTier.mutate(
      { agentId: agent.id, tiers: selectedTiers },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleSuspend = () => {
    suspendAgent.mutate(agent.id, { onSuccess: () => onOpenChange(false) });
  };

  const handleReactivate = () => {
    reactivateAgent.mutate(agent.id, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('agent_manage.title')}
            <Badge variant="outline" className={cn(
              agent.status === 'active' && 'bg-success/10 text-success border-success/20',
              agent.status === 'suspended' && 'bg-destructive/10 text-destructive border-destructive/20'
            )}>
              {agent.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>{t('agent_manage.description')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info & Stats */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('agent_manage.agent_info')}
              </Label>
              <div className="grid gap-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{agent.full_name}</span></div>
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{agent.email}</span></div>
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{agent.phone}</span></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-2xl font-bold">{agent.completed_visits || 0}</p>
                  <p className="text-xs text-muted-foreground">{t('agent_manage.completed_visits')}</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    {agent.rating_avg ? (<><Star className="h-4 w-4 fill-warning text-warning" />{agent.rating_avg.toFixed(1)}</>) : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('agent_manage.rating')}</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <p className="text-2xl font-bold text-success">{agent.total_earnings?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">{t('agent_manage.total_earnings')}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Questionnaire */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('agent_manage.questionnaire_responses')}
              </Label>
              {questionnaire.length > 0 ? (
                <div className="space-y-3">
                  {questionnaire.map((item: any, index: number) => {
                    const label = typeof item.question === 'object'
                      ? (i18n.language === 'ar' ? item.question.ar : item.question.en) || item.question.en
                      : item.question;
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <p className="text-sm font-medium mb-1">{label}</p>
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('agent_manage.no_questionnaire')}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Multi-Tier Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('agent_manage.agent_tier')}
              </Label>
              <div className="grid gap-2">
                {tierOptions.map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = selectedTiers.includes(tier.code);
                  const isCurrent = currentTiers.includes(tier.code);
                  return (
                    <button key={tier.code} type="button" onClick={() => toggleTier(tier.code)}
                      className={cn(
                        'flex items-center gap-3 p-3 border rounded-lg text-left transition-all',
                        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'hover:border-primary/50'
                      )}>
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded text-white', tier.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Tier {tier.code}</span>
                          <Badge variant="outline" className="text-xs">{tier.name}</Badge>
                          {isCurrent && <Badge variant="secondary" className="text-xs">{t('agent_manage.current')}</Badge>}
                        </div>
                      </div>
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
              <Button variant="outline" onClick={handleSuspend} disabled={suspendAgent.isPending}
                className="text-destructive hover:text-destructive">
                <Ban className="h-4 w-4 mr-2" />{t('agent_manage.suspend')}
              </Button>
            ) : agent.status === 'suspended' ? (
              <Button variant="outline" onClick={handleReactivate} disabled={reactivateAgent.isPending}>
                <RefreshCw className="h-4 w-4 mr-2" />{t('agent_manage.reactivate')}
              </Button>
            ) : null}
          </div>
          <Button onClick={handleSaveTier} disabled={!hasChangedTiers || selectedTiers.length === 0 || updateTier.isPending}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {hasChangedTiers ? t('agent_manage.change_tier', { tier: selectedTiers.join(', ') }) : t('agent_manage.no_changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
