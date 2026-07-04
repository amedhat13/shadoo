import { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import shadooLogo from '@/assets/shadoo-logo.png';
import {
  Plus,
  ArrowUp,
  Paperclip,
  FileText,
  BarChart3,
  TrendingUp,
  Sparkles,
  MessageSquarePlus,
  Bot,
  User as UserIcon,
  Trash2,
  Command,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

// ---- Visual types ----------------------------------------------------------
type KPI = { label: string; value: string; delta?: string; up?: boolean };
type Visual =
  | { kind: 'kpis'; items: KPI[] }
  | { kind: 'line'; title?: string; data: { name: string; value: number }[]; unit?: string }
  | { kind: 'bar'; title?: string; data: { name: string; value: number }[]; unit?: string }
  | { kind: 'ranking'; title?: string; items: { name: string; value: number; max: number; unit?: string }[] }
  | { kind: 'donut'; title?: string; data: { name: string; value: number }[] }
  | { kind: 'compare'; title?: string; a: string; b: string; rows: { label: string; a: number; b: number; unit?: string }[] };

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  visual?: Visual;
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
};

type Suggestion = {
  id: string;
  pill: string;
  prompt: string;
  answer: string;
  visual?: Visual;
};

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

// ---- Suggestions with rich visuals ----------------------------------------
const SUGGESTIONS: Suggestion[] = [
  {
    id: 'top-branch',
    pill: 'Top branch',
    prompt: 'Which branch performed best last month?',
    answer: `**Cairo Festival City** led all branches with a CX score of **91.4/100** across 24 visits. Service quality jumped 6 points; NPS is nearly 2× the industry benchmark.`,
    visual: {
      kind: 'ranking',
      title: 'Top branches — Overall CX (last 30 days)',
      items: [
        { name: 'Cairo Festival City', value: 91.4, max: 100 },
        { name: 'Mall of Arabia – Giza', value: 88.7, max: 100 },
        { name: 'Nasr City', value: 86.1, max: 100 },
        { name: 'Heliopolis', value: 84.9, max: 100 },
        { name: 'New Cairo', value: 82.3, max: 100 },
      ],
    },
  },
  {
    id: 'nps-trend',
    pill: 'NPS trend',
    prompt: 'Show me the NPS trend for the last 6 months.',
    answer: `NPS has climbed **+23 points** in six months, driven by Heliopolis and Nasr City. Detractor mentions dropped 38%.`,
    visual: {
      kind: 'line',
      title: 'Net Promoter Score — last 6 months',
      unit: '',
      data: [
        { name: 'Jan', value: 41 },
        { name: 'Feb', value: 45 },
        { name: 'Mar', value: 48 },
        { name: 'Apr', value: 52 },
        { name: 'May', value: 58 },
        { name: 'Jun', value: 64 },
      ],
    },
  },
  {
    id: 'agent-quality',
    pill: 'Agent quality',
    prompt: 'Are my agents catching real issues?',
    answer: `Yes — agent submissions are reliable this quarter. Approval rate **91%**, photo compliance **96%**. Watch agent **Karim H.** — 4 rushed visits.`,
    visual: {
      kind: 'kpis',
      items: [
        { label: 'Approval rate', value: '91%', delta: '+3pp', up: true },
        { label: 'Photo compliance', value: '96%', delta: '+1pp', up: true },
        { label: 'Avg rating given', value: '4.6/5', delta: '+0.2', up: true },
        { label: 'Rejections', value: '9', delta: '-4', up: true },
      ],
    },
  },
  {
    id: 'geo-weakness',
    pill: 'Weak areas',
    prompt: 'Where am I underperforming geographically?',
    answer: `Three areas need attention: **Alexandria – Smouha** (staff knowledge), **Giza – Dokki** (cleanliness slipping), **Cairo – Maadi** (NPS turned negative).`,
    visual: {
      kind: 'ranking',
      title: 'Weakest branches — CX score',
      items: [
        { name: 'Alexandria – Smouha', value: 68, max: 100 },
        { name: 'Giza – Dokki', value: 72, max: 100 },
        { name: 'Cairo – Maadi', value: 74, max: 100 },
        { name: 'Alexandria – Sidi Gaber', value: 77, max: 100 },
      ],
    },
  },
  {
    id: 'complaints',
    pill: 'Top complaints',
    prompt: 'What are customers complaining about most?',
    answer: `Across 87 open-ended responses this month. Sentiment is **62% positive**, negative share shrank from 21% to 14%.`,
    visual: {
      kind: 'bar',
      title: 'Complaint themes — mentions this month',
      data: [
        { name: 'Wait time', value: 24 },
        { name: 'Out of stock', value: 19 },
        { name: 'Staff attention', value: 11 },
        { name: 'Temperature', value: 8 },
        { name: 'Restrooms', value: 6 },
      ],
    },
  },
  {
    id: 'roi',
    pill: 'Mission ROI',
    prompt: 'What is my ROI on missions this quarter?',
    answer: `You invested **48,750 EGP** across 65 visits. Estimated recovered revenue from flagged issues: **~180,000 EGP** — a **~3.7× ROI**.`,
    visual: {
      kind: 'kpis',
      items: [
        { label: 'Spend', value: '48,750 EGP' },
        { label: 'Recovered value', value: '~180,000 EGP', delta: '+3.7×', up: true },
        { label: 'Issues fixed', value: '3', delta: 'ops', up: true },
        { label: 'Avg / visit', value: '750 EGP' },
      ],
    },
  },
  {
    id: 'compare',
    pill: 'Compare branches',
    prompt: 'Compare Cairo Festival City vs Mall of Arabia side by side.',
    answer: `**Cairo Festival City** wins on service and NPS. **Mall of Arabia** is slightly cleaner and faster at checkout.`,
    visual: {
      kind: 'compare',
      title: 'Head-to-head — last 30 days',
      a: 'Cairo Festival City',
      b: 'Mall of Arabia',
      rows: [
        { label: 'Overall CX', a: 91.4, b: 88.7 },
        { label: 'NPS', a: 72, b: 61 },
        { label: 'Cleanliness', a: 92, b: 93 },
        { label: 'Service Quality', a: 94, b: 87 },
        { label: 'Wait Time', a: 82, b: 85 },
        { label: 'Visits', a: 24, b: 19 },
      ],
    },
  },
  {
    id: 'exec-summary',
    pill: 'Exec summary',
    prompt: "Draft an executive summary of this month's performance.",
    answer: `**June was a strong month.** Overall CX **86.2** (+2.1 MoM) across 65 visits in 12 branches. NPS **+64** — the year's best. Watch-out: wait time is the emerging #1 complaint.`,
    visual: {
      kind: 'kpis',
      items: [
        { label: 'Overall CX', value: '86.2', delta: '+2.1', up: true },
        { label: 'NPS', value: '+64', delta: '+6', up: true },
        { label: 'Visits', value: '65', delta: '+8', up: true },
        { label: 'Complaints', value: '87', delta: '-12', up: true },
      ],
    },
  },
];

const QUICK_COMMANDS = [
  { id: 'q1', label: 'Compare two branches side-by-side', icon: BarChart3 },
  { id: 'q2', label: 'Draft an executive summary email', icon: FileText },
  { id: 'q3', label: "Find anomalies in this month's visits", icon: Sparkles },
  { id: 'q4', label: 'Suggest which branches need attention', icon: TrendingUp },
];

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'seed-1',
    title: 'June monthly CX summary',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    messages: [
      { id: 'a', role: 'user', content: 'Give me a June monthly CX summary.' },
      { id: 'b', role: 'assistant', content: SUGGESTIONS[7].answer, visual: SUGGESTIONS[7].visual },
    ],
  },
  {
    id: 'seed-2',
    title: 'Cairo region branch comparison',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    messages: [
      { id: 'a', role: 'user', content: 'Compare Cairo branches.' },
      { id: 'b', role: 'assistant', content: SUGGESTIONS[6].answer, visual: SUGGESTIONS[6].visual },
    ],
  },
  {
    id: 'seed-3',
    title: 'Where should I focus next?',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    messages: [
      { id: 'a', role: 'user', content: 'Where am I underperforming?' },
      { id: 'b', role: 'assistant', content: SUGGESTIONS[3].answer, visual: SUGGESTIONS[3].visual },
    ],
  },
];

