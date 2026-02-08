import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { CURRENCY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';

export interface Transaction {
  id: string;
  type: 'topup' | 'allocation' | 'release';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { t } = useTranslation('wallet');
  const { isRTL } = useLanguage();

  const TYPE_CONFIG = {
    topup: {
      icon: ArrowDownLeft,
      label: t('transaction_types.topup'),
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
    },
    allocation: {
      icon: ArrowUpRight,
      label: t('transaction_types.allocation'),
      colorClass: 'text-foreground',
      bgClass: 'bg-muted',
    },
    release: {
      icon: ArrowDownLeft,
      label: t('transaction_types.release'),
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
    },
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          {t('no_transactions')}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((tx) => {
        const config = TYPE_CONFIG[tx.type];
        const Icon = config.icon;
        const isPositive = tx.type === 'topup' || tx.type === 'release';

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div className={cn('flex h-8 w-8 items-center justify-center', config.bgClass)}>
                <Icon className={cn('h-4 w-4', config.colorClass)} />
              </div>
              <div>
                <div className="text-sm font-medium">{tx.description}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(tx.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-EG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
            <div className={cn('text-sm font-bold', isPositive ? 'text-success' : 'text-foreground')}>
              {isPositive ? '+' : '-'}{tx.amount.toLocaleString(isRTL ? 'ar-EG' : CURRENCY.locale)} {CURRENCY.symbol}
            </div>
          </div>
        );
      })}
    </div>
  );
}