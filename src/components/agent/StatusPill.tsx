import { cn } from '@/lib/utils';
import { AgentMissionStatus } from '@/lib/agentAppMock';

const MAP: Record<AgentMissionStatus, { label: string; cls: string; dot: string }> = {
  available: { label: 'Available', cls: 'bg-muted text-foreground', dot: 'bg-muted-foreground' },
  active: { label: 'In progress', cls: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  submitted: { label: 'Submitted', cls: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  under_review: { label: 'In review', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', cls: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
};

export function StatusPill({ status }: { status: AgentMissionStatus }) {
  const m = MAP[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap', m.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}
