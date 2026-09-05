import { heatColor } from '@/lib/reportInsights';

export interface HeatCell {
  percent: number | null;
  answers: number;
  raw: string;
}

export interface HeatGridData {
  rows: { key: string; label: string }[];
  cols: { id: string; label: string }[];
  cells: Record<string, Record<string, HeatCell>>; // rowKey -> colId
}

interface Props {
  data: HeatGridData;
  onSelect?: (rowKey: string, colId: string) => void;
  activeRow?: string | null;
  activeCol?: string | null;
}

/** Questions down the side, branches across the top — spot weak combinations instantly. */
export function QuestionHeatGrid({ data, onSelect, activeRow, activeCol }: Props) {
  if (data.rows.length === 0 || data.cols.length === 0) {
    return <p className="text-xs text-muted-foreground py-8 text-center">Not enough tagged questions or branches yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="text-start font-medium text-muted-foreground w-56 min-w-[14rem]">Question</th>
            {data.cols.map(c => (
              <th
                key={c.id}
                className={`px-1 pb-1 text-[10px] font-medium align-bottom ${activeCol === c.id ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <span className="block max-w-[5.5rem] truncate mx-auto" title={c.label}>{c.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map(r => (
            <tr key={r.key}>
              <td className={`pe-2 truncate max-w-[14rem] ${activeRow === r.key ? 'font-bold text-primary' : ''}`} title={r.label}>
                {r.label}
              </td>
              {data.cols.map(c => {
                const cell = data.cells[r.key]?.[c.id];
                const has = cell && cell.answers > 0 && cell.percent !== null;
                return (
                  <td key={c.id} className="p-0">
                    <button
                      type="button"
                      disabled={!has}
                      onClick={() => onSelect?.(r.key, c.id)}
                      title={has ? `${r.label} · ${c.label}: ${cell!.raw} (${cell!.answers} answers)` : 'No answers'}
                      className={`h-8 w-full rounded-sm text-[10px] font-bold text-white transition-transform ${has ? 'hover:scale-[1.06] cursor-pointer' : 'cursor-default'} ${activeRow === r.key && activeCol === c.id ? 'ring-2 ring-foreground' : ''}`}
                      style={{ backgroundColor: has ? heatColor(cell!.percent) : 'hsl(var(--muted))' }}
                    >
                      {has ? Math.round(cell!.percent as number) : ''}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-muted-foreground">Weak</span>
        <div className="h-2 flex-1 max-w-[180px] rounded-full" style={{ background: `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(50)}, ${heatColor(100)})` }} />
        <span className="text-[10px] text-muted-foreground">Strong</span>
      </div>
    </div>
  );
}
