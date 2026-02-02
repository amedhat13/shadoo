import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FORM_STEPS } from '@/lib/constants';
import { MissionFormData, canPublishMission } from '@/types';
import { StepBasics } from '@/components/missions/form/StepBasics';
import { StepQuestions } from '@/components/missions/form/StepQuestions';
import { StepFunding } from '@/components/missions/form/StepFunding';
import { StepReview } from '@/components/missions/form/StepReview';
import { useMissions } from '@/hooks/useMissions';
import { useWallet } from '@/hooks/useWallet';
import { usePackage } from '@/hooks/usePackage';
import { useToast } from '@/hooks/use-toast';

const initialFormData: MissionFormData = {
  name: '',
  branch_id: '',
  questions: [],
  photo_requirements: {
    required_count: 3,
    instructions: '',
  },
  number_of_visits: 10,
  purchase_budget_per_visit: 100,
};

export default function MissionCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
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
        branch_id: existingMission.branch_id,
        questions: existingMission.questions,
        photo_requirements: existingMission.photo_requirements,
        number_of_visits: existingMission.number_of_visits,
        purchase_budget_per_visit: existingMission.purchase_budget_per_visit,
      };
    }
    return initialFormData;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPurchaseBudget = formData.number_of_visits * formData.purchase_budget_per_visit;
  
  const { canPublish, reason } = canPublishMission(formData, subscription, wallet);

  const updateFormData = (updates: Partial<MissionFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Basics
        return Boolean(formData.name && formData.branch_id);
      case 1: // Questions & Photos
        return formData.questions.length > 0 && formData.questions.every(q => q.text.trim() !== '');
      case 2: // Funding
        return formData.number_of_visits > 0;
      case 3: // Review
        return isStepValid(0) && isStepValid(1) && isStepValid(2);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < FORM_STEPS.length - 1) {
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
      await createMission({
        name: formData.name,
        branch_id: formData.branch_id,
        questions: formData.questions,
        photo_requirements: formData.photo_requirements,
        number_of_visits: formData.number_of_visits,
        purchase_budget_per_visit: formData.purchase_budget_per_visit,
      });
      toast({
        title: 'Draft saved',
        description: 'Your mission has been saved as a draft.',
      });
      navigate('/missions');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save mission. Please try again.',
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
      const mission = await createMission({
        name: formData.name,
        branch_id: formData.branch_id,
        questions: formData.questions,
        photo_requirements: formData.photo_requirements,
        number_of_visits: formData.number_of_visits,
        purchase_budget_per_visit: formData.purchase_budget_per_visit,
      });
      
      await publishMission(mission.id);
      await allocateBudget(totalPurchaseBudget);
      await consumeVisits(formData.number_of_visits);
      
      toast({
        title: 'Mission published!',
        description: `Your mission is now live. ${totalPurchaseBudget.toLocaleString()} EGP has been allocated.`,
      });
      navigate('/missions');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish mission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepBasics
            data={formData}
            onChange={updateFormData}
            branches={branches}
          />
        );
      case 1:
        return (
          <StepQuestions
            data={formData}
            onChange={updateFormData}
          />
        );
      case 2:
        return (
          <StepFunding
            data={formData}
            onChange={updateFormData}
            visitsRemaining={visitsRemaining}
            walletBalance={wallet.available_balance}
          />
        );
      case 3:
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
      <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/missions')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {isEditing ? 'Edit Mission' : 'Create Mission'}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {FORM_STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Progress Steps - Horizontal on desktop, compact on mobile */}
        <div className="flex items-center justify-between gap-1 pb-2">
          {FORM_STEPS.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-1 items-center min-w-0"
            >
              <button
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  'flex items-center gap-1.5 lg:gap-2 transition-colors shrink-0',
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground',
                  index < currentStep && 'cursor-pointer hover:text-primary'
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 items-center justify-center text-xs font-bold transition-all shrink-0',
                    index < currentStep
                      ? 'bg-success text-success-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden lg:block text-xs xl:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">
                  {step.title}
                </span>
              </button>
              {index < FORM_STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-1 md:mx-2 lg:mx-3 h-px flex-1 min-w-2 md:min-w-4',
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
        {currentStep < 3 && (
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-full sm:w-auto"
            >
              BACK
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!isStepValid(0) || isSubmitting}
                className="w-full sm:w-auto"
              >
                SAVE DRAFT
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="w-full sm:w-auto"
              >
                CONTINUE
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
