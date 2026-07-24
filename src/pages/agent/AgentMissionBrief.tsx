import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getMission, acceptMission } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AlertTriangle, Camera, ClipboardList, Coins, ShoppingBag, ScrollText, Info } from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Info },
  { key: 'rules', label: 'Rules', icon: ScrollText },
  { key: 'questions', label: 'Questions', icon: ClipboardList },
  { key: 'photos', label: 'Photos', icon: Camera },
  { key: 'purchase', label: 'Purchase', icon: ShoppingBag },
  { key: 'payout', label: 'Payout', icon: Coins },
];

export default function AgentMissionBrief() {
  const { id } = useParams();
  const nav = useNavigate();
  const mission = id ? getMission(id) : undefined;
  const [tab, setTab] = useState('overview');
  const [accepted, setAccepted] = useState(false);
  if (!mission) return null;

  const accept = () => {
    const visit = acceptMission(mission.id);
    nav(`/agent-app/active/${visit.id}`);
  };

  return (
    <>
      <AgentTopBar title="Mission brief" showBack />

      <div className="sticky top-14 z-20 bg-background border-b overflow-x-auto scrollbar-none">
        <div className="flex gap-1 px-3 py-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1',
                tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pb-28 space-y-4">
        {tab === 'overview' && (
          <>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="text-[10px] uppercase font-bold text-primary tracking-wide">Cover story</div>
              <p className="text-sm mt-1.5 leading-relaxed">{mission.coverStory}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Duration</div>
                <div className="font-bold">{mission.durationMin} min</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Cancel window</div>
                <div className="font-bold">{mission.cancelWindowMin} min after accept</div>
              </div>
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
          <p className="text-xs text-amber-900">By accepting, you commit to complete this mission within {mission.durationMin} minutes of arrival. You may cancel within {mission.cancelWindowMin} min of accepting.</p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3 space-y-3">
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} />
          I've read and understood the full brief.
        </label>
        <Button className="w-full" size="lg" disabled={!accepted} onClick={accept}>
          Accept mission
        </Button>
      </div>
    </>
  );
}
