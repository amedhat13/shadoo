import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CURRENCY } from '@/lib/constants';

interface WalletSnapshotProps {
  availableBalance: number;
  onHoldBalance: number;
  requiredHold: number;
  className?: string;
}

export function WalletSnapshot({ 
  availableBalance, 
  onHoldBalance, 
  requiredHold,
  className 
}: WalletSnapshotProps) {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
  };

  const hasSufficientFunds = availableBalance >= requiredHold;
  const shortfall = requiredHold - availableBalance;

  return (
    <Card className={cn('border border-border', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wide">Wallet Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="font-bold text-success">{formatCurrency(availableBalance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Currently On Hold</span>
            <span className="font-bold">{formatCurrency(onHoldBalance)}</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide">Required Hold</span>
            <span className="font-black text-primary">{formatCurrency(requiredHold)}</span>
          </div>
        </div>

        {/* Status Message */}
        <div 
          className={cn(
            'border p-3 flex items-start gap-2',
            hasSufficientFunds 
              ? 'border-success/30 bg-success/5 text-success' 
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          )}
        >
          {hasSufficientFunds ? (
            <>
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold uppercase text-sm">Sufficient Funds</div>
                <div className="text-sm opacity-80">
                  You can publish this mission. {formatCurrency(requiredHold)} will be placed on hold.
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold uppercase text-sm">Insufficient Funds</div>
                <div className="text-sm opacity-80">
                  You need {formatCurrency(shortfall)} more to publish this mission.
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
