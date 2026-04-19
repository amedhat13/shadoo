import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  ClipboardList, 
  Building2, 
  Wallet, 
  BarChart3, 
  Settings,
  Menu,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import shadooLogo from '@/assets/shadoo-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useDirectionalIcons, useDirectionalSide } from '@/i18n/utils';
import { useLanguage } from '@/i18n/LanguageProvider';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { id: 'dashboard', labelKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'missions', labelKey: 'missions', href: '/missions', icon: ClipboardList },
  { id: 'branches', labelKey: 'branches', href: '/branches', icon: Building2 },
  { id: 'wallet', labelKey: 'wallet', href: '/wallet', icon: Wallet },
  { id: 'reports', labelKey: 'reports', href: '/reports', icon: BarChart3 },
  { id: 'settings', labelKey: 'settings', href: '/settings', icon: Settings },
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
  const { t } = useTranslation('nav');
  const { t: tc } = useTranslation('common');
  const { ChevronStart, ChevronEnd } = useDirectionalIcons();

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
            <ChevronEnd className="h-4 w-4" />
          ) : (
            <ChevronStart className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(item.href);
          const Icon = item.icon;
          const label = t(item.labelKey);
          
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
              title={collapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && label}
            </NavLink>
          );
        })}
      </nav>

      {/* Language Switcher */}
      {!collapsed && (
        <div className="px-4 py-2">
          <LanguageSwitcher variant="full" className="w-full justify-start" />
        </div>
      )}
      {collapsed && (
        <div className="px-2 py-2 flex justify-center">
          <LanguageSwitcher variant="icon" />
        </div>
      )}

      {/* Wallet Quick View */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <div className="border border-sidebar-border p-3">
            <div className="flex items-center gap-2 text-xs text-sidebar-muted uppercase tracking-wide">
              <Wallet className="h-3.5 w-3.5" />
              <span>{t('in_mission_balance')}</span>
            </div>
            <div className="mt-1 text-xl font-black text-success">
              15,000 {tc('currency_code')}
            </div>
            <div className="mt-0.5 text-xs text-sidebar-muted">
              {t('on_hold', { amount: `2,500 ${tc('currency_code')}` })}
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
  const { t } = useTranslation('nav');
  const { start } = useDirectionalSide();
  const { isRTL } = useLanguage();

  // Mobile: Use Sheet (triggered from Header, not floating button)
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side={start} className="w-64 p-0 bg-sidebar">
          <SheetTitle className="sr-only">{t('navigation_menu')}</SheetTitle>
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
        "fixed top-0 z-40 h-screen bg-sidebar border-sidebar-border transition-all duration-300 hidden md:block",
        isRTL ? "right-0 border-s" : "left-0 border-e",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}