import { NavLink, useLocation } from 'react-router-dom';
import { 
  ClipboardList, 
  Building2, 
  Wallet, 
  BarChart3, 
  Settings,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'missions', label: 'Missions', href: '/missions', icon: ClipboardList },
  { id: 'branches', label: 'Branches', href: '/branches', icon: Building2 },
  { id: 'wallet', label: 'Wallet', href: '/wallet', icon: Wallet },
  { id: 'reports', label: 'Reports', href: '/reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-accent-foreground">
            Shadoo
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.id}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Wallet Quick View */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <div className="flex items-center gap-2 text-xs text-sidebar-muted">
              <Wallet className="h-3.5 w-3.5" />
              <span>Wallet Balance</span>
            </div>
            <div className="mt-1 text-lg font-semibold text-sidebar-accent-foreground">
              15,000 EGP
            </div>
            <div className="mt-0.5 text-xs text-sidebar-muted">
              2,500 EGP on hold
            </div>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-medium text-sidebar-primary-foreground">
              AC
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-sidebar-accent-foreground">
                Acme Corp
              </div>
              <div className="truncate text-xs text-sidebar-muted">
                admin@acme.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
