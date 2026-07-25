import { useParams } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisit, getMission } from '@/lib/agentAppMock';
import { StatusTimeline } from '@/components/agent/StatusTimeline';
import { StatusPill } from '@/components/agent/StatusPill';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export default function AgentVisitHistory() {
  const { visitId } = useParams();
  const visit = visitId ? getVisit(visitId) : undefined;
  const mission = visit ? getMission(visit.missionId) : undefined;
  if (!visit || !mission) return null;

  return (
    <>
      <AgentTopBar title="Visit history" showBack />
      <div className="p-4 space-y-4 pb-8">
        <div className="rounded-2xl border overflow-hidden">
          <img src={mission.brandLogo || mission.hero} className="w-full aspect-video object-contain bg-muted p-6" alt="" />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">{mission.brand}</div>
              <StatusPill status={visit.status} />
            </div>
            <h1 className="font-bold text-base mt-1">{mission.title}</h1>
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide mb-3">Status timeline</div>
          <StatusTimeline items={visit.timeline} />
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="text-xs text-muted-foreground">Payout</div>
          <div className="font-bold text-lg text-primary">
            {mission.payoutBreakdown.reduce((s, p) => s + p.amount, 0)} EGP
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {visit.status === 'approved' ? 'Paid to wallet' : visit.status === 'rejected' ? 'Not paid — see reason below' : 'Pending approval'}
          </div>
        </div>

        {visit.status === 'rejected' && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="text-xs font-bold text-red-800 uppercase">Rejection reason</div>
            <p className="text-sm text-red-900 mt-1">Photos were unclear and could not be verified. You may re-apply to a similar mission.</p>
          </div>
        )}

        <Button variant="outline" className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" /> Contact support
        </Button>
      </div>
    </>
  );
}
