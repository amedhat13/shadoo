import { useState } from 'react';
import { SubscriptionPlan } from '@/components/settings/SubscriptionPlans';

// Mock subscription plans
const mockPlans: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: 2999,
    visits_per_month: 50,
    features: [
      'Up to 50 visits per month',
      'Basic analytics dashboard',
      'Email support',
      '5 active missions',
    ],
  },
  {
    id: 'plan-professional',
    name: 'Professional',
    description: 'Best for growing businesses with multiple branches',
    price: 5999,
    visits_per_month: 150,
    features: [
      'Up to 150 visits per month',
      'Advanced analytics & reports',
      'Priority email & chat support',
      '20 active missions',
      'Custom question templates',
    ],
    is_popular: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    description: 'For large organizations with high volume needs',
    price: 9999,
    visits_per_month: 500,
    features: [
      'Up to 500 visits per month',
      'Full analytics suite',
      'Dedicated account manager',
      'Unlimited active missions',
      'API access',
      'Custom integrations',
    ],
  },
];

export function useSubscription() {
  const [currentPlanId, setCurrentPlanId] = useState<string>('plan-professional');
  const [plans] = useState<SubscriptionPlan[]>(mockPlans);
  const [isLoading, setIsLoading] = useState(false);

  const selectPlan = async (planId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentPlanId(planId);
    setIsLoading(false);
  };

  const currentPlan = plans.find((p) => p.id === currentPlanId);

  return {
    plans,
    currentPlanId,
    currentPlan,
    isLoading,
    selectPlan,
  };
}
