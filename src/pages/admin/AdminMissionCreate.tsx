import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MissionFormData, Question, PhotoRequirements } from '@/types';
import { AdminStepBasics } from '@/components/admin/missions/form/AdminStepBasics';
import { StepAgentTier } from '@/components/missions/form/StepAgentTier';
import { StepQuestions } from '@/components/missions/form/StepQuestions';
import { StepGeoSettings } from '@/components/missions/form/StepGeoSettings';
import { AdminStepFunding } from '@/components/admin/missions/form/AdminStepFunding';
import { AdminStepReview } from '@/components/admin/missions/form/AdminStepReview';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useClientBranches } from '@/hooks/useAdminData';

const ADMIN_FORM_STEPS = [
  { id: 'basics', title: 'Basics', description: 'Client, name and branches.' },
  { id: 'agent-tier', title: 'Agent Tier', description: 'Select agent tier.' },
  { id: 'questions', title: 'Questions', description: 'Build questionnaire.' },
  { id: 'geo-settings', title: 'Geo Settings', description: 'Location verification.' },
  { id: 'funding', title: 'Visits & Funding', description: 'Budget configuration.' },
  { id: 'review', title: 'Review', description: 'Review and create.' },
];

interface AdminMissionFormData extends MissionFormData {
  clientUserId: string;
}

const initialFormData: AdminMissionFormData = {
  clientUserId: '',
  name: '',
  branch_ids: [],
  agent_tier: 'C',
  questions: [],
  photo_requirements: {
    required_count: 3,
    instructions: '',
  },
  number_of_visits: 10,
  purchase_items: [{ id: crypto.randomUUID(), name: '', budget: 100 }],
  purchase_budget_per_visit: 100,
  purchase_item_name: '',
  is_geo_tagged: false,
};

export default function AdminMissionCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AdminMissionFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clientBranches = [] } = useClientBranches(formData.clientUserId || null);

  const createMissionMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      name: string;
      branchId: string;
      agentTier: string;
      questions: Question[];
      photoRequirements: PhotoRequirements;
      numberOfVisits: number;
      purchaseBudgetPerVisit: number;
      isGeoTagged: boolean;
    }) => {
      const totalBudget = data.numberOfVisits * data.purchaseBudgetPerVisit;

      const { error } = await supabase.from('missions').insert({
        user_id: data.userId,
        name: data.name,
        branch_id: data.branchId,
        agent_tier: data.agentTier,
        questions: JSON.parse(JSON.stringify(data.questions)),
        photo_requirements: JSON.parse(JSON.stringify(data.photoRequirements)),
        number_of_visits: data.numberOfVisits,
        purchase_budget_per_visit: data.purchaseBudgetPerVisit,
        total_purchase_budget: totalBudget,
        is_geo_tagged: data.isGeoTagged,
        status: 'draft',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
    },
  });

  const updateFormData = (updates: Partial<AdminMissionFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return Boolean(formData.clientUserId && formData.name && formData.branch_ids.length > 0);
      case 1:
        return Boolean(formData.agent_tier);
      case 2:
        return formData.questions.length > 0 && formData.questions.every((q) => q.text.trim() !== '');
      case 3:
        return true; // Geo settings is optional
      case 4:
        return formData.number_of_visits > 0;
      case 5:
        return isStepValid(0) && isStepValid(1) && isStepValid(2) && isStepValid(4);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < ADMIN_FORM_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      for (const branchId of formData.branch_ids) {
        const branch = clientBranches.find((b) => b.id === branchId);
        const missionName =
          formData.branch_ids.length > 1
            ? `${formData.name} - ${branch?.name || branchId}`
            : formData.name;

        await createMissionMutation.mutateAsync({
          userId: formData.clientUserId,
          name: missionName,
          branchId,
          agentTier: formData.agent_tier,
          questions: formData.questions,
          photoRequirements: formData.photo_requirements,
          numberOfVisits: formData.number_of_visits,
          purchaseBudgetPerVisit: formData.purchase_budget_per_visit,
          isGeoTagged: formData.is_geo_tagged ?? false,
        });
      }

      toast.success(
        formData.branch_ids.length > 1
          ? `${formData.branch_ids.length} missions created successfully`
          : 'Mission created successfully'
      );
      navigate('/admin/missions');
    } catch (error) {
      toast.error('Failed to create mission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <AdminStepBasics
            data={formData}
            onChange={updateFormData}
            branches={clientBranches}
          />
        );
      case 1:
        return <StepAgentTier data={formData} onChange={updateFormData} />;
      case 2:
        return <StepQuestions data={formData} onChange={updateFormData} />;
      case 3:
        return <StepGeoSettings data={formData} onChange={updateFormData} />;
      case 4:
        return (
          <AdminStepFunding
            data={formData}
            onChange={updateFormData}
            branchCount={formData.branch_ids.length || 1}
          />
        );
      case 5:
        return (
          <AdminStepReview
            data={formData}
            branches={clientBranches}
            onCreate={handleCreate}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/missions')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              Create Mission for Client
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {ADMIN_FORM_STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 md:gap-0 pb-2 overflow-x-auto">
          {ADMIN_FORM_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
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
                      {step.title}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="xl:hidden">
                  <p>{step.title}</p>
                </TooltipContent>
              </Tooltip>
              {index < ADMIN_FORM_STEPS.length - 1 && (
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
          <CardContent className="p-4 md:p-6">{renderStepContent()}</CardContent>
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
              BACK
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="w-full sm:w-auto"
            >
              CONTINUE
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
