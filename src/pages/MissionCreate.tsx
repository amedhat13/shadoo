import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBilingualText } from '@/i18n/utils';
import { Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MissionFormData, canPublishMission } from '@/types';
import { StepBasics } from '@/components/missions/form/StepBasics';
import { StepBrief } from '@/components/missions/form/StepBrief';
import { StepAgentTier } from '@/components/missions/form/StepAgentTier';
import { StepQuestions } from '@/components/missions/form/StepQuestions';
import { StepFunding } from '@/components/missions/form/StepFunding';
import { StepReview } from '@/components/missions/form/StepReview';
import { useMissions } from '@/hooks/useMissions';
import { useWallet } from '@/hooks/useWallet';
import { usePackage } from '@/hooks/usePackage';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useDirectionalIcons } from '@/i18n/utils';

const initialFormData: MissionFormData = {
  name: '',
  name_ar: '',
  branch_ids: [],
  agent_tier: 'C',
  questions: [],
  photo_requirements: {
    required_count: 3,
    instructions: '',
  },
  number_of_visits: 0,
  visit_schedules: [],
  purchase_items: [{ id: crypto.randomUUID(), name: '', budget: 100 }],
  purchase_budget_per_visit: 100,
  purchase_item_name: '',
  is_geo_tagged: false,
  cover_story: { en: '', ar: '' },
  rules: [{ en: '', ar: '' }],
};

const STEP_KEYS = ['basics', 'brief', 'questions', 'agent_tier', 'funding', 'review'] as const;

