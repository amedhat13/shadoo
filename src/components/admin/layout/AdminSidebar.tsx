import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  UserCheck,
  Award,
  FileQuestion,
  CreditCard,
  DollarSign,
  Wallet,
  BarChart3,
  Settings,
  ScrollText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import shadooLogo from '@/assets/shadoo-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

const navSections = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'DASHBOARD', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'clients', label: 'CLIENTS', href: '/admin/clients', icon: Users },
      { id: 'branches', label: 'BRANCHES', href: '/admin/branches', icon: Building2 },
      { id: 'missions', label: 'MISSIONS', href: '/admin/missions', icon: ClipboardList },
    ],
  },
  {
    title: 'Agents',
    items: [
      { id: 'agents', label: 'AGENTS', href: '/admin/agents', icon: UserCheck },
      { id: 'tiers', label: 'AGENT TIERS', href: '/admin/tiers', icon: Award },
      { id: 'payouts', label: 'PAYOUTS', href: '/admin/payouts', icon: Wallet },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { id: 'templates', label: 'TEMPLATES', href: '/admin/templates', icon: FileQuestion },
      { id: 'plans', label: 'PLANS', href: '/admin/plans', icon: CreditCard },
    ],
  },
  {
    title: 'Finance',
    items: [
      { id: 'finance', label: 'FINANCES', href: '/admin/finance', icon: DollarSign },
      { id: 'reports', label: 'REPORTS', href: '/admin/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'config', label: 'CONFIGURATION', href: '/admin/config', icon: Settings },
      { id: 'audit', label: 'AUDIT LOGS', href: '/admin/audit', icon: ScrollText },
      { id: 'admins', label: 'ADMIN USERS', href: '/admin/admins', icon: ShieldCheck },
    ],
  },
];

interface AdminSidebarProps {
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
    <div className="flex h-full flex-col bg-foreground">
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-muted-foreground/20 px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img 
              src={shadooLogo} 
              alt="Shadoo" 
              className="h-8 w-auto brightness-0 invert"
            />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 text-background hover:bg-muted-foreground/20 hidden md:flex",
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
      <ScrollArea className="flex-1">
        <nav className="space-y-4 px-2 py-4">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.href === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <NavLink
                      key={item.id}
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wide transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted-foreground/10 hover:text-background',
                        collapsed && 'justify-center px-0'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Admin User */}
      <div className="border-t border-muted-foreground/20 p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-9 w-9 items-center justify-center bg-primary text-sm font-bold text-primary-foreground shrink-0">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold text-background">
                Super Admin
              </div>
              <div className="truncate text-xs text-muted-foreground">
                admin@shadoo.com
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileOpenChange }: AdminSidebarProps) {
  const isMobile = useIsMobile();

  // Mobile: Use Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden h-10 w-10 bg-foreground text-background border-0 shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-foreground border-0">
          <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
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
        "fixed left-0 top-0 z-40 h-screen bg-foreground transition-all duration-300 hidden md:block",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}
