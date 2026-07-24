import { cn } from '@/lib/utils';
import { Check, Circle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function StatusTimeline({ items }: { items: { label: string; ts?: string; state: 'done' | 'current' | 'pending' }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn('h-6 w-6 rounded-full flex items-center justify-center shrink-0',
              it.state === 'done' && 'bg-emerald-500 text-white',
              it.state === 'current' && 'bg-primary text-primary-foreground',
              it.state === 'pending' && 'bg-muted text-muted-foreground')}>
              {it.state === 'done' ? <Check className="h-3.5 w-3.5" /> :
                it.state === 'current' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                <Circle className="h-3 w-3" />}
            </div>
            {i < items.length - 1 && <div className={cn('w-px flex-1 my-1', it.state === 'done' ? 'bg-emerald-500' : 'bg-border')} />}
          </div>
          <div className="pb-3">
            <div className={cn('text-sm font-medium', it.state === 'pending' && 'text-muted-foreground')}>{it.label}</div>
            {it.ts && <div className="text-xs text-muted-foreground">{format(new Date(it.ts), 'MMM d, HH:mm')}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
