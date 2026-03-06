import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Phone, Mail, CreditCard, FileText, CheckCircle, XCircle,
  Crown, Star, Users, AlertTriangle, RotateCcw,
} from 'lucide-react';
import { Agent, useApproveAgent, useRejectAgent, parseTiers } from '@/hooks/useAgents';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AgentApprovalDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tierOptions = [
  { code: 'C', name: 'Entry Agent', icon: Users, color: 'bg-amber-700' },
  { code: 'B', name: 'Standard Agent', icon: Star, color: 'bg-slate-400' },
  { code: 'A', name: 'Premium Agent', icon: Crown, color: 'bg-amber-500' },
];

const rejectionCategories = [
  { value: 'incomplete_info', labelEn: 'Incomplete information', labelAr: 'معلومات غير مكتملة' },
  { value: 'insufficient_experience', labelEn: 'Insufficient experience', labelAr: 'خبرة غير كافية' },
  { value: 'invalid_documents', labelEn: 'Invalid documents', labelAr: 'مستندات غير صالحة' },
  { value: 'failed_questionnaire', labelEn: 'Failed questionnaire', labelAr: 'لم يجتز الاستبيان' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

export function AgentApprovalDialog({ agent, open, onOpenChange }: AgentApprovalDialogProps) {
  const { t, i18n } = useTranslation('admin');
  const [selectedTiers, setSelectedTiers] = useState<string[]>(['C']);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionCategory, setRejectionCategory] = useState('');
  const approveAgent = useApproveAgent();
  const rejectAgent = useRejectAgent();

  if (!agent) return null;

  const questionnaire = Array.isArray(agent.questionnaire_answers) ? agent.questionnaire_answers : [];
  const documents = Array.isArray(agent.verification_docs) ? agent.verification_docs : [];
  const isResubmission = agent.status === 'rejected_resubmit';
  const agentAny = agent as any;

  const toggleTier = (code: string) => {
    setSelectedTiers(prev => 
      prev.includes(code) ? prev.filter(t => t !== code) : [...prev, code]
    );
  };

  const handleApprove = () => {
    if (selectedTiers.length === 0) return;
    approveAgent.mutate(
      { agentId: agent.id, tiers: selectedTiers },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    rejectAgent.mutate(
      { agentId: agent.id, reason: rejectionReason, category: rejectionCategory },
      { onSuccess: () => { setShowRejectForm(false); setRejectionReason(''); onOpenChange(false); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('agent_approval.title')}</DialogTitle>
          <DialogDescription>{t('agent_approval.description')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Resubmission Banner */}
            {isResubmission && (
              <Alert className="border-warning bg-warning/10">
                <RotateCcw className="h-4 w-4" />
                <AlertDescription>
                  {i18n.language === 'ar' 
                    ? 'تم رفض هذا الوكيل سابقاً وأعاد التقديم'
                    : 'This agent was previously rejected and has resubmitted'}
                  {agentAny.rejection_reason && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {i18n.language === 'ar' ? 'سبب الرفض السابق: ' : 'Previous reason: '}
                      {agentAny.rejection_reason}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Info */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('agent_approval.basic_info')}
              </Label>
              <div className="grid gap-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{agent.full_name}</span></div>
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{agent.email}</span></div>
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{agent.phone}</span></div>
                {agent.national_id && (
                  <div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-muted-foreground" /><span>National ID: {agent.national_id}</span></div>
                )}
              </div>
            </div>

            <Separator />

            {/* Questionnaire Answers */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('agent_approval.questionnaire_responses')}
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
                  <p className="text-sm">{t('agent_approval.no_questionnaire')}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Documents */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('agent_approval.verification_docs')}
              </Label>
              {documents.length > 0 ? (
                <div className="grid gap-2">
                  {documents.map((doc: any, index: number) => (
                    <a key={index} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('agent_approval.no_documents')}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Tier Selection - Multi-select */}
            {!showRejectForm && (
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t('agent_approval.assign_tier')}
                </Label>
                <div className="grid gap-2">
                  {tierOptions.map((tier) => {
                    const Icon = tier.icon;
                    const isSelected = selectedTiers.includes(tier.code);
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
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rejection Form */}
            {showRejectForm && (
              <div className="space-y-4 p-4 border border-destructive rounded-lg">
                <Label className="text-xs font-bold uppercase tracking-wide text-destructive">
                  {i18n.language === 'ar' ? 'سبب الرفض' : 'Rejection Details'}
                </Label>
                <Select value={rejectionCategory} onValueChange={setRejectionCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={i18n.language === 'ar' ? 'اختر الفئة...' : 'Select category...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionCategories.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        {i18n.language === 'ar' ? c.labelAr : c.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={i18n.language === 'ar' ? 'يرجى تقديم سبب الرفض...' : 'Please provide a reason for rejection...'}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || rejectAgent.isPending}>
                    <XCircle className="h-4 w-4 mr-2" />
                    {i18n.language === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection'}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}>
                    {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {!showRejectForm && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowRejectForm(true)} className="text-destructive hover:text-destructive">
              <XCircle className="h-4 w-4 mr-2" />
              {t('agent_approval.reject')}
            </Button>
            <Button onClick={handleApprove} disabled={selectedTiers.length === 0 || approveAgent.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('agent_approval.approve_as', { tier: selectedTiers.join(', ') })}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
