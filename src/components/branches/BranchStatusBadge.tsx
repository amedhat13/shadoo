import { Badge } from '@/components/ui/badge';
import { BranchStatus } from '@/types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BranchStatusBadgeProps {
  status: BranchStatus;
}

const statusConfig: Record<BranchStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending_verification: {
    variant: 'secondary',
    icon: Clock,
  },
  verified: {
    variant: 'default',
    icon: CheckCircle,
  },
  rejected: {
    variant: 'destructive',
    icon: XCircle,
  },
};

export function BranchStatusBadge({ status }: BranchStatusBadgeProps) {
  const { t } = useTranslation('branches');
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={config.variant} className="gap-1 cursor-help">
          <Icon className="h-3 w-3" />
          {t(`statuses.${status}`)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-[250px]">{t(`status_descriptions.${status}`)}</p>
      </TooltipContent>
    </Tooltip>
  );
}