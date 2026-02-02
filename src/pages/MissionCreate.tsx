import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FORM_STEPS } from '@/lib/constants';
import { MissionFormData } from '@/types/mission';
import { StepBasics } from '@/components/missions/form/StepBasics';
import { StepRequirements } from '@/components/missions/form/StepRequirements';
import { StepReward } from '@/components/missions/form/StepReward';
import { StepReview } from '@/components/missions/form/StepReview';
import { useMissions } from '@/hooks/useMissions';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';

const initialFormData: MissionFormData = {
  title: '',
  branch_id: '',
  description: '',
  start_date: undefined,
  end_date: undefined,
  quota: 10,
  quiz_id: undefined,
  form_id: undefined,
  required_photos_count: 3,
  fixed_reward: 100,
  reimbursement_cap: 50,
};

export default function MissionCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { createMission, publishMission, getMission, branches } = useMissions();
  const { wallet, placeHold } = useWallet();

  const isEditing = Boolean(id);
  const existingMission = id ? getMission(id) : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MissionFormData>(() => {
    if (existingMission) {
      return {
        title: existingMission.title,
        branch_id: existingMission.branch_id,
        description: existingMission.description,
        start_date: existingMission.start_date ? new Date(existingMission.start_date) : undefined,
        end_date: existingMission.end_date ? new Date(existingMission.end_date) : undefined,
        quota: existingMission.quota,
        quiz_id: existingMission.quiz_id,
        form_id: existingMission.form_id,
        required_photos_count: existingMission.required_photos_count,
        fixed_reward: existingMission.fixed_reward,
        reimbursement_cap: existingMission.reimbursement_cap,
      };
    }
    return initialFormData;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const perRunMaxCost = formData.fixed_reward + formData.reimbursement_cap;
  const requiredHold = formData.quota * perRunMaxCost;
  const canPublish = wallet.available_balance >= requiredHold;

  const updateFormData = (updates: Partial<MissionFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Basics
        return Boolean(
          formData.title &&
          formData.branch_id &&
          formData.description &&
          formData.start_date &&
          formData.end_date &&
          formData.quota > 0
        );
      case 1: // Requirements
        return formData.required_photos_count >= 0;
      case 2: // Reward
        return formData.fixed_reward > 0;
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
        ...formData,
        start_date: formData.start_date?.toISOString().split('T')[0],
        end_date: formData.end_date?.toISOString().split('T')[0],
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
        ...formData,
        start_date: formData.start_date?.toISOString().split('T')[0],
        end_date: formData.end_date?.toISOString().split('T')[0],
      });
      await publishMission(mission.id);
      await placeHold(requiredHold);
      toast({
        title: 'Mission published!',
        description: `Your mission is now live. ${requiredHold.toLocaleString()} EGP has been placed on hold.`,
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
          <StepRequirements
            data={formData}
            onChange={updateFormData}
          />
        );
      case 2:
        return (
          <StepReward
            data={formData}
            onChange={updateFormData}
            perRunMaxCost={perRunMaxCost}
            requiredHold={requiredHold}
          />
        );
      case 3:
        return (
          <StepReview
            data={formData}
            branches={branches}
            wallet={wallet}
            perRunMaxCost={perRunMaxCost}
            requiredHold={requiredHold}
            canPublish={canPublish}
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
            <h1 className="text-2xl font-semibold tracking-tight">
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
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all',
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden text-sm font-medium sm:block">
                  {step.title}
                </span>
              </button>
              {index < FORM_STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-px flex-1',
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card className="shadow-card">
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
              Back
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!isStepValid(0) || isSubmitting}
              >
                Save Draft
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
