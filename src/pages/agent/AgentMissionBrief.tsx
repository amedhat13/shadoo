import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getMission, getSlot, getBranch, acceptSlot, acceptMission } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AlertTriangle, Camera, ClipboardList, Coins, ShoppingBag, ScrollText, Info, ChevronRight, Navigation, MapPin, Clock } from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Info },
  { key: 'rules', label: 'Rules', icon: ScrollText },
  { key: 'questions', label: 'Questions', icon: ClipboardList },
  { key: 'photos', label: 'Photos', icon: Camera },
  { key: 'purchase', label: 'Purchase', icon: ShoppingBag },
  { key: 'payout', label: 'Payout', icon: Coins },
] as const;

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

export default function AgentMissionBrief() {
  const { id } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const slotId = sp.get('slot') || undefined;
  const mission = id ? getMission(id) : undefined;
  const slot = getSlot(slotId);
  const branch = slot && mission ? getBranch(mission.id, slot.branchId) : undefined;

  const [tabIdx, setTabIdx] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!mission) return null;
  const tab = TABS[tabIdx].key;
  const isLast = tabIdx === TABS.length - 1;

  const startMs = slot ? new Date(slot.startAt).getTime() : 0;
  const notStarted = slot ? startMs > now : false;
  const countdown = notStarted ? formatCountdown(startMs - now) : '';

  const gotoTab = (i: number) => {
    // Only allow forward navigation to tabs already reached
    if (i > maxReached) return;
    setTabIdx(i);
  };

  const next = () => {
    const n = Math.min(tabIdx + 1, TABS.length - 1);
    setTabIdx(n);
    setMaxReached((m) => Math.max(m, n));
  };

  const accept = () => {
    const visit = slot ? acceptSlot(slot.id) : acceptMission(mission.id);
    nav(`/agent-app/active/${visit.id}`);
  };

  const mapsUrl = branch
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.name}, ${branch.address}, ${branch.city}`)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.address)}`;

  return (
    <>
      <div className="sticky top-0 z-30 bg-background">
        <AgentTopBar title="Mission brief" showBack />
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-1 px-3 py-2">
            {TABS.map((t, i) => {
              const locked = i > maxReached;
              const active = i === tabIdx;
              return (
                <button key={t.key} onClick={() => gotoTab(i)} disabled={locked}
                  className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition',
                    active ? 'bg-primary text-primary-foreground'
                      : locked ? 'bg-muted/50 text-muted-foreground/50'
                      : 'bg-muted text-foreground')}>
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="px-3 pb-2 text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
            Step {tabIdx + 1} of {TABS.length}
          </div>
        </div>
      </div>

      <div className="p-4 pb-40 space-y-4">
        {tab === 'overview' && (
          <>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="text-[10px] uppercase font-bold text-primary tracking-wide">Cover story</div>
              <p className="text-sm mt-1.5 leading-relaxed">{mission.coverStory}</p>
            </div>

            {branch && (
              <div className="rounded-xl border overflow-hidden">
                <div className="px-3 py-2 bg-muted/50 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wide">Visit location</span>
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

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Duration</div>
                <div className="font-bold">{mission.durationMin} min</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Cancel window</div>
                <div className="font-bold">{mission.cancelWindowMin} min after accept</div>
              </div>
              {slot && (
                <div className="col-span-2 rounded-xl border p-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Visit start</div>
                    <div className="font-bold text-sm">{new Date(slot.startAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'rules' && (
          <ol className="space-y-3">
            {mission.rules.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="h-6 w-6 shrink-0 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <p className="text-sm leading-relaxed">{r}</p>
              </li>
            ))}
          </ol>
        )}

        {tab === 'questions' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Preview of what you'll be asked. You'll answer these during the visit.</p>
            {mission.sections.map((sec, si) => (
              <div key={sec.id} className="rounded-xl border overflow-hidden">
                <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">Section {si + 1}</div>
                    <div className="font-semibold text-sm">{sec.title}</div>
                  </div>
                  <span className="text-[10px] font-semibold bg-background rounded-full px-2 py-0.5 border">{sec.questions.length} Q</span>
                </div>
                <ol className="p-3 space-y-2">
                  {sec.questions.map((q, qi) => (
                    <li key={q.id} className="text-sm">
                      <span className="text-muted-foreground mr-1">{qi + 1}.</span>{q.text}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        {tab === 'photos' && (
          <div className="space-y-3">
            {mission.photoTasks.map((p) => (
              <div key={p.id} className="rounded-xl border overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  <img src={p.sample} alt="" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-background/95 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">Sample</div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="font-semibold text-sm">{p.title}</div>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                  <ul className="text-xs space-y-1 mt-2">
                    {p.tips.map((t) => <li key={t}>• {t}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'purchase' && (
          <div className="space-y-3">
            {!mission.requiresReceipt ? (
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">No purchase required for this mission.</div>
            ) : (
              <>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-900 leading-relaxed">Shadoo reimburses your purchase in full up to the budget. Keep the receipt.</p>
                </div>
                <div className="rounded-xl border">
                  <div className="p-3 border-b flex justify-between">
                    <span className="text-sm font-medium">Total budget</span>
                    <span className="font-bold text-primary">{mission.purchaseBudget} EGP</span>
                  </div>
                  {mission.itemsToPurchase.map((it) => (
                    <div key={it.name} className="p-3 border-b last:border-0 flex justify-between text-sm">
                      <span>{it.name}</span>
                      <span className="text-muted-foreground">up to {it.budget} EGP</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'payout' && (
          <div className="space-y-3">
            <div className="rounded-xl border">
              {mission.payoutBreakdown.map((p) => (
                <div key={p.label} className="p-3 border-b last:border-0 flex justify-between text-sm">
                  <span>{p.label}</span>
                  <span className="font-semibold">{p.amount} EGP</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{mission.payoutTiming}</p>
          </div>
        )}

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900">By accepting, you commit to complete this visit within {mission.durationMin} minutes of arrival. You may cancel within {mission.cancelWindowMin} min of accepting.</p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3 space-y-3">
        {!isLast ? (
          <Button className="w-full" size="lg" onClick={next}>
            Next: {TABS[tabIdx + 1].label} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} />
              I've read and understood the full brief.
            </label>
            {notStarted && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-900">
                Visit starts in <span className="font-bold">{countdown}</span>. Accept will unlock at start time.
              </div>
            )}
            <Button className="w-full" size="lg" disabled={!accepted || notStarted} onClick={accept}>
              {notStarted ? `Available in ${countdown}` : 'Accept & start visit'}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
