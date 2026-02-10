import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CURRENCY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  visits_per_month: number;
  features: string[];
  is_popular?: boolean;
}

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  Starter: Zap,
  Professional: Sparkles,
  Enterprise: Crown,
};

export function SubscriptionPlans({
  plans,
  currentPlanId,
  onSelectPlan,
  isLoading,
}: SubscriptionPlansProps) {
  const { t: tc } = useTranslation('common');
  const currencyLabel = tc('currency_code');
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const Icon = PLAN_ICONS[plan.name] || Zap;
        const isCurrent = plan.id === currentPlanId;

        return (
          <Card
            key={plan.id}
            className={cn(
              'relative border transition-all',
              plan.is_popular && 'border-primary ring-1 ring-primary',
              isCurrent && 'bg-muted/30'
            )}
          >
            {plan.is_popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}

            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center bg-foreground">
                  <Icon className="h-4 w-4 text-background" />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">
                    {plan.price.toLocaleString(CURRENCY.locale)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {currencyLabel}/month
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {plan.visits_per_month} visits included
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action */}
              <Button
                variant={isCurrent ? 'outline' : plan.is_popular ? 'default' : 'secondary'}
                className="w-full"
                disabled={isCurrent || isLoading}
                onClick={() => onSelectPlan(plan.id)}
              >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
