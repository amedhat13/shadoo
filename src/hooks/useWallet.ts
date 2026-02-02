import { useState, useCallback } from 'react';
import { Wallet } from '@/types';
import { Transaction } from '@/components/wallet/TransactionList';

const mockWallet: Wallet = {
  id: 'wallet-1',
  organization_id: 'org-1',
  available_balance: 15000,
  allocated_to_missions: 2500,
  currency: 'EGP',
  updated_at: new Date().toISOString(),
};

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'topup',
    amount: 10000,
    description: 'Wallet top-up via PayMob',
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-2',
    type: 'allocation',
    amount: 2500,
    description: 'Allocated to "Summer Campaign"',
    status: 'completed',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-3',
    type: 'topup',
    amount: 5000,
    description: 'Wallet top-up via PayMob',
    status: 'completed',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
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
    allocateBudget,
    releaseBudget,
    canAllocate,
  };
}
