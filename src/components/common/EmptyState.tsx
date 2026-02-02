import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-card p-12 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center bg-muted">
        {icon || <FileQuestion className="h-7 w-7 text-muted-foreground" />}
      </div>
      <h3 className="mt-4 text-lg font-bold uppercase tracking-wide text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
