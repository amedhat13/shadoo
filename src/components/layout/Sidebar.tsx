import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  ClipboardList, 
  Building2, 
  Wallet, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import shadooLogo from '@/assets/shadoo-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', href: '/', icon: LayoutDashboard },
  { id: 'missions', label: 'MISSIONS', href: '/missions', icon: ClipboardList },
  { id: 'branches', label: 'BRANCHES', href: '/branches', icon: Building2 },
  { id: 'wallet', label: 'WALLET', href: '/wallet', icon: Wallet },
  { id: 'reports', label: 'REPORTS', href: '/reports', icon: BarChart3 },
  { id: 'settings', label: 'SETTINGS', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function SidebarContent({ collapsed, onToggle, onNavigate }: { 
  collapsed: boolean; 
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
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
            "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex",
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
          const isActive = item.href === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.id}
              to={item.href}
              onClick={onNavigate}
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
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const isMobile = useIsMobile();

  // Mobile: Use Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden h-10 w-10 bg-background border border-border shadow-sm"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent 
            collapsed={false} 
            onToggle={onToggle} 
            onNavigate={() => onMobileOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden md:block",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}
