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
} from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
};

type Suggestion = {
  id: string;
  pill: string; // short 3-4 words
  prompt: string; // full prompt inserted into box
  answer: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'top-branch',
    pill: 'Top branch',
    prompt: 'Which branch performed best last month?',
    answer: `**Cairo Festival City** led all branches last month with an overall CX score of **91.4/100** across 24 completed visits.

Key drivers:
- **Service Quality**: 94/100 (up 6 points vs previous month)
- **Cleanliness**: 92/100
- **NPS**: +72 (industry benchmark: +40)
- **Staff Friendliness**: 4.8/5 avg

Second place: **Mall of Arabia – Giza** at 88.7/100.
Weakest area across all branches this month was **Wait Time Perception** (avg 78/100) — worth flagging for operations.`,
  },
  {
    id: 'nps-trend',
    pill: 'NPS trend',
    prompt: 'Show me the NPS trend for the last 6 months.',
    answer: `Your NPS has climbed steadily over the last 6 months:

- Jan: **+41**
- Feb: **+45**
- Mar: **+48**
- Apr: **+52**
- May: **+58**
- Jun: **+64** ← current

That's a **+23 point improvement** in half a year, mostly driven by Heliopolis and Nasr City locations. Detractor mentions dropped 38%.

Want me to break this down by branch or by methodology?`,
  },
  {
    id: 'agent-quality',
    pill: 'Agent quality',
    prompt: 'Are my agents catching real issues?',
    answer: `Yes — agent submissions look reliable this quarter.

- **Approval rate**: 91% (114 approved / 125 submitted)
- **Photo compliance**: 96%
- **Rejection reasons**: mostly incomplete answers (7), only 2 flagged as low-quality
- **Avg agent rating** you've given: **4.6/5**

Top performers: Ahmed M. (4.9), Salma K. (4.8), Youssef R. (4.8).

Recommendation: agent **Karim H.** submitted 4 rushed visits — worth a review before their next mission.`,
  },
  {
    id: 'geo-weakness',
    pill: 'Weak areas',
    prompt: 'Where am I underperforming geographically?',
    answer: `Three areas need attention:

1. **Alexandria – Smouha** — CX score **68/100** (12 points below your network avg). Main issue: staff product knowledge scored 61/100.
2. **Giza – Dokki** — Cleanliness dropped to **72/100** after being stable at 85+ all year.
3. **Cairo – Maadi** — NPS turned negative (-8) for the first time in 2026.

Everything in **Nasr City, Heliopolis, and New Cairo** is performing at or above target.`,
  },
  {
    id: 'complaints',
    pill: 'Top complaints',
    prompt: 'What are customers complaining about most?',
    answer: `Across 87 open-ended responses this month:

1. **Wait time at checkout** — 24 mentions (28%)
2. **Product availability** — 19 mentions (22%)
3. **Staff attentiveness** — 11 mentions (13%)
4. **Store temperature** — 8 mentions (9%)
5. **Restroom cleanliness** — 6 mentions (7%)

Sentiment: **62% positive, 24% neutral, 14% negative** — negative share shrank from 21% last month.`,
  },
  {
    id: 'roi',
    pill: 'Mission ROI',
    prompt: 'What is my ROI on missions this quarter?',
    answer: `This quarter you've invested **48,750 EGP** across 65 completed visits (avg **750 EGP/visit**).

- 3 operational issues fixed after mystery shopper flags (est. recovered revenue: **~180,000 EGP**).
- Staff training gap identified in 2 branches — training rolled out reduced complaint rate 34%.
- 1 compliance risk caught before any regulatory issue.

Estimated ROI: **~3.7×** on spend.`,
  },
  {
    id: 'compare',
    pill: 'Compare branches',
    prompt: 'Compare Cairo Festival City vs Mall of Arabia side by side.',
    answer: `**Head-to-head — last 30 days**

| Metric | Cairo Festival City | Mall of Arabia |
|---|---|---|
| Overall CX | **91.4** | 88.7 |
| NPS | **+72** | +61 |
| Cleanliness | 92 | **93** |
| Service Quality | **94** | 87 |
| Wait Time | 82 | **85** |
| Visits | 24 | 19 |

**Cairo Festival City** wins on service and NPS. **Mall of Arabia** is slightly cleaner and faster at checkout.`,
  },
  {
    id: 'exec-summary',
    pill: 'Exec summary',
    prompt: 'Draft an executive summary email of this month\'s performance.',
    answer: `**Subject: June 2026 CX Performance Snapshot**

Team,

June was a strong month. Overall CX landed at **86.2/100** (+2.1 MoM) across **65 visits in 12 branches**, and **NPS hit +64** — our best reading of the year.

**Highlights**
- Cairo Festival City topped the network at 91.4
- Complaint volume dropped 12% vs May
- Agent approval rate held at 91%

**Watch-outs**
- Alexandria Smouha (CX 68) needs a service refresh
- Wait time is emerging as the #1 recurring complaint

Full report attached.`,
  },
];

