import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CURRENCY } from '@/lib/constants';
import { useTranslation } from 'react-i18next';

export interface PurchaseItem {
  id: string;
  name: string;
  budget: number;
}

interface PurchaseItemsListProps {
  items: PurchaseItem[];
  onChange: (items: PurchaseItem[]) => void;
}

export function PurchaseItemsList({ items, onChange }: PurchaseItemsListProps) {
  const { t } = useTranslation('missions');

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: crypto.randomUUID(),
      name: '',
      budget: 0,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<PurchaseItem>) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.id !== id));
  };

  const totalBudget = items.reduce((sum, item) => sum + (item.budget || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <ShoppingBag className="h-4 w-4" />
          {t('funding.purchase_items')}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          {t('funding.add_item')}
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex gap-3 items-start p-3 border border-border rounded-md bg-muted/30"
          >
            <div className="flex-1 space-y-2">
              <Input
                placeholder={t('funding.item_placeholder', { index: index + 1 })}
                value={item.name}
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
              />
            </div>
            <div className="relative w-32">
              <Input
                type="number"
                min={0}
                placeholder={t('funding.budget_label')}
                value={item.budget || ''}
                onChange={(e) =>
                  updateItem(item.id, { budget: parseFloat(e.target.value) || 0 })
                }
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                {CURRENCY.symbol}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              disabled={items.length <= 1}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
        <span className="text-muted-foreground">{t('funding.total_budget_per_visit')}</span>
        <span className="font-bold">
          {totalBudget.toLocaleString(CURRENCY.locale)} {CURRENCY.symbol}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {t('funding.purchase_items_help')}
      </p>
    </div>
  );
}
