import { useRef, useState } from 'react';
import { AgentQuestion } from '@/lib/agentAppMock';
import { Star, ChevronDown, Check, Camera, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  question: AgentQuestion;
  value: any;
  onChange: (v: any) => void;
  photo?: string;
  onPhoto?: (dataUrl: string | undefined) => void;
}

export function QuestionCard({ question, value, onChange, photo, onPhoto }: Props) {
  const [showWhy, setShowWhy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const trig = question.photoOn;
  const photoRequired = !!trig && (
    (trig.ratingLte !== undefined && typeof value === 'number' && value > 0 && value <= trig.ratingLte) ||
    (trig.ifAnswer !== undefined && value === trig.ifAnswer)
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !onPhoto) return;
    const r = new FileReader();
    r.onload = () => onPhoto(r.result as string);
    r.readAsDataURL(f);
  };

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-[15px] leading-snug">
          {question.text}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </h3>
        {question.description && (
          <button onClick={() => setShowWhy((s) => !s)} className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
            Why we ask <ChevronDown className={cn('h-3 w-3 transition-transform', showWhy && 'rotate-180')} />
          </button>
        )}
        {showWhy && question.description && (
          <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 leading-relaxed">{question.description}</p>
        )}
      </div>

      {question.type === 'rating' && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: question.max_rating || 5 }).map((_, i) => {
            const n = i + 1;
            const active = value >= n;
            return (
              <button key={n} onClick={() => onChange(n)} className="p-1" aria-label={`${n} stars`}>
                <Star className={cn('h-8 w-8 transition', active ? 'fill-primary text-primary' : 'text-muted-foreground/40')} />
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'yes_no' && (
        <div className="grid grid-cols-2 gap-2">
          {['Yes', 'No'].map((opt) => (
            <button key={opt} onClick={() => onChange(opt)}
              className={cn('rounded-xl border-2 py-3 font-semibold text-sm',
                value === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border')}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === 'single_select' && (
        <div className="flex flex-wrap gap-2">
          {question.options?.map((opt) => (
            <button key={opt} onClick={() => onChange(opt)}
              className={cn('rounded-full border px-3 py-1.5 text-sm',
                value === opt ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background')}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === 'multi_select' && (
        <div className="flex flex-wrap gap-2">
          {question.options?.map((opt) => {
            const sel = Array.isArray(value) && value.includes(opt);
            return (
              <button key={opt}
                onClick={() => {
                  const arr = Array.isArray(value) ? value : [];
                  onChange(sel ? arr.filter((x: string) => x !== opt) : [...arr, opt]);
                }}
                className={cn('rounded-full border px-3 py-1.5 text-sm flex items-center gap-1',
                  sel ? 'border-primary bg-primary/10 text-primary' : 'border-border')}>
                {sel && <Check className="h-3 w-3" />}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'text' && (
        <Textarea rows={4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="Type your answer..." />
      )}

      {photoRequired && (
        <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <div className="font-semibold uppercase tracking-wide text-[10px] mb-0.5">Photo required</div>
              {trig!.prompt}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
          {photo ? (
            <div className="relative rounded-lg overflow-hidden">
              <img src={photo} alt="Attached" className="w-full aspect-video object-cover" />
              <button onClick={() => onPhoto?.(undefined)} className="absolute top-1.5 right-1.5 bg-background/90 rounded-full p-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-background border border-amber-400 rounded-lg py-2.5 text-sm font-semibold text-amber-900">
              <Camera className="h-4 w-4" /> Attach photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
