import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Award, Star, CheckCircle2, Edit2, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { useVisitPricing, useUpdateVisitPrice, useCreateVisitPrice, useDeleteVisitPrice } from '@/hooks/useVisitPricing';
import { LoadingState } from '@/components/common/LoadingState';

const tiers = [
  { code: 'A', name: 'Premium Agent', description: 'Top-tier agents with excellent track record.', color: 'bg-amber-500', requirements: { minVisits: 100, minRating: 4.8 } },
  { code: 'B', name: 'Standard Agent', description: 'Experienced agents with good performance.', color: 'bg-slate-400', requirements: { minVisits: 30, minRating: 4.5 } },
  { code: 'C', name: 'Entry Agent', description: 'New agents building their reputation.', color: 'bg-amber-700', requirements: { minVisits: 0, minRating: 0 } },
];

export default function AdminTiersPage() {
  const { t } = useTranslation('admin');
  const { data: pricing, isLoading } = useVisitPricing();
  const updatePrice = useUpdateVisitPrice();
  const createPrice = useCreateVisitPrice();
  const deletePrice = useDeleteVisitPrice();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newDuration, setNewDuration] = useState<Record<string, string>>({});
  const [newPrice, setNewPrice] = useState<Record<string, string>>({});

  const getPricing = (tierCode: string) => {
    return (pricing || []).filter(p => p.tier_code === tierCode).sort((a, b) => a.duration_minutes - b.duration_minutes);
  };

  const handleSavePrice = (id: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val <= 0) return;
    updatePrice.mutate({ id, price: val }, { onSuccess: () => setEditingId(null) });
  };

  const handleAddDuration = (tierCode: string) => {
    const dur = parseInt(newDuration[tierCode]);
    const pr = parseFloat(newPrice[tierCode]);
    if (isNaN(dur) || isNaN(pr) || dur <= 0 || pr <= 0) return;
    createPrice.mutate(
      { tier_code: tierCode, duration_minutes: dur, price: pr },
      { onSuccess: () => { setNewDuration(d => ({ ...d, [tierCode]: '' })); setNewPrice(p => ({ ...p, [tierCode]: '' })); } }
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('tiers.title', { defaultValue: 'Agent Tier & Pricing Configuration' })}
          description={t('tiers.description', { defaultValue: 'Configure agent tiers, requirements, and visit pricing.' })}
        />

        {/* Tier Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const tierPricing = getPricing(tier.code);
            return (
              <Card key={tier.code} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${tier.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center text-white font-black ${tier.color}`}>
                      {tier.code}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">Min. Visits</Label>
                      <p className="text-lg font-bold">{tier.requirements.minVisits}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">Min. Rating</Label>
                      <p className="text-lg font-bold flex items-center gap-1">
                        {tier.requirements.minRating > 0 ? (
                          <><Star className="h-4 w-4 fill-warning text-warning" />{tier.requirements.minRating}</>
                        ) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Visit Pricing Table */}
                  <div className="pt-2 border-t space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">
                      {t('tiers.visit_pricing', { defaultValue: 'Visit Pricing (EGP)' })}
                    </Label>
                    {isLoading ? (
                      <div className="py-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
                    ) : (
                      <div className="space-y-1">
                        {tierPricing.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50">
                            <span className="text-muted-foreground">{p.duration_minutes} min</span>
                            {editingId === p.id ? (
                              <div className="flex items-center gap-1">
                                <Input className="w-20 h-7 text-xs" value={editValue} onChange={e => setEditValue(e.target.value)} type="number" />
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSavePrice(p.id)}>
                                  <Save className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="font-bold">{p.price} EGP</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingId(p.id); setEditValue(String(p.price)); }}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deletePrice.mutate(p.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        {/* Add new duration */}
                        <div className="flex items-center gap-1 pt-2">
                          <Input className="w-16 h-7 text-xs" placeholder="min" value={newDuration[tier.code] || ''} onChange={e => setNewDuration(d => ({ ...d, [tier.code]: e.target.value }))} type="number" />
                          <Input className="w-16 h-7 text-xs" placeholder="EGP" value={newPrice[tier.code] || ''} onChange={e => setNewPrice(p => ({ ...p, [tier.code]: e.target.value }))} type="number" />
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleAddDuration(tier.code)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Auto-Promotion & Location Settings */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold uppercase">
                {t('tiers.auto_promotion', { defaultValue: 'Auto-Promotion Rules' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">Automatic tier upgrades</p>
                  <p className="text-sm text-muted-foreground">Agents are automatically promoted when they meet tier requirements.</p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold uppercase">
                {t('tiers.mission_visibility', { defaultValue: 'Mission Visibility Settings' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{t('tiers.max_radius', { defaultValue: 'Maximum mission radius' })}</p>
                  <p className="text-sm text-muted-foreground">{t('tiers.max_radius_desc', { defaultValue: 'Agents only see missions within this radius.' })}</p>
                </div>
                <Badge variant="outline">30 KM</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{t('tiers.location_filtering', { defaultValue: 'Enable location-based filtering' })}</p>
                  <p className="text-sm text-muted-foreground">{t('tiers.location_filtering_desc', { defaultValue: 'Filter missions by agent proximity.' })}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
