// Wallet entity types

export interface Wallet {
  id: string;
  organization_id: string;
  available_balance: number;
  on_hold_balance: number;
  currency: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'withdrawal' | 'hold' | 'release' | 'payment';
  amount: number;
  description: string;
  reference_id?: string;
  created_at: string;
}
