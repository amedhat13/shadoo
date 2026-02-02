import { cn } from '@/lib/utils';
import { MissionStatus } from '@/types';
import { MISSION_STATUS_LABELS } from '@/lib/constants';

interface MissionStatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

// Brand colors: Green = active/completed, Orange = pending/action, Gray = inactive
const statusStyles: Record<MissionStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  published: 'bg-success/10 text-success border-success/30',
  paused: 'bg-primary/10 text-primary border-primary/30',
  completed: 'bg-foreground/10 text-foreground border-border',
  archived: 'bg-muted text-muted-foreground border-border',
};

export function MissionStatusBadge({ status, className }: MissionStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        statusStyles[status],
        className
      )}
    >
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}
