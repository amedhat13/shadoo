import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentTopBar } from './AgentAppLayout';
import { getVisit, getMission, updateVisit } from '@/lib/agentAppMock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, ShieldCheck, Receipt as ReceiptIcon } from 'lucide-react';

export default function AgentReceipt() {
  const { visitId } = useParams();
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const visit = visitId ? getVisit(visitId) : undefined;
  const mission = visit ? getMission(visit.missionId) : undefined;
  const [amount, setAmount] = useState<number>(visit?.amountSpent || 0);
  const [desc, setDesc] = useState<string>(visit?.receiptDescription || '');
  const [photo, setPhoto] = useState<string | null>(visit?.receiptPhoto || null);
  if (!visit || !mission) return null;

  const budget = mission.purchaseBudget;
  const overBudget = amount > budget;
  const remaining = Math.max(0, budget - amount);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(URL.createObjectURL(f));
  };

  const submit = () => {
    updateVisit(visit.id, {
      receiptPhoto: photo || '/tamara-demo/waterway-1-receipt.jpg',
      amountSpent: amount,
      receiptDescription: desc,
    });
    nav(`/agent-app/active/${visit.id}`);
  };

  const canSubmit = amount > 0 && !overBudget && (photo || true);

  return (
    <>
      <AgentTopBar title="Receipt & purchase" showBack />
      <div className="p-4 pb-28 space-y-4">
        <div className="grid grid-cols-3 gap-2 rounded-xl border p-3">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Budget</div>
            <div className="font-bold text-sm">{budget} EGP</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Spent</div>
            <div className="font-bold text-sm">{amount || 0} EGP</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Remaining</div>
            <div className="font-bold text-sm text-primary">{remaining} EGP</div>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-900 leading-relaxed">Your reimbursement is <strong>locked</strong> the moment we approve this visit. Funds go directly to your Shadoo wallet within 24 hours.</p>
        </div>

        <div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide mb-2">Receipt photo</div>
          <div className="relative aspect-[3/4] max-h-72 rounded-xl overflow-hidden border bg-muted">
            {photo ? (
              <img src={photo} className="w-full h-full object-cover" alt="Receipt" />
            ) : (
              <>
                <div className="absolute inset-6 border-2 border-dashed border-primary/60 rounded-lg flex items-center justify-center">
                  <ReceiptIcon className="h-8 w-8 text-primary/60" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-center text-xs text-muted-foreground bg-background/90 rounded-lg py-1.5">Align receipt inside the frame</div>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
          <Button variant="outline" className="w-full mt-2" onClick={() => inputRef.current?.click()}>
            <Camera className="h-4 w-4 mr-2" /> {photo ? 'Retake receipt' : 'Capture receipt'}
          </Button>
          {!photo && (
            <button className="w-full mt-2 text-xs text-primary font-semibold" onClick={() => setPhoto('/tamara-demo/waterway-1-receipt.jpg')}>
              Use sample receipt (demo)
            </button>
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Amount spent (EGP)</label>
          <Input type="number" inputMode="decimal" placeholder={`e.g. ${Math.round(budget * 0.6)}`} value={amount || ''} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="mt-1" />
          <p className="text-[11px] text-muted-foreground mt-1">Budget: up to {budget} EGP · fully refunded.</p>
          {overBudget && <p className="text-xs text-destructive mt-1">Amount exceeds the {budget} EGP budget.</p>}
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Items purchased</label>
          <Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Grilled chicken · Fresh juice · Baklava" className="mt-1" />
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3">
        <Button className="w-full" size="lg" disabled={!canSubmit || !photo} onClick={submit}>
          Save receipt
        </Button>
      </div>
    </>
  );
}
