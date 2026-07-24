import { AgentTopBar } from './AgentAppLayout';
import { Bell, CheckCircle2, AlertCircle, Coins } from 'lucide-react';

const NOTIFS = [
  { id: 1, icon: Coins, tone: 'emerald', title: 'Payout received', body: '650 EGP added to your wallet for Tamara — Almaza.', time: '2 hours ago' },
  { id: 2, icon: CheckCircle2, tone: 'primary', title: 'Visit approved', body: 'Your TBS Korba visit passed review.', time: 'Yesterday' },
  { id: 3, icon: AlertCircle, tone: 'amber', title: 'Mission deadline soon', body: 'Vodafone City Stars ends in 12 hours.', time: '2 days ago' },
];

export default function AgentNotifications() {
  return (
    <>
      <AgentTopBar title="Notifications" showBack />
      <div className="p-4 space-y-2">
        {NOTIFS.map((n) => (
          <div key={n.id} className="rounded-xl border p-3 flex gap-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <n.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{n.title}</div>
              <div className="text-xs text-muted-foreground">{n.body}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
