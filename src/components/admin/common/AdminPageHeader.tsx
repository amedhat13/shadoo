import { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function AdminPageHeader({ title, description, actions, badge }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between text-start">
      <div className="space-y-0.5 md:space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
