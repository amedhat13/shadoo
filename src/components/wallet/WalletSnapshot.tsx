import { InfoIcon, AlertTriangle, CheckCircle } from 'lucide-react';
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
    <Card className={cn('shadow-card', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Wallet Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="font-medium">{formatCurrency(availableBalance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Currently On Hold</span>
            <span className="font-medium text-warning">{formatCurrency(onHoldBalance)}</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Required Hold for This Mission</span>
            <span className="font-semibold text-primary">{formatCurrency(requiredHold)}</span>
          </div>
        </div>

        {/* Status Message */}
        <div 
          className={cn(
            'rounded-lg p-3 flex items-start gap-2',
            hasSufficientFunds 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
          )}
        >
          {hasSufficientFunds ? (
            <>
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Sufficient funds available</div>
                <div className="text-sm opacity-80">
                  You can publish this mission. {formatCurrency(requiredHold)} will be placed on hold.
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Insufficient funds</div>
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
