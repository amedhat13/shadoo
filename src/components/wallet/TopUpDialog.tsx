import { useState } from 'react';
import { CreditCard, Loader2, CheckCircle2, Wallet, Building2, Upload, Clock } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { CURRENCY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000];

type TopUpStep = 'amount' | 'processing' | 'success' | 'requesting' | 'requested';
type FundingMethod = 'card' | 'manual';

interface TopUpDialogProps {
  onTopUp: (amount: number) => Promise<void>;
  onRequestFunding?: (amount: number, reference?: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function TopUpDialog({ onTopUp, onRequestFunding, trigger }: TopUpDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<TopUpStep>('amount');
  const [method, setMethod] = useState<FundingMethod>('card');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [proofName, setProofName] = useState('');
  const { t } = useTranslation('wallet');
  const { t: tc } = useTranslation('common');
  const { isRTL } = useLanguage();

  const amount = selectedAmount || Number(customAmount) || 0;

  const formatNumber = (num: number) => num.toLocaleString(isRTL ? 'ar-EG' : CURRENCY.locale);

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

    if (method === 'manual') {
      setStep('requesting');
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await onRequestFunding?.(amount, reference.trim() || undefined);
      setStep('requested');
      setTimeout(() => {
        setOpen(false);
        resetState();
      }, 2600);
      return;
    }

    setStep('processing');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await onTopUp(amount);
    setStep('success');
    setTimeout(() => {
      setOpen(false);
      resetState();
    }, 2000);
  };

  const resetState = () => {
    setStep('amount');
    setMethod('card');
    setSelectedAmount(null);
    setCustomAmount('');
    setReference('');
    setNote('');
    setProofName('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) resetState();
  };

  const MethodCard = ({
    value, icon: Icon, title, subtitle,
  }: { value: FundingMethod; icon: typeof CreditCard; title: string; subtitle: string }) => (
    <button
      type="button"
      onClick={() => setMethod(value)}
      className={cn(
        'flex items-start gap-3 border p-3 text-start transition-all hover:border-primary',
        method === value ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-background'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <CreditCard className="h-4 w-4" />
            {t('top_up_wallet')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        {step === 'amount' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t('top_up_wallet')}
              </DialogTitle>
              <DialogDescription>{t('top_up_description')}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Funding method */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('funding.method_label')}
                </Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <MethodCard value="card" icon={CreditCard} title={t('funding.instant_title')} subtitle={t('funding.instant_subtitle')} />
                  <MethodCard value="manual" icon={Building2} title={t('funding.manual_title')} subtitle={t('funding.manual_subtitle')} />
                </div>
              </div>

              {/* Preset Amounts */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('select_amount')}
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
                      <span className="text-lg font-bold">{formatNumber(preset)}</span>
                      <span className="ms-1 text-sm text-muted-foreground">{tc('currency_code')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="custom-amount" className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('or_enter_custom_amount')}
                </Label>
                <div className="relative">
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder={t('enter_amount')}
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    min={100}
                    className="pe-12"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {tc('currency_code')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('minimum_amount', { amount: `100 ${tc('currency_code')}` })}
                </p>
              </div>

              {/* Manual funding details */}
              {method === 'manual' && (
                <div className="space-y-3 border border-border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">{t('funding.manual_helper')}</p>
                  <div className="space-y-2">
                    <Label htmlFor="funding-ref">{t('funding.reference_label')}</Label>
                    <Input
                      id="funding-ref"
                      placeholder={t('funding.reference_placeholder')}
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="funding-note">{t('funding.note_label')}</Label>
                    <Textarea
                      id="funding-note"
                      rows={2}
                      placeholder={t('funding.note_placeholder')}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="funding-proof">{t('funding.proof_label')}</Label>
                    <label
                      htmlFor="funding-proof"
                      className="flex cursor-pointer items-center gap-2 border border-dashed border-border bg-background p-3 text-sm text-muted-foreground hover:border-primary"
                    >
                      <Upload className="h-4 w-4" />
                      {proofName || t('funding.proof_placeholder')}
                    </label>
                    <input
                      id="funding-proof"
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setProofName(e.target.files?.[0]?.name || '')}
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              {amount >= 100 && (
                <div className="border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('amount_to_add')}</span>
                    <span className="text-xl font-black">
                      {formatNumber(amount)} {tc('currency_code')}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleProceed} disabled={amount < 100} className="w-full gap-2">
                {method === 'manual' ? (
                  <><Building2 className="h-4 w-4" />{t('funding.submit_request')}</>
                ) : (
                  <><CreditCard className="h-4 w-4" />{t('proceed_to_payment')}</>
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-bold">{t('processing_payment')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('connecting_to_paymob')}</p>
          </div>
        )}

        {step === 'requesting' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-bold">{t('funding.submitting')}</h3>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{t('payment_successful')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('amount_added_to_wallet', { amount: `${formatNumber(amount)} ${tc('currency_code')}` })}
            </p>
          </div>
        )}

        {step === 'requested' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-10 w-10 text-warning" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{t('funding.requested_title')}</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {t('funding.requested_desc', { amount: `${formatNumber(amount)} ${tc('currency_code')}` })}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