const QUICK_COMMANDS = [
  { id: 'q1', label: 'Compare two branches side-by-side', icon: BarChart3 },
  { id: 'q2', label: 'Draft an executive summary email', icon: FileText },
  { id: 'q3', label: 'Find anomalies in this month\'s visits', icon: Sparkles },
  { id: 'q4', label: 'Suggest which branches need attention', icon: TrendingUp },
];

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'seed-1',
    title: 'June monthly CX summary',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    messages: [
      { id: 'a', role: 'user', content: 'Give me a June monthly CX summary.' },
      { id: 'b', role: 'assistant', content: SUGGESTIONS[7].answer },
    ],
  },
  {
    id: 'seed-2',
    title: 'Cairo region branch comparison',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    messages: [
      { id: 'a', role: 'user', content: 'Compare Cairo branches.' },
      { id: 'b', role: 'assistant', content: SUGGESTIONS[6].answer },
    ],
  },
  {
    id: 'seed-3',
    title: 'Where should I focus next?',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    messages: [
      { id: 'a', role: 'user', content: 'Where am I underperforming?' },
      { id: 'b', role: 'assistant', content: SUGGESTIONS[3].answer },
    ],
  },
];

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-2" />;
    // Table row
    if (line.trim().startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^-+$/.test(c))) return null;
      return (
        <div key={i} className="grid gap-2 py-1 border-b border-border/50 text-xs" style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0,1fr))` }}>
          {cells.map((c, j) => (
            <div key={j}>{c.split(/(\*\*[^*]+\*\*)/g).map((p, k) => p.startsWith('**') ? <strong key={k}>{p.slice(2, -2)}</strong> : <span key={k}>{p}</span>)}</div>
          ))}
        </div>
      );
    }
    const isBullet = /^\s*[-*]\s/.test(line);
    const isNumbered = /^\s*\d+\.\s/.test(line);
    const clean = line.replace(/^\s*[-*]\s/, '').replace(/^\s*\d+\.\s/, '');
    const parts = clean.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
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

function findAnswer(query: string): string {
  const q = query.toLowerCase().trim();
  const hit = SUGGESTIONS.find(s => s.prompt.toLowerCase() === q)
    || SUGGESTIONS.find(s => {
      const words = s.prompt.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      return words.some(w => q.includes(w));
    });
  if (hit) return hit.answer;
  return `I looked across your visits, branches, and agent submissions for **"${query}"**.

At a glance:
- Overall CX score this month: **86.2/100** (+2.1 vs last month)
- Total completed visits: **65** across **12 branches**
- NPS: **+64**, CSAT: **4.5/5**
- No critical alerts in the last 7 days

Try something more specific — e.g. "which branch has the lowest cleanliness score?" or "how did Maadi perform this month?"`;
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

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
      const answer = findAnswer(trimmed);
      const asstMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: answer };
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
          <Button
            onClick={startNew}
            variant="outline"
            className="justify-start gap-2 mb-3"
          >
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
                <div className="text-xs text-muted-foreground px-2 py-4 text-center">
                  No conversations yet
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 max-w-3xl mx-auto w-full">
          {isEmpty ? (
            // WELCOME — centered hero with composer
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <img src={shadooLogo} alt="Shadoo" className="h-12 w-auto mb-5" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3">
                Meet Shadoo AI
              </h1>
              <p className="text-sm md:text-base text-muted-foreground text-center max-w-xl mb-8 leading-relaxed">
                Your branches speak. Shadoo listens. Ask anything about how your stores are really performing —
                what customers loved, where staff dropped the ball, which location needs your attention this week —
                and get a straight answer in seconds. No dashboards to hunt through. No charts to decode.
                Just the truth about your customer experience, on demand.
              </p>

              {/* Big centered composer */}
              <div className="w-full max-w-2xl">
                <div className="rounded-2xl border border-border bg-card shadow-lg focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 transition">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Ask Shadoo about your branches, agents, visits, or trends…"
                    rows={2}
                    className="resize-none border-0 shadow-none focus-visible:ring-0 min-h-[72px] max-h-40 bg-transparent px-5 pt-4 text-base"
                  />
                  <div className="flex items-center justify-between px-2 pb-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                          <Plus className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64">
                        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                          Attach
                        </DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Paperclip className="h-4 w-4 me-2" />
                          Upload file (CSV, PDF, image)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 me-2" />
                          Attach a saved report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                          Quick commands
                        </DropdownMenuLabel>
                        {QUICK_COMMANDS.map(c => {
                          const Icon = c.icon;
                          return (
                            <DropdownMenuItem key={c.id} onClick={() => insertPrompt(c.label)}>
                              <Icon className="h-4 w-4 me-2" />
                              {c.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      size="icon"
                      onClick={() => send(input)}
                      disabled={!input.trim() || thinking}
                      className="h-9 w-9 rounded-full"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Small suggestion pills under the box */}
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
            // ACTIVE CONVERSATION
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
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                        msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'
                      )}
                    >
                      {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                    </div>
                    <div className={cn('flex-1 max-w-[85%]', msg.role === 'user' && 'flex justify-end')}>
                      {msg.role === 'user' ? (
                        <div className="inline-block bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="text-sm text-foreground/90">{renderMarkdown(msg.content)}</div>
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

              {/* Composer (bottom) */}
              <div className="pb-2">
                <div className="rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Ask a follow-up…"
                    rows={1}
                    className="resize-none border-0 shadow-none focus-visible:ring-0 min-h-[52px] max-h-40 bg-transparent px-4 pt-3.5"
                  />
                  <div className="flex items-center justify-between px-2 pb-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64">
                        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                          Attach
                        </DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Paperclip className="h-4 w-4 me-2" />
                          Upload file (CSV, PDF, image)
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 me-2" />
                          Attach a saved report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                          Quick commands
                        </DropdownMenuLabel>
                        {QUICK_COMMANDS.map(c => {
                          const Icon = c.icon;
                          return (
                            <DropdownMenuItem key={c.id} onClick={() => insertPrompt(c.label)}>
                              <Icon className="h-4 w-4 me-2" />
                              {c.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      size="icon"
                      onClick={() => send(input)}
                      disabled={!input.trim() || thinking}
                      className="h-8 w-8 rounded-full"
                    >
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
