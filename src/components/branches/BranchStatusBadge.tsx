import { Badge } from '@/components/ui/badge';
import { BranchStatus } from '@/types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BranchStatusBadgeProps {
  status: BranchStatus;
}

const statusConfig: Record<BranchStatus, { label: string; description: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending_verification: {
    label: 'Pending',
    description: 'Branch is awaiting verification by Shadoo admin.',
    variant: 'secondary',
    icon: Clock,
  },
  verified: {
    label: 'Verified',
    description: 'Branch has been verified and can be used in missions.',
    variant: 'default',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    description: 'Branch verification was rejected. Check the reason and resubmit.',
    variant: 'destructive',
    icon: XCircle,
  },
};

export function BranchStatusBadge({ status }: BranchStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={config.variant} className="gap-1 cursor-help">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-[250px]">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
