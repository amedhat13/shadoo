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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Phone, Mail, CreditCard, FileText, CheckCircle, XCircle,
  AlertTriangle, RotateCcw, Sparkles,
} from 'lucide-react';
import { Agent, useApproveAgent, useRejectAgent } from '@/hooks/useAgents';
import { useActiveAgentTiers } from '@/hooks/useAgentTiers';
import { matchAgentToTiers, getAge, type TierCriteria } from '@/lib/agentHelpers';
import { useTranslation } from 'react-i18next';

interface AgentApprovalDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rejectionCategories = [
  { value: 'incomplete_info', labelEn: 'Incomplete information', labelAr: 'معلومات غير مكتملة' },
  { value: 'insufficient_experience', labelEn: 'Insufficient experience', labelAr: 'خبرة غير كافية' },
  { value: 'invalid_documents', labelEn: 'Invalid documents', labelAr: 'مستندات غير صالحة' },
  { value: 'failed_questionnaire', labelEn: 'Failed questionnaire', labelAr: 'لم يجتز الاستبيان' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

export function AgentApprovalDialog({ agent, open, onOpenChange }: AgentApprovalDialogProps) {
  const { t, i18n } = useTranslation('admin');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionCategory, setRejectionCategory] = useState('');
  const approveAgent = useApproveAgent();
  const rejectAgent = useRejectAgent();
  const { data: tiers } = useActiveAgentTiers();

  if (!agent) return null;

  const questionnaire = Array.isArray(agent.questionnaire_answers) ? agent.questionnaire_answers : [];
  const documents = Array.isArray(agent.verification_docs) ? agent.verification_docs : [];
  const isResubmission = agent.status === 'rejected_resubmit';
  const agentAny = agent as Record<string, unknown>;

  // Auto-assign tiers preview
  const tierCriteria: TierCriteria[] = (tiers || []).map(t => ({
    tier_code: t.tier_code,
    min_age: t.min_age, max_age: t.max_age, gender: t.gender,
    cities: t.cities, districts: t.districts, education_levels: t.education_levels,
    languages: t.languages, requires_car: t.requires_car, requires_motorcycle: t.requires_motorcycle,
    marital_statuses: t.marital_statuses, employment_statuses: t.employment_statuses,
    min_experience_years: t.min_experience_years, specializations: t.specializations,
    min_rating: t.min_rating, min_completed_visits: t.min_completed_visits,
    sort_order: t.sort_order, questionnaire_criteria: t.questionnaire_criteria,
  }));

  const matchedTierCodes = matchAgentToTiers({
    date_of_birth: agentAny.date_of_birth as string | null,
    gender: agentAny.gender as string | null,
    city: agentAny.city as string | null,
    district: agentAny.district as string | null,
    education_level: agentAny.education_level as string | null,
    languages: agentAny.languages as string[] | null,
    has_car: agentAny.has_car as boolean | null,
    has_motorcycle: agentAny.has_motorcycle as boolean | null,
    marital_status: agentAny.marital_status as string | null,
    employment_status: agentAny.employment_status as string | null,
    experience_years: agentAny.experience_years as number | null,
    specializations: agentAny.specializations as string[] | null,
    rating_avg: agent.rating_avg,
    completed_visits: agent.completed_visits,
    questionnaire_answers: agent.questionnaire_answers as unknown[] | null,
  }, tierCriteria);

  const hasDemographics = agentAny.date_of_birth || agentAny.gender || agentAny.city;
  const age = getAge(agentAny.date_of_birth as string | null);

  const handleApprove = () => {
    approveAgent.mutate(
      { agentId: agent.id },
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
            {isResubmission && (
              <Alert className="border-warning bg-warning/10">
                <RotateCcw className="h-4 w-4" />
                <AlertDescription>
                  {i18n.language === 'ar' ? 'تم رفض هذا الوكيل سابقاً وأعاد التقديم' : 'This agent was previously rejected and has resubmitted'}
                  {agentAny.rejection_reason && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {i18n.language === 'ar' ? 'سبب الرفض السابق: ' : 'Previous reason: '}{agentAny.rejection_reason as string}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Info */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('agent_approval.basic_info')}</Label>
              <div className="grid gap-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{agent.full_name}</span></div>
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{agent.email}</span></div>
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{agent.phone}</span></div>
                {agent.national_id && (
                  <div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-muted-foreground" /><span>National ID: {agent.national_id}</span></div>
                )}
              </div>
            </div>

            {/* Demographics */}
            {hasDemographics && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {i18n.language === 'ar' ? 'البيانات الديموغرافية' : 'Demographics'}
                  </Label>
                  <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/30">
                    {age != null && <div><span className="text-xs text-muted-foreground block">Age</span><span className="font-medium">{age}</span></div>}
                    {agentAny.gender && <div><span className="text-xs text-muted-foreground block">Gender</span><span className="font-medium capitalize">{agentAny.gender as string}</span></div>}
                    {agentAny.city && <div><span className="text-xs text-muted-foreground block">City</span><span className="font-medium">{agentAny.city as string}</span></div>}
                    {agentAny.education_level && <div><span className="text-xs text-muted-foreground block">Education</span><span className="font-medium capitalize">{(agentAny.education_level as string).replace('_', ' ')}</span></div>}
                    {agentAny.has_car && <div><span className="text-xs text-muted-foreground block">Has Car</span><span className="font-medium">Yes</span></div>}
                    {agentAny.experience_years && <div><span className="text-xs text-muted-foreground block">Experience</span><span className="font-medium">{agentAny.experience_years as number} years</span></div>}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Questionnaire Answers */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('agent_approval.questionnaire_responses')}</Label>
              {questionnaire.length > 0 ? (
                <div className="space-y-3">
                  {questionnaire.map((item: Record<string, unknown>, index: number) => {
                    const label = typeof item.question === 'object'
                      ? (i18n.language === 'ar' ? (item.question as Record<string, string>).ar : (item.question as Record<string, string>).en) || (item.question as Record<string, string>).en
                      : item.question as string;
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <p className="text-sm font-medium mb-1">{label}</p>
                        <p className="text-sm text-muted-foreground">{item.answer as string}</p>
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
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('agent_approval.verification_docs')}</Label>
              {documents.length > 0 ? (
                <div className="grid gap-2">
                  {documents.map((doc: Record<string, unknown>, index: number) => (
                    <a key={index} href={doc.url as string} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">{(doc.name as string) || `Document ${index + 1}`}</span>
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

            {/* Auto-Assigned Tiers */}
            {!showRejectForm && (
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  {t('tiers.auto_assigned_tiers')}
                </Label>
                {matchedTierCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
                    {matchedTierCodes.map(code => {
                      const tier = tiers?.find(t => t.tier_code === code);
                      return (
                        <Badge key={code} style={{ backgroundColor: tier?.color || '#6B7280', color: 'white' }}>
                          {i18n.language === 'ar' && tier?.name_ar ? tier.name_ar : tier?.name || code}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">{t('tiers.demographics_not_provided')}</p>
                  </div>
                )}
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
                <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={i18n.language === 'ar' ? 'يرجى تقديم سبب الرفض...' : 'Please provide a reason for rejection...'} rows={3} />
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || rejectAgent.isPending}>
                    <XCircle className="h-4 w-4 mr-2" />{i18n.language === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection'}
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
              <XCircle className="h-4 w-4 mr-2" />{t('agent_approval.reject')}
            </Button>
            <Button onClick={handleApprove} disabled={approveAgent.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {i18n.language === 'ar' ? 'الموافقة' : 'Approve'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
