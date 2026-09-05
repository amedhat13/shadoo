import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingDown, MapPin } from 'lucide-react';
import { BranchMatrix } from '@/lib/reportInsights';

interface Props {
  matrix: BranchMatrix;
}

export function TopBranchCard({ matrix }: Props) {
  const best = matrix.best;
  if (!best) return null;
  const gap = matrix.average !== null ? (best.score ?? 0) - matrix.average : null;

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/15 p-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Top branch</p>
              <p className="text-lg font-bold leading-tight">{best.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" /> {best.city || '—'} · {best.visits} visits · {best.answers} answers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-end">
              <p className="text-3xl font-black text-primary">{best.score}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Overall / 100</p>
            </div>
            {gap !== null && (
              <Badge variant="secondary" className="text-xs">
                {gap >= 0 ? '+' : ''}{gap} vs average ({matrix.average})
              </Badge>
            )}
          </div>
        </div>

        {matrix.worst && matrix.worst.id !== best.id && (
          <p className="mt-3 pt-3 border-t border-primary/20 text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            Needs the most attention: <span className="font-semibold text-foreground">{matrix.worst.name}</span> at {matrix.worst.score}/100
            {matrix.average !== null && ` (${(matrix.worst.score ?? 0) - matrix.average} vs average)`}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
