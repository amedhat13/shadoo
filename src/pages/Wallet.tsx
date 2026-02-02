import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { WalletCard } from '@/components/wallet/WalletCard';
import { TopUpDialog } from '@/components/wallet/TopUpDialog';
import { TransactionList } from '@/components/wallet/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';

export default function WalletPage() {
  const { wallet, transactions, topUp } = useWallet();

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Wallet"
          description="Manage your balance and view funds allocated to missions."
          actions={<TopUpDialog onTopUp={topUp} />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <WalletCard
              availableBalance={wallet.available_balance}
              allocatedToMissions={wallet.allocated_to_missions}
            />
          </div>

          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions.slice(0, 5)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
