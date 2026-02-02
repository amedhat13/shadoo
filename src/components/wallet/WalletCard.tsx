import { Wallet, Lock } from 'lucide-react';
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
      <Card className={cn('border border-border', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-foreground">
                <Wallet className="h-5 w-5 text-background" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Available Balance</div>
                <div className="text-xl font-black text-success">{formatCurrency(availableBalance)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">On Hold</div>
              <div className="text-lg font-bold text-foreground">{formatCurrency(onHoldBalance)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border border-border', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
          <Wallet className="h-4 w-4" />
          Wallet Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Balance */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Balance</div>
          <div className="text-2xl font-black">{formatCurrency(totalBalance)}</div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-success/30 bg-success/5 p-3">
            <div className="flex items-center gap-2 text-xs text-success uppercase tracking-wide">
              <Wallet className="h-3.5 w-3.5" />
              Available
            </div>
            <div className="mt-1 text-lg font-black text-success">{formatCurrency(availableBalance)}</div>
          </div>
          <div className="border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Lock className="h-3.5 w-3.5" />
              On Hold
            </div>
            <div className="mt-1 text-lg font-bold">{formatCurrency(onHoldBalance)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
