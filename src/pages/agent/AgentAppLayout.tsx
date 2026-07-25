import { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Home, ClipboardList, Wallet, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

import shadooLogo from '@/assets/shadoo-logo-white.png.asset.json';
import shadooCap from '@/assets/shadoo-cap.png';

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 flex items-start justify-center py-4 sm:py-6">
      <div
        className="w-full sm:w-[390px] h-[100vh] sm:h-[780px] bg-background sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[10px] sm:border-foreground/90 sm:overflow-hidden flex flex-col relative"
      >
        {children}
      </div>
    </div>
  );
}

export function AgentTopBar({ title, showBack = false, right }: { title?: string; showBack?: boolean; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 h-14 bg-background/95 backdrop-blur">
      <div className="flex items-center gap-1 min-w-0">
        {showBack ? (
          <button onClick={() => nav(-1)} aria-label="Back" className="-ml-2 p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : <span className="w-6" />}
        <div className="font-bold uppercase tracking-wide text-sm truncate">{title}</div>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export function BottomTabs() {
  const items = [
    { to: '/agent-app', icon: Home, label: 'Home', end: true },
    { to: '/agent-app/my-missions', icon: ClipboardList, label: 'My missions' },
    { to: '/agent-app/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/agent-app/profile', icon: 'shadoo' as const, label: 'Profile' },
  ];
  return (
    <nav className="shrink-0 bg-background border-t grid grid-cols-4">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn('flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide',
              isActive ? 'text-primary' : 'text-muted-foreground')
          }
        >
          {it.icon === 'shadoo'
            ? <img src={shadooCap} alt="" className="h-6 w-6 object-contain" />
            : <it.icon className="h-5 w-5" />}
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Small inline Shadoo lockup for in-app headers */
export function ShadooMark({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <img src={shadooLogo.url} alt="Shadoo" className="h-5 w-auto object-contain" />
    </div>
  );
}

export default function AgentAppLayout() {
  const location = useLocation();
  // Hide bottom tabs on immersive/task screens
  const hideTabs = /\/agent-app\/(active|mission)\//.test(location.pathname);
  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </div>
      {!hideTabs && <BottomTabs />}
    </MobileFrame>
  );
}
