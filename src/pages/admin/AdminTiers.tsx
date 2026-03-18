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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Award, Star, Edit2, Loader2, Save, Plus, Trash2, Users, AlertTriangle,
  Shield, Crown, Gem, Zap, Target, BadgeCheck, UserCheck, Briefcase,
  Rocket, TrendingUp, Eye, Heart, Flame, Medal, Trophy, Sparkles,
  CircleUser, GraduationCap, Car, Bike, Globe, MapPin, Building2,
  ShieldCheck, Handshake, Lightbulb, type LucideIcon,
} from 'lucide-react';
import {
  useAgentTiers, useCreateAgentTier, useUpdateAgentTier, useDeleteAgentTier,
  useAgentCountByTier, type AgentTier,
} from '@/hooks/useAgentTiers';
import { useVisitPricing, useUpdateVisitPrice, useCreateVisitPrice, useDeleteVisitPrice } from '@/hooks/useVisitPricing';
import { AGENT_DEMOGRAPHICS } from '@/lib/constants';
import { LoadingState } from '@/components/common/LoadingState';
import { cn } from '@/lib/utils';

// Curated icon library for tiers
const TIER_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'shield', icon: Shield },
  { name: 'crown', icon: Crown },
  { name: 'gem', icon: Gem },
  { name: 'zap', icon: Zap },
  { name: 'target', icon: Target },
  { name: 'award', icon: Award },
  { name: 'badge-check', icon: BadgeCheck },
  { name: 'user-check', icon: UserCheck },
  { name: 'briefcase', icon: Briefcase },
  { name: 'rocket', icon: Rocket },
  { name: 'trending-up', icon: TrendingUp },
  { name: 'eye', icon: Eye },
  { name: 'heart', icon: Heart },
  { name: 'flame', icon: Flame },
  { name: 'medal', icon: Medal },
  { name: 'trophy', icon: Trophy },
  { name: 'sparkles', icon: Sparkles },
  { name: 'star', icon: Star },
  { name: 'circle-user', icon: CircleUser },
  { name: 'graduation-cap', icon: GraduationCap },
  { name: 'car', icon: Car },
  { name: 'bike', icon: Bike },
  { name: 'globe', icon: Globe },
  { name: 'map-pin', icon: MapPin },
  { name: 'building-2', icon: Building2 },
  { name: 'shield-check', icon: ShieldCheck },
  { name: 'handshake', icon: Handshake },
  { name: 'lightbulb', icon: Lightbulb },
];

function getTierIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return Shield;
  return TIER_ICONS.find(i => i.name === iconName)?.icon || Shield;
}

const emptyTier: Partial<AgentTier> = {
  name: '', name_ar: '', tier_code: '', description: '', description_ar: '',
  color: '#6B7280', icon: null, is_active: true, sort_order: 0,
  min_age: null, max_age: null, gender: null,
  cities: [], districts: [], education_levels: [], languages: [],
  requires_car: false, requires_motorcycle: false,
  marital_statuses: [], employment_statuses: [],
  min_experience_years: 0, specializations: [],
  min_rating: 0, min_completed_visits: 0,
  questionnaire_criteria: [],
};

