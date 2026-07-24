import { useMemo, useState } from 'react';
import { AgentMission } from '@/lib/agentAppMock';
import { MapPin, Locate, Plus, Minus, Coins, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

/**
 * Mocked "map" — no real tiles. Uses a subtle grid + roads background and
 * positions mission pins based on a deterministic hash of the mission id.
 * Tapping a pin surfaces a mini-card overlay linking to mission detail.
 */
export function NearYouMap({ missions }: { missions: AgentMission[] }) {
  const nav = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const pins = useMemo(() => missions.map((m, i) => {
    // Deterministic pseudo-position from mission id — spread across the frame
    let h = 0;
    for (let k = 0; k < m.id.length; k++) h = (h * 31 + m.id.charCodeAt(k)) & 0xffff;
    // Bring closer-distance missions nearer to the center (agent = center)
    const angle = ((h % 360) * Math.PI) / 180;
    const clampedKm = Math.min(m.distanceKm, 12);
    const radius = 8 + (clampedKm / 12) * 34; // 8% .. 42% of frame
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius * 0.75; // slight vertical squash
    return { m, x, y, i };
  }), [missions]);

  const sel = pins.find((p) => p.m.id === selected)?.m;

  return (
    <div className="rounded-2xl overflow-hidden relative border bg-[#eaf1ec]" style={{ height: 260 }}>
      {/* Mock map background: soft grid + diagonal "roads" */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          transition: 'transform 200ms',
          backgroundImage: `
            linear-gradient(0deg, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(60deg, rgba(255,255,255,0.9) 6px, transparent 6px),
            linear-gradient(-30deg, rgba(255,255,255,0.9) 4px, transparent 4px),
            radial-gradient(circle at 30% 40%, rgba(59,130,246,0.08), transparent 45%),
            radial-gradient(circle at 75% 65%, rgba(34,197,94,0.10), transparent 40%)
          `,
          backgroundSize: '24px 24px, 24px 24px, 220px 220px, 320px 320px, 100% 100%, 100% 100%',
        }}
      />

      {/* River-ish stripe */}
      <div className="absolute inset-0 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <path d="M -5 60 Q 30 45, 50 55 T 105 40" stroke="#93c5fd" strokeWidth="4" fill="none" opacity="0.6" />
          <path d="M -5 60 Q 30 45, 50 55 T 105 40" stroke="#bfdbfe" strokeWidth="7" fill="none" opacity="0.35" />
        </svg>
      </div>

      {/* Agent's location — center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" style={{ width: 28, height: 28, left: -6, top: -6 }} />
          <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
        </div>
      </div>

      {/* Radius ring — "30 km" */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/40 pointer-events-none"
        style={{ width: '85%', height: '110%' }} />

      {/* Pins */}
      {pins.map(({ m, x, y }) => {
        const isSel = selected === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setSelected(isSel ? null : m.id)}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-full z-20 transition-transform',
              isSel && 'scale-110 z-30'
            )}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 shadow-lg border-2 border-white',
              isSel ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
            )}>
              <Coins className={cn('h-3 w-3', isSel ? '' : 'text-primary')} />
              <span className="text-[11px] font-bold leading-none">{m.reward}</span>
            </div>
            <div className={cn(
              'w-2 h-2 rotate-45 -mt-1 mx-auto border-b-2 border-r-2 border-white',
              isSel ? 'bg-primary' : 'bg-background'
            )} />
          </button>
        );
      })}

      {/* Zoom controls */}
      <div className="absolute top-2 right-2 flex flex-col rounded-lg overflow-hidden border bg-background shadow z-30">
        <button className="p-1.5 hover:bg-muted border-b" onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}>
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button className="p-1.5 hover:bg-muted" onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))}>
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button className="absolute top-2 left-2 p-1.5 rounded-lg bg-background border shadow z-30" onClick={() => { setZoom(1); setSelected(null); }}>
        <Locate className="h-3.5 w-3.5" />
      </button>

      {/* Header chip */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur rounded-full px-2.5 py-1 border shadow-sm z-30 flex items-center gap-1.5">
        <MapPin className="h-3 w-3 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-wide">Cairo · 30 km</span>
        <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold ml-0.5">{missions.length}</span>
      </div>

      {/* Selected mission mini-card */}
      {sel && (
        <button
          onClick={() => nav(`/agent-app/mission/${sel.id}`)}
          className="absolute bottom-2 left-2 right-2 bg-background rounded-xl border shadow-lg p-2.5 z-30 flex items-center gap-2.5 text-left animate-in slide-in-from-bottom-2"
        >
          <img src={sel.hero} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground truncate">{sel.brand}</div>
            <div className="font-bold text-sm truncate leading-tight">{sel.title}</div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{sel.distanceKm} km</span>
              <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{sel.durationMin}m</span>
              <span className="font-bold text-primary">{sel.reward} EGP</span>
            </div>
          </div>
          <div className="text-[11px] font-bold text-primary shrink-0">View →</div>
        </button>
      )}
    </div>
  );
}
