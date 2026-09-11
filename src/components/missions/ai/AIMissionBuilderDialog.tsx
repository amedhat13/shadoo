import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkle,
  Paperclip,
  ArrowUp,
  Brain,
  ChevronDown,
  Check,
  AlertTriangle,
  X,
  FileText,
  Loader2,
  Wand2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import shadooCap from '@/assets/shadoo-cap.png';
import {
  AI_MOCK_ATTACHMENTS,
  AI_SAMPLE_PROMPTS,
  AIAnalysis,
  AIAttachment,
  AIDraftResult,
  analyzeRequest,
  buildDraft,
  BuilderContext,
} from '@/lib/aiMissionDraft';

type Phase = 'compose' | 'thinking' | 'clarify' | 'building' | 'ready';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: BuilderContext;
}

const BUILD_STEPS = [
  'Locking the objective and methodology',
  'Writing the questionnaire in English and Arabic',
  'Setting photo slots, receipt rules and timers',
  'Scheduling visits across the selected branches',
  'Running wallet and allowance checks',
];

export function AIMissionBuilderDialog({ open, onOpenChange, context }: Props) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('compose');
  const [brief, setBrief] = useState('');
  const [files, setFiles] = useState<AIAttachment[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [result, setResult] = useState<AIDraftResult | null>(null);
  const [buildStep, setBuildStep] = useState(0);
  const [showReasoning, setShowReasoning] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPhase('compose');
    setBrief('');
    setFiles([]);
    setAnalysis(null);
    setAnswers({});
    setResult(null);
    setBuildStep(0);
    setShowReasoning(false);
  };

  const handleSend = () => {
    if (!brief.trim()) return;
    setPhase('thinking');
    const a = analyzeRequest(brief, files, context);
    timers.current.push(
      window.setTimeout(() => {
        setAnalysis(a);
        setShowReasoning(false);
        setPhase('clarify');
      }, 1600)
    );
  };

  const answersComplete = (analysis?.questions ?? [])
    .filter((q) => q.required)
    .every((q) => {
      const v = answers[q.id];
      return Array.isArray(v) ? v.length > 0 : v !== undefined && String(v).trim() !== '';
    });

  const handleBuild = () => {
    setPhase('building');
    setBuildStep(0);
    BUILD_STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setBuildStep(i + 1), 700 * (i + 1)));
    });
    timers.current.push(
      window.setTimeout(() => {
        setResult(buildDraft(brief, files, answers, context));
        setPhase('ready');
      }, 700 * BUILD_STEPS.length + 500)
    );
  };

  const handleOpenWizard = () => {
    if (!result) return;
    onOpenChange(false);
    navigate('/missions/create', { state: { aiDraft: result.draft } });
    reset();
  };

  const blocked = result?.preflight.some((p) => p.status === 'fail');

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-5 py-4 text-start">
          <DialogTitle className="flex items-center gap-2 text-base font-black uppercase tracking-tight">
            <img src={shadooCap} alt="" className="h-6 w-auto" />
            Create with Shadoo AI
          </DialogTitle>
          <DialogDescription className="text-xs">
            Describe the mission once. Shadoo AI drafts every step in English and Arabic — you just review and publish.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 px-5 py-4">
            {/* ---------- Composer ---------- */}
            {phase === 'compose' && (
              <>
                <div className="rounded-lg border border-border bg-card p-3">
                  <Textarea
                    autoFocus
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="e.g. I want to check the greeting, upselling and cleanliness in all my branches this month, shoppers should buy a coffee."
                    className="min-h-[110px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
                  />
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {files.map((f) => (
                        <Badge key={f.id} variant="secondary" className="gap-1 py-1">
                          <FileText className="h-3 w-3" />
                          {f.name}
                          <button onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setFiles(AI_MOCK_ATTACHMENTS)}
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Attach brand standards
                    </Button>
                    <Button size="icon" onClick={handleSend} disabled={!brief.trim()}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {AI_SAMPLE_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setBrief(p)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ---------- User bubble (kept visible after send) ---------- */}
            {phase !== 'compose' && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {brief}
                  {files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {files.map((f) => (
                        <span key={f.id} className="rounded bg-primary-foreground/15 px-2 py-0.5 text-xs">
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === 'thinking' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4 animate-pulse text-primary" />
                Reading your request{files.length ? ' and the attachment' : ''}…
              </div>
            )}

            {/* ---------- Clarify (all questions in one batch) ---------- */}
            {analysis && (phase === 'clarify' || phase === 'building') && (
              <div className="space-y-3">
                <Collapsible open={showReasoning} onOpenChange={setShowReasoning}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                    <Brain className="h-3.5 w-3.5" />
                    Reasoning
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showReasoning && 'rotate-180')} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1.5 rounded-lg border border-dashed border-border bg-muted/40 p-3">
                    {analysis.reasoning.map((r) => (
                      <p key={r} className="text-xs text-muted-foreground">• {r}</p>
                    ))}
                    {files.flatMap((f) => f.extracted.map((e) => `${f.name} → ${e}`)).map((e) => (
                      <p key={e} className="text-xs text-primary">• {e}</p>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm">
                    I have enough to draft the mission. {analysis.questions.length} things to confirm first — answer them
                    all here and I will build everything in one pass.
                  </p>
                </div>

                <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                  {analysis.questions.map((q, i) => {
                    const value = answers[q.id];
                    return (
                      <div key={q.id} className="space-y-2">
                        <p className="text-sm font-semibold">
                          {i + 1}. {q.question}
                          {q.required && <span className="text-destructive">*</span>}
                        </p>
                        {q.hint && <p className="text-xs text-muted-foreground">{q.hint}</p>}

                        {q.type === 'choice' && q.multi && (
                          <div className="space-y-2">
                            {q.options?.map((o) => {
                              const list = (value as string[]) ?? [];
                              return (
                                <label key={o} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={list.includes(o)}
                                    disabled={phase !== 'clarify'}
                                    onCheckedChange={(c) =>
                                      setAnswers((p) => ({
                                        ...p,
                                        [q.id]: c ? [...list, o] : list.filter((x) => x !== o),
                                      }))
                                    }
                                  />
                                  {o}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'choice' && !q.multi && (
                          <div className="flex flex-wrap gap-2">
                            {q.options?.map((o) => (
                              <button
                                key={o}
                                disabled={phase !== 'clarify'}
                                onClick={() => setAnswers((p) => ({ ...p, [q.id]: o }))}
                                className={cn(
                                  'rounded-full border px-3 py-1.5 text-xs transition-colors',
                                  value === o
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border text-muted-foreground hover:border-primary'
                                )}
                              >
                                {o}
                              </button>
                            ))}
                          </div>
                        )}

                        {(q.type === 'text' || q.type === 'number') && (
                          <Input
                            type={q.type === 'number' ? 'number' : 'text'}
                            disabled={phase !== 'clarify'}
                            value={(value as string) ?? ''}
                            onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                            placeholder={q.type === 'number' ? '0' : 'Optional'}
                          />
                        )}
                      </div>
                    );
                  })}

                  {phase === 'clarify' && (
                    <Button className="w-full gap-2" disabled={!answersComplete} onClick={handleBuild}>
                      <Wand2 className="h-4 w-4" />
                      Build my mission
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ---------- Building ---------- */}
            {phase === 'building' && (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <Progress value={(buildStep / BUILD_STEPS.length) * 100} />
                <div className="space-y-1.5">
                  {BUILD_STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2 text-sm">
                      {i < buildStep ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : i === buildStep ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <span className="h-4 w-4" />
                      )}
                      <span className={i <= buildStep ? '' : 'text-muted-foreground'}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------- Ready ---------- */}
            {phase === 'ready' && result && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkle className="h-4 w-4 text-primary" />
                    Your mission is drafted — every step is pre-filled in both languages.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {result.summary.map((s) => (
                      <div key={s.label} className="rounded-md bg-muted/50 p-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                        <p className="text-sm font-semibold">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Pre-flight checks</p>
                  <div className="mt-2 space-y-2">
                    {result.preflight.map((c) => (
                      <div key={c.id} className="flex items-start gap-2 text-sm">
                        {c.status === 'pass' ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        ) : (
                          <AlertTriangle
                            className={cn('mt-0.5 h-4 w-4 shrink-0', c.status === 'fail' ? 'text-destructive' : 'text-warning')}
                          />
                        )}
                        <div>
                          <p className="font-medium">{c.label}</p>
                          <p className="text-xs text-muted-foreground">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-border p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Optional fields I filled for you
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {result.optionalFilled.map((o) => (
                      <p key={o.field} className="text-xs">
                        <span className="font-semibold">{o.field}</span>
                        <span className="text-muted-foreground"> — {o.why}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {blocked && (
                  <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                    One check failed. You can still open the wizard and adjust visits or top up your wallet before
                    publishing.
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => setPhase('clarify')}>
                    Change answers
                  </Button>
                  <Button className="gap-2" onClick={handleOpenWizard}>
                    Open wizard with my data
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
