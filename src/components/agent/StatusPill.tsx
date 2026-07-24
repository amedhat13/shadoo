import { cn } from '@/lib/utils';
import { AgentMissionStatus } from '@/lib/agentAppMock';

const MAP: Record<AgentMissionStatus, { label: string; cls: string }> = {
  available: { label: 'Available', cls: 'bg-muted text-foreground' },
  active: { label: 'In progress', cls: 'bg-primary/15 text-primary' },
  submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Under review', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

export function StatusPill({ status }: { status: AgentMissionStatus }) {
  const m = MAP[status];
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', m.cls)}>{m.label}</span>;
}
