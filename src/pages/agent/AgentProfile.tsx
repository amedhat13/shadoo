import { AgentTopBar } from './AgentAppLayout';
import { ChevronRight, ClipboardList, Wallet, User, Bell, Shield, LogOut, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AgentProfile() {
  const nav = useNavigate();
  const items = [
    { icon: ClipboardList, label: 'My missions', to: '/agent-app/my-missions' },
    { icon: Wallet, label: 'Wallet', to: '/agent-app/wallet' },
    { icon: Bell, label: 'Notifications', to: '/agent-app/notifications' },
    { icon: User, label: 'Personal information' },
    { icon: Shield, label: 'Verification & documents' },
  ];
  return (
    <>
      <AgentTopBar title="Profile" />
      <div className="p-4 space-y-4">
        <div className="rounded-2xl border p-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">A</div>
          <div className="flex-1">
            <div className="font-bold">Ahmed Youssef</div>
            <div className="text-xs text-muted-foreground">ahmed@example.com</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] uppercase font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Tier A</span>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground ml-1">
                <Star className="h-3 w-3 fill-primary text-primary" /> 4.8 · 42 missions
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          {items.map((it, i) => (
            <button key={i} onClick={() => it.to && nav(it.to)}
              className="w-full flex items-center gap-3 p-4 border-b last:border-0 hover:bg-muted/40 text-left">
              <it.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{it.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button className="w-full flex items-center gap-2 justify-center rounded-xl border p-3 text-sm font-semibold text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );
}
