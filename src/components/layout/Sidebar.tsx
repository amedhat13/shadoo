import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ClipboardList, 
  Building2, 
  Wallet, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import shadooLogo from '@/assets/shadoo-logo.png';

const navItems = [
  { id: 'missions', label: 'MISSIONS', href: '/missions', icon: ClipboardList },
  { id: 'branches', label: 'BRANCHES', href: '/branches', icon: Building2 },
  { id: 'wallet', label: 'WALLET', href: '/wallet', icon: Wallet },
  { id: 'reports', label: 'REPORTS', href: '/reports', icon: BarChart3 },
  { id: 'settings', label: 'SETTINGS', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo & Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-3">
          {!collapsed && (
            <img 
              src={shadooLogo} 
              alt="Shadoo" 
              className="h-10 w-auto"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.id}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold tracking-wide transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-primary'
                    : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Wallet Quick View */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="border border-sidebar-border p-3">
              <div className="flex items-center gap-2 text-xs text-sidebar-muted uppercase tracking-wide">
                <Wallet className="h-3.5 w-3.5" />
                <span>Wallet Balance</span>
              </div>
              <div className="mt-1 text-xl font-black text-success">
                15,000 EGP
              </div>
              <div className="mt-0.5 text-xs text-sidebar-muted">
                2,500 EGP on hold
              </div>
            </div>
          </div>
        )}

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="flex h-9 w-9 items-center justify-center bg-primary text-sm font-bold text-primary-foreground shrink-0">
              AC
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-sidebar-foreground">
                  Acme Corp
                </div>
                <div className="truncate text-xs text-sidebar-muted">
                  admin@acme.com
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
