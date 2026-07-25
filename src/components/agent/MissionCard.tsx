import { AgentMission } from '@/lib/agentAppMock';
import { MapPin, Clock, Coins, Camera, ClipboardList, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function MissionCard({ mission }: { mission: AgentMission }) {
  const nav = useNavigate();
  const qCount = mission.sections.reduce((s, sec) => s + sec.questions.length, 0);
  return (
    <div className="rounded-2xl overflow-hidden border bg-card shadow-sm">
      <div
        className="relative aspect-[2/1] flex items-center justify-center overflow-hidden"
        style={{
          background: mission.brandColor
            ? `linear-gradient(135deg, ${mission.brandColor}18, ${mission.brandColor}05)`
            : 'hsl(var(--muted))',
        }}
      >
        {/* Shadoo branding — subtle flowing lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.13]"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="shadooLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-20,150 C 80,110 180,190 260,140 S 420,90 440,120" stroke="url(#shadooLine)" strokeWidth="1.5" fill="none" />
          <path d="M-20,170 C 90,130 200,210 280,160 S 420,110 440,140" stroke="url(#shadooLine)" strokeWidth="1" fill="none" />
          <path d="M-20,40 C 100,10 200,80 300,40 S 420,10 440,30" stroke="url(#shadooLine)" strokeWidth="1" fill="none" />
        </svg>
        <img
          src={mission.brandLogo || mission.hero}
          alt={mission.brand}
          className="relative max-h-[95%] max-w-[95%] w-auto h-auto object-contain drop-shadow-sm"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute top-2 left-2 bg-background/95 backdrop-blur rounded-full px-2 py-1 text-[10px] font-bold uppercase">
          {mission.category}
        </div>
      </div>
      <div className="p-3.5 space-y-3">
        <div>
          <div className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">{mission.brand}</div>
          <h3 className="font-bold text-[15px] leading-snug mt-0.5">{mission.title}</h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{mission.distanceKm} km</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{mission.durationMin} min</span>
          <span className="flex items-center gap-1 font-semibold text-primary"><Coins className="h-3.5 w-3.5" />{mission.reward} EGP</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 bg-muted rounded-full px-2 py-0.5 text-[10px] font-medium"><ClipboardList className="h-3 w-3" />{qCount} questions</span>
          <span className="inline-flex items-center gap-1 bg-muted rounded-full px-2 py-0.5 text-[10px] font-medium"><Camera className="h-3 w-3" />{mission.photoTasks.length} photos</span>
          {mission.requiresReceipt && (
            <span className="inline-flex items-center gap-1 bg-muted rounded-full px-2 py-0.5 text-[10px] font-medium"><Receipt className="h-3 w-3" />Receipt · {mission.purchaseBudget} EGP</span>
          )}
        </div>

        <Button className="w-full" onClick={() => nav(`/agent-app/mission/${mission.id}`)}>View mission</Button>
      </div>
    </div>
  );
}
