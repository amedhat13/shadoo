import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, Star, CheckCircle2, Edit2 } from 'lucide-react';

const tiers = [
  {
    code: 'A',
    name: 'Premium Agent',
    description: 'Top-tier agents with excellent track record.',
    features: ['Priority mission access', 'Higher commission rate', 'Premium support'],
    requirements: { minVisits: 100, minRating: 4.8 },
    commission: 15,
    color: 'bg-amber-500',
    agents: 28,
  },
  {
    code: 'B',
    name: 'Standard Agent',
    description: 'Experienced agents with good performance.',
    features: ['Standard mission access', 'Regular commission rate', 'Email support'],
    requirements: { minVisits: 30, minRating: 4.5 },
    commission: 12,
    color: 'bg-slate-400',
    agents: 156,
  },
  {
    code: 'C',
    name: 'Entry Agent',
    description: 'New agents building their reputation.',
    features: ['Basic mission access', 'Starter commission rate', 'Self-service support'],
    requirements: { minVisits: 0, minRating: 0 },
    commission: 10,
    color: 'bg-amber-700',
    agents: 272,
  },
];

export default function AdminTiersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Agent Tier Configuration"
          description="Configure agent tiers, requirements, and commission rates."
        />

        {/* Tier Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.code} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${tier.color}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center text-white font-black ${tier.color}`}>
                      {tier.code}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <CardDescription>{tier.agents} agents</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{tier.description}</p>
                
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Features</Label>
                  <ul className="space-y-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Min. Visits</Label>
                    <p className="text-lg font-bold">{tier.requirements.minVisits}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Min. Rating</Label>
                    <p className="text-lg font-bold flex items-center gap-1">
                      {tier.requirements.minRating > 0 ? (
                        <>
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          {tier.requirements.minRating}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Commission Rate</Label>
                  <p className="text-2xl font-black text-success">{tier.commission}%</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tier Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Auto-Promotion Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <p className="font-medium">Automatic tier upgrades</p>
                <p className="text-sm text-muted-foreground">
                  Agents are automatically promoted when they meet tier requirements.
                </p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <p className="font-medium">Rating recalculation</p>
                <p className="text-sm text-muted-foreground">
                  Rolling average of last 50 visits for tier eligibility.
                </p>
              </div>
              <Badge variant="outline">Last 50 visits</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
