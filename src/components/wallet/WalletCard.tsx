import { Wallet, Lock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CURRENCY } from '@/lib/constants';

interface WalletCardProps {
  availableBalance: number;
  onHoldBalance: number;
  className?: string;
  compact?: boolean;
}

export function WalletCard({ 
  availableBalance, 
  onHoldBalance, 
  className,
  compact = false 
}: WalletCardProps) {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
  };

  const totalBalance = availableBalance + onHoldBalance;

  if (compact) {
    return (
      <Card className={cn('shadow-card', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Available Balance</div>
                <div className="text-xl font-semibold">{formatCurrency(availableBalance)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">On Hold</div>
              <div className="text-lg font-medium text-warning">{formatCurrency(onHoldBalance)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('shadow-card', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Wallet className="h-4 w-4" />
          Wallet Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Balance */}
        <div>
          <div className="text-sm text-muted-foreground">Total Balance</div>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-success/5 p-3">
            <div className="flex items-center gap-2 text-sm text-success">
              <ArrowUpRight className="h-4 w-4" />
              Available
            </div>
            <div className="mt-1 text-lg font-semibold">{formatCurrency(availableBalance)}</div>
          </div>
          <div className="rounded-lg bg-warning/5 p-3">
            <div className="flex items-center gap-2 text-sm text-warning">
              <Lock className="h-4 w-4" />
              On Hold
            </div>
            <div className="mt-1 text-lg font-semibold">{formatCurrency(onHoldBalance)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
