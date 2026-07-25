import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisit, getMission, subscribe } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { Camera, ClipboardList, Receipt, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import shadooCap from '@/assets/shadoo-cap.png';

function ProgressRing({ value, size = 72, complete = false }: { value: number; size?: number; complete?: boolean }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={6} className="stroke-muted" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={6}
          className={cn('transition-all', complete ? 'stroke-emerald-500' : 'stroke-primary')}
          fill="none"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {complete ? (
          <img
            src={shadooCap}
            alt=""
            className="h-8 w-8 object-contain animate-in zoom-in-50 duration-500"
            style={{ animation: 'shadoo-bounce 1.6s ease-in-out infinite' }}
          />
        ) : (
          <span className="text-[11px] font-bold tabular-nums text-foreground">{Math.round(value)}%</span>
        )}
      </div>
      <style>{`@keyframes shadoo-bounce { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-3px) rotate(4deg); } }`}</style>
    </div>
  );
}

function formatMS(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function AgentActive() {
  const { visitId } = useParams();
  const nav = useNavigate();
  const [, force] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => subscribe(() => force((x) => x + 1)), []);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const visit = visitId ? getVisit(visitId) : undefined;
  const mission = visit ? getMission(visit.missionId) : undefined;
  if (!visit || !mission) return <div className="p-6">Visit not found</div>;

  const answers = visit.answers || {};
  const photos = visit.photos || {};

  const sectionDone = (sid: string) => {
    const sec = mission.sections.find((s) => s.id === sid);
    if (!sec) return false;
    return sec.questions.filter((q) => q.required).every((q) => answers[q.id] !== undefined && answers[q.id] !== '');
  };
  const sectionProgress = (sid: string) => {
    const sec = mission.sections.find((s) => s.id === sid);
    if (!sec) return 0;
    const answered = sec.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;
    return Math.round((answered / sec.questions.length) * 100);
  };

  const doneSections = mission.sections.filter((s) => sectionDone(s.id)).length;
  const donePhotos = mission.photoTasks.filter((p) => photos[p.id]).length;
  const receiptDone = !!visit.receiptPhoto;
  const totalTasks = mission.sections.length + mission.photoTasks.length + (mission.requiresReceipt ? 1 : 0);
  const completed = doneSections + donePhotos + (mission.requiresReceipt && receiptDone ? 1 : 0);
  const allDone = completed === totalTasks;

  const acceptedAt = visit.acceptedAt ? new Date(visit.acceptedAt).getTime() : now;
  const cancelDeadline = acceptedAt + mission.cancelWindowMin * 60_000;
  const missionDeadline = acceptedAt + mission.durationMin * 60_000;
  const cancelLeft = cancelDeadline - now;
  const missionLeft = missionDeadline - now;
  const cancelActive = cancelLeft > 0;
  const missionOverdue = missionLeft <= 0;

  return (
    <>
      <AgentTopBar title="Active mission" showBack />
      <div className="p-4 pb-28 space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <div className={cn('rounded-xl border p-3', cancelActive ? 'bg-amber-50 border-amber-200' : 'bg-muted/40')}>
            <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">Cancel window</div>
            <div className={cn('font-bold text-lg tabular-nums mt-0.5', cancelActive ? 'text-amber-700' : 'text-muted-foreground')}>
              {cancelActive ? formatMS(cancelLeft) : 'Closed'}
            </div>
          </div>
          <div className={cn('rounded-xl border p-3', missionOverdue ? 'bg-rose-50 border-rose-200' : 'bg-primary/5 border-primary/20')}>
            <div className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">Time to complete</div>
            <div className={cn('font-bold text-lg tabular-nums mt-0.5', missionOverdue ? 'text-rose-700' : 'text-primary')}>
              {missionOverdue ? 'Overdue' : formatMS(missionLeft)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-4 flex items-center gap-4">
          <ProgressRing value={(completed / totalTasks) * 100} complete={allDone} />
          <div className="flex-1">
            <div className="text-xs uppercase text-muted-foreground font-semibold">{allDone ? 'Ready to submit' : 'In progress'}</div>
            <div className="font-bold text-sm leading-tight mt-0.5">{mission.title}</div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {completed} of {totalTasks} tasks complete
            </div>
          </div>
        </div>


        <div>
          <h3 className="text-xs uppercase font-bold tracking-wide mb-2">Question sections</h3>
          <div className="space-y-2">
            {mission.sections.map((sec, i) => {
              const done = sectionDone(sec.id);
              const prog = sectionProgress(sec.id);
              return (
                <button key={sec.id} onClick={() => nav(`/agent-app/active/${visit.id}/section/${sec.id}`)}
                  className="w-full rounded-xl border p-3 flex items-center gap-3 text-left bg-card hover:bg-muted/40 transition">
                  <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold',
                    done ? 'bg-emerald-500 text-white' : 'bg-muted')}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{sec.title}</div>
                    <div className="text-xs text-muted-foreground">{sec.questions.length} questions · {prog}% done</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase font-bold tracking-wide mb-2">Photos</h3>
          <div className="space-y-2">
            {mission.photoTasks.map((p) => {
              const done = !!photos[p.id];
              return (
                <button key={p.id} onClick={() => nav(`/agent-app/active/${visit.id}/photo/${p.id}`)}
                  className="w-full rounded-xl border p-3 flex items-center gap-3 text-left bg-card hover:bg-muted/40">
                  <div className={cn('h-12 w-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center',
                    done ? '' : 'bg-muted')}>
                    {done ? <img src={photos[p.id]} className="w-full h-full object-cover" alt="" /> : <Camera className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{p.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                  </div>
                  {done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {mission.requiresReceipt && (
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wide mb-2">Receipt & purchase</h3>
            <button onClick={() => nav(`/agent-app/active/${visit.id}/receipt`)}
              className="w-full rounded-xl border p-3 flex items-center gap-3 text-left bg-card hover:bg-muted/40">
              <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center shrink-0',
                receiptDone ? 'bg-emerald-100' : 'bg-muted')}>
                <Receipt className={cn('h-5 w-5', receiptDone ? 'text-emerald-600' : 'text-muted-foreground')} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Upload receipt</div>
                <div className="text-xs text-muted-foreground">
                  {receiptDone ? `${visit.amountSpent} EGP submitted` : `Up to ${mission.purchaseBudget} EGP reimbursed`}
                </div>
              </div>
              {receiptDone && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3">
        <Button className="w-full" size="lg" disabled={!allDone}
          onClick={() => nav(`/agent-app/active/${visit.id}/review`)}>
          {allDone ? 'Review & submit' : `Complete all ${totalTasks} tasks to submit`}
        </Button>
      </div>
    </>
  );
}