// ---- Markdown (inline only) -----------------------------------------------
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-2" />;
    const isBullet = /^\s*[-*]\s/.test(line);
    const isNumbered = /^\s*\d+\.\s/.test(line);
    const clean = line.replace(/^\s*[-*]\s/, '').replace(/^\s*\d+\.\s/, '');
    const parts = clean.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        : <span key={j}>{part}</span>
    );
    if (isBullet || isNumbered) {
      return (
        <div key={i} className="flex gap-2 my-1">
          <span className="text-muted-foreground shrink-0">
            {isNumbered ? line.match(/^\s*(\d+)\./)?.[1] + '.' : '•'}
          </span>
          <div>{parts}</div>
        </div>
      );
    }
    return <p key={i} className="my-1 leading-relaxed">{parts}</p>;
  });
}

// ---- Visual renderer -------------------------------------------------------
function VisualBlock({ v }: { v: Visual }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-card p-4">
      {'title' in v && v.title && (
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{v.title}</div>
      )}
      {v.kind === 'kpis' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {v.items.map((k, i) => (
            <div key={i} className="rounded-lg border border-border/60 bg-background p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="text-lg font-black mt-1">{k.value}</div>
              {k.delta && (
                <div className={cn('flex items-center gap-1 text-[11px] mt-0.5', k.up ? 'text-emerald-600' : 'text-red-600')}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {k.delta}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {v.kind === 'line' && (
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={v.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {v.kind === 'bar' && (
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={v.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {v.kind === 'donut' && (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={v.data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {v.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {v.kind === 'ranking' && (
        <div className="space-y-2.5">
          {v.items.map((r, i) => {
            const pct = (r.value / r.max) * 100;
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{r.name}</span>
                  <span className="font-mono font-semibold">{r.value}{r.unit ?? ''}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {v.kind === 'compare' && (
        <div>
          <div className="grid grid-cols-3 gap-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground pb-2 border-b border-border">
            <div>Metric</div>
            <div className="text-center">{v.a}</div>
            <div className="text-center">{v.b}</div>
          </div>
          {v.rows.map((r, i) => {
            const aWins = r.a > r.b;
            const bWins = r.b > r.a;
            return (
              <div key={i} className="grid grid-cols-3 gap-2 py-2 border-b border-border/50 text-sm items-center">
                <div className="text-muted-foreground">{r.label}</div>
                <div className={cn('text-center font-mono font-semibold', aWins && 'text-primary')}>
                  {r.a}{r.unit ?? ''} {aWins && <TrendingUp className="inline h-3 w-3 ms-1" />}
                </div>
                <div className={cn('text-center font-mono font-semibold', bWins && 'text-primary')}>
                  {r.b}{r.unit ?? ''} {bWins && <TrendingUp className="inline h-3 w-3 ms-1" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function findSuggestion(query: string): Suggestion | null {
  const q = query.toLowerCase().trim();
  return (
    SUGGESTIONS.find(s => s.prompt.toLowerCase() === q) ||
    SUGGESTIONS.find(s => {
      const words = s.prompt.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      return words.some(w => q.includes(w));
    }) ||
    null
  );
}

function fallbackAnswer(query: string): { content: string; visual: Visual } {
  return {
    content: `Here's a quick pulse on your data for **"${query}"**. Ask me something more specific — a branch name, a metric, a timeframe — and I'll dig deeper.`,
    visual: {
      kind: 'kpis',
      items: [
        { label: 'Overall CX', value: '86.2', delta: '+2.1', up: true },
        { label: 'NPS', value: '+64', delta: '+6', up: true },
        { label: 'Visits (30d)', value: '65', delta: '+8', up: true },
        { label: 'Branches', value: '12' },
      ],
    },
  };
}

function formatRelative(ts: number) {
  const d = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

// ---- + menu ----------------------------------------------------------------
function ComposerPlusMenu({ onInsertPrompt }: { onInsertPrompt: (p: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Paperclip className="h-4 w-4 me-2" />
            Attach
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-60">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">Attach</DropdownMenuLabel>
              <DropdownMenuItem>
                <Paperclip className="h-4 w-4 me-2" />
                Upload file (CSV, PDF, image)
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 me-2" />
                Attach a saved report
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Command className="h-4 w-4 me-2" />
            Commands
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-64">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">Ready-made commands</DropdownMenuLabel>
              {QUICK_COMMANDS.map(c => {
                const Icon = c.icon;
                return (
                  <DropdownMenuItem key={c.id} onClick={() => onInsertPrompt(c.label)}>
                    <Icon className="h-4 w-4 me-2" />
                    {c.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---- Page ------------------------------------------------------------------
export default function ReportsV2Page() {
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find(c => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const isEmpty = !active;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, thinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  const startNew = () => {
    setActiveId(null);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed };

    let convoId = activeId;
    if (!convoId) {
      convoId = crypto.randomUUID();
      const title = trimmed.length > 42 ? trimmed.slice(0, 42) + '…' : trimmed;
      setConversations(cs => [{ id: convoId!, title, updatedAt: Date.now(), messages: [userMsg] }, ...cs]);
      setActiveId(convoId);
    } else {
      setConversations(cs => cs.map(c => c.id === convoId
        ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() }
        : c));
    }
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const hit = findSuggestion(trimmed);
      const asstMsg: Message = hit
        ? { id: crypto.randomUUID(), role: 'assistant', content: hit.answer, visual: hit.visual }
        : { id: crypto.randomUUID(), role: 'assistant', ...fallbackAnswer(trimmed) };
      setConversations(cs => cs.map(c => c.id === convoId
        ? { ...c, messages: [...c.messages, asstMsg], updatedAt: Date.now() }
        : c));
      setThinking(false);
    }, 700);
  };

  const insertPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const deleteConvo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(cs => cs.filter(c => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-[calc(100vh-8rem)] -mx-4 md:-mx-6 -my-4 md:-my-6 px-4 md:px-6 py-4 md:py-6">
        {/* Secondary nav — Recent Conversations */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-e border-border pe-4">
          <Button onClick={startNew} variant="outline" className="justify-start gap-2 mb-3">
            <MessageSquarePlus className="h-4 w-4" />
            New conversation
          </Button>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
            Recent conversations
          </div>
          <ScrollArea className="flex-1 -me-2 pe-2">
            <div className="space-y-0.5">
              {conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    'group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-sm transition-colors',
                    activeId === c.id ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-foreground/80'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">{formatRelative(c.updatedAt)}</div>
                  </div>
                  <button
                    onClick={(e) => deleteConvo(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded transition"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="text-xs text-muted-foreground px-2 py-4 text-center">No conversations yet</div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 max-w-3xl mx-auto w-full">
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <img src={shadooLogo} alt="Shadoo" className="h-12 w-auto mb-5" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">Meet Shadoo AI</h1>
              <p className="text-sm md:text-base text-muted-foreground text-center max-w-lg mb-8 leading-relaxed">
                Ask anything about your branches, agents, and visits — get straight answers with charts, in seconds.
              </p>

              <div className="w-full max-w-2xl">
                <div className="rounded-2xl border border-border bg-card shadow-lg focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 transition">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
                    }}
                    placeholder="Ask Shadoo about your branches, agents, visits, or trends…"
                    rows={2}
                    className="resize-none border-0 shadow-none focus-visible:ring-0 min-h-[72px] max-h-40 bg-transparent px-5 pt-4 text-base"
                  />
                  <div className="flex items-center justify-between px-2 pb-2">
                    <ComposerPlusMenu onInsertPrompt={insertPrompt} />
                    <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || thinking} className="h-9 w-9 rounded-full">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => insertPrompt(s.prompt)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground transition"
                    >
                      {s.pill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <img src={shadooLogo} alt="Shadoo" className="h-7 w-auto" />
                <div className="min-w-0">
                  <h1 className="text-sm font-black uppercase tracking-wide truncate">{active!.title}</h1>
                  <p className="text-[11px] text-muted-foreground">Shadoo AI</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6">
                {messages.map(msg => (
                  <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                      msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'
                    )}>
                      {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                    </div>
                    <div className={cn('flex-1 min-w-0', msg.role === 'user' ? 'max-w-[85%] flex justify-end' : 'max-w-full')}>
                      {msg.role === 'user' ? (
                        <div className="inline-block bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="text-sm text-foreground/90 w-full">
                          {renderMarkdown(msg.content)}
                          {msg.visual && <VisualBlock v={msg.visual} />}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 pt-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pb-2">
                <div className="rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
                    }}
                    placeholder="Ask a follow-up…"
                    rows={1}
                    className="resize-none border-0 shadow-none focus-visible:ring-0 min-h-[52px] max-h-40 bg-transparent px-4 pt-3.5"
                  />
                  <div className="flex items-center justify-between px-2 pb-2">
                    <ComposerPlusMenu onInsertPrompt={insertPrompt} />
                    <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || thinking} className="h-8 w-8 rounded-full">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
