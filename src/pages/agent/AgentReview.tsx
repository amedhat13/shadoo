import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisit, getMission, submitVisit } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Camera, Receipt, ClipboardList } from 'lucide-react';

export default function AgentReview() {
  const { visitId } = useParams();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const visit = visitId ? getVisit(visitId) : undefined;
  const mission = visit ? getMission(visit.missionId) : undefined;
  if (!visit || !mission) return null;
  const answers = visit.answers || {};
  const photos = visit.photos || {};

  const doSubmit = () => {
    submitVisit(visit.id);
    nav(`/agent-app/active/${visit.id}/submitted`);
  };

  return (
    <>
      <AgentTopBar title="Review & submit" showBack />
      <div className="p-4 pb-28 space-y-4">
        <div className="rounded-2xl border p-4">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Mission</div>
          <div className="font-bold text-sm mt-0.5">{mission.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{mission.brand}</div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <div className="bg-muted/50 p-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="text-sm font-semibold">Answers</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {Object.keys(answers).length} of {mission.sections.reduce((s, sec) => s + sec.questions.length, 0)}
            </span>
          </div>
          <div className="divide-y">
            {mission.sections.map((sec) => (
              <div key={sec.id} className="p-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground">{sec.title}</div>
                <ul className="mt-2 space-y-1">
                  {sec.questions.map((q) => (
                    <li key={q.id} className="text-xs flex justify-between gap-2">
                      <span className="text-muted-foreground truncate">{q.text}</span>
                      <span className="font-medium text-right shrink-0">
                        {answers[q.id] !== undefined && answers[q.id] !== '' ? String(answers[q.id]) : <span className="text-destructive">Missing</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <div className="bg-muted/50 p-3 flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="text-sm font-semibold">Photos</span>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {mission.photoTasks.map((p) => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                {photos[p.id] ? <img src={photos[p.id]} className="w-full h-full object-cover" alt="" /> : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-destructive text-center px-1">Missing</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {mission.requiresReceipt && (
          <div className="rounded-2xl border overflow-hidden">
            <div className="bg-muted/50 p-3 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="text-sm font-semibold">Receipt</span>
            </div>
            <div className="p-3 flex gap-3">
              {visit.receiptPhoto ? (
                <img src={visit.receiptPhoto} className="w-20 h-24 object-cover rounded-lg" alt="" />
              ) : <div className="w-20 h-24 rounded-lg bg-muted flex items-center justify-center text-xs text-destructive">Missing</div>}
              <div className="flex-1 text-xs space-y-1">
                <div><span className="text-muted-foreground">Amount: </span><span className="font-semibold">{visit.amountSpent} EGP</span></div>
                <div className="text-muted-foreground">{visit.receiptDescription}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3 space-y-3">
        <label className="flex items-start gap-2 text-xs leading-relaxed">
          <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(!!v)} className="mt-0.5" />
          I confirm that all information is accurate and honestly reflects my visit.
        </label>
        <Button className="w-full" size="lg" disabled={!confirm} onClick={doSubmit}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Submit mission
        </Button>
      </div>
    </>
  );
}
