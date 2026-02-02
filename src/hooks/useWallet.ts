import { useState, useCallback } from 'react';
import { Wallet } from '@/types';

const mockWallet: Wallet = {
  id: 'wallet-1',
  organization_id: 'org-1',
  available_balance: 15000,
  allocated_to_missions: 2500,
  currency: 'EGP',
  updated_at: new Date().toISOString(),
};

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet>(mockWallet);
  const [isLoading, setIsLoading] = useState(false);

  const allocateBudget = useCallback(async (amount: number) => {
    if (amount > wallet.available_balance) {
      throw new Error('Insufficient balance');
    }
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setWallet((prev) => ({
      ...prev,
      available_balance: prev.available_balance - amount,
      allocated_to_missions: prev.allocated_to_missions + amount,
      updated_at: new Date().toISOString(),
    }));
    
    setIsLoading(false);
  }, [wallet.available_balance]);

  const releaseBudget = useCallback(async (amount: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setWallet((prev) => ({
      ...prev,
      available_balance: prev.available_balance + amount,
      allocated_to_missions: Math.max(0, prev.allocated_to_missions - amount),
      updated_at: new Date().toISOString(),
    }));
    
    setIsLoading(false);
  }, []);

  const canAllocate = useCallback((amount: number) => {
    return amount <= wallet.available_balance;
  }, [wallet.available_balance]);

  return {
    wallet,
    isLoading,
    allocateBudget,
    releaseBudget,
    canAllocate,
  };
}
