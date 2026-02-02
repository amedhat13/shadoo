import { cn } from '@/lib/utils';
import { MissionStatus } from '@/types/mission';
import { MISSION_STATUS_LABELS } from '@/lib/constants';

interface MissionStatusBadgeProps {
  status: MissionStatus;
  className?: string;
}

const statusStyles: Record<MissionStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  ready_for_funding: 'bg-warning/10 text-warning border-warning/20',
  published: 'bg-success/10 text-success border-success/20',
  paused: 'bg-warning/10 text-warning border-warning/20',
  expired: 'bg-muted text-muted-foreground',
  archived: 'bg-muted text-muted-foreground',
};

export function MissionStatusBadge({ status, className }: MissionStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        statusStyles[status],
        className
      )}
    >
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}
