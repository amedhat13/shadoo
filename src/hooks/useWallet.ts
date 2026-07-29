import { useState, useCallback } from 'react';
import { Wallet } from '@/types';
import { Transaction } from '@/components/wallet/TransactionList';

// Mock wallet — aligned with T-Lab demo: 15,000 EGP topped up, 1,000 EGP spent on 2 completed missions
const mockWallet: Wallet = {
  id: 'wallet-1',
  organization_id: 'org-1',
  available_balance: 14000,
  allocated_to_missions: 0,
  currency: 'EGP',
  updated_at: new Date().toISOString(),
};

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'topup',
    amount: 15000,
    description: 'Wallet top-up via PayMob',
    status: 'completed',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-2',
    type: 'allocation',
    amount: 500,
    description: 'Allocated to "T-Lab Boba — The Yard — In-Store Visit"',
    status: 'completed',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-3',
    type: 'allocation',
    amount: 500,
    description: 'Allocated to "T-Lab Boba — Arabella — In-Store Visit"',
    status: 'completed',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet>(mockWallet);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);

  const topUp = useCallback(async (amount: number) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'topup',
      amount,
      description: 'Wallet top-up via PayMob',
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    
    setWallet((prev) => ({
      ...prev,
      available_balance: prev.available_balance + amount,
      updated_at: new Date().toISOString(),
    }));
    
    setTransactions((prev) => [newTransaction, ...prev]);
    setIsLoading(false);
  }, []);

  const requestManualTopUp = useCallback(async (amount: number, reference?: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'topup',
      amount,
      description: reference
        ? `Manual funding request — awaiting admin approval (ref: ${reference})`
        : 'Manual funding request — awaiting admin approval',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setIsLoading(false);
  }, []);

  const allocateBudget = useCallback(async (amount: number, missionName?: string) => {
    if (amount > wallet.available_balance) {
      throw new Error('Insufficient balance');
    }
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'allocation',
      amount,
      description: missionName ? `Allocated to "${missionName}"` : 'Mission budget allocation',
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    
    setWallet((prev) => ({
      ...prev,
      available_balance: prev.available_balance - amount,
      allocated_to_missions: prev.allocated_to_missions + amount,
      updated_at: new Date().toISOString(),
    }));
    
    setTransactions((prev) => [newTransaction, ...prev]);
    setIsLoading(false);
  }, [wallet.available_balance]);

  const releaseBudget = useCallback(async (amount: number, missionName?: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'release',
      amount,
      description: missionName ? `Released from "${missionName}"` : 'Budget released',
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    
    setWallet((prev) => ({
      ...prev,
      available_balance: prev.available_balance + amount,
      allocated_to_missions: Math.max(0, prev.allocated_to_missions - amount),
      updated_at: new Date().toISOString(),
    }));
    
    setTransactions((prev) => [newTransaction, ...prev]);
    setIsLoading(false);
  }, []);

  const canAllocate = useCallback((amount: number) => {
    return amount <= wallet.available_balance;
  }, [wallet.available_balance]);

  return {
    wallet,
    transactions,
    isLoading,
    topUp,
    requestManualTopUp,
    allocateBudget,
    releaseBudget,
    canAllocate,
  };
}
