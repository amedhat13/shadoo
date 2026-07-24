import { useState } from 'react';
import { AgentQuestion } from '@/lib/agentAppMock';
import { Star, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  question: AgentQuestion;
  value: any;
  onChange: (v: any) => void;
}

export function QuestionCard({ question, value, onChange }: Props) {
  const [showWhy, setShowWhy] = useState(false);
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
    </div>
  );
}
