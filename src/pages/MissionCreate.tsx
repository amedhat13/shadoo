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
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/missions')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              {isEditing ? 'Edit Mission' : 'Create Mission'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {FORM_STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {FORM_STEPS.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-1 items-center"
            >
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
                    'flex h-8 w-8 items-center justify-center text-sm font-bold transition-all',
                    index < currentStep
                      ? 'bg-success text-success-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden text-sm font-semibold uppercase tracking-wide sm:block">
                  {step.title}
                </span>
              </button>
              {index < FORM_STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-px flex-1',
                    index < currentStep ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card className="border border-border">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              BACK
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!isStepValid(0) || isSubmitting}
              >
                SAVE DRAFT
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
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
