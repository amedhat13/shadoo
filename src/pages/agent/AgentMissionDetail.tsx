import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getMission } from '@/lib/agentAppMock';
import { MapPin, Clock, Coins, Users, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function AgentMissionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const mission = id ? getMission(id) : undefined;
  if (!mission) return <div className="p-6">Mission not found</div>;

  return (
    <>
      <AgentTopBar title="Mission details" showBack />
      <div className="pb-24">
        <div className="relative aspect-video bg-muted">
          <img src={mission.hero} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="p-4 space-y-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified by Shadoo
            </div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mt-2 tracking-wide">{mission.brand}</div>
            <h1 className="font-bold text-xl leading-tight mt-1">{mission.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Coins, label: 'Reward', value: `${mission.reward} EGP` },
              { icon: Clock, label: 'Duration', value: `${mission.durationMin} min` },
              { icon: MapPin, label: 'Distance', value: `${mission.distanceKm} km` },
              { icon: Users, label: 'Slots left', value: `${mission.slotsLeft}` },
              { icon: Calendar, label: 'Deadline', value: format(new Date(mission.deadline), 'MMM d, HH:mm') },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border p-3 bg-card">
                <f.icon className="h-4 w-4 text-muted-foreground" />
                <div className="text-[10px] uppercase text-muted-foreground mt-1.5">{f.label}</div>
                <div className="font-semibold text-sm">{f.value}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-bold uppercase text-xs tracking-wide mb-2">What you'll do</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{mission.coverStory}</p>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="p-3 border-t">
              <div className="text-[10px] uppercase text-muted-foreground">Location</div>
              <div className="font-medium text-sm">{mission.address}</div>
            </div>
          </div>

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
            <div className="text-[10px] uppercase text-primary font-bold tracking-wide">Reward breakdown</div>
            {mission.payoutBreakdown.map((p) => (
              <div key={p.label} className="flex justify-between text-sm mt-1.5">
                <span className="text-muted-foreground">{p.label}</span>
                <span className="font-semibold">{p.amount} EGP</span>
              </div>
            ))}
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-primary/20 font-bold">
              <span>Total payout</span>
              <span>{mission.payoutBreakdown.reduce((s, p) => s + p.amount, 0)} EGP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3">
        <Button className="w-full" size="lg" onClick={() => nav(`/agent-app/mission/${mission.id}/brief`)}>
          Read full brief
        </Button>
      </div>
    </>
  );
}
