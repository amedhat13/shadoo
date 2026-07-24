import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisit, getMission } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { StatusTimeline } from '@/components/agent/StatusTimeline';

export default function AgentSubmitted() {
  const { visitId } = useParams();
  const nav = useNavigate();
  const visit = visitId ? getVisit(visitId) : undefined;
  const mission = visit ? getMission(visit.missionId) : undefined;
  if (!visit || !mission) return null;

  return (
    <>
      <AgentTopBar title="Submitted" />
      <div className="p-6 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="font-bold text-xl">Mission submitted!</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your visit is being reviewed. You'll be notified once approved and paid.
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-2xl border p-4">
          <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground mb-3">What happens next</div>
          <StatusTimeline items={visit.timeline} />
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="text-xs text-muted-foreground">Expected payout</div>
          <div className="font-bold text-lg text-primary">
            {mission.payoutBreakdown.reduce((s, p) => s + p.amount, 0)} EGP
          </div>
          <p className="text-xs text-muted-foreground mt-1">{mission.payoutTiming}</p>
        </div>
      </div>

      <div className="p-4 space-y-2 mt-auto">
        <Button className="w-full" size="lg" onClick={() => nav('/agent-app/my-missions')}>View in my missions</Button>
        <Button variant="outline" className="w-full" onClick={() => nav('/agent-app')}>Find another mission</Button>
      </div>
    </>
  );
}
