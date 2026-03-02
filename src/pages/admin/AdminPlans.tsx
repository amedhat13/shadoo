import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { CreditCard, Plus, Edit2, Users, CheckCircle2 } from 'lucide-react';
import { useSubscriptionPlans, SubscriptionPlan } from '@/hooks/useSubscriptionPlans';
import { PlanFormDialog } from '@/components/admin/plans/PlanFormDialog';
import { LoadingState } from '@/components/common/LoadingState';

export default function AdminPlansPage() {
  const { t, i18n } = useTranslation('admin');
  const isRTL = i18n.dir() === 'rtl';
  const { plans, isLoading, activePlans, createPlan, updatePlan, isCreating, isUpdating } = useSubscriptionPlans();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const openCreate = () => { setEditingPlan(null); setFormOpen(true); };
  const openEdit = (p: SubscriptionPlan) => { setEditingPlan(p); setFormOpen(true); };

  const handleSave = async (data: any) => {
    if (editingPlan) {
      await updatePlan({ id: editingPlan.id, ...data });
    } else {
      await createPlan(data);
    }
  };

  const getName = (p: SubscriptionPlan) => isRTL && p.name_ar ? p.name_ar : p.name;

  const formatCurrency = (amount: number, currency: string) => {
    if (isRTL) return `${amount.toLocaleString('ar-EG')} ${currency === 'EGP' ? 'ج.م' : currency}`;
    return `${amount.toLocaleString()} ${currency}`;
  };

  const totalMRR = plans.filter(p => p.is_active).reduce((sum, p) => sum + p.price, 0);

  if (isLoading) return <AdminLayout><LoadingState /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('plans.title')}
          description={t('plans.description')}
          actions={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t('plans.create_plan')}
            </Button>
          }
        />

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-start">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('plans.active_plans')}</p>
                  <p className="text-2xl font-black">{activePlans.length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-start">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('plans.all_plans')}</p>
                  <p className="text-2xl font-black">{plans.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-start">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('plans.mrr')}</p>
                  <p className="text-2xl font-black text-success">{formatCurrency(totalMRR, 'EGP')}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('plans.all_plans')}</CardTitle>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('plans.no_plans')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">{t('plans.plan_name')}</TableHead>
                    <TableHead className="text-start">{t('plans.price')}</TableHead>
                    <TableHead className="text-start">{t('plans.visits_per_month')}</TableHead>
                    <TableHead className="text-start">{t('plans.billing_period')}</TableHead>
                    <TableHead className="text-start">{t('plans.features')}</TableHead>
                    <TableHead className="text-start">{t('config.status')}</TableHead>
                    <TableHead className="text-end">{t('config.edit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map(plan => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium text-start">{getName(plan)}</TableCell>
                      <TableCell className="font-bold text-start">{formatCurrency(plan.price, plan.currency)}</TableCell>
                      <TableCell className="text-start">{plan.visits_per_month}</TableCell>
                      <TableCell className="text-start">
                        <Badge variant="outline">{plan.billing_period === 'monthly' ? t('plans.monthly') : t('plans.yearly')}</Badge>
                      </TableCell>
                      <TableCell className="text-start">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {Array.isArray(plan.features) && plan.features.slice(0, 2).map((f: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                          ))}
                          {Array.isArray(plan.features) && plan.features.length > 2 && (
                            <Badge variant="secondary" className="text-xs">+{plan.features.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-start">
                        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                          {plan.is_active ? t('plans.active') : t('plans.archived')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(plan)}>
                          <Edit2 className="h-3 w-3" />
                          {t('config.edit')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <PlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={editingPlan}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />
    </AdminLayout>
  );
}
