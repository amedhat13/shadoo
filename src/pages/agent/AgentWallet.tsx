import { AgentTopBar } from './AgentAppLayout';
import { Coins, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TX = [
  { id: 1, label: 'Tamara — Almaza payout', amount: 650, date: '5 days ago', status: 'done' },
  { id: 2, label: 'Withdraw to bank', amount: -500, date: '8 days ago', status: 'done' },
  { id: 3, label: 'TBS Korba — pending review', amount: 380, date: '1 day ago', status: 'pending' },
  { id: 4, label: 'Vodafone City Stars', amount: 150, date: '3 weeks ago', status: 'done' },
];

export default function AgentWallet() {
  return (
    <>
      <AgentTopBar title="Wallet" />
      <div className="p-4 space-y-4">
        <div className="rounded-2xl bg-primary text-primary-foreground p-5">
          <div className="text-xs uppercase font-semibold opacity-80">Available balance</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold">1,240</span>
            <span className="text-sm opacity-90">EGP</span>
          </div>
          <div className="text-xs opacity-80 mt-1">+ 380 EGP pending</div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" className="flex-1">Withdraw</Button>
            <Button variant="secondary" className="flex-1">History</Button>
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase font-bold tracking-wide mb-2">Recent transactions</h3>
          <div className="space-y-2">
            {TX.map((t) => (
              <div key={t.id} className="rounded-xl border p-3 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${t.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-muted'}`}>
                  {t.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{t.label}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {t.status === 'pending' ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                    {t.date}
                  </div>
                </div>
                <div className={`font-bold text-sm ${t.amount > 0 ? 'text-emerald-600' : ''}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount} EGP
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
