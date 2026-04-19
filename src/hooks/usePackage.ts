import { useState, useCallback } from 'react';
import { Package, OrganizationSubscription, getVisitsRemaining } from '@/types';

// Mock package data
const mockPackage: Package = {
  id: 'pkg-professional',
  name: 'Professional',
  visits_per_month: 50,
  price_per_month: 2500,
};

// Mock subscription data — aligned with T-Lab demo (2 missions × 2 visits = 4 visits used)
const mockSubscription: OrganizationSubscription = {
  id: 'sub-1',
  organization_id: 'org-1',
  package: mockPackage,
  visits_used_this_month: 4,
  current_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  current_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
};

export function usePackage() {
  const [subscription, setSubscription] = useState<OrganizationSubscription>(mockSubscription);
  const [isLoading, setIsLoading] = useState(false);

  const visitsRemaining = getVisitsRemaining(subscription);
  const visitsUsed = subscription.visits_used_this_month;
  const visitsTotal = subscription.package.visits_per_month;

  const consumeVisits = useCallback(async (count: number) => {
    if (count > visitsRemaining) {
      throw new Error('Not enough visits remaining');
    }
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setSubscription((prev) => ({
      ...prev,
      visits_used_this_month: prev.visits_used_this_month + count,
    }));
    
    setIsLoading(false);
  }, [visitsRemaining]);

  const canConsumeVisits = useCallback((count: number) => {
    return count <= visitsRemaining;
  }, [visitsRemaining]);

  return {
    subscription,
    package: subscription.package,
    visitsRemaining,
    visitsUsed,
    visitsTotal,
    isLoading,
    consumeVisits,
    canConsumeVisits,
  };
}
