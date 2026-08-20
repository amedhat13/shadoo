import { Plus, Trash2, BookOpen, ListChecks, Sparkles, CheckSquare, ShieldCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MissionFormData, BriefSectionKey, BRIEF_SECTION_KEYS, RuleItem } from '@/types';
import { useTranslation } from 'react-i18next';

interface StepBriefProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

type BL = { en: string; ar: string };

const emptyBL = (): BL => ({ en: '', ar: '' });

export function StepBrief({ data, onChange }: StepBriefProps) {
  const { t: tc } = useTranslation('common');
  const cover = data.cover_story || emptyBL();
  const rules: RuleItem[] =
    data.rules && data.rules.length > 0 ? data.rules : [{ en: '', ar: '', kind: 'do' as const }];
  const checklist = data.checklist && data.checklist.length > 0 ? data.checklist : [emptyBL()];
  const briefSections = data.brief_sections ?? BRIEF_SECTION_KEYS;

  const setCover = (patch: Partial<BL>) => onChange({ cover_story: { ...cover, ...patch } });
  const setRule = (idx: number, patch: Partial<RuleItem>) => {
    const next = [...rules];
    next[idx] = { ...next[idx], ...patch };
    onChange({ rules: next });
  };
  const addRule = (kind: 'do' | 'dont') => onChange({ rules: [...rules, { en: '', ar: '', kind }] });
  const removeRule = (idx: number) => onChange({ rules: rules.filter((_, i) => i !== idx) });

  const setChecklist = (idx: number, patch: Partial<BL>) => {
    const next = [...checklist];
    next[idx] = { ...next[idx], ...patch };
    onChange({ checklist: next });
  };
  const addChecklist = () => onChange({ checklist: [...checklist, emptyBL()] });
  const removeChecklist = (idx: number) => onChange({ checklist: checklist.filter((_, i) => i !== idx) });

  const toggleSection = (key: BriefSectionKey) =>
    onChange({
      brief_sections: briefSections.includes(key)
        ? briefSections.filter((k) => k !== key)
        : [...briefSections, key],
    });


  return (
    <div className="space-y-8">
      {/* Cover Story */}
      <section className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wide">Cover story / Description</Label>
            <p className="text-xs text-muted-foreground mt-1">
              The persona and scenario the agent will play during the visit. Keep it natural — the agent must blend in.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('english')}</span>
            <Textarea
              rows={4}
              dir="ltr"
              value={cover.en}
              onChange={(e) => setCover({ en: e.target.value })}
              placeholder="e.g. You are a first-time customer visiting on a Friday evening. Order a latte and observe how staff handle a busy queue."
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('arabic')}</span>
            <Textarea
              rows={4}
              dir="rtl"
              className="font-ar"
              value={cover.ar}
              onChange={(e) => setCover({ ar: e.target.value })}
              placeholder="مثال: أنت عميل يزور الفرع لأول مرة مساء الجمعة..."
            />
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">
            <ListChecks className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <Label className="text-xs font-bold uppercase tracking-wide">Rules & Do's / Don'ts</Label>
            <p className="text-xs text-muted-foreground mt-1">
              One rule per line. The app shows them in two columns — Do (green ticks) and Don't (red crosses) — on the Rules tab of the brief.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rules.map((r, idx) => (
            <div key={idx} className="border border-border rounded-md p-3 space-y-2 relative bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Rule {idx + 1}
                  </span>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(['do', 'dont'] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setRule(idx, { kind: k })}
                        className={
                          'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ' +
                          ((r.kind ?? 'do') === k
                            ? k === 'do'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-destructive text-destructive-foreground'
                            : 'text-muted-foreground')
                        }
                      >
                        {k === 'do' ? 'Do' : "Don't"}
                      </button>
                    ))}
                  </div>
                </div>
                {rules.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeRule(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  dir="ltr"
                  value={r.en}
                  onChange={(e) => setRule(idx, { en: e.target.value })}
                  placeholder="e.g. Do not reveal you are a mystery shopper"
                  className="text-sm"
                />
                <Input
                  dir="rtl"
                  className="text-sm font-ar"
                  value={r.ar}
                  onChange={(e) => setRule(idx, { ar: e.target.value })}
                  placeholder="مثال: لا تكشف أنك متسوق سري"
                />
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => addRule('do')} className="gap-2">
              <Plus className="h-3.5 w-3.5" /> Add "Do" rule
            </Button>
            <Button variant="outline" size="sm" onClick={() => addRule('dont')} className="gap-2">
              <Plus className="h-3.5 w-3.5" /> Add "Don't" rule
            </Button>
          </div>
        </div>
      </section>

      {/* Checklist — what to do on site */}
      <section className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <Label className="text-xs font-bold uppercase tracking-wide">Checklist — what to do on site</Label>
            <p className="text-xs text-muted-foreground mt-1">
              The last thing the agent sees in the brief. One action per line, in order.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {checklist.map((c, idx) => (
            <div key={idx} className="border border-border rounded-md p-3 space-y-2 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step {idx + 1}</span>
                {checklist.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeChecklist(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  dir="ltr"
                  value={c.en}
                  onChange={(e) => setChecklist(idx, { en: e.target.value })}
                  placeholder="e.g. Order one hot drink and pay by card"
                  className="text-sm"
                />
                <Input
                  dir="rtl"
                  className="text-sm font-ar"
                  value={c.ar}
                  onChange={(e) => setChecklist(idx, { ar: e.target.value })}
                  placeholder="مثال: اطلب مشروبًا ساخنًا وادفع بالبطاقة"
                />
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addChecklist} className="gap-2">
            <Plus className="h-3.5 w-3.5" /> Add checklist item
          </Button>
        </div>
      </section>

      {/* Brief acknowledgement + sections shown in the app */}
      <section className="space-y-3">
        <div className="flex items-start gap-3 border border-border rounded-md p-4">
          <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="brief-ack" className="text-sm font-semibold cursor-pointer">
                Require brief acknowledgement
              </Label>
              <Switch
                id="brief-ack"
                checked={data.require_brief_ack ?? true}
                onCheckedChange={(checked) => onChange({ require_brief_ack: checked })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The agent must page through every enabled brief tab and tick a confirmation before accepting the visit.
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Brief sections shown in the app
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BRIEF_SECTION_KEYS.map((key) => {
                  const auto = AUTO_SECTIONS.includes(key);
                  const active = auto || briefSections.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={auto}
                      onClick={() => !auto && toggleSection(key)}
                      className={
                        'rounded-md border px-3 py-2 text-xs font-semibold capitalize transition ' +
                        (active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground') +
                        (auto ? ' opacity-90 cursor-default' : '')
                      }
                    >
                      {key.replace('_', ' ')}
                      {auto && <span className="ms-1 text-[9px] font-bold uppercase">auto</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Purchase and Payout are generated automatically — Purchase from the total purchase budget per visit, and Payout from the visit duration and the agent tier price. They are always shown to the agent.
              </p>
              {(data.require_brief_ack ?? true) && briefSections.length === 0 && (
                <p className="text-xs text-destructive">
                  Enable at least one brief section while acknowledgement is required.
                </p>
              )}
            </div>

          </div>
        </div>
      </section>

      <div className="rounded-md border border-primary/30 bg-primary/5 p-3 flex gap-2">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          The cover story, rules and checklist all appear in the agent's mission brief in Arabic and English, and are attached to every visit report.
        </p>
      </div>
    </div>
  );
}

