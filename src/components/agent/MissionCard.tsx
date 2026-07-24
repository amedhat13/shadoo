import { AgentMission } from '@/lib/agentAppMock';
import { MapPin, Clock, Coins, Camera, ClipboardList, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function MissionCard({ mission }: { mission: AgentMission }) {
  const nav = useNavigate();
  const qCount = mission.sections.reduce((s, sec) => s + sec.questions.length, 0);
  return (
    <div className="rounded-2xl overflow-hidden border bg-card shadow-sm">
      <div className="relative aspect-video bg-muted">
        <img src={mission.hero} alt={mission.title} className="w-full h-full object-cover" />
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
