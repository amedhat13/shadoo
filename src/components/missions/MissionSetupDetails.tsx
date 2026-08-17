import { Camera, Clock, ListChecks, Receipt, Timer, ShieldCheck, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QUESTION_TYPE_LABELS } from '@/lib/constants';
import type {
  BriefSectionKey,
  PhotoRequirements,
  Question,
  QuestionSection,
  ReceiptConfig,
} from '@/types';

type Bilingual = { en?: string; ar?: string };

const asBilingual = (v: unknown): Bilingual => {
  if (!v) return {};
  if (typeof v === 'string') return { en: v };
  return v as Bilingual;
};

const BRIEF_SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  cover_story: 'Cover story',
  rules: 'Rules',
  checklist: 'Checklist',
  questions: 'Questions',
  photos: 'Photos',
};

function Bi({ value, className }: { value: unknown; className?: string }) {
  const b = asBilingual(value);
  if (!b.en && !b.ar) return null;
  return (
    <div className={className}>
      {b.en && <div className="text-sm leading-relaxed">{b.en}</div>}
      {b.ar && (
        <div className="text-sm leading-relaxed font-ar text-muted-foreground" dir="rtl">
          {b.ar}
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
      {children}
    </div>
  );
}

/** Cover story, rules, on-site checklist, brief tabs and acknowledgement. */
export function MissionBriefCard({
  category,
  coverStory,
  rules,
  checklist,
  briefSections,
  requireBriefAck,
}: {
  category?: string;
  coverStory?: unknown;
  rules?: Bilingual[];
  checklist?: Bilingual[];
  briefSections?: BriefSectionKey[] | string[];
  requireBriefAck?: boolean;
}) {
  const cover = asBilingual(coverStory);
  const ruleList = (rules || []).filter((r) => r?.en || r?.ar);
  const checkList = (checklist || []).filter((c) => c?.en || c?.ar);
  const sections = (briefSections || []).filter(Boolean);

  const hasContent =
    !!category ||
    !!(cover.en || cover.ar) ||
    ruleList.length > 0 ||
    checkList.length > 0 ||
    sections.length > 0 ||
    requireBriefAck !== undefined;

  if (!hasContent) return null;

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wide">Agent Brief</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {category && (
          <div>
            <Label>Category</Label>
            <Badge variant="outline">{category}</Badge>
          </div>
        )}

        {(cover.en || cover.ar) && (
          <div>
            <Label>Cover story</Label>
            <Bi value={cover} />
          </div>
        )}

        {ruleList.length > 0 && (
          <div>
            <Label>Rules</Label>
            <ol className="space-y-2">
              {ruleList.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <Bi value={r} className="flex-1" />
                </li>
              ))}
            </ol>
          </div>
        )}

        {checkList.length > 0 && (
          <div>
            <Label>
              <span className="inline-flex items-center gap-1">
                <ListChecks className="h-3 w-3" /> What to do on site
              </span>
            </Label>
            <ul className="space-y-2">
              {checkList.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <Bi value={c} className="flex-1" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {(sections.length > 0 || requireBriefAck !== undefined) && (
          <div>
            <Label>Brief tabs shown in the app</Label>
            <div className="flex flex-wrap gap-1.5">
              {sections.map((s) => (
                <Badge key={String(s)} variant="secondary" className="text-[10px]">
                  {BRIEF_SECTION_LABELS[String(s)] || String(s)}
                </Badge>
              ))}
            </div>
            {requireBriefAck !== undefined && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                {requireBriefAck
                  ? 'Shopper must confirm reading the brief before accepting.'
                  : 'Brief acknowledgement is not required.'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Timing, cancel window, review SLA and receipt rules. */
export function MissionOperationsCard({
  methodology,
  expectedMinutes,
  completionDeadlineMin,
  cancelWindowMin,
  reviewSlaHours,
  receipt,
  currencyCode = 'EGP',
}: {
  methodology?: string;
  expectedMinutes?: number;
  completionDeadlineMin?: number;
  cancelWindowMin?: number;
  reviewSlaHours?: number;
  receipt?: ReceiptConfig;
  currencyCode?: string;
}) {
  const rows: { icon: React.ReactNode; label: string; value: string }[] = [];
  if (methodology) rows.push({ icon: <Layers className="h-4 w-4" />, label: 'Methodology', value: methodology.toUpperCase() });
  if (expectedMinutes) rows.push({ icon: <Timer className="h-4 w-4" />, label: 'Expected time on site', value: `${expectedMinutes} min` });
  if (completionDeadlineMin) rows.push({ icon: <Clock className="h-4 w-4" />, label: 'Completion deadline', value: `${completionDeadlineMin} min` });
  if (cancelWindowMin !== undefined && cancelWindowMin !== null)
    rows.push({ icon: <Clock className="h-4 w-4" />, label: 'Free-cancel window', value: `${cancelWindowMin} min` });
  if (reviewSlaHours) rows.push({ icon: <ShieldCheck className="h-4 w-4" />, label: 'Review SLA', value: `${reviewSlaHours} h` });

  const receiptRule = asBilingual(receipt?.ruleText);
  const hasReceipt = !!receipt;

  if (rows.length === 0 && !hasReceipt) return null;

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wide">Operations &amp; Timing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              {r.icon}
              {r.label}
            </span>
            <span className="font-semibold text-sm">{r.value}</span>
          </div>
        ))}

        {hasReceipt && (
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Receipt className="h-4 w-4" />
                Receipt required
              </span>
              {receipt?.enabled ? (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  Yes — cap {Number(receipt.capEGP || 0).toLocaleString()} {currencyCode}
                </Badge>
              ) : (
                <span className="font-semibold text-sm">No</span>
              )}
            </div>
            {receipt?.enabled && (receiptRule.en || receiptRule.ar) && (
              <Bi value={receiptRule} className="mt-2" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function questionTags(q: Question): { label: string; className: string }[] {
  const tags: { label: string; className: string }[] = [];
  if (q.type === 'rating') tags.push({ label: `Rating ${q.max_rating || 5}`, className: 'bg-muted text-foreground' });
  if (q.allowNA) tags.push({ label: 'N/A allowed', className: 'bg-muted text-muted-foreground' });
  if (q.commentMode === 'required') tags.push({ label: 'Comment req.', className: 'bg-primary/10 text-primary' });
  else if (q.commentMode === 'optional') tags.push({ label: 'Comment opt.', className: 'bg-muted text-muted-foreground' });
  if (q.suggestedComments?.some((c) => c.en || c.ar))
    tags.push({ label: `${q.suggestedComments.filter((c) => c.en || c.ar).length} chips`, className: 'bg-muted text-muted-foreground' });
  const pr = q.photoRequirement;
  if (pr?.enabled) {
    let label = 'Photo';
    if (pr.triggerCondition === 'low_rating') label = `Photo < ${pr.ratingThreshold ?? 70}%`;
    else if (pr.triggerAnswer === 'any') label = 'Photo — any answer';
    else if (pr.triggerAnswer) label = `Photo on "${pr.triggerAnswer}"`;
    tags.push({ label, className: 'bg-amber-100 text-amber-700' });
  }
  if (q.type === 'attachment') {
    const cfg = q.attachment_config;
    tags.push({ label: `Attachment${cfg?.max_files ? ` ×${cfg.max_files}` : ''}`, className: 'bg-muted text-muted-foreground' });
  }
  return tags;
}

/** Questions grouped by section, with every enabled behaviour surfaced as a tag. */
export function MissionQuestionsCard({
  questions,
  sections,
  requiredLabel = 'Required',
  emptyLabel = 'No questions',
  titleLabel,
}: {
  questions: Question[];
  sections?: QuestionSection[];
  requiredLabel?: string;
  emptyLabel?: string;
  titleLabel?: string;
}) {
  const list = questions || [];
  const sectionList = (sections || []).filter(Boolean);
  const groups =
    sectionList.length > 0
      ? sectionList.map((s) => ({
          section: s,
          items: list.filter((q) => q.section_id === s.id),
        }))
      : [{ section: undefined as QuestionSection | undefined, items: list }];
  const ungrouped =
    sectionList.length > 0 ? list.filter((q) => !q.section_id || !sectionList.some((s) => s.id === q.section_id)) : [];

  const renderQuestion = (q: Question, index: number) => {
    const desc = asBilingual(q.description);
    const tags = questionTags(q);
    return (
      <div key={q.id} className="flex items-start gap-3 border border-border p-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {typeof q.text === 'string' ? q.text : q.text?.en || q.text?.ar}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {QUESTION_TYPE_LABELS[q.type] || q.type}
            {q.required && ` • ${requiredLabel}`}
          </p>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${tag.className}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
          {(desc.en || desc.ar) && (
            <div className="mt-2 rounded-md border-l-2 border-primary/40 bg-primary/5 px-2.5 py-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">Why we ask</div>
              {desc.en && <p className="text-xs text-muted-foreground leading-relaxed">{desc.en}</p>}
              {desc.ar && (
                <p className="text-xs text-muted-foreground leading-relaxed font-ar mt-0.5" dir="rtl">
                  {desc.ar}
                </p>
              )}
            </div>
          )}
          {q.suggestedComments?.some((c) => c.en || c.ar) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {q.suggestedComments
                .filter((c) => c.en || c.ar)
                .map((c) => (
                  <span key={c.id} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    {c.en || c.ar}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  let counter = 0;

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wide">
          {titleLabel || `${list.length} Questions`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyLabel}</p>
        ) : (
          <>
            {groups.map((g, gi) => (
              <div key={g.section?.id || gi} className="space-y-3">
                {g.section && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {g.section.label?.en || g.section.label?.ar}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{g.items.length} questions</span>
                  </div>
                )}
                {g.items.map((q) => renderQuestion(q, counter++))}
              </div>
            ))}
            {ungrouped.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Other</span>
                {ungrouped.map((q) => renderQuestion(q, counter++))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Photo count plus named slots and their required flags. */
export function MissionPhotosCard({
  photoRequirements,
  titleLabel = 'Photo Requirements',
  countLabel,
}: {
  photoRequirements?: PhotoRequirements | null;
  titleLabel?: string;
  countLabel?: string;
}) {
  const reqs = photoRequirements;
  const slots = (reqs?.slots || []).filter((s) => s?.label?.en || s?.label?.ar);

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
          <Camera className="h-4 w-4" />
          {titleLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="inline-flex items-center gap-2 border border-border px-3 py-2">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            {countLabel || `${reqs?.required_count || 0} photos required`}
          </span>
        </div>

        {slots.length > 0 && (
          <div className="space-y-2">
            <Label>Named photo slots</Label>
            {slots.map((s, i) => (
              <div key={s.id || i} className="flex items-start justify-between gap-3 border border-border p-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.label?.en || s.label?.ar}</div>
                  {s.label?.ar && s.label?.en && (
                    <div className="text-xs font-ar text-muted-foreground" dir="rtl">{s.label.ar}</div>
                  )}
                  {(s.hint?.en || s.hint?.ar) && (
                    <div className="text-xs text-muted-foreground mt-0.5">{s.hint?.en || s.hint?.ar}</div>
                  )}
                </div>
                <Badge variant={s.required === false ? 'outline' : 'secondary'} className="shrink-0 text-[10px]">
                  {s.required === false ? 'Optional' : 'Required'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
