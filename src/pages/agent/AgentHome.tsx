import { useState } from 'react';
import { AgentTopBar } from './AgentAppLayout';
import { MissionCard } from '@/components/agent/MissionCard';
import { NearYouMap } from '@/components/agent/NearYouMap';
import { getMissions } from '@/lib/agentAppMock';
import { Bell, Coins, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const CATS: ('All' | 'F&B' | 'Retail' | 'Service')[] = ['All', 'F&B', 'Retail', 'Service'];

export default function AgentHome() {
  const nav = useNavigate();
  const [cat, setCat] = useState<'All' | 'F&B' | 'Retail' | 'Service'>('All');
  const [sort, setSort] = useState<'recommended' | 'nearest' | 'reward'>('recommended');
  const missions = getMissions()
    .filter((m) => cat === 'All' || m.category === cat)
    .sort((a, b) => sort === 'nearest' ? a.distanceKm - b.distanceKm : sort === 'reward' ? b.reward - a.reward : 0);

  return (
    <>
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Good afternoon,</div>
            <div className="font-bold text-lg leading-tight">Ahmed <span className="text-primary text-sm">· Tier A</span></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => nav('/agent-app/wallet')} className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1.5">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">1,240 EGP</span>
            </button>
            <button onClick={() => nav('/agent-app/notifications')} className="p-2 rounded-full bg-muted relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search missions or brands" className="pl-9 h-10 rounded-full bg-muted border-0" />
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-semibold border',
                cat === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border')}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <NearYouMap missions={missions} />

        <div className="flex items-center justify-between">
          <h2 className="font-bold uppercase text-sm tracking-wide">Available missions</h2>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="text-xs bg-muted rounded-full px-2 py-1 border-0">
            <option value="recommended">Recommended</option>
            <option value="nearest">Nearest</option>
            <option value="reward">Highest reward</option>
          </select>
        </div>

        <div className="space-y-4">
          {missions.map((m) => <MissionCard key={m.id} mission={m} />)}
        </div>
      </div>
    </>
  );
}
