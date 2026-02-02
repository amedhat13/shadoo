import { useState, useCallback } from 'react';
import { Wallet } from '@/types/wallet';

const mockWallet: Wallet = {
  id: 'wallet-1',
  organization_id: 'org-1',
  available_balance: 15000,
  on_hold_balance: 2500,
  currency: 'EGP',
  updated_at: new Date().toISOString(),
};

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet>(mockWallet);
  const [isLoading, setIsLoading] = useState(false);

  const placeHold = useCallback(async (amount: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setWallet((prev) => ({
      ...prev,
      available_balance: prev.available_balance - amount,
      on_hold_balance: prev.on_hold_balance + amount,
      updated_at: new Date().toISOString(),
    }));
    setIsLoading(false);
  }, []);

  const releaseHold = useCallback(async (amount: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setWallet((prev) => ({
      ...prev,
      available_balance: prev.available_balance + amount,
      on_hold_balance: prev.on_hold_balance - amount,
      updated_at: new Date().toISOString(),
    }));
    setIsLoading(false);
  }, []);

  return {
    wallet,
    isLoading,
    placeHold,
    releaseHold,
  };
}
