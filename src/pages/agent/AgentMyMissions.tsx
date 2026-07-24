import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisits, getMission, subscribe, AgentMissionStatus } from '@/lib/agentAppMock';
import { StatusPill } from '@/components/agent/StatusPill';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

const TABS: { key: 'active' | 'under_review' | 'approved' | 'rejected' | 'all'; label: string; match: AgentMissionStatus[] }[] = [
  { key: 'active', label: 'Active', match: ['active'] },
  { key: 'under_review', label: 'Review', match: ['under_review', 'submitted'] },
  { key: 'approved', label: 'Approved', match: ['approved'] },
  { key: 'rejected', label: 'Rejected', match: ['rejected'] },
  { key: 'all', label: 'All', match: ['active', 'under_review', 'submitted', 'approved', 'rejected'] },
];

export default function AgentMyMissions() {
  const nav = useNavigate();
  const [tab, setTab] = useState<typeof TABS[number]['key']>('active');
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((x) => x + 1)), []);
  const activeTab = TABS.find((t) => t.key === tab)!;
  const visits = getVisits().filter((v) => activeTab.match.includes(v.status));

  return (
    <>
      <AgentTopBar title="My missions" />
      <div className="sticky top-14 z-20 bg-background border-b overflow-x-auto scrollbar-none">
        <div className="flex gap-1 px-3 py-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold',
                tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {visits.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">No missions here yet.</div>
        )}
        {visits.map((v) => {
          const m = getMission(v.missionId);
          if (!m) return null;
          const target = v.status === 'active' ? `/agent-app/active/${v.id}` : `/agent-app/my-missions/${v.id}`;
          return (
            <button key={v.id} onClick={() => nav(target)}
              className="w-full text-left rounded-2xl border overflow-hidden bg-card hover:bg-muted/30">
              <div className="flex">
                <img src={m.hero} className="w-24 h-24 object-cover shrink-0" alt="" />
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground truncate">{m.brand}</div>
                    <StatusPill status={v.status} />
                  </div>
                  <div className="font-semibold text-sm leading-tight mt-1 line-clamp-2">{m.title}</div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{v.submittedAt ? format(new Date(v.submittedAt), 'MMM d') : v.acceptedAt ? 'Accepted ' + format(new Date(v.acceptedAt), 'MMM d') : ''}</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      {m.payoutBreakdown.reduce((s, p) => s + p.amount, 0)} EGP
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
