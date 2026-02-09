import { CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface VisitsRemainingWidgetProps {
  visitsRemaining: number;
  visitsTotal: number;
  variant?: 'header' | 'card' | 'compact';
  className?: string;
}

export function VisitsRemainingWidget({
  visitsRemaining,
  visitsTotal,
  variant = 'header',
  className,
}: VisitsRemainingWidgetProps) {
  const { t } = useTranslation('dashboard');
  const percentage = (visitsRemaining / visitsTotal) * 100;
  const isLow = visitsRemaining <= 5;
  const isZero = visitsRemaining === 0;

  if (variant === 'header') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center',
            isZero ? 'bg-destructive' : isLow ? 'bg-primary' : 'bg-success'
          )}
        >
          <CalendarCheck className="h-4 w-4 text-background" />
        </div>
        <div className="leading-tight">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('visits_left')}</div>
          <div
            className={cn(
              'text-sm font-black',
              isZero ? 'text-destructive' : isLow ? 'text-primary' : 'text-success'
            )}
          >
            {visitsRemaining} / {visitsTotal}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 border px-3 py-1.5 text-sm font-semibold',
          isZero
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : isLow
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-success/30 bg-success/10 text-success',
          className
        )}
      >
        <CalendarCheck className="h-3.5 w-3.5" />
        <span>{t('visits_left_count', { count: visitsRemaining })}</span>
      </div>
    );
  }

  // Card variant
  return (
    <div className={cn('border border-border p-4 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
          <CalendarCheck className="h-4 w-4" />
          {t('visits_this_month')}
        </div>
        <div
          className={cn(
            'text-lg font-black',
            isZero ? 'text-destructive' : isLow ? 'text-primary' : 'text-success'
          )}
        >
          {visitsRemaining} / {visitsTotal}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden bg-muted">
        <div
          className={cn(
            'h-full transition-all duration-500',
            isZero ? 'bg-destructive' : isLow ? 'bg-primary' : 'bg-success'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isZero && (
        <p className="text-xs text-destructive">
          {t('visits_used_all')}
        </p>
      )}
    </div>
  );
}
