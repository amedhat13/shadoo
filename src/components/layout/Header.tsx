import { Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VisitsRemainingWidget } from '@/components/package/VisitsRemainingWidget';
import { usePackage } from '@/hooks/usePackage';

export function Header() {
  const { visitsRemaining, visitsTotal } = usePackage();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Left side - can be used for breadcrumbs or search */}
      <div className="flex-1" />

      {/* Right side - Visits + Notifications */}
      <div className="flex items-center gap-4">
        <VisitsRemainingWidget
          visitsRemaining={visitsRemaining}
          visitsTotal={visitsTotal}
          variant="header"
        />
        
        <div className="h-6 w-px bg-border" />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 bg-primary" />
        </Button>
      </div>
    </header>
  );
}
