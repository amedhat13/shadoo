import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { SubscriptionPlan } from '@/hooks/useSubscriptionPlans';

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
  onSave: (data: {
    name: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    price: number;
    visits_per_month: number;
    currency?: string;
    billing_period?: string;
    features?: string[];
    is_active?: boolean;
  }) => Promise<void>;
  isSaving: boolean;
}

export function PlanFormDialog({ open, onOpenChange, plan, onSave, isSaving }: PlanFormDialogProps) {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [price, setPrice] = useState(0);
  const [visits, setVisits] = useState(0);
  const [currency, setCurrency] = useState('EGP');
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [isActive, setIsActive] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setNameAr(plan.name_ar || '');
      setDescription(plan.description || '');
      setDescriptionAr(plan.description_ar || '');
      setPrice(plan.price);
      setVisits(plan.visits_per_month);
      setCurrency(plan.currency);
      setBillingPeriod(plan.billing_period);
      setIsActive(plan.is_active);
      setFeatures(Array.isArray(plan.features) ? plan.features : []);
    } else {
      setName(''); setNameAr(''); setDescription(''); setDescriptionAr('');
      setPrice(0); setVisits(0); setCurrency('EGP'); setBillingPeriod('monthly');
      setIsActive(true); setFeatures([]); setNewFeature('');
    }
  }, [plan, open]);

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (idx: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    await onSave({
      name, name_ar: nameAr, description, description_ar: descriptionAr,
      price, visits_per_month: visits, currency, billing_period: billingPeriod,
      features, is_active: isActive,
    });
    onOpenChange(false);
  };

  const isEdit = !!plan;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <DialogTitle className="font-black uppercase tracking-tight">
            {isEdit ? t('plans.edit_plan') : t('plans.create_plan')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wide">{t('plans.plan_name')} *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('english')}</span>
                <Input value={name} onChange={e => setName(e.target.value)} dir="ltr" placeholder="e.g. Pro" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('arabic')}</span>
                <Input value={nameAr} onChange={e => setNameAr(e.target.value)} dir="rtl" className="font-ar" placeholder="مثال: احترافي" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wide">{t('plans.plan_description')}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('english')}</span>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} dir="ltr" rows={2} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('arabic')}</span>
                <Textarea value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} dir="rtl" className="font-ar" rows={2} />
              </div>
            </div>
          </div>

          {/* Price & Visits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wide">{t('plans.price')} *</Label>
              <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wide">{t('plans.visits_per_month')} *</Label>
              <Input type="number" value={visits} onChange={e => setVisits(Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wide">{t('plans.currency')}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">EGP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wide">{t('plans.billing_period')}</Label>
              <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('plans.monthly')}</SelectItem>
                  <SelectItem value="yearly">{t('plans.yearly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-sm">{t('plans.active')}</Label>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wide">{t('plans.features')}</Label>
            <div className="flex flex-wrap gap-2">
              {features.map((f, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pe-1">
                  {f}
                  <button onClick={() => removeFeature(i)} className="ms-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                placeholder={t('plans.feature_placeholder')}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addFeature} className="gap-1 shrink-0">
                <Plus className="h-4 w-4" />
                {tc('add')}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tc('cancel')}</Button>
          <Button onClick={handleSave} disabled={!name.trim() || price <= 0 || visits <= 0 || isSaving}>
            {isSaving ? tc('saving') : isEdit ? tc('save') : t('plans.create_plan')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
