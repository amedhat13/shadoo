import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Plus,
  ArrowUp,
  Sparkles,
  Paperclip,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Star,
  DollarSign,
  Bot,
  User as UserIcon,
} from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Suggestion = {
  id: string;
  label: string;
  icon: typeof BarChart3;
  answer: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'top-branch',
    label: 'Which branch performed best last month?',
    icon: TrendingUp,
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
    label: 'Show me NPS trend for the last 6 months',
    icon: BarChart3,
    answer: `Your NPS has climbed steadily over the last 6 months:

- Jan: **+41**
- Feb: **+45**
- Mar: **+48**
- Apr: **+52**
- May: **+58**
- Jun: **+64** ← current

That's a **+23 point improvement** in half a year, mostly driven by improvements in Heliopolis and Nasr City locations. Detractor mentions dropped 38% — the most common complaint moving from "slow service" to "limited product availability", which is a healthier signal.

Want me to break this down by branch or by methodology?`,
  },
  {
    id: 'agent-quality',
    label: 'Are my agents catching real issues?',
    icon: Users,
    answer: `Yes — agent submissions look reliable this quarter.

- **Approval rate**: 91% (114 approved / 125 submitted)
- **Photo compliance**: 96% (agents attaching required evidence)
- **Rejection reasons**: mostly incomplete answers (7), only 2 flagged as low-quality
- **Avg agent rating** you've given: **4.6/5**

Top performers: Ahmed M. (4.9), Salma K. (4.8), Youssef R. (4.8). No agents currently below the 3.5 threshold.

Recommendation: agent **Karim H.** submitted 4 visits with rushed answers — worth a review or extra training assignment before their next mission.`,
  },
  {
    id: 'geo-weakness',
    label: 'Where am I underperforming geographically?',
    icon: MapPin,
    answer: `Three areas need attention:

1. **Alexandria – Smouha** — CX score **68/100** (12 points below your network avg). Main issue: staff product knowledge scored 61/100 in the last 3 visits.
2. **Giza – Dokki** — Cleanliness dropped to **72/100** after being stable at 85+ all year.
3. **Cairo – Maadi** — NPS turned negative (-8) for the first time in 2026. Only 6 visits so far this month, so sample is small but worth watching.

Everything in **Nasr City, Heliopolis, and New Cairo** is performing at or above target.`,
  },
  {
    id: 'complaints',
    label: 'What are customers complaining about most?',
    icon: Star,
    answer: `Across 87 open-ended responses this month, the top themes are:

1. **Wait time at checkout** — 24 mentions (28%)
2. **Product availability / out of stock** — 19 mentions (22%)
3. **Staff attentiveness** — 11 mentions (13%)
4. **Store temperature / A/C** — 8 mentions (9%)
5. **Restroom cleanliness** — 6 mentions (7%)

Sentiment breakdown: **62% positive, 24% neutral, 14% negative**. The negative share has actually shrunk from 21% last month, so the trajectory is good — but wait times are becoming a signature complaint and would be the highest-leverage thing to fix.`,
  },
  {
    id: 'roi',
    label: 'What is my ROI on missions this quarter?',
    icon: DollarSign,
    answer: `This quarter you've invested **48,750 EGP** across 65 completed visits (avg **750 EGP/visit**).

Insights uncovered:
- 3 operational issues fixed after mystery shopper flags (est. recovered revenue: **~180,000 EGP** based on historical churn data for similar issues).
- Staff training gap identified in 2 branches — training rolled out reduced complaint rate 34%.
- 1 compliance risk caught (expired signage) before any regulatory issue.

Estimated ROI: **~3.7×** on spend, not counting brand-equity effects. Your best-value mission type this quarter was **Service Audit at Peak Hours** — cheapest per insight generated.`,
  },
];

const READY_REPORTS = [
  { id: 'r1', title: 'June 2026 — Monthly CX Summary', desc: 'All branches, all methodologies', date: '2 days ago' },
  { id: 'r2', title: 'Cairo Region — Branch Comparison', desc: '8 branches ranked by NPS + CSAT', date: '1 week ago' },
  { id: 'r3', title: 'Ramadan Campaign Recap', desc: 'Foot traffic + service quality during promo', date: '3 weeks ago' },
];

const QUICK_COMMANDS = [
  { id: 'q1', label: 'Compare two branches side-by-side', icon: BarChart3 },
  { id: 'q2', label: 'Draft an executive summary email', icon: FileText },
  { id: 'q3', label: 'Find anomalies in this month\'s visits', icon: Sparkles },
  { id: 'q4', label: 'Suggest which branches need attention', icon: TrendingUp },
];

function renderMarkdown(text: string) {
  // Minimal markdown: **bold**, bullet lists, line breaks
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-2" />;
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
  const q = query.toLowerCase();
  const hit = SUGGESTIONS.find(s => s.label.toLowerCase() === q)
    || SUGGESTIONS.find(s => {
      const words = s.label.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      return words.some(w => q.includes(w));
    });
  if (hit) return hit.answer;
  return `I looked across your visits, branches, and agent submissions for **"${query}"**.

Here's what I can tell you at a glance:
- Overall CX score this month: **86.2/100** (+2.1 vs last month)
- Total completed visits: **65** across **12 branches**
- NPS: **+64**, CSAT: **4.5/5**
- No critical alerts in the last 7 days

Try asking me something more specific — for example: "which branch has the lowest cleanliness score?" or "how did the Maadi branch perform this month?" I can also draft summaries, spot anomalies, or compare any two branches for you.`;
}

export default function ReportsV2Page() {
  const { t: tc } = useTranslation('common');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [messages.length]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const answer = findAnswer(trimmed);
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: answer }]);
      setThinking(false);
    }, 700);
  };

  const isEmpty = messages.length === 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-wide">Reports AI</h1>
            <p className="text-xs text-muted-foreground">Ask anything about your data — get instant insights</p>
          </div>
          <span className="ms-auto text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 text-primary rounded">
            Beta
          </span>
        </div>

        {/* Conversation area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                What do you want to know?
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                Ask questions in plain language. I'll pull insights from your missions, visits, agents, and branch data.
              </p>

              {/* Suggestion pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                {SUGGESTIONS.slice(0, 4).map(s => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => send(s.label)}
                      className="flex items-start gap-3 p-3 text-start rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors group"
                    >
                      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary shrink-0" />
                      <span className="text-sm text-foreground">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'
                  )}
                >
                  {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                </div>
                <div
                  className={cn(
                    'flex-1 max-w-[85%]',
                    msg.role === 'user' && 'flex justify-end'
                  )}
                >
                  {msg.role === 'user' ? (
                    <div className="inline-block bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="text-sm text-foreground/90">
                      {renderMarkdown(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

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

        {/* Composer */}
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
              placeholder="Ask about your branches, agents, visits, or trends…"
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
                      <DropdownMenuItem key={c.id} onClick={() => send(c.label)}>
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

          {isEmpty && (
            <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
              {SUGGESTIONS.slice(4).map(s => (
                <button
                  key={s.id}
                  onClick={() => send(s.label)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ready-made reports (secondary) */}
        {isEmpty && (
          <div className="pt-6 mt-2 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recent reports generated for you
              </h3>
              <Button variant="ghost" size="sm" className="text-xs h-7">View all</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {READY_REPORTS.map(r => (
                <Card key={r.id} className="p-3 hover:border-primary/30 hover:shadow-sm transition cursor-pointer group">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate group-hover:text-primary">{r.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.desc}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{r.date}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
