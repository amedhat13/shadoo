import { useState } from 'react';
import { CreditCard, Loader2, CheckCircle2, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CURRENCY } from '@/lib/constants';
import { cn } from '@/lib/utils';

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];

type TopUpStep = 'amount' | 'processing' | 'success';

interface TopUpDialogProps {
  onTopUp: (amount: number) => Promise<void>;
  trigger?: React.ReactNode;
}

export function TopUpDialog({ onTopUp, trigger }: TopUpDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<TopUpStep>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const amount = selectedAmount || Number(customAmount) || 0;

  const handleSelectPreset = (preset: number) => {
    setSelectedAmount(preset);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleProceed = async () => {
    if (amount < 100) return;
    
    setStep('processing');
    
    // Simulate PayMob payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    await onTopUp(amount);
    setStep('success');
    
    // Auto-close after success
    setTimeout(() => {
      setOpen(false);
      resetState();
    }, 2000);
  };

  const resetState = () => {
    setStep('amount');
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetState();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <CreditCard className="h-4 w-4" />
            Top Up Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === 'amount' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Top Up Wallet
              </DialogTitle>
              <DialogDescription>
                Add funds to your wallet using PayMob secure payment.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Preset Amounts */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Select Amount
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSelectPreset(preset)}
                      className={cn(
                        'border p-3 text-center transition-all hover:border-primary',
                        selectedAmount === preset
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border bg-background'
                      )}
                    >
                      <span className="text-lg font-bold">
                        {preset.toLocaleString(CURRENCY.locale)}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        {CURRENCY.symbol}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="custom-amount" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Or Enter Custom Amount
                </Label>
                <div className="relative">
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min={100}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {CURRENCY.symbol}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum amount: 100 {CURRENCY.symbol}
                </p>
              </div>

              {/* Summary */}
              {amount >= 100 && (
                <div className="border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount to add</span>
                    <span className="text-xl font-black">
                      {amount.toLocaleString(CURRENCY.locale)} {CURRENCY.symbol}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleProceed}
                disabled={amount < 100}
                className="w-full gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Proceed to Payment
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-bold">Processing Payment</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Connecting to PayMob...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Payment Successful!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {amount.toLocaleString(CURRENCY.locale)} {CURRENCY.symbol} has been added to your wallet.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
