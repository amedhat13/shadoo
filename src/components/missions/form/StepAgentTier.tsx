import { Check, Crown, Lock, Star, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MissionFormData, AgentTier } from '@/types';
import { AGENT_TIERS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StepAgentTierProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

const tierIcons: Record<AgentTier, React.ReactNode> = {
  C: <Users className="h-5 w-5" />,
  B: <Star className="h-5 w-5" />,
  A: <Crown className="h-5 w-5" />,
};

export function StepAgentTier({ data, onChange }: StepAgentTierProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">
          Select Agent Tier<span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Choose the agent tier for this mission. Higher tiers provide more experienced agents with better reporting.
        </p>
      </div>

      <div className="grid gap-4">
        {AGENT_TIERS.map((tierInfo) => {
          const isSelected = data.agent_tier === tierInfo.tier;
          const isLocked = tierInfo.requiresUpgrade;

          return (
            <button
              key={tierInfo.tier}
              type="button"
              onClick={() => {
                if (!isLocked) {
                  onChange({ agent_tier: tierInfo.tier });
                }
              }}
              disabled={isLocked}
              className={cn(
                'relative flex items-start gap-4 border p-4 text-left transition-all',
                isSelected && !isLocked
                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
                  : 'border-border hover:border-primary/50',
                isLocked && 'opacity-60 cursor-not-allowed'
              )}
            >
              {/* Selection indicator */}
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  isSelected && !isLocked
                    ? 'bg-primary text-primary-foreground'
                    : isLocked
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                {isLocked ? <Lock className="h-5 w-5" /> : tierIcons[tierInfo.tier]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold uppercase tracking-wide">{tierInfo.name}</h3>
                  {isLocked && (
                    <Badge variant="outline" className="text-xs">
                      Upgrade Required
                    </Badge>
                  )}
                  {isSelected && !isLocked && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tierInfo.description}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tierInfo.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-xs bg-muted px-2 py-1 rounded"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrade button for locked tiers */}
              {isLocked && (
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to upgrade page or open upgrade modal
                    window.location.href = '/settings?tab=billing';
                  }}
                >
                  <Crown className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              )}
            </button>
          );
        })}
      </div>

      <div className="border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm">
          <strong>Tip:</strong> For complex evaluations or high-stakes visits, consider upgrading to access Class A agents who provide executive-level reports and dedicated support.
        </p>
      </div>
    </div>
  );
}
