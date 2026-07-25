import { useState } from 'react';
import { AgentTopBar } from './AgentAppLayout';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, Building2, User, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const TX = [
  { id: 1, label: 'Tamara — Almaza payout', amount: 650, date: '5 days ago', status: 'done' },
  { id: 2, label: 'Withdraw to bank', amount: -500, date: '8 days ago', status: 'done' },
  { id: 3, label: 'TBS Korba — pending review', amount: 380, date: '1 day ago', status: 'pending' },
  { id: 4, label: 'Vodafone City Stars', amount: 150, date: '3 weeks ago', status: 'done' },
];

type Step = 'intro' | 'identity' | 'payout' | 'review';

function WalletSetup({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>('intro');
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [method, setMethod] = useState<'bank' | 'wallet' | ''>('');
  const [account, setAccount] = useState('');
  const [bank, setBank] = useState('');

  const stepIndex = { intro: 0, identity: 1, payout: 2, review: 3 }[step];

  return (
    <div className="p-4 space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full', i <= stepIndex ? 'bg-primary' : 'bg-muted')} />
        ))}
      </div>

      {step === 'intro' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5">
            <div className="text-[11px] uppercase font-bold tracking-widest opacity-80">Shadoo Wallet</div>
            <div className="text-xl font-bold mt-1 leading-tight">Set up your wallet<br/>to receive payouts</div>
            <p className="text-xs opacity-90 mt-2">
              Add your identity and payout method to start earning from missions.
            </p>
          </div>

          <div className="space-y-2">
            {[
              { icon: Shield, title: 'Verify your identity', sub: 'National ID for secure payouts' },
              { icon: Building2, title: 'Add a payout method', sub: 'Bank account or mobile wallet' },
              { icon: CheckCircle2, title: 'Start earning', sub: 'Payouts within 24h of approval' },
            ].map((it, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <it.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{it.title}</div>
                  <div className="text-xs text-muted-foreground">{it.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full h-11" onClick={() => setStep('identity')}>
            Get started
          </Button>
        </div>
      )}

      {step === 'identity' && (
        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase font-bold text-primary tracking-widest">Step 1 of 3</div>
            <h2 className="text-lg font-bold mt-1">Verify your identity</h2>
            <p className="text-xs text-muted-foreground">Required for secure payouts to your account.</p>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Full name (as on ID)</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmed Mohamed Ali" />
            </div>
            <div>
              <Label className="text-xs">National ID number</Label>
              <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="14-digit ID" maxLength={14} inputMode="numeric" />
            </div>
          </div>
          <Button className="w-full h-11" disabled={!fullName || nationalId.length < 14} onClick={() => setStep('payout')}>
            Continue
          </Button>
        </div>
      )}

      {step === 'payout' && (
        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase font-bold text-primary tracking-widest">Step 2 of 3</div>
            <h2 className="text-lg font-bold mt-1">Choose payout method</h2>
            <p className="text-xs text-muted-foreground">Where should we send your earnings?</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMethod('bank')}
              className={cn('rounded-xl border p-3 text-left space-y-1',
                method === 'bank' ? 'border-primary bg-primary/5' : 'border-border')}
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div className="text-sm font-semibold">Bank account</div>
              <div className="text-[10px] text-muted-foreground">IBAN transfer, 1–2 days</div>
            </button>
            <button
              onClick={() => setMethod('wallet')}
              className={cn('rounded-xl border p-3 text-left space-y-1',
                method === 'wallet' ? 'border-primary bg-primary/5' : 'border-border')}
            >
              <User className="h-5 w-5 text-primary" />
              <div className="text-sm font-semibold">Mobile wallet</div>
              <div className="text-[10px] text-muted-foreground">Vodafone Cash, Instapay</div>
            </button>
          </div>

          {method === 'bank' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Bank name</Label>
                <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="CIB, Banque Misr, ..." />
              </div>
              <div>
                <Label className="text-xs">IBAN / Account number</Label>
                <Input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="EG.." />
              </div>
            </div>
          )}
          {method === 'wallet' && (
            <div>
              <Label className="text-xs">Mobile wallet number</Label>
              <Input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="010xxxxxxxx" inputMode="numeric" />
            </div>
          )}

          <Button className="w-full h-11" disabled={!method || !account} onClick={() => setStep('review')}>
            Continue
          </Button>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase font-bold text-primary tracking-widest">Step 3 of 3</div>
            <h2 className="text-lg font-bold mt-1">Review & confirm</h2>
          </div>
          <div className="rounded-xl border divide-y">
            <div className="p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Full name</span><span className="font-semibold">{fullName}</span>
            </div>
            <div className="p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">National ID</span><span className="font-semibold">••••{nationalId.slice(-4)}</span>
            </div>
            <div className="p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Payout method</span>
              <span className="font-semibold">{method === 'bank' ? `Bank · ${bank}` : 'Mobile wallet'}</span>
            </div>
            <div className="p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Account</span>
              <span className="font-semibold">••••{account.slice(-4)}</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            By confirming you agree to Shadoo's payout terms. Identity verification usually completes within 1 business day.
          </p>
          <Button className="w-full h-11" onClick={onDone}>
            Activate wallet
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AgentWallet() {
  const [setup, setSetup] = useState(() => {
    try {
      return localStorage.getItem('agent-wallet-setup') === 'done';
    } catch {
      return false;
    }
  });

  const finish = () => {
    try { localStorage.setItem('agent-wallet-setup', 'done'); } catch {}
    setSetup(true);
  };

  return (
    <>
      <AgentTopBar
        title="Wallet"
        right={setup ? (
          <button
            onClick={() => { try { localStorage.removeItem('agent-wallet-setup'); } catch {} setSetup(false); }}
            className="text-[10px] uppercase font-semibold text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        ) : undefined}
      />

      {!setup ? (
        <WalletSetup onDone={finish} />
      ) : (
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
      )}
    </>
  );
}
