import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Pin, PinOff, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReportPins } from '@/hooks/useReportPins';
import { computePinnedQuestion, measurableQuestionIndex } from '@/lib/reportInsights';

interface Props {
  missions: any[];
  visits: any[];
  branches: any[];
  language: string;
  ownerId?: string;
}

export function PinnedQuestionCards({ missions, visits, branches, language, ownerId }: Props) {
  const { pins, isPinned, toggle, canEdit } = useReportPins(ownerId);
  const [open, setOpen] = useState(false);

  const index = useMemo(() => measurableQuestionIndex(missions, language), [missions, language]);

  const results = useMemo(() => {
    return pins
      .map(p => {
        const entry = index.get(p.question_key);
        if (!entry) return null;
        return computePinnedQuestion(entry, missions, visits, branches, language);
      })
      .filter(Boolean) as ReturnType<typeof computePinnedQuestion>[];
  }, [pins, index, missions, visits, branches, language]);

  const available = Array.from(index.values());

  if (!canEdit && results.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
            <Pin className="h-3.5 w-3.5 text-primary" /> Pinned questions
          </h3>
          <p className="text-xs text-muted-foreground">
            Keep the questions you care about most at the top of your overview.
          </p>
        </div>
        {canEdit && available.length > 0 && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Pin a question
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0">
              <ScrollArea className="max-h-72">
                <div className="p-2 space-y-1">
                  {available.map(q => {
                    const pinned = isPinned(q.key);
                    return (
                      <button
                        key={q.key}
                        type="button"
                        onClick={() => toggle({ question_key: q.key, label: q.label })}
                        className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-start hover:bg-muted"
                      >
                        {pinned ? <PinOff className="h-3.5 w-3.5 text-primary shrink-0" /> : <Pin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                        <span className="text-xs flex-1 truncate">{q.label}</span>
                        <Badge variant="outline" className="text-[10px]">{q.type === 'yes_no' ? 'Yes/No' : `1-${q.maxRating}`}</Badge>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {results.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Nothing pinned yet. Pin a rating or yes/no question and it will show here with its score, spread and best and worst branch.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map(r => (
            <Card key={r.key} className="border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold leading-snug">{r.label}</p>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => toggle({ question_key: r.key, label: r.label })}
                    >
                      <PinOff className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black">
                    {r.average === null ? '—' : r.type === 'yes_no' ? `${r.average}%` : r.average}
                  </p>
                  {r.type !== 'yes_no' && r.average !== null && (
                    <span className="text-xs text-muted-foreground mb-1.5">/ {r.maxRating}</span>
                  )}
                  <Badge variant="secondary" className="text-[10px] mb-2 ms-auto">{r.answers} answers</Badge>
                </div>

                <Progress value={r.percent ?? 0} className="h-1.5" />

                {r.distribution.length > 0 && (
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                    {r.distribution.map((d, i) => (
                      <div
                        key={i}
                        title={`${d.label}: ${d.percent}%`}
                        style={{
                          width: `${d.percent}%`,
                          backgroundColor: `hsl(${Math.round((i / Math.max(1, r.distribution.length - 1)) * 130)} 72% 45%)`,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-1 text-[11px]">
                  {r.bestBranch && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-success" />
                      Best: <span className="font-semibold text-foreground truncate">{r.bestBranch.name}</span> ({r.bestBranch.percent}%)
                    </p>
                  )}
                  {r.worstBranch && (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingDown className="h-3 w-3 text-destructive" />
                      Lowest: <span className="font-semibold text-foreground truncate">{r.worstBranch.name}</span> ({r.worstBranch.percent}%)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
