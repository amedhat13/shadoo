import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, ClipboardList, ClipboardCheck,
  UserCheck, Award, FileQuestion, CreditCard, DollarSign, Wallet,
  BarChart3, Settings, ScrollText, ShieldCheck, Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import shadooLogo from '@/assets/shadoo-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { useDirectionalIcons, useDirectionalSide } from '@/i18n/utils';
import { useLanguage } from '@/i18n/LanguageProvider';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';

const navSections = [
  { titleKey: 'admin.sections.overview', items: [
    { id: 'dashboard', labelKey: 'admin.items.dashboard', href: '/admin', icon: LayoutDashboard },
  ]},
  { titleKey: 'admin.sections.management', items: [
    { id: 'clients', labelKey: 'admin.items.clients', href: '/admin/clients', icon: Users },
    { id: 'branches', labelKey: 'admin.items.branches', href: '/admin/branches', icon: Building2 },
    { id: 'missions', labelKey: 'admin.items.missions', href: '/admin/missions', icon: ClipboardList },
    { id: 'visits', labelKey: 'admin.items.visits', href: '/admin/visits', icon: ClipboardCheck },
  ]},
  { titleKey: 'admin.sections.agents', items: [
    { id: 'agents', labelKey: 'admin.items.agents', href: '/admin/agents', icon: UserCheck },
    { id: 'tiers', labelKey: 'admin.items.tiers', href: '/admin/tiers', icon: Award },
    { id: 'payouts', labelKey: 'admin.items.payouts', href: '/admin/payouts', icon: Wallet },
  ]},
  { titleKey: 'admin.sections.configuration', items: [
    { id: 'templates', labelKey: 'admin.items.templates', href: '/admin/templates', icon: FileQuestion },
    { id: 'plans', labelKey: 'admin.items.plans', href: '/admin/plans', icon: CreditCard },
  ]},
  { titleKey: 'admin.sections.finance', items: [
    { id: 'finance', labelKey: 'admin.items.finances', href: '/admin/finance', icon: DollarSign },
    { id: 'reports', labelKey: 'admin.items.reports', href: '/admin/reports', icon: BarChart3 },
  ]},
  { titleKey: 'admin.sections.system', items: [
    { id: 'config', labelKey: 'admin.items.config', href: '/admin/config', icon: Settings },
    { id: 'audit', labelKey: 'admin.items.audit', href: '/admin/audit', icon: ScrollText },
    { id: 'admins', labelKey: 'admin.items.admins', href: '/admin/admins', icon: ShieldCheck },
  ]},
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
  const { t } = useTranslation('nav');
  const { ChevronStart, ChevronEnd } = useDirectionalIcons();

  return (
    <div className="flex h-full flex-col bg-background border-e border-border text-start">
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={shadooLogo} alt="Shadoo" className="h-8 w-auto" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('admin.badge')}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 text-foreground hover:bg-muted hidden md:flex",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronEnd className="h-4 w-4" /> : <ChevronStart className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-4 px-2 py-4">
          {navSections.map((section) => (
            <div key={section.titleKey}>
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t(section.titleKey)}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.href === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.href);
                  const Icon = item.icon;
                  const label = t(item.labelKey);
                  
                  return (
                    <NavLink
                      key={item.id}
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wide transition-colors rounded-md',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted',
                        collapsed && 'justify-center px-0'
                      )}
                      title={collapsed ? label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Language Switcher */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-border">
          <LanguageSwitcher variant="full" className="w-full justify-start" />
        </div>
      )}
      {collapsed && (
        <div className="px-2 py-2 flex justify-center border-t border-border">
          <LanguageSwitcher variant="icon" />
        </div>
      )}

      {/* Admin User */}
      <div className="border-t border-border p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-9 w-9 items-center justify-center bg-primary text-sm font-bold text-primary-foreground shrink-0 rounded-md">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {t('admin.items.dashboard', { defaultValue: 'Super Admin' })}
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
  const { t } = useTranslation('nav');
  const { start } = useDirectionalSide();
  const { isRTL } = useLanguage();

  // Mobile: Use Sheet (triggered from Header, not floating button)
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side={start} className="w-64 p-0 bg-background border-e border-border">
          <SheetTitle className="sr-only">{t('admin_navigation_menu')}</SheetTitle>
          <SidebarContent 
            collapsed={false} 
            onToggle={onToggle} 
            onNavigate={() => onMobileOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside 
      className={cn(
        "fixed top-0 z-40 h-screen bg-background transition-all duration-300 hidden md:block",
        isRTL ? "right-0" : "left-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}