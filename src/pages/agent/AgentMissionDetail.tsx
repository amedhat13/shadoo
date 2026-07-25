import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getMission, getSlot, getBranch } from '@/lib/agentAppMock';
import { MapPin, Clock, Coins, Calendar, ShoppingBag, Receipt, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function AgentMissionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const slotId = sp.get('slot') || undefined;
  const mission = id ? getMission(id) : undefined;
  const slot = getSlot(slotId);
  const branch = slot && mission ? getBranch(mission.id, slot.branchId) : undefined;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!mission) return <div className="p-6">Mission not found</div>;

  const startMs = slot ? new Date(slot.startAt).getTime() : 0;
  const notStarted = slot ? startMs > now : false;
  const countdown = notStarted ? formatCountdown(startMs - now) : '';

  const mapsUrl = branch
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.name}, ${branch.address}, ${branch.city}`)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.address)}`;

  return (
    <>
      <AgentTopBar title="Visit details" showBack />
      <div className="pb-24">
        <div
          className="relative aspect-video flex items-center justify-center"
          style={{
            background: mission.brandColor
              ? `linear-gradient(135deg, ${mission.brandColor}22, ${mission.brandColor}08)`
              : 'hsl(var(--muted))',
          }}
        >
          <img
            src={mission.brandLogo || mission.hero}
            alt={mission.brand}
            className="max-h-[60%] max-w-[65%] object-contain drop-shadow"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div className="p-4 space-y-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase">
              {mission.category}
            </div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mt-2 tracking-wide">{mission.brand}</div>
            <h1 className="font-bold text-xl leading-tight mt-1">{mission.title}</h1>
          </div>

          {slot && branch && (
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 overflow-hidden">
              <div className="px-3 py-2 bg-primary/10 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wide text-primary">Visit location</span>
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <div className="font-bold text-sm">{branch.name}</div>
                  <div className="text-xs text-muted-foreground">{branch.address} · {branch.city}</div>
                  <div className="text-xs text-muted-foreground mt-1">{branch.distanceKm} km away</div>
                </div>
                <a href={mapsUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold uppercase">
                  <Navigation className="h-3.5 w-3.5" /> Navigate
                </a>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Coins, label: 'Reward', value: `${mission.reward} EGP` },
              { icon: Clock, label: 'Duration', value: `${mission.durationMin} min` },
              slot
                ? { icon: Calendar, label: 'Starts', value: format(new Date(slot.startAt), 'MMM d, HH:mm') }
                : { icon: Calendar, label: 'Deadline', value: format(new Date(mission.deadline), 'MMM d, HH:mm') },
              { icon: MapPin, label: 'Distance', value: `${branch?.distanceKm ?? mission.distanceKm} km` },
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
          {mission.requiresReceipt && mission.purchaseBudget > 0 && (
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 overflow-hidden">
              <div className="px-3 py-2 bg-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wide text-primary">Purchase required</span>
                </div>
                <span className="text-sm font-bold text-primary">{mission.purchaseBudget} EGP</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Items to buy</div>
                <ul className="space-y-1.5">
                  {mission.itemsToPurchase.map((it) => (
                    <li key={it.name} className="flex justify-between text-sm">
                      <span>{it.name}</span>
                      <span className="text-muted-foreground">up to {it.budget} EGP</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-1.5 pt-2 border-t text-[11px] text-muted-foreground leading-relaxed">
                  <Receipt className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  Keep the receipt — full amount is reimbursed to your wallet after approval.
                </div>
              </div>
            </div>
          )}

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

          {notStarted && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
              This visit starts in <span className="font-bold">{countdown}</span>. You can read the full brief now — the mission button becomes active at the start time.
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3">
        <Button className="w-full" size="lg"
          onClick={() => nav(`/agent-app/mission/${mission.id}/brief${slot ? `?slot=${slot.id}` : ''}`)}>
          Read full brief
        </Button>
      </div>
    </>
  );
}