export default function MissionCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { t } = useTranslation('missions');
  const { ArrowStart } = useDirectionalIcons();
  const { createMission, publishMission, getMission, branches } = useMissions();
  const { wallet, allocateBudget } = useWallet();
  const { visitsRemaining, consumeVisits, subscription } = usePackage();

  const isEditing = Boolean(id);
  const existingMission = id ? getMission(id) : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MissionFormData>(() => {
    if (existingMission) {
      return {
        name: existingMission.name,
        branch_ids: [existingMission.branch_id],
        agent_tier: 'C',
        questions: existingMission.questions,
        photo_requirements: existingMission.photo_requirements,
        number_of_visits: existingMission.number_of_visits,
        visit_schedules: [],
        purchase_items: [{ id: crypto.randomUUID(), name: '', budget: existingMission.purchase_budget_per_visit }],
        purchase_budget_per_visit: existingMission.purchase_budget_per_visit,
        is_geo_tagged: false,
      };
    }
    return initialFormData;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branchCount = formData.branch_ids.length || 1;
  const totalVisitsPerMission = formData.number_of_visits;
  const totalPurchaseBudgetPerMission = formData.number_of_visits * formData.purchase_budget_per_visit;
  const grandTotalBudget = totalPurchaseBudgetPerMission * branchCount;
  const grandTotalVisits = totalVisitsPerMission * branchCount;

  const mockFormDataForValidation = {
    ...formData,
    number_of_visits: grandTotalVisits,
    purchase_budget_per_visit: grandTotalBudget / grandTotalVisits || 0,
  };

  const { canPublish, reason } = canPublishMission(mockFormDataForValidation, subscription, wallet);

  const updateFormData = (updates: Partial<MissionFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Steps: 0 basics, 1 brief, 2 questions, 3 agent_tier, 4 funding, 5 review
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return Boolean(formData.name && formData.branch_ids.length > 0);
      case 1:
        return true; // brief is optional but recommended
      case 2:
        return (
          (formData.question_sections?.length || 0) >= 1 &&
          (formData.question_sections || []).every((s) => (s.label.en || '').trim() !== '') &&
          formData.questions.length > 0 &&
          formData.questions.every((q) => getBilingualText(q.text).trim() !== '' && Boolean(q.section_id))
        );
      case 3:
        return Boolean(formData.agent_tier);
      case 4:
        return formData.visit_schedules.length > 0;
      case 5:
        return isStepValid(0) && isStepValid(2) && isStepValid(3) && isStepValid(4);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEP_KEYS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      for (const branchId of formData.branch_ids) {
        const missionName = formData.branch_ids.length > 1
          ? `${formData.name} - ${branches.find(b => b.id === branchId)?.name || branchId}`
          : formData.name;
        const missionNameAr = formData.branch_ids.length > 1
          ? `${formData.name_ar || ''} - ${branches.find(b => b.id === branchId)?.name || branchId}`
          : formData.name_ar;

        await createMission({
          name: missionName,
          name_ar: missionNameAr,
          branch_id: branchId,
          questions: formData.questions,
          photo_requirements: formData.photo_requirements,
          number_of_visits: formData.visit_schedules.length,
          visit_schedules: formData.visit_schedules,
          purchase_budget_per_visit: formData.purchase_budget_per_visit,
          is_geo_tagged: formData.is_geo_tagged,
          methodology: formData.methodology || 'custom',
          category: formData.category,
          cover_story: formData.cover_story,
          rules: formData.rules,
        });
      }
      toast({
        title: t('draft_saved'),
        description: formData.branch_ids.length > 1
          ? t('draft_saved_desc_multi', { count: formData.branch_ids.length })
          : t('draft_saved_desc_single'),
      });
      navigate('/missions');
    } catch (error) {
      toast({
        title: t('save_error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!canPublish) return;

    setIsSubmitting(true);
    try {
      for (const branchId of formData.branch_ids) {
        const missionName = formData.branch_ids.length > 1
          ? `${formData.name} - ${branches.find(b => b.id === branchId)?.name || branchId}`
          : formData.name;
        const missionNameAr = formData.branch_ids.length > 1
          ? `${formData.name_ar || ''} - ${branches.find(b => b.id === branchId)?.name || branchId}`
          : formData.name_ar;

        const mission = await createMission({
          name: missionName,
          name_ar: missionNameAr,
          branch_id: branchId,
          questions: formData.questions,
          photo_requirements: formData.photo_requirements,
          number_of_visits: formData.visit_schedules.length,
          visit_schedules: formData.visit_schedules,
          purchase_budget_per_visit: formData.purchase_budget_per_visit,
          is_geo_tagged: formData.is_geo_tagged,
          methodology: formData.methodology || 'custom',
          category: formData.category,
          cover_story: formData.cover_story,
          rules: formData.rules,
        });

        await publishMission(mission.id);
      }

      await allocateBudget(grandTotalBudget);
      await consumeVisits(grandTotalVisits);

      toast({
        title: formData.branch_ids.length > 1
          ? t('publish_messages.missions_published')
          : t('publish_messages.success'),
        description: formData.branch_ids.length > 1
          ? t('publish_messages.missions_published_desc', { count: formData.branch_ids.length, amount: grandTotalBudget.toLocaleString() })
          : t('publish_messages.mission_published_desc', { amount: grandTotalBudget.toLocaleString() }),
      });
      navigate('/missions');
    } catch (error) {
      toast({
        title: t('publish_messages.error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: {
        const verifiedBranches = branches.filter(b => b.status === 'verified');
        return <StepBasics data={formData} onChange={updateFormData} branches={verifiedBranches} />;
      }
      case 1:
        return <StepBrief data={formData} onChange={updateFormData} />;
      case 2:
        return <StepQuestions data={formData} onChange={updateFormData} />;
      case 3:
        return <StepAgentTier data={formData} onChange={updateFormData} />;
      case 4:
        return (
          <StepFunding
            data={formData}
            onChange={updateFormData}
            visitsRemaining={visitsRemaining}
            walletBalance={wallet.available_balance}
            branchCount={branchCount}
            onSaveDraft={handleSaveDraft}
          />
        );
      case 5:
        return (
          <StepReview
            data={formData}
            branches={branches}
            wallet={wallet}
            visitsRemaining={visitsRemaining}
            canPublish={canPublish}
            publishBlockReason={reason}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/missions')}
            className="shrink-0"
          >
            <ArrowStart className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {isEditing ? t('edit_mission') : t('create_title')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {t(`steps.${STEP_KEYS[currentStep]}_desc`)}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 md:gap-0 pb-2 overflow-x-auto">
          {STEP_KEYS.map((stepKey, index) => (
            <div key={stepKey} className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => index < currentStep && setCurrentStep(index)}
                    disabled={index > currentStep}
                    className={cn(
                      'flex items-center gap-2 transition-colors',
                      index <= currentStep ? 'text-foreground' : 'text-muted-foreground',
                      index < currentStep && 'cursor-pointer hover:text-primary'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 md:h-8 md:w-8 items-center justify-center text-xs font-bold transition-all shrink-0',
                        index < currentStep
                          ? 'bg-success text-success-foreground'
                          : index === currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
                    </div>
                    <span className="hidden xl:block text-sm font-semibold uppercase tracking-wide whitespace-nowrap">
                      {t(`steps.${stepKey}`)}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="xl:hidden">
                  <p>{t(`steps.${stepKey}`)}</p>
                </TooltipContent>
              </Tooltip>
              {index < STEP_KEYS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 md:mx-3 lg:mx-4 h-px w-4 md:w-8 lg:w-12',
                    index < currentStep ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card className="border border-border">
          <CardContent className="p-4 md:p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-full sm:w-auto"
            >
              {t('form.back')}
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!isStepValid(0) || isSubmitting}
                className="w-full sm:w-auto"
              >
                {t('form.save_draft')}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="w-full sm:w-auto"
              >
                {t('form.continue')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
