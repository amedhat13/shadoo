import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisit, getMission, updateVisit, subscribe } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/agent/QuestionCard';
import { cn } from '@/lib/utils';

export default function AgentSectionRunner() {
  const { visitId, sectionId } = useParams();
  const nav = useNavigate();
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((x) => x + 1)), []);
  const visit = visitId ? getVisit(visitId) : undefined;
  const mission = visit ? getMission(visit.missionId) : undefined;
  const section = mission?.sections.find((s) => s.id === sectionId);
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [sectionId]);
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
  const isLast = idx === section.questions.length - 1;
  const answered = answer !== undefined && answer !== '';
  const canNext = (!q.required || answered) && (!needsPhoto || !!photos[`q:${q.id}`]);

  return (
    <>
      <AgentTopBar title={section.title} showBack />

      <div className="p-4 space-y-4 pb-28">
        <div className="flex justify-center gap-1.5">
          {section.questions.map((_, i) => (
            <span key={i} className={cn('h-1.5 rounded-full transition-all',
              i === idx ? 'w-6 bg-primary' : i < idx ? 'w-4 bg-primary/60' : 'w-4 bg-muted')} />
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground">Question {idx + 1} of {section.questions.length}</div>

        <QuestionCard question={q} value={answer} onChange={setAnswer} photo={photos[`q:${q.id}`]} onPhoto={setPhoto} />
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3 flex gap-2">
        <Button variant="outline" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>Previous</Button>
        <Button className="flex-1" disabled={!canNext}
          onClick={() => {
            if (!isLast) {
              setIdx((i) => i + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              return;
            }
            // Section finished — jump to next incomplete section, else back to active hub.
            const currentAnswers = { ...answers };
            const nextSec = mission.sections.find((s) => {
              if (s.id === section.id) return false;
              return s.questions.filter((q) => q.required).some((q) => currentAnswers[q.id] === undefined || currentAnswers[q.id] === '');
            });
            if (nextSec) nav(`/agent-app/active/${visit.id}/section/${nextSec.id}`, { replace: true });
            else nav(`/agent-app/active/${visit.id}`);
          }}>
          {isLast ? 'Finish section' : 'Next'}
        </Button>
      </div>
    </>
  );
}
