import { Badge } from '@/components/ui/badge';
import { BranchStatus } from '@/types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface BranchStatusBadgeProps {
  status: BranchStatus;
}

const statusConfig: Record<BranchStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending_verification: {
    label: 'Pending',
    variant: 'secondary',
    icon: Clock,
  },
  verified: {
    label: 'Verified',
    variant: 'default',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    icon: XCircle,
  },
};

export function BranchStatusBadge({ status }: BranchStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
