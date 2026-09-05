import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, X } from 'lucide-react';
import { BranchInsight, BranchMatrix, heatColor } from '@/lib/reportInsights';

interface Props {
  matrix: BranchMatrix;
  focusBranchId: string | null;
  onFocusBranch: (branchId: string | null) => void;
}

export function BranchHeatMap({ matrix, focusBranchId, onFocusBranch }: Props) {
  const byCity = useMemo(() => {
    const map = new Map<string, BranchInsight[]>();
    for (const b of matrix.branches) {
      const city = b.city || 'Other';
      if (!map.has(city)) map.set(city, []);
      map.get(city)!.push(b);
    }
    return Array.from(map.entries())
      .map(([city, list]) => ({
        city,
        list: [...list].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)),
      }))
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [matrix.branches]);

  if (matrix.branches.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" /> Location heat map
            </CardTitle>
            <CardDescription className="text-xs">
              Each tile is a branch, coloured by its blended score across your active metrics. Click a tile to focus the whole overview on it.
            </CardDescription>
          </div>
          {focusBranchId && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => onFocusBranch(null)}>
              <X className="h-3.5 w-3.5" /> Clear focus
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {byCity.map(({ city, list }) => (
          <div key={city}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
              {city} · {list.length}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {list.map(b => {
                const hasData = b.score !== null && b.answers > 0;
                const focused = focusBranchId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onFocusBranch(focused ? null : b.id)}
                    className={`rounded-md p-3 text-start transition-all ${focused ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-90'} ${hasData ? 'text-primary-foreground' : 'text-muted-foreground border border-dashed'}`}
                    style={hasData ? { backgroundColor: heatColor(b.score) } : { backgroundColor: 'hsl(var(--muted))' }}
                  >
                    <p className="text-xs font-semibold truncate">{b.name}</p>
                    {hasData ? (
                      <>
                        <p className="text-2xl font-black leading-tight">{b.score}</p>
                        <p className="text-[10px] opacity-90">{b.answers} answers · {b.visits} visits</p>
                      </>
                    ) : (
                      <p className="text-[10px] mt-2">Not enough data</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-muted-foreground">0</span>
          <div className="h-2 flex-1 rounded-full" style={{ background: `linear-gradient(to right, ${heatColor(0)}, ${heatColor(50)}, ${heatColor(100)})` }} />
          <span className="text-[10px] text-muted-foreground">100</span>
        </div>
      </CardContent>
    </Card>
  );
}
