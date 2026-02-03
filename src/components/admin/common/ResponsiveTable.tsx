import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileCardListProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  className?: string;
}

export function MobileCardList<T>({ items, renderCard, className }: MobileCardListProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => renderCard(item, index))}
    </div>
  );
}

interface MobileCardFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function MobileCardField({ label, value, className }: MobileCardFieldProps) {
  return (
    <div className={cn("flex justify-between items-center py-1", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

interface ResponsiveTableProps {
  children: ReactNode;
  mobileContent: ReactNode;
}

export function ResponsiveTable({ children, mobileContent }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        {children}
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden">
        {mobileContent}
      </div>
    </>
  );
}
