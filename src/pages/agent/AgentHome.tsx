import { useMemo, useState, useEffect } from 'react';

import { MissionCard } from '@/components/agent/MissionCard';
import { NearYouMap } from '@/components/agent/NearYouMap';
import { getMissions, getSlots, getMission, getBranch, subscribe } from '@/lib/agentAppMock';
import { Bell, Coins, Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const CATS = ['All', 'F&B', 'Retail', 'Banking', 'Service', 'Telecom', 'Pharmacy', 'Fashion', 'Grocery', 'Automotive', 'Hospitality'] as const;
type Cat = typeof CATS[number];

const RECENT_KEY = 'agent_recent_searches';

export default function AgentHome() {
  const nav = useNavigate();
  const [cat, setCat] = useState<Cat>('All');
  const [sort, setSort] = useState<'nearest' | 'reward' | 'soonest'>('soonest');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((x) => x + 1)), []);
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  });

  const allMissions = getMissions();
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Enrich available slots with mission + branch
  const availableVisits = useMemo(() => {
    return getSlots()
      .map((slot) => {
        const mission = getMission(slot.missionId);
        const branch = getBranch(slot.missionId, slot.branchId);
        if (!mission || !branch) return null;
        return { slot, mission, branch };
      })
      .filter((v): v is { slot: NonNullable<ReturnType<typeof getSlots>>[number]; mission: NonNullable<ReturnType<typeof getMission>>; branch: NonNullable<ReturnType<typeof getBranch>> } => v !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMissions.length, /* rerun on visit changes */ force]);

  const brandSuggestions = useMemo(() => {
    const map = new Map<string, { brand: string; logo?: string; count: number }>();
    availableVisits.forEach(({ mission }) => {
      const prev = map.get(mission.brand);
      map.set(mission.brand, { brand: mission.brand, logo: mission.brandLogo, count: (prev?.count ?? 0) + 1 });
    });
    return Array.from(map.values());
  }, [availableVisits]);

  const visits = availableVisits
    .filter(({ mission }) => cat === 'All' || mission.category === cat)
    .filter(({ mission, branch }) => !searching || [mission.brand, mission.title, mission.category, branch.name, branch.city].join(' ').toLowerCase().includes(q))
    .sort((a, b) => {
      if (sort === 'nearest') return a.branch.distanceKm - b.branch.distanceKm;
      if (sort === 'reward') return b.mission.reward - a.mission.reward;
      return new Date(a.slot.startAt).getTime() - new Date(b.slot.startAt).getTime();
    });

  // Missions list for the "Near you" map (deduped by mission)
  const mapMissions = useMemo(() => {
    const seen = new Set<string>();
    return visits.reduce<typeof allMissions>((acc, v) => {
      if (!seen.has(v.mission.id)) { seen.add(v.mission.id); acc.push(v.mission); }
      return acc;
    }, []);
  }, [visits, allMissions]);

  const commitSearch = (value: string) => {
    const v = value.trim();
    if (!v) return;
    const next = [v, ...recent.filter((r) => r.toLowerCase() !== v.toLowerCase())].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };

  useEffect(() => {
    if (!searching) return;
    const t = setTimeout(() => commitSearch(query), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const clearRecent = () => {
    setRecent([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  };


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
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { commitSearch(query); (e.target as HTMLInputElement).blur(); }
                if (e.key === 'Escape') { setQuery(''); setFocused(false); }
              }}
              placeholder="Search missions or brands"
              className="pl-9 pr-9 h-10 rounded-full bg-muted border-0"
            />
            {(query || focused) && (
              <button
                onClick={() => { setQuery(''); setFocused(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-background"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {!searching && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-semibold border',
                  cat === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border')}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {searching ? (
        <div className="p-4 space-y-4">
          {/* Matching brands */}
          {(() => {
            const brandHits = brandSuggestions.filter((b) => b.brand.toLowerCase().includes(q)).slice(0, 4);
            if (brandHits.length === 0) return null;
            return (
              <div>
                <h3 className="font-bold uppercase text-xs tracking-wide text-muted-foreground mb-2">Brands</h3>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                  {brandHits.map((b) => (
                    <button
                      key={b.brand}
                      onClick={() => setQuery(b.brand)}
                      className="shrink-0 flex items-center gap-2 rounded-full border bg-background pl-1 pr-3 py-1"
                    >
                      {b.logo ? (
                        <img src={b.logo} alt="" className="h-7 w-7 rounded-full object-cover bg-muted" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted" />
                      )}
                      <div className="text-left">
                        <div className="text-xs font-semibold leading-tight">{b.brand}</div>
                        <div className="text-[10px] text-muted-foreground">{b.count} mission{b.count > 1 ? 's' : ''}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between">
            <h2 className="font-bold uppercase text-sm tracking-wide">
              {visits.length} result{visits.length === 1 ? '' : 's'}
            </h2>
            {visits.length > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-[11px] font-semibold">
                <button onClick={() => setSort('soonest')} className={cn('rounded-full px-2.5 py-1 transition', sort === 'soonest' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>Soonest</button>
                <button onClick={() => setSort('nearest')} className={cn('rounded-full px-2.5 py-1 transition', sort === 'nearest' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>Nearest</button>
                <button onClick={() => setSort('reward')} className={cn('rounded-full px-2.5 py-1 transition', sort === 'reward' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>Highest</button>
              </div>
            )}
          </div>

          {visits.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="font-semibold text-sm">No visits match “{query}”</div>
              <div className="text-xs text-muted-foreground">Try another brand, city, or category.</div>
              <button onClick={() => setQuery('')} className="mt-2 text-xs font-semibold text-primary">Clear search</button>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((v) => <MissionCard key={v.slot.id} mission={v.mission} slot={v.slot} branch={v.branch} />)}
            </div>
          )}

        </div>
      ) : focused && (recent.length > 0 || brandSuggestions.length > 0) ? (
        <div className="p-4 space-y-5">
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold uppercase text-xs tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Recent
                </h3>
                <button onClick={clearRecent} className="text-[11px] font-semibold text-muted-foreground">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button key={r} onClick={() => setQuery(r)} className="rounded-full border bg-background px-3 py-1 text-xs">
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="font-bold uppercase text-xs tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Popular brands
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {brandSuggestions.slice(0, 6).map((b) => (
                <button
                  key={b.brand}
                  onClick={() => setQuery(b.brand)}
                  className="flex items-center gap-2 rounded-xl border bg-background p-2 text-left"
                >
                  {b.logo ? (
                    <img src={b.logo} alt="" className="h-8 w-8 rounded-full object-cover bg-muted shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{b.brand}</div>
                    <div className="text-[10px] text-muted-foreground">{b.count} mission{b.count > 1 ? 's' : ''}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <NearYouMap missions={mapMissions} />

          <div className="flex items-center justify-between">
            <h2 className="font-bold uppercase text-sm tracking-wide">Available visits</h2>
            <div className="flex items-center gap-1 rounded-full bg-muted p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => setSort('soonest')}
                className={cn('rounded-full px-2.5 py-1 transition',
                  sort === 'soonest' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
              >
                Soonest
              </button>
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
            {visits.map((v) => <MissionCard key={v.slot.id} mission={v.mission} slot={v.slot} branch={v.branch} />)}
          </div>
        </div>

      )}
    </>
  );
}


