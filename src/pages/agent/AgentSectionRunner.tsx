import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisit, getMission, updateVisit, subscribe } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/agent/QuestionCard';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function AgentSectionRunner() {
  const { visitId, sectionId } = useParams();
  const nav = useNavigate();
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((x) => x + 1)), []);
  const visit = visitId ? getVisit(visitId) : undefined;
  const mission = visit ? getMission(visit.missionId) : undefined;
  const section = mission?.sections.find((s) => s.id === sectionId);
  const [idx, setIdx] = useState(0);
  const [transition, setTransition] = useState<null | { doneTitle: string; nextTitle?: string; nextId?: string }>(null);
  useEffect(() => { setIdx(0); setTransition(null); }, [sectionId]);
  if (!visit || !mission || !section) return null;

  const safeIdx = Math.min(idx, section.questions.length - 1);
  const q = section.questions[safeIdx];
  if (!q) return null;
  const answers = visit.answers || {};
  const photos = visit.photos || {};
  const setAnswer = (val: any) => updateVisit(visit.id, { answers: { ...answers, [q.id]: val } });
  const setPhoto = (dataUrl: string | undefined) => {
    const next = { ...photos };
    if (dataUrl) next[`q:${q.id}`] = dataUrl; else delete next[`q:${q.id}`];
    updateVisit(visit.id, { photos: next });
  };

  const answer = answers[q.id];
  const trig = q.photoOn;
  const needsPhoto = !!trig && (
    (trig.ratingLte !== undefined && typeof answer === 'number' && answer > 0 && answer <= trig.ratingLte) ||
    (trig.ifAnswer !== undefined && answer === trig.ifAnswer)
  );
  const isLast = safeIdx === section.questions.length - 1;
  const answered = answer !== undefined && answer !== '';
  const canNext = (!q.required || answered) && (!needsPhoto || !!photos[`q:${q.id}`]);

  return (
    <>
      <AgentTopBar title={section.title} showBack />

      <div className="p-4 space-y-4 pb-28">
        <div className="flex justify-center gap-1.5">
          {section.questions.map((_, i) => (
            <span key={i} className={cn('h-1.5 rounded-full transition-all',
              i === safeIdx ? 'w-6 bg-primary' : i < safeIdx ? 'w-4 bg-primary/60' : 'w-4 bg-muted')} />
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground">Question {safeIdx + 1} of {section.questions.length}</div>

        <QuestionCard question={q} value={answer} onChange={setAnswer} photo={photos[`q:${q.id}`]} onPhoto={setPhoto} />
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3 flex gap-2">
        <Button variant="outline" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={safeIdx === 0}>Previous</Button>
        <Button className="flex-1" disabled={!canNext}
          onClick={() => {
            if (!isLast) {
              setIdx((i) => i + 1);
              document.getElementById('agent-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
              return;
            }
            // Section finished — show transition, then jump to next incomplete section (or hub).
            const currentAnswers = { ...answers, [q.id]: answer };
            const nextSec = mission.sections.find((s) => {
              if (s.id === section.id) return false;
              return s.questions.filter((qq) => qq.required).some((qq) => currentAnswers[qq.id] === undefined || currentAnswers[qq.id] === '');
            });
            setTransition({ doneTitle: section.title, nextTitle: nextSec?.title, nextId: nextSec?.id });
            window.setTimeout(() => {
              if (nextSec) nav(`/agent-app/active/${visit.id}/section/${nextSec.id}`, { replace: true });
              else nav(`/agent-app/active/${visit.id}`);
            }, 1500);
          }}>
          {isLast ? 'Finish section' : 'Next'}
        </Button>
      </div>

      {transition && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-scale-in">
              <Check className="w-10 h-10" strokeWidth={3} />
            </div>
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Section complete</div>
          <div className="text-xl font-semibold text-center mb-8">{transition.doneTitle}</div>

          {transition.nextTitle ? (
            <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Up next</div>
              <div className="text-lg font-medium text-center">{transition.nextTitle}</div>
              <div className="mt-4 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              All sections done — heading back…
            </div>
          )}
        </div>
      )}
    </>
  );
}