export default function AdminTiersPage() {
  const { t, i18n } = useTranslation('admin');
  const { data: tiers, isLoading } = useAgentTiers();
  const { data: agentCounts } = useAgentCountByTier();
  const createTier = useCreateAgentTier();
  const updateTier = useUpdateAgentTier();
  const deleteTier = useDeleteAgentTier();

  const { data: pricing, isLoading: pricingLoading } = useVisitPricing();
  const updatePrice = useUpdateVisitPrice();
  const createPrice = useCreateVisitPrice();
  const deletePrice = useDeleteVisitPrice();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Partial<AgentTier> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [editMinDur, setEditMinDur] = useState('');
  const [editMaxDur, setEditMaxDur] = useState('');
  const [newMinDur, setNewMinDur] = useState<Record<string, string>>({});
  const [newMaxDur, setNewMaxDur] = useState<Record<string, string>>({});
  const [newPrice, setNewPrice] = useState<Record<string, string>>({});

  const activeTiers = (tiers || []).filter(t => t.is_active);

  const openCreate = () => { setEditingTier({ ...emptyTier }); setDialogOpen(true); };
  const openEdit = (tier: AgentTier) => { setEditingTier({ ...tier }); setDialogOpen(true); };

  const handleSave = () => {
    if (!editingTier) return;
    if (editingTier.id) {
      updateTier.mutate(editingTier as AgentTier, { onSuccess: () => setDialogOpen(false) });
    } else {
      createTier.mutate(editingTier, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTier.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  const getPricing = (tierCode: string) =>
    (pricing || []).filter(p => p.tier_code === tierCode).sort((a, b) => a.min_duration_minutes - b.min_duration_minutes);

  const handleSavePrice = (id: string) => {
    const val = parseFloat(editPriceValue);
    const minD = parseInt(editMinDur);
    const maxD = parseInt(editMaxDur);
    if (isNaN(val) || val <= 0) return;
    updatePrice.mutate({
      id,
      price: val,
      min_duration_minutes: isNaN(minD) ? undefined : minD,
      max_duration_minutes: isNaN(maxD) ? undefined : maxD,
    }, { onSuccess: () => setEditingPriceId(null) });
  };

  const handleAddDuration = (tierCode: string) => {
    const minD = parseInt(newMinDur[tierCode]);
    const maxD = parseInt(newMaxDur[tierCode]);
    const pr = parseFloat(newPrice[tierCode]);
    if (isNaN(minD) || isNaN(maxD) || isNaN(pr) || minD <= 0 || maxD <= 0 || pr <= 0 || maxD < minD) return;
    createPrice.mutate(
      { tier_code: tierCode, min_duration_minutes: minD, max_duration_minutes: maxD, price: pr },
      {
        onSuccess: () => {
          setNewMinDur(d => ({ ...d, [tierCode]: '' }));
          setNewMaxDur(d => ({ ...d, [tierCode]: '' }));
          setNewPrice(p => ({ ...p, [tierCode]: '' }));
        },
      }
    );
  };

  const buildSummary = (tier: Partial<AgentTier>) => {
    const parts: string[] = [];
    if (tier.gender) parts.push(tier.gender === 'male' ? t('tiers.male') : t('tiers.female'));
    if (tier.min_age != null || tier.max_age != null) parts.push(`${tier.min_age ?? '?'}-${tier.max_age ?? '?'}`);
    if (tier.cities?.length) parts.push(tier.cities.join(', '));
    if (tier.education_levels?.length) parts.push(tier.education_levels.map(e => t(`tiers.${e}`, { defaultValue: e })).join(', '));
    if (tier.requires_car) parts.push(t('tiers.has_car'));
    if (tier.requires_motorcycle) parts.push(t('tiers.has_motorcycle'));
    if (tier.specializations?.length) parts.push(tier.specializations.join(', '));
    return parts.length > 0 ? parts.join(' • ') : t('tiers.all_agents');
  };

  if (isLoading) return <AdminLayout><LoadingState /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('tiers.title', { defaultValue: 'Agent Tier & Pricing Configuration' })}
          description={t('tiers.description', { defaultValue: 'Configure agent tiers, requirements, and visit pricing.' })}
          actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t('tiers.add_tier')}</Button>}
        />

        {/* Tier Cards */}
        <div className="grid gap-4">
          {activeTiers.map((tier) => {
            const count = agentCounts?.[tier.tier_code] || 0;
            const name = i18n.language === 'ar' && tier.name_ar ? tier.name_ar : tier.name;
            const desc = i18n.language === 'ar' && tier.description_ar ? tier.description_ar : tier.description;
            const tierPricing = getPricing(tier.tier_code);
            const IconComp = getTierIcon(tier.icon);

            return (
              <Card key={tier.id} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: tier.color || '#6B7280' }} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center text-white rounded"
                        style={{ backgroundColor: tier.color || '#6B7280' }}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        {desc && <CardDescription>{desc}</CardDescription>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {t('tiers.agents_in_tier', { count })}
                      </Badge>
                      {count === 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t('tiers.no_agents_warning', { defaultValue: 'No agents' })}
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(tier)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(tier.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Criteria Summary */}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t('tiers.criteria_summary')}: </span>
                    {buildSummary(tier)}
                  </div>

                  {/* Performance requirements */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">{t('tiers.min_visits')}</Label>
                      <p className="text-lg font-bold">{tier.min_completed_visits || 0}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase text-muted-foreground">{t('tiers.min_rating')}</Label>
                      <p className="text-lg font-bold flex items-center gap-1">
                        {(tier.min_rating ?? 0) > 0 ? (
                          <><Star className="h-4 w-4 fill-warning text-warning" />{tier.min_rating}</>
                        ) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Visit Pricing — Duration Ranges */}
                  <div className="pt-2 border-t space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">
                      {t('tiers.visit_pricing', { defaultValue: 'Visit Pricing (EGP)' })}
                    </Label>
                    {pricingLoading ? (
                      <div className="py-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
                    ) : (
                      <div className="space-y-1">
                        {tierPricing.map(p => (
                          <div key={p.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50">
                            <span className="text-muted-foreground">
                              {p.min_duration_minutes}-{p.max_duration_minutes ?? p.min_duration_minutes} {t('tiers.mins', { defaultValue: 'mins' })}
                            </span>
                            {editingPriceId === p.id ? (
                              <div className="flex items-center gap-1">
                                <Input className="w-14 h-7 text-xs" placeholder="min" value={editMinDur} onChange={e => setEditMinDur(e.target.value)} type="number" />
                                <span className="text-xs text-muted-foreground">-</span>
                                <Input className="w-14 h-7 text-xs" placeholder="max" value={editMaxDur} onChange={e => setEditMaxDur(e.target.value)} type="number" />
                                <Input className="w-16 h-7 text-xs" value={editPriceValue} onChange={e => setEditPriceValue(e.target.value)} type="number" />
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSavePrice(p.id)}>
                                  <Save className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="font-bold">{p.price} EGP</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                                  setEditingPriceId(p.id);
                                  setEditPriceValue(String(p.price));
                                  setEditMinDur(String(p.min_duration_minutes));
                                  setEditMaxDur(String(p.max_duration_minutes ?? p.min_duration_minutes));
                                }}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deletePrice.mutate(p.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        {/* Add new range */}
                        <div className="flex items-center gap-1 pt-2">
                          <Input className="w-14 h-7 text-xs" placeholder={t('tiers.min_dur', { defaultValue: 'min' })} value={newMinDur[tier.tier_code] || ''} onChange={e => setNewMinDur(d => ({ ...d, [tier.tier_code]: e.target.value }))} type="number" />
                          <span className="text-xs text-muted-foreground">-</span>
                          <Input className="w-14 h-7 text-xs" placeholder={t('tiers.max_dur', { defaultValue: 'max' })} value={newMaxDur[tier.tier_code] || ''} onChange={e => setNewMaxDur(d => ({ ...d, [tier.tier_code]: e.target.value }))} type="number" />
                          <Input className="w-16 h-7 text-xs" placeholder="EGP" value={newPrice[tier.tier_code] || ''} onChange={e => setNewPrice(p => ({ ...p, [tier.tier_code]: e.target.value }))} type="number" />
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleAddDuration(tier.tier_code)}>
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

        {/* Settings Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold uppercase">
                {t('tiers.auto_promotion', { defaultValue: 'Auto-Assignment Rules' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">Automatic tier assignment</p>
                  <p className="text-sm text-muted-foreground">Agents are automatically assigned to tiers based on their demographics.</p>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Tier Dialog */}
      {editingTier && (
        <TierFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tier={editingTier}
          onChange={setEditingTier}
          onSave={handleSave}
          saving={createTier.isPending || updateTier.isPending}
          t={t}
          i18nLang={i18n.language}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tiers.delete_tier')}</AlertDialogTitle>
            <AlertDialogDescription>{t('tiers.confirm_delete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('config.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('tiers.delete_tier')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

/* ─── Icon Picker ─── */
function IconPicker({ value, onChange, color }: { value: string | null; onChange: (v: string) => void; color: string }) {
  const [open, setOpen] = useState(false);
  const SelectedIcon = getTierIcon(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 w-10 p-0" type="button">
          <SelectedIcon className="h-5 w-5" style={{ color }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Choose Icon</p>
        <div className="grid grid-cols-7 gap-1">
          {TIER_ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded transition-all hover:bg-muted',
                value === name && 'ring-2 ring-primary bg-primary/10'
              )}
              onClick={() => { onChange(name); setOpen(false); }}
            >
              <Icon className="h-4 w-4" style={value === name ? { color } : undefined} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Tier Form Dialog ─── */
function TierFormDialog({
  open, onOpenChange, tier, onChange, onSave, saving, t, i18nLang,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tier: Partial<AgentTier>;
  onChange: (t: Partial<AgentTier>) => void;
  onSave: () => void;
  saving: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
  i18nLang: string;
}) {
  const update = (partial: Partial<AgentTier>) => onChange({ ...tier, ...partial });
  const toggleArrayItem = (field: keyof AgentTier, value: string) => {
    const current = (tier[field] as string[] | null) || [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onChange({ ...tier, [field]: updated });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{tier.id ? t('tiers.edit_tier') : t('tiers.add_tier')}</DialogTitle>
          <DialogDescription>{t('tiers.demographic_criteria')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6">
            {/* Section A: Basic Info */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('tiers.basic_info')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">{t('tiers.tier_name')}</Label>
                  <Input value={tier.name || ''} onChange={e => {
                    const name = e.target.value;
                    const code = tier.id ? tier.tier_code : name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10);
                    update({ name, tier_code: code } as Partial<AgentTier>);
                  }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('tiers.tier_name_ar')}</Label>
                  <Input value={tier.name_ar || ''} onChange={e => update({ name_ar: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">{t('tiers.tier_code')}</Label>
                  <Input value={tier.tier_code || ''} onChange={e => update({ tier_code: e.target.value.toUpperCase() } as Partial<AgentTier>)} disabled={!!tier.id} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('tiers.tier_icon', { defaultValue: 'Icon' })}</Label>
                  <div className="flex items-center gap-3">
                    <IconPicker value={tier.icon || null} onChange={v => update({ icon: v })} color={tier.color || '#6B7280'} />
                    <span className="text-xs text-muted-foreground">{tier.icon || 'shield'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.tier_color')}</Label>
                <div className="flex flex-wrap gap-2">
                  {AGENT_DEMOGRAPHICS.tier_colors.map(c => (
                    <button key={c.value} type="button"
                      className={cn('h-8 w-8 rounded-full border-2 transition-all', tier.color === c.value ? 'border-foreground scale-110' : 'border-transparent')}
                      style={{ backgroundColor: c.value }}
                      onClick={() => update({ color: c.value })}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">{t('tiers.description', { defaultValue: 'Description' })}</Label>
                  <Textarea value={tier.description || ''} onChange={e => update({ description: e.target.value })} rows={2} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('tiers.description', { defaultValue: 'Description' })} (AR)</Label>
                  <Textarea value={tier.description_ar || ''} onChange={e => update({ description_ar: e.target.value })} rows={2} dir="rtl" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section B: Demographic Criteria */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('tiers.demographic_criteria')}</Label>

              {/* Age */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.age_range')}</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" placeholder={t('tiers.min_age')} className="w-24" value={tier.min_age ?? ''} onChange={e => update({ min_age: e.target.value ? parseInt(e.target.value) : null })} />
                  <span className="text-muted-foreground">—</span>
                  <Input type="number" placeholder={t('tiers.max_age')} className="w-24" value={tier.max_age ?? ''} onChange={e => update({ max_age: e.target.value ? parseInt(e.target.value) : null })} />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.gender')}</Label>
                <div className="flex gap-2">
                  {[null, 'male', 'female'].map(g => (
                    <button key={g ?? 'any'} type="button"
                      className={cn('px-3 py-1.5 border rounded text-xs transition-all',
                        tier.gender === g ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => update({ gender: g })}
                    >
                      {g === null ? t('tiers.any_gender') : g === 'male' ? t('tiers.male') : t('tiers.female')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cities */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.cities')}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_DEMOGRAPHICS.egyptian_cities.map(city => (
                    <button key={city} type="button"
                      className={cn('px-2 py-0.5 text-xs border rounded transition-all',
                        tier.cities?.includes(city) ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => toggleArrayItem('cities', city)}
                    >{city}</button>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.education')}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_DEMOGRAPHICS.education_levels.map(edu => (
                    <button key={edu} type="button"
                      className={cn('px-2 py-0.5 text-xs border rounded transition-all',
                        tier.education_levels?.includes(edu) ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => toggleArrayItem('education_levels', edu)}
                    >{t(`tiers.${edu}`, { defaultValue: edu })}</button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.languages')}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_DEMOGRAPHICS.languages.map(lang => (
                    <button key={lang} type="button"
                      className={cn('px-2 py-0.5 text-xs border rounded transition-all',
                        tier.languages?.includes(lang) ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => toggleArrayItem('languages', lang)}
                    >{lang.charAt(0).toUpperCase() + lang.slice(1)}</button>
                  ))}
                </div>
              </div>

              {/* Car/Motorcycle */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={tier.requires_car || false} onCheckedChange={v => update({ requires_car: v })} />
                  <Label className="text-xs">{t('tiers.has_car')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={tier.requires_motorcycle || false} onCheckedChange={v => update({ requires_motorcycle: v })} />
                  <Label className="text-xs">{t('tiers.has_motorcycle')}</Label>
                </div>
              </div>

              {/* Marital Status */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.marital_status')}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_DEMOGRAPHICS.marital_statuses.map(ms => (
                    <button key={ms} type="button"
                      className={cn('px-2 py-0.5 text-xs border rounded transition-all',
                        tier.marital_statuses?.includes(ms) ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => toggleArrayItem('marital_statuses', ms)}
                    >{t(`tiers.${ms}`, { defaultValue: ms })}</button>
                  ))}
                </div>
              </div>

              {/* Employment Status */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.employment_status')}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_DEMOGRAPHICS.employment_statuses.map(es => (
                    <button key={es} type="button"
                      className={cn('px-2 py-0.5 text-xs border rounded transition-all',
                        tier.employment_statuses?.includes(es) ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => toggleArrayItem('employment_statuses', es)}
                    >{t(`tiers.${es}`, { defaultValue: es })}</button>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.specializations')}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {AGENT_DEMOGRAPHICS.specializations.map(spec => (
                    <button key={spec} type="button"
                      className={cn('px-2 py-0.5 text-xs border rounded transition-all',
                        tier.specializations?.includes(spec) ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => toggleArrayItem('specializations', spec)}
                    >{spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</button>
                  ))}
                </div>
              </div>

              {/* Min Experience */}
              <div className="space-y-1">
                <Label className="text-xs">{t('tiers.min_experience')}</Label>
                <Input type="number" className="w-24" value={tier.min_experience_years ?? 0} onChange={e => update({ min_experience_years: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <Separator />

            {/* Section D: Performance Criteria */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('tiers.performance_criteria')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">{t('tiers.min_rating')}</Label>
                  <Input type="number" step="0.1" min="0" max="5" className="w-24" value={tier.min_rating ?? 0} onChange={e => update({ min_rating: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('tiers.min_visits')}</Label>
                  <Input type="number" min="0" className="w-24" value={tier.min_completed_visits ?? 0} onChange={e => update({ min_completed_visits: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Summary Preview */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">{t('tiers.criteria_summary')}</p>
              <p className="text-sm">
                {buildCriteriaSummary(tier, t)}
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('config.cancel')}</Button>
          <Button onClick={onSave} disabled={saving || !tier.name || !tier.tier_code}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {tier.id ? t('config.save') : t('tiers.add_tier')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildCriteriaSummary(tier: Partial<AgentTier>, t: (k: string, o?: Record<string, unknown>) => string): string {
  const parts: string[] = [];
  if (tier.gender) parts.push(tier.gender === 'male' ? t('tiers.male') : t('tiers.female'));
  if (tier.min_age != null || tier.max_age != null) parts.push(`aged ${tier.min_age ?? '?'}-${tier.max_age ?? '?'}`);
  if (tier.cities?.length) parts.push(`in ${tier.cities.join(', ')}`);
  if (tier.education_levels?.length) parts.push(`with ${tier.education_levels.map(e => t(`tiers.${e}`, { defaultValue: e })).join(' or ')}`);
  if (tier.requires_car) parts.push('who have a car');
  if (tier.requires_motorcycle) parts.push('who have a motorcycle');
  if (tier.languages?.length) parts.push(`speaking ${tier.languages.join(', ')}`);
  if (tier.specializations?.length) parts.push(`experienced in ${tier.specializations.join(', ')}`);
  if (tier.min_experience_years && tier.min_experience_years > 0) parts.push(`with ${tier.min_experience_years}+ years experience`);
  if ((tier.min_rating ?? 0) > 0) parts.push(`rating ≥ ${tier.min_rating}`);
  if ((tier.min_completed_visits ?? 0) > 0) parts.push(`≥ ${tier.min_completed_visits} visits`);

  return parts.length > 0
    ? `${parts.join(', ')}.`
    : t('tiers.all_agents');
}
