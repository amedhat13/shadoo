import { useState } from 'react';

import { MissionCard } from '@/components/agent/MissionCard';
import { NearYouMap } from '@/components/agent/NearYouMap';
import { getMissions } from '@/lib/agentAppMock';
import { Bell, Coins, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const CATS = ['All', 'F&B', 'Retail', 'Banking', 'Service', 'Telecom', 'Pharmacy', 'Fashion', 'Grocery', 'Automotive', 'Hospitality'] as const;
type Cat = typeof CATS[number];

export default function AgentHome() {
  const nav = useNavigate();
  const [cat, setCat] = useState<Cat>('All');
  const [sort, setSort] = useState<'nearest' | 'reward'>('nearest');
  const missions = getMissions()
    .filter((m) => cat === 'All' || m.category === cat)
    .sort((a, b) => (sort === 'nearest' ? a.distanceKm - b.distanceKm : b.reward - a.reward));

  return (
    <>
      <div className="sticky top-0 z-40 bg-background border-b">
        {/* Unified orange brand header */}
        <div className="bg-primary text-primary-foreground px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-90">Good afternoon,</div>
              <div className="font-bold text-lg leading-tight">Ahmed <span className="text-sm opacity-90">· Tier A</span></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => nav('/agent-app/wallet')} className="flex items-center gap-1 bg-primary-foreground text-primary rounded-full px-2.5 py-1.5">
                <Coins className="h-4 w-4" />
                <span className="text-xs font-semibold">1,240 EGP</span>
              </button>
              <button onClick={() => nav('/agent-app/notifications')} className="p-2 rounded-full bg-primary-foreground/15 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 pt-3 pb-3">
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
          <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setSort('nearest')}
              className={cn('rounded-full px-2.5 py-1 transition',
                sort === 'nearest' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
            >
              Nearest
            </button>
            <button
              onClick={() => setSort('reward')}
              className={cn('rounded-full px-2.5 py-1 transition',
                sort === 'reward' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
            >
              Highest reward
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {missions.map((m) => <MissionCard key={m.id} mission={m} />)}
        </div>
      </div>
    </>
  );
}

