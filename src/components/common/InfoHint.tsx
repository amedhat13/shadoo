import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface InfoHintProps {
  /** Short explanatory text shown inside the popover. */
  label: string;
  /** Optional accessible name for the trigger button. */
  title?: string;
  /** Position the popover opens relative to the trigger. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  iconClassName?: string;
}

/**
 * A small ℹ icon that reveals its label on click (and hover on desktop).
 * Use it to tuck away helper / explanatory copy and reduce visual noise.
 */
export function InfoHint({
  label,
  title,
  side = 'top',
  align = 'center',
  className,
  iconClassName,
}: InfoHintProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={title || label}
          aria-label={title || label}
          className={cn(
            'inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors',
            className,
          )}
        >
          <Info className={cn('h-3.5 w-3.5', iconClassName)} />
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-64 text-xs leading-relaxed">
        {label}
      </PopoverContent>
    </Popover>
  );
}
