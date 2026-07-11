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
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import shadooLogo from '@/assets/shadoo-logo.png';
import shadooCap from '@/assets/shadoo-cap.png';
import {
  Plus, ArrowUp, Paperclip, FileText, BarChart3, TrendingUp, Sparkles,
  MessageSquarePlus, Bot, User as UserIcon, Trash2, Command,
  ArrowUpRight, ArrowDownRight, Trophy, AlertTriangle, CheckCircle2, XCircle,
  MapPin, Star, Download, FileSpreadsheet, FileType2,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ---------- Visual types ----------
type KPI = { label: string; value: string; delta?: string; up?: boolean; hint?: string };
type TableCell = { text: string; strong?: boolean; tone?: 'good' | 'bad' | 'neutral' };
type Visual =
  | { kind: 'kpis'; title?: string; items: KPI[] }
  | { kind: 'hero'; title: string; subtitle?: string; value: string; badge?: string; icon?: 'trophy' | 'alert' | 'check' | 'star' }
  | { kind: 'line'; title?: string; data: any[]; series: { key: string; label: string; color?: string }[] }
  | { kind: 'bar'; title?: string; data: any[]; series: { key: string; label: string; color?: string }[]; horizontal?: boolean }
  | { kind: 'ranking'; title?: string; items: { name: string; value: number; max: number; unit?: string; tone?: 'good' | 'bad' }[] }
  | { kind: 'donut'; title?: string; data: { name: string; value: number; color?: string }[] }
  | { kind: 'radar'; title?: string; data: { metric: string; a: number; b: number }[]; a: string; b: string }
  | { kind: 'table'; title?: string; headers: string[]; rows: TableCell[][] }
  | { kind: 'callouts'; title?: string; items: { icon: 'check' | 'alert' | 'x'; label: string; text: string }[] };

type Artifact = {
  id: string;
  name: string;                // filename incl. extension
  label: string;               // display label
  kind: 'csv' | 'md' | 'json';
  build: () => string;         // returns file text content
};
type Message = { id: string; role: 'user' | 'assistant'; content: string; visuals?: Visual[]; followUps?: string[]; artifacts?: Artifact[] };
type Conversation = { id: string; title: string; updatedAt: number; messages: Message[] };
type Answer = { content: string; visuals: Visual[]; followUps: string[]; artifacts?: Artifact[] };
type Suggestion = { id: string; pill: string; prompt: string; keywords: string[]; followUps: string[]; build: () => Omit<Answer, 'followUps'> };

const C = {
  primary: 'hsl(var(--primary))',
  muted: 'hsl(var(--muted-foreground))',
  good: '#10b981',
  bad: '#ef4444',
  warn: '#f59e0b',
  info: '#3b82f6',
  violet: '#8b5cf6',
};

// ---------- Answer builders (each tailored to the prompt) ----------
const ANSWERS: Suggestion[] = [
  {
    id: 'top-branch',
    pill: 'Top branch',
    prompt: 'Which branch performed best last month?',
    keywords: ['top', 'best', 'performed', 'winner', 'leader'],
    followUps: [
      'What drove Cairo Festival City to #1?',
      'Compare Cairo Festival City vs Mall of Arabia',
      'Which branch dropped the most vs last month?',
      'Draft a congrats note to the CFC store manager',
    ],
    build: () => ({
      content: `**Cairo Festival City** was your #1 branch last month — leading on service quality and NPS across all 12 locations. Here's the ranking and what drove the win:`,
      visuals: [
        { kind: 'hero', title: 'Winner — Cairo Festival City', subtitle: '24 visits • CX 91.4/100 • NPS +72', value: '#1', badge: 'Top branch', icon: 'trophy' },
        {
          kind: 'ranking',
          title: 'Overall CX score — last 30 days',
          items: [
            { name: 'Cairo Festival City', value: 91.4, max: 100, tone: 'good' },
            { name: 'Mall of Arabia – Giza', value: 88.7, max: 100 },
            { name: 'Nasr City', value: 86.1, max: 100 },
            { name: 'Heliopolis', value: 84.9, max: 100 },
            { name: 'New Cairo', value: 82.3, max: 100 },
            { name: 'Zamalek', value: 79.6, max: 100 },
          ],
        },
        {
          kind: 'table',
          title: 'What drove Cairo Festival City',
          headers: ['Category', 'Score', 'vs May', 'vs network avg'],
          rows: [
            [{ text: 'Service Quality', strong: true }, { text: '94/100' }, { text: '+6', tone: 'good' }, { text: '+8', tone: 'good' }],
            [{ text: 'Cleanliness', strong: true }, { text: '92/100' }, { text: '+2', tone: 'good' }, { text: '+5', tone: 'good' }],
            [{ text: 'Staff Friendliness', strong: true }, { text: '4.8/5' }, { text: '+0.3', tone: 'good' }, { text: '+0.5', tone: 'good' }],
            [{ text: 'Wait Time', strong: true }, { text: '82/100' }, { text: '−1', tone: 'bad' }, { text: '+4', tone: 'good' }],
          ],
        },
      ],
    }),
  },
  {
    id: 'nps-trend',
    pill: 'NPS trend',
    prompt: 'Show me the NPS trend for the last 6 months.',
    keywords: ['nps', 'trend', 'promoter', 'months', 'over time'],
    followUps: [
      'Why did NPS jump in May?',
      'Show NPS by branch',
      'Which branches dragged NPS down?',
      'Forecast NPS for next month',
    ],
    build: () => ({
      content: `Your NPS climbed **+23 points** in six months — the steepest gain came in May–June after the Heliopolis service refresh.`,
      visuals: [
        {
          kind: 'kpis',
          items: [
            { label: 'Current NPS', value: '+64', delta: '+6 MoM', up: true },
            { label: '6-month change', value: '+23', delta: 'best half in 2 yrs', up: true },
            { label: 'Promoters', value: '71%', delta: '+8pp', up: true },
            { label: 'Detractors', value: '7%', delta: '−5pp', up: true },
          ],
        },
        {
          kind: 'line',
          title: 'NPS — last 6 months',
          series: [{ key: 'nps', label: 'NPS', color: C.primary }],
          data: [
            { name: 'Jan', nps: 41 }, { name: 'Feb', nps: 45 }, { name: 'Mar', nps: 48 },
            { name: 'Apr', nps: 52 }, { name: 'May', nps: 58 }, { name: 'Jun', nps: 64 },
          ],
        },
        {
          kind: 'bar',
          title: 'Contribution to NPS gain — by branch',
          series: [{ key: 'delta', label: 'Δ NPS pts', color: C.good }],
          data: [
            { name: 'Heliopolis', delta: 9 }, { name: 'Nasr City', delta: 6 },
            { name: 'Cairo Festival', delta: 4 }, { name: 'New Cairo', delta: 3 }, { name: 'Maadi', delta: -2 },
          ],
        },
      ],
    }),
  },
  {
    id: 'agent-quality',
    pill: 'Agent quality',
    prompt: 'Are my agents catching real issues?',
    keywords: ['agent', 'agents', 'catching', 'quality', 'reliable', 'submissions'],
    followUps: [
      'Coaching plan for Karim H.',
      'Reward the top 3 agents',
      'Break down rejection reasons',
      'Approval rate trend over 6 months',
    ],
    build: () => ({
      content: `Agent submissions look reliable this quarter — **91% approval**, **96% photo compliance**. Three top performers to reward, one to coach.`,
      visuals: [
        {
          kind: 'kpis',
          items: [
            { label: 'Approval rate', value: '91%', delta: '+3pp', up: true },
            { label: 'Photo compliance', value: '96%', delta: '+1pp', up: true },
            { label: 'Avg rating given', value: '4.6/5', delta: '+0.2', up: true },
            { label: 'Rejections', value: '11', delta: '−4', up: true },
          ],
        },
        {
          kind: 'donut',
          title: 'Rejection reasons (11 total)',
          data: [
            { name: 'Incomplete answers', value: 7, color: C.warn },
            { name: 'Low-quality photos', value: 2, color: C.bad },
            { name: 'Off-brief detail', value: 2, color: C.violet },
          ],
        },
        {
          kind: 'table',
          title: 'Agent performance leaderboard',
          headers: ['Agent', 'Visits', 'Approval', 'Avg rating', 'Flag'],
          rows: [
            [{ text: 'Ahmed M.', strong: true }, { text: '18' }, { text: '100%', tone: 'good' }, { text: '4.9', tone: 'good' }, { text: 'Top', tone: 'good' }],
            [{ text: 'Salma K.', strong: true }, { text: '15' }, { text: '100%', tone: 'good' }, { text: '4.8', tone: 'good' }, { text: 'Top', tone: 'good' }],
            [{ text: 'Youssef R.', strong: true }, { text: '14' }, { text: '93%', tone: 'good' }, { text: '4.8', tone: 'good' }, { text: 'Top', tone: 'good' }],
            [{ text: 'Karim H.', strong: true }, { text: '9' }, { text: '56%', tone: 'bad' }, { text: '3.2', tone: 'bad' }, { text: 'Coach', tone: 'bad' }],
          ],
        },
      ],
    }),
  },
  {
    id: 'geo-weakness',
    pill: 'Weak areas',
    prompt: 'Where am I underperforming geographically?',
    keywords: ['weak', 'underperform', 'worst', 'lowest', 'attention', 'geograph', 'area'],
    followUps: [
      'Deep dive on Alexandria – Smouha',
      'Suggest recovery missions',
      'Draft action-plan email to regional manager',
      'Compare Alexandria vs Cairo regions',
    ],
    build: () => ({
      content: `Three branches need your attention this month. **Alexandria – Smouha** is the most urgent — CX is 18 points below your network average.`,
      visuals: [
        {
          kind: 'callouts',
          title: 'Branches needing action',
          items: [
            { icon: 'x', label: 'Alexandria – Smouha', text: 'CX 68 (network avg 86). Staff product knowledge fell to 61/100 across last 3 visits.' },
            { icon: 'alert', label: 'Giza – Dokki', text: 'Cleanliness dropped to 72 after 6 months stable at 85+. Check evening shift.' },
            { icon: 'alert', label: 'Cairo – Maadi', text: 'NPS turned negative (−8) for the first time in 2026. Small sample (6 visits) but worth watching.' },
          ],
        },
        {
          kind: 'ranking',
          title: 'Weakest branches — CX score',
          items: [
            { name: 'Alexandria – Smouha', value: 68, max: 100, tone: 'bad' },
            { name: 'Giza – Dokki', value: 72, max: 100, tone: 'bad' },
            { name: 'Cairo – Maadi', value: 74, max: 100, tone: 'bad' },
            { name: 'Alexandria – Sidi Gaber', value: 77, max: 100 },
            { name: 'Network average', value: 86, max: 100, tone: 'good' },
          ],
        },
        {
          kind: 'table',
          title: 'Region rollup',
          headers: ['Region', 'Branches', 'Avg CX', 'Trend'],
          rows: [
            [{ text: 'Cairo – East' }, { text: '4' }, { text: '88.2', tone: 'good' }, { text: '↑ +2.1', tone: 'good' }],
            [{ text: 'Cairo – West / Giza' }, { text: '3' }, { text: '82.1' }, { text: '↓ −1.4', tone: 'bad' }],
            [{ text: 'Alexandria' }, { text: '3' }, { text: '74.5', tone: 'bad' }, { text: '↓ −3.2', tone: 'bad' }],
            [{ text: 'New Cairo' }, { text: '2' }, { text: '85.6', tone: 'good' }, { text: '↑ +1.0', tone: 'good' }],
          ],
        },
      ],
    }),
  },
  {
    id: 'complaints',
    pill: 'Top complaints',
    prompt: 'What are customers complaining about most?',
    keywords: ['complain', 'complaint', 'issue', 'problem', 'negative', 'feedback'],
    followUps: [
      'Wait-time complaints by branch',
      'Show hourly wait patterns',
      'Compare complaints vs industry benchmark',
      'Draft response template for customers',
    ],
    build: () => ({
      content: `**Wait time at checkout** is the #1 complaint (28% of mentions) and it's growing. Overall sentiment is still healthy — 62% positive.`,
      visuals: [
        {
          kind: 'donut',
          title: 'Sentiment breakdown — 87 responses',
          data: [
            { name: 'Positive', value: 62, color: C.good },
            { name: 'Neutral', value: 24, color: C.muted },
            { name: 'Negative', value: 14, color: C.bad },
          ],
        },
        {
          kind: 'bar',
          title: 'Complaint themes — mentions this month',
          horizontal: true,
          series: [{ key: 'count', label: 'Mentions', color: C.primary }],
          data: [
            { name: 'Wait time', count: 24 },
            { name: 'Out of stock', count: 19 },
            { name: 'Staff attention', count: 11 },
            { name: 'Temperature', count: 8 },
            { name: 'Restrooms', count: 6 },
          ],
        },
        {
          kind: 'table',
          title: 'Theme movement vs last month',
          headers: ['Theme', 'This month', 'Last month', 'Δ'],
          rows: [
            [{ text: 'Wait time', strong: true }, { text: '24' }, { text: '16' }, { text: '+8', tone: 'bad' }],
            [{ text: 'Out of stock', strong: true }, { text: '19' }, { text: '22' }, { text: '−3', tone: 'good' }],
            [{ text: 'Staff attention', strong: true }, { text: '11' }, { text: '14' }, { text: '−3', tone: 'good' }],
            [{ text: 'Temperature', strong: true }, { text: '8' }, { text: '5' }, { text: '+3', tone: 'bad' }],
            [{ text: 'Restrooms', strong: true }, { text: '6' }, { text: '9' }, { text: '−3', tone: 'good' }],
          ],
        },
      ],
    }),
  },
  {
    id: 'roi',
    pill: 'Mission ROI',
    prompt: 'What is my ROI on missions this quarter?',
    keywords: ['roi', 'return', 'value', 'spend', 'invest', 'cost'],
    followUps: [
      'ROI by branch',
      'Which mission type has best ROI?',
      'Forecast next quarter ROI',
      'Justify Q3 budget in a slide',
    ],
    build: () => ({
      content: `You spent **48,750 EGP** and recovered an estimated **180,000 EGP** in prevented churn — a **~3.7×** return, before brand-equity effects.`,
      visuals: [
        {
          kind: 'hero',
          title: 'Estimated ROI',
          subtitle: '48,750 EGP invested → ~180,000 EGP recovered',
          value: '3.7×',
          badge: 'This quarter',
          icon: 'star',
        },
        {
          kind: 'bar',
          title: 'Spend vs recovered value (EGP, thousands)',
          series: [
            { key: 'spend', label: 'Spend', color: C.muted },
            { key: 'recovered', label: 'Recovered', color: C.good },
          ],
          data: [
            { name: 'April', spend: 15.2, recovered: 42 },
            { name: 'May', spend: 16.8, recovered: 61 },
            { name: 'June', spend: 16.75, recovered: 77 },
          ],
        },
        {
          kind: 'table',
          title: 'Value driven by mission type',
          headers: ['Mission type', 'Visits', 'Spend', 'Value found', 'ROI'],
          rows: [
            [{ text: 'Service audit — peak hrs', strong: true }, { text: '22' }, { text: '16,500' }, { text: '82,000' }, { text: '5.0×', tone: 'good' }],
            [{ text: 'Cleanliness spot check' }, { text: '18' }, { text: '11,700' }, { text: '38,000' }, { text: '3.2×', tone: 'good' }],
            [{ text: 'Compliance sweep' }, { text: '12' }, { text: '9,000' }, { text: '45,000' }, { text: '5.0×', tone: 'good' }],
            [{ text: 'New-product test' }, { text: '13' }, { text: '11,550' }, { text: '15,000' }, { text: '1.3×' }],
          ],
        },
      ],
    }),
  },
  {
    id: 'compare',
    pill: 'Compare branches',
    prompt: 'Compare Cairo Festival City vs Mall of Arabia side by side.',
    keywords: ['compare', 'vs', 'versus', 'side'],
    followUps: [
      'Add Nasr City to this comparison',
      'Show 6-month trend for both',
      'Which one improved more this quarter?',
      'Save this comparison as a report',
    ],
    build: () => ({
      content: `**Cairo Festival City** wins overall on service and NPS. **Mall of Arabia** edges ahead on cleanliness and speed at checkout.`,
      visuals: [
        {
          kind: 'kpis',
          title: 'Head-to-head verdict',
          items: [
            { label: 'Cairo Festival City', value: 'CX 91.4', delta: '4 metric wins', up: true, hint: 'Winner' },
            { label: 'Mall of Arabia', value: 'CX 88.7', delta: '2 metric wins', hint: 'Runner-up' },
            { label: 'Gap', value: '+2.7 pts', hint: 'Overall CX' },
            { label: 'Sample', value: '24 vs 19', hint: 'visits' },
          ],
        },
        {
          kind: 'radar',
          title: 'Category profile',
          a: 'Cairo Festival City',
          b: 'Mall of Arabia',
          data: [
            { metric: 'Service', a: 94, b: 87 },
            { metric: 'Cleanliness', a: 92, b: 93 },
            { metric: 'NPS', a: 90, b: 78 },
            { metric: 'Wait', a: 82, b: 85 },
            { metric: 'Product', a: 88, b: 84 },
            { metric: 'Staff', a: 96, b: 88 },
          ],
        },
        {
          kind: 'table',
          title: 'Metric-by-metric',
          headers: ['Metric', 'Cairo Festival City', 'Mall of Arabia', 'Winner'],
          rows: [
            [{ text: 'Overall CX' }, { text: '91.4', tone: 'good', strong: true }, { text: '88.7' }, { text: 'CFC', tone: 'good' }],
            [{ text: 'NPS' }, { text: '+72', tone: 'good', strong: true }, { text: '+61' }, { text: 'CFC', tone: 'good' }],
            [{ text: 'Cleanliness' }, { text: '92' }, { text: '93', tone: 'good', strong: true }, { text: 'MoA', tone: 'good' }],
            [{ text: 'Service Quality' }, { text: '94', tone: 'good', strong: true }, { text: '87' }, { text: 'CFC', tone: 'good' }],
            [{ text: 'Wait Time' }, { text: '82' }, { text: '85', tone: 'good', strong: true }, { text: 'MoA', tone: 'good' }],
            [{ text: 'Visits' }, { text: '24' }, { text: '19' }, { text: '—' }],
          ],
        },
      ],
    }),
  },
  {
    id: 'exec-summary',
    pill: 'Exec summary',
    prompt: "Draft an executive summary of this month's performance.",
    keywords: ['exec', 'executive', 'summary', 'draft', 'monthly', 'recap', 'email'],
    followUps: [
      'Turn this into an email',
      'Add revenue impact estimate',
      'Compare to last month',
      'Break down by region',
    ],
    build: () => ({
      content: `**June was a strong month.** Overall CX **86.2** (+2.1 MoM), NPS **+64** — the year's best. One watch-out: wait time is emerging as the #1 recurring complaint.`,
      visuals: [
        {
          kind: 'kpis',
          title: 'The month in numbers',
          items: [
            { label: 'Overall CX', value: '86.2', delta: '+2.1', up: true },
            { label: 'NPS', value: '+64', delta: '+6', up: true },
            { label: 'Visits', value: '65', delta: '+8', up: true },
            { label: 'Branches', value: '12', hint: 'active' },
          ],
        },
        {
          kind: 'line',
          title: 'CX score — last 6 months',
          series: [{ key: 'cx', label: 'CX', color: C.primary }],
          data: [
            { name: 'Jan', cx: 79 }, { name: 'Feb', cx: 81 }, { name: 'Mar', cx: 82 },
            { name: 'Apr', cx: 83.6 }, { name: 'May', cx: 84.1 }, { name: 'Jun', cx: 86.2 },
          ],
        },
        {
          kind: 'callouts',
          title: 'What to tell the exec team',
          items: [
            { icon: 'check', label: 'Highlight', text: 'Cairo Festival City hit CX 91.4 — new all-time high.' },
            { icon: 'check', label: 'Highlight', text: 'Complaint volume dropped 12% MoM; sentiment 62% positive.' },
            { icon: 'alert', label: 'Watch-out', text: 'Alexandria Smouha (CX 68) needs a service refresh this quarter.' },
            { icon: 'alert', label: 'Watch-out', text: 'Wait time complaints up 50% — biggest emerging risk.' },
          ],
        },
      ],
    }),
  },
  {
    id: 'peak-hours',
    pill: 'Peak hours',
    prompt: 'When are my busiest hours and how is service holding up?',
    keywords: ['peak', 'busy', 'hour', 'hours', 'traffic', 'rush'],
    followUps: ['Staff schedule vs traffic', 'Wait time by hour', 'Weekend vs weekday load', 'Recommend a shift plan'],
    build: () => ({
      content: `Peak load is **7pm–10pm on Thu–Sat**. Service quality dips **9 pts** at peak vs off-peak — mostly wait time and staff attention.`,
      visuals: [
        { kind: 'line', title: 'Traffic by hour (visits observed)', series: [{ key: 'v', label: 'Visits', color: C.primary }],
          data: [{ name: '10a', v: 4 }, { name: '12p', v: 7 }, { name: '2p', v: 9 }, { name: '4p', v: 11 }, { name: '6p', v: 16 }, { name: '8p', v: 22 }, { name: '10p', v: 14 }] },
        { kind: 'bar', title: 'Service score — peak vs off-peak', series: [{ key: 'peak', label: 'Peak', color: C.bad }, { key: 'off', label: 'Off-peak', color: C.good }],
          data: [{ name: 'Service', peak: 78, off: 89 }, { name: 'Wait', peak: 68, off: 88 }, { name: 'Cleanliness', peak: 84, off: 91 }, { name: 'Staff', peak: 79, off: 90 }] },
      ],
    }),
  },
  {
    id: 'stockouts',
    pill: 'Stockouts',
    prompt: 'How often are products out of stock across branches?',
    keywords: ['stock', 'stockout', 'out of stock', 'availability', 'inventory'],
    followUps: ['Which SKUs are missing most?', 'Branch-level stockout rate', 'Lost revenue estimate', 'Alert operations'],
    build: () => ({
      content: `**18%** of tracked SKUs were unavailable during shopper visits — up from 12% last month. Alexandria region drives most of the gap.`,
      visuals: [
        { kind: 'kpis', items: [
          { label: 'SKU availability', value: '82%', delta: '−6pp', up: false },
          { label: 'Branches affected', value: '9 / 12' },
          { label: 'Est. lost sales', value: '~64k EGP', delta: '+22k', up: false },
          { label: 'Top missing cat.', value: 'Beverages' },
        ] },
        { kind: 'ranking', title: 'Stockout rate by branch', items: [
          { name: 'Alexandria – Smouha', value: 34, max: 40, tone: 'bad' },
          { name: 'Alexandria – Sidi Gaber', value: 28, max: 40, tone: 'bad' },
          { name: 'Giza – Dokki', value: 22, max: 40 },
          { name: 'Nasr City', value: 14, max: 40 },
          { name: 'Cairo Festival City', value: 6, max: 40, tone: 'good' },
        ] },
      ],
    }),
  },
  {
    id: 'competitor',
    pill: 'Competitor benchmark',
    prompt: 'How do I compare to competitors on service and cleanliness?',
    keywords: ['competitor', 'benchmark', 'industry', 'market', 'peers'],
    followUps: ['Where do competitors beat me?', 'Benchmark by category', 'Suggest gap-closing missions', 'Share benchmark deck'],
    build: () => ({
      content: `You beat the category average on **Service (+4)** and **NPS (+11)**, but trail on **Speed at checkout (−6)**.`,
      visuals: [
        { kind: 'radar', title: 'You vs category average', a: 'You', b: 'Category avg',
          data: [
            { metric: 'Service', a: 88, b: 84 }, { metric: 'Cleanliness', a: 87, b: 86 },
            { metric: 'Speed', a: 78, b: 84 }, { metric: 'NPS', a: 64, b: 53 },
            { metric: 'Price value', a: 76, b: 79 }, { metric: 'Product', a: 85, b: 82 },
          ] },
        { kind: 'callouts', title: 'Gaps to close', items: [
          { icon: 'x', label: 'Speed at checkout', text: '6 pts behind category. Peak-hour queues are the main driver.' },
          { icon: 'alert', label: 'Price perception', text: 'Slight gap (−3). Consider clearer value messaging in-store.' },
          { icon: 'check', label: 'NPS leadership', text: 'You lead the category by 11 points — protect it via staff recognition.' },
        ] },
      ],
    }),
  },
  {
    id: 'staff-friendliness',
    pill: 'Staff friendliness',
    prompt: 'How is staff friendliness trending across my network?',
    keywords: ['friendly', 'friendliness', 'staff attitude', 'greeting', 'politeness'],
    followUps: ['Best-performing staff behaviors', 'Coaching topics to prioritize', 'Branch drill-down', 'Reward top branches'],
    build: () => ({
      content: `Staff friendliness averages **4.6/5** across the network — up from **4.3** in Q1. Zamalek and Maadi still lag.`,
      visuals: [
        { kind: 'line', title: 'Friendliness score — 6 months', series: [{ key: 's', label: 'Score /5', color: C.good }],
          data: [{ name: 'Jan', s: 4.3 }, { name: 'Feb', s: 4.3 }, { name: 'Mar', s: 4.4 }, { name: 'Apr', s: 4.5 }, { name: 'May', s: 4.5 }, { name: 'Jun', s: 4.6 }] },
        { kind: 'ranking', title: 'By branch', items: [
          { name: 'Cairo Festival City', value: 4.9, max: 5, tone: 'good' },
          { name: 'Heliopolis', value: 4.8, max: 5, tone: 'good' },
          { name: 'Nasr City', value: 4.7, max: 5 },
          { name: 'Zamalek', value: 4.1, max: 5, tone: 'bad' },
          { name: 'Maadi', value: 3.9, max: 5, tone: 'bad' },
        ] },
      ],
    }),
  },
  {
    id: 'anomaly',
    pill: 'Anomalies',
    prompt: "Find anomalies in this month's visits.",
    keywords: ['anomaly', 'anomalies', 'outlier', 'unusual', 'suspicious', 'weird'],
    followUps: ['Investigate Zamalek drop', 'Flag suspect visits for review', 'Show anomaly history', 'Alert me next time this happens'],
    build: () => ({
      content: `Detected **3 anomalies** worth investigating. Zamalek's sudden CX drop is the most material.`,
      visuals: [
        { kind: 'callouts', title: 'Anomalies detected', items: [
          { icon: 'x', label: 'Zamalek — CX drop', text: 'CX fell from 84 to 61 over 6 visits in one week. 3σ deviation from baseline.' },
          { icon: 'alert', label: 'Nasr City — rating inflation', text: '5 back-to-back perfect scores from same agent. Worth spot-checking.' },
          { icon: 'alert', label: 'Heliopolis — wait spike', text: 'Wait time jumped 40% on Fridays only. Likely staffing gap.' },
        ] },
        { kind: 'table', title: 'Anomaly summary', headers: ['Branch', 'Metric', 'Baseline', 'Observed', 'Severity'],
          rows: [
            [{ text: 'Zamalek' }, { text: 'CX score' }, { text: '84' }, { text: '61', tone: 'bad' }, { text: 'High', tone: 'bad' }],
            [{ text: 'Nasr City' }, { text: 'Rating pattern' }, { text: 'mixed' }, { text: '5×5.0' }, { text: 'Medium' }],
            [{ text: 'Heliopolis' }, { text: 'Fri wait' }, { text: '4 min' }, { text: '5.6 min', tone: 'bad' }, { text: 'Medium' }],
          ] },
      ],
    }),
  },
  {
    id: 'forecast',
    pill: 'Forecast',
    prompt: 'Forecast my CX and NPS for the next 3 months.',
    keywords: ['forecast', 'predict', 'projection', 'future', 'next month', 'next quarter'],
    followUps: ['Show confidence bands', 'What could change this?', 'Set a goal for Q3', 'Alert me if we go off-track'],
    build: () => ({
      content: `If current trends hold, CX reaches **~89** and NPS **~+72** by September. Wait-time complaints are the biggest downside risk.`,
      visuals: [
        { kind: 'line', title: 'CX — actual & 3-month forecast', series: [{ key: 'cx', label: 'CX', color: C.primary }],
          data: [{ name: 'Apr', cx: 83.6 }, { name: 'May', cx: 84.1 }, { name: 'Jun', cx: 86.2 }, { name: 'Jul*', cx: 87.1 }, { name: 'Aug*', cx: 88.0 }, { name: 'Sep*', cx: 89.0 }] },
        { kind: 'kpis', title: 'Projected Sep', items: [
          { label: 'CX (proj.)', value: '89.0', delta: '+2.8', up: true },
          { label: 'NPS (proj.)', value: '+72', delta: '+8', up: true },
          { label: 'Visits (proj.)', value: '75/mo', delta: '+10', up: true },
          { label: 'Confidence', value: '±2.5 pts' },
        ] },
      ],
    }),
  },
  {
    id: 'agent-fraud',
    pill: 'Fraud check',
    prompt: 'Are any agents submitting fake or copy-paste answers?',
    keywords: ['fraud', 'fake', 'copy', 'paste', 'duplicate', 'suspicious agent', 'cheat'],
    followUps: ['Show flagged submissions', 'Block agent X', 'Tighten photo requirements', 'Auto-reject duplicates'],
    build: () => ({
      content: `**2 agents** show patterns worth reviewing. No confirmed fraud, but likelihood is elevated on **4 recent visits**.`,
      visuals: [
        { kind: 'kpis', items: [
          { label: 'Flagged visits', value: '4', delta: 'of 65', up: false },
          { label: 'Duplicate text %', value: '11%', delta: '+6pp', up: false },
          { label: 'GPS mismatch', value: '2', hint: 'in flagged batch' },
          { label: 'Photo re-use', value: '1', hint: 'metadata match' },
        ] },
        { kind: 'table', title: 'Flagged agents', headers: ['Agent', 'Visits', 'Signal', 'Action'],
          rows: [
            [{ text: 'Karim H.', strong: true }, { text: '9' }, { text: '3 near-duplicate answer sets', tone: 'bad' }, { text: 'Review + coach', tone: 'bad' }],
            [{ text: 'Omar T.', strong: true }, { text: '6' }, { text: 'GPS 400m off branch (1 visit)', tone: 'bad' }, { text: 'Warn' }],
          ] },
      ],
    }),
  },
  {
    id: 'action-plan',
    pill: 'Action plan',
    prompt: 'Give me a 30-day action plan to improve CX.',
    keywords: ['action', 'plan', 'improve', 'roadmap', 'next steps', 'recommend'],
    followUps: ['Assign owners', 'Turn into missions', 'Estimate impact', 'Add to calendar'],
    build: () => ({
      content: `Here is a prioritized **30-day plan** — three moves that together should lift CX by an estimated **+3 points**.`,
      visuals: [
        { kind: 'callouts', title: 'Prioritized actions', items: [
          { icon: 'check', label: 'Week 1 — Wait time fix', text: 'Add a second cashier 7–10pm at CFC, MoA, Nasr City. Expected: −40% queue complaints.' },
          { icon: 'check', label: 'Week 2 — Smouha refresh', text: 'Product-knowledge training + surprise audit missions ×3. Expected: +6 pts CX.' },
          { icon: 'alert', label: 'Week 3 — Coach Karim H.', text: 'Ride-along + submission review. Reassign to lower-stakes branches until approval rate ≥85%.' },
          { icon: 'check', label: 'Week 4 — Reward top 3', text: 'Bonus + public shout-out for Ahmed M., Salma K., Youssef R.' },
        ] },
        { kind: 'kpis', title: 'Expected 30-day impact', items: [
          { label: 'CX', value: '+3.0', up: true },
          { label: 'Wait complaints', value: '−40%', up: true },
          { label: 'Smouha CX', value: '+6', up: true },
          { label: 'Cost', value: '~22k EGP' },
        ] },
      ],
    }),
  },
  {
    id: 'expansion',
    pill: 'Expansion',
    prompt: 'Where should I open my next branch?',
    keywords: ['expand', 'expansion', 'open', 'new branch', 'location', 'where should'],
    followUps: ['Detail on 6th of October', 'Compare New Cairo vs Sheikh Zayed', 'Cost model for a new site', 'Draft investor slide'],
    build: () => ({
      content: `Based on demand signals from shoppers and unmet-need feedback, **6th of October** and **Sheikh Zayed** score highest for expansion.`,
      visuals: [
        { kind: 'ranking', title: 'Expansion attractiveness score', items: [
          { name: '6th of October', value: 88, max: 100, tone: 'good' },
          { name: 'Sheikh Zayed', value: 84, max: 100, tone: 'good' },
          { name: 'Mansoura', value: 72, max: 100 },
          { name: 'Hurghada', value: 66, max: 100 },
          { name: 'Tanta', value: 58, max: 100 },
        ] },
        { kind: 'table', title: 'Signal breakdown', headers: ['City', 'Requests', 'Nearest branch', 'Est. demand', 'Payback'],
          rows: [
            [{ text: '6th of October', strong: true }, { text: '142' }, { text: '18 km' }, { text: 'High', tone: 'good' }, { text: '~9 mo', tone: 'good' }],
            [{ text: 'Sheikh Zayed', strong: true }, { text: '118' }, { text: '14 km' }, { text: 'High', tone: 'good' }, { text: '~11 mo', tone: 'good' }],
            [{ text: 'Mansoura' }, { text: '84' }, { text: '120 km' }, { text: 'Medium' }, { text: '~16 mo' }],
          ] },
      ],
    }),
  },
  {
    id: 'tbs-pilot',
    pill: 'TBS Pilot scorecard',
    prompt: 'Show the TBS Mystery Shopping Pilot scorecard for last month.',
    keywords: ['tbs', 'pilot', 'scorecard', '1-5', 'pass criteria', 'mystery shopping pilot'],
    followUps: [
      'Which branch scored highest on the TBS pilot?',
      'Break down Service score by question',
      'Where are the biggest pass-criteria gaps?',
      'Draft the TBS pilot recap for the client',
    ],
    build: () => ({
      content: `**TBS Pilot — Overall 84.6 / 100** across 4 pilot branches and 32 visits, using the 14-question 1-5 form with weighted scoring (Service 30 · Upselling 20 · Order Accuracy 25 · Product Quality 20 · Packaging 5).`,
      visuals: [
        { kind: 'hero', title: 'TBS Pilot — weighted overall', subtitle: '4 branches • 32 visits • 14 core questions', value: '84.6 / 100', badge: 'Pilot result', icon: 'trophy' },
        { kind: 'kpis', title: 'Weighted category scores', items: [
          { label: 'Service (30%)', value: '4.4 / 5', delta: '88 pts', up: true },
          { label: 'Upselling (20%)', value: '3.6 / 5', delta: '72 pts', up: false },
          { label: 'Order Accuracy (25%)', value: '4.5 / 5', delta: '90 pts', up: true },
          { label: 'Product Quality (20%)', value: '4.3 / 5', delta: '86 pts', up: true },
          { label: 'Packaging (5%)', value: '4.2 / 5', delta: '84 pts', up: true },
        ] },
        { kind: 'bar', title: 'Average rating (1-5) per question', horizontal: true,
          series: [{ key: 'r', label: 'Avg /5', color: C.primary }],
          data: [
            { name: 'Q1 Acknowledgement', r: 4.6 },
            { name: 'Q2 Greeting & Engagement', r: 4.5 },
            { name: 'Q3 Menu Support', r: 4.1 },
            { name: 'Q4 Item Availability', r: 4.4 },
            { name: 'Q5 Alternative Offered', r: 3.9 },
            { name: 'Q6 Upselling', r: 3.4 },
            { name: 'Q7 Recommendation Relevance', r: 3.8 },
            { name: 'Q8 Order Confirmation', r: 4.7 },
            { name: 'Q9 Order Timing', r: 4.2 },
            { name: 'Q10 Order Accuracy', r: 4.6 },
            { name: 'Q11 Final Check', r: 4.4 },
            { name: 'Q12 Product Quality', r: 4.3 },
            { name: 'Q13 Packaging', r: 4.2 },
            { name: 'Q14 Overall Experience', r: 4.5 },
          ] },
        { kind: 'ranking', title: 'Branch scorecard — weighted /100', items: [
          { name: 'TBS — Cairo Festival City', value: 89.2, max: 100, tone: 'good' },
          { name: 'TBS — Mall of Arabia', value: 86.4, max: 100, tone: 'good' },
          { name: 'TBS — Nasr City', value: 83.1, max: 100 },
          { name: 'TBS — Alexandria Smouha', value: 79.6, max: 100, tone: 'bad' },
        ] },
        { kind: 'callouts', title: 'Top pass-criteria gaps observed', items: [
          { icon: 'x', label: 'Q6 Upselling (3.4/5)', text: 'In 42% of visits staff did NOT proactively suggest a drink, side or upgrade — the single biggest score drag.' },
          { icon: 'alert', label: 'Q5 Alternative (3.9/5)', text: 'When an item was unavailable, only 61% of staff offered a close-match alternative without being prompted.' },
          { icon: 'alert', label: 'Q3 Menu Support (4.1/5)', text: 'Preference-based recommendations missing at Smouha; staff defaulted to reading the menu.' },
          { icon: 'check', label: 'Q8 Order Confirmation (4.7/5)', text: 'Strongest control — staff repeated full order + add-ons before payment in 94% of visits.' },
        ] },
        { kind: 'table', title: 'Must-check controls', headers: ['Control', 'Pass rate', 'Trend', 'Owner'],
          rows: [
            [{ text: 'Greeting & Staff Engagement', strong: true }, { text: '91%', tone: 'good' }, { text: '+4 pts', tone: 'good' }, { text: 'Shift lead' }],
            [{ text: 'Item Availability / Alternative', strong: true }, { text: '76%' }, { text: '−3 pts', tone: 'bad' }, { text: 'Operations' }],
            [{ text: 'Order Confirmation / Final Check', strong: true }, { text: '93%', tone: 'good' }, { text: '+2 pts', tone: 'good' }, { text: 'Cashier lead' }],
          ] },
      ],
    }),
  },
];


// ---------- Matcher — keyword score, then substring on prompt ----------
function findAnswer(text: string): Answer {
  const q = text.toLowerCase();
  let best: { s: Suggestion; score: number } | null = null;
  for (const s of ANSWERS) {
    let score = 0;
    for (const k of s.keywords) if (q.includes(k)) score += 2;
    for (const w of s.prompt.toLowerCase().split(/\W+/).filter(w => w.length > 4)) {
      if (q.includes(w)) score += 1;
    }
    if (!best || score > best.score) best = { s, score };
  }
  if (best && best.score >= 2) {
    const built = best.s.build();
    return { ...built, followUps: best.s.followUps, artifacts: artifactsFor(best.s.prompt, built) };
  }

  const fallback: Omit<Answer, 'followUps' | 'artifacts'> = {
    content: `Here's the pulse on your account. Ask me a more specific question — a branch name, a metric, or a timeframe — and I'll pull a detailed answer with charts.`,
    visuals: [
      {
        kind: 'kpis',
        items: [
          { label: 'Overall CX', value: '86.2', delta: '+2.1', up: true },
          { label: 'NPS', value: '+64', delta: '+6', up: true },
          { label: 'Visits (30d)', value: '65', delta: '+8', up: true },
          { label: 'Complaints', value: '87', delta: '−12', up: true },
        ],
      },
    ],
  };
  return {
    ...fallback,
    followUps: [
      'Which branch performed best last month?',
      'Show me the NPS trend',
      'Where am I underperforming?',
      "Draft this month's executive summary",
    ],
    artifacts: artifactsFor(text || 'account-pulse', fallback),
  };
}

// ---------- Artifact builders ----------
function csvEscape(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCSV(headers: string[], rows: (string | number)[][]): string {
  return '\uFEFF' + [headers, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');
}
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'artifact';
}

function artifactsFor(prompt: string, ans: Omit<Answer, 'followUps' | 'artifacts'>): Artifact[] {
  const base = slug(prompt);
  const arts: Artifact[] = [];

  // 1. Markdown summary of the whole answer
  arts.push({
    id: 'summary',
    name: `${base}-summary.md`,
    label: 'Summary (Markdown)',
    kind: 'md',
    build: () => {
      const lines: string[] = [];
      lines.push(`# ${prompt}`);
      lines.push('');
      lines.push(`_Generated by Shadoo AI · ${new Date().toISOString().slice(0, 10)}_`);
      lines.push('');
      lines.push(ans.content);
      lines.push('');
      for (const v of ans.visuals) {
        if ('title' in v && v.title) {
          lines.push(`## ${v.title}`);
          lines.push('');
        }
        if (v.kind === 'kpis') {
          for (const k of v.items) lines.push(`- **${k.label}**: ${k.value}${k.delta ? ` (${k.delta})` : ''}${k.hint ? ` — ${k.hint}` : ''}`);
          lines.push('');
        } else if (v.kind === 'hero') {
          lines.push(`**${v.title}** — ${v.value}${v.subtitle ? ` · ${v.subtitle}` : ''}`);
          lines.push('');
        } else if (v.kind === 'ranking') {
          for (const it of v.items) lines.push(`- ${it.name}: ${it.value}${it.unit || ''} / ${it.max}${it.unit || ''}`);
          lines.push('');
        } else if (v.kind === 'table') {
          lines.push('| ' + v.headers.join(' | ') + ' |');
          lines.push('| ' + v.headers.map(() => '---').join(' | ') + ' |');
          for (const row of v.rows) lines.push('| ' + row.map(c => c.text).join(' | ') + ' |');
          lines.push('');
        } else if (v.kind === 'callouts') {
          for (const c of v.items) lines.push(`- **${c.label}** — ${c.text}`);
          lines.push('');
        } else if (v.kind === 'line' || v.kind === 'bar') {
          const keys = v.series.map(s => s.key);
          lines.push('| ' + ['name', ...v.series.map(s => s.label)].join(' | ') + ' |');
          lines.push('| ' + ['---', ...keys.map(() => '---')].join(' | ') + ' |');
          for (const row of v.data as Record<string, unknown>[]) {
            lines.push('| ' + [String(row.name ?? ''), ...keys.map(k => String(row[k] ?? ''))].join(' | ') + ' |');
          }
          lines.push('');
        } else if (v.kind === 'donut') {
          for (const d of v.data) lines.push(`- ${d.name}: ${d.value}`);
          lines.push('');
        } else if (v.kind === 'radar') {
          lines.push(`| Metric | ${v.a} | ${v.b} |`);
          lines.push('| --- | --- | --- |');
          for (const r of v.data) lines.push(`| ${r.metric} | ${r.a} | ${r.b} |`);
          lines.push('');
        }
      }
      return lines.join('\n');
    },
  });

  // 2. One CSV per data-bearing visual
  let idx = 0;
  for (const v of ans.visuals) {
    idx += 1;
    const title = ('title' in v && v.title) ? v.title : v.kind;
    const filename = `${base}-${idx}-${slug(String(title))}.csv`;
    if (v.kind === 'kpis') {
      arts.push({
        id: `v${idx}`, name: filename, label: `${title} (CSV)`, kind: 'csv',
        build: () => toCSV(['Metric', 'Value', 'Delta', 'Hint'],
          v.items.map(k => [k.label, k.value, k.delta || '', k.hint || ''])),
      });
    } else if (v.kind === 'ranking') {
      arts.push({
        id: `v${idx}`, name: filename, label: `${title} (CSV)`, kind: 'csv',
        build: () => toCSV(['Name', 'Value', 'Max', 'Unit'],
          v.items.map(it => [it.name, it.value, it.max, it.unit || ''])),
      });
    } else if (v.kind === 'table') {
      arts.push({
        id: `v${idx}`, name: filename, label: `${title} (CSV)`, kind: 'csv',
        build: () => toCSV(v.headers, v.rows.map(r => r.map(c => c.text))),
      });
    } else if (v.kind === 'line' || v.kind === 'bar') {
      const keys = v.series.map(s => s.key);
      const labels = v.series.map(s => s.label);
      arts.push({
        id: `v${idx}`, name: filename, label: `${title} (CSV)`, kind: 'csv',
        build: () => toCSV(['Name', ...labels],
          (v.data as Record<string, unknown>[]).map(row =>
            [String(row.name ?? ''), ...keys.map(k => (row[k] as string | number) ?? '')]
          )),
      });
    } else if (v.kind === 'donut') {
      arts.push({
        id: `v${idx}`, name: filename, label: `${title} (CSV)`, kind: 'csv',
        build: () => toCSV(['Segment', 'Value'], v.data.map(d => [d.name, d.value])),
      });
    } else if (v.kind === 'radar') {
      arts.push({
        id: `v${idx}`, name: filename, label: `${title} (CSV)`, kind: 'csv',
        build: () => toCSV(['Metric', v.a, v.b], v.data.map(r => [r.metric, r.a, r.b])),
      });
    } else {
      idx -= 1; // hero / callouts covered by markdown
    }
  }

  return arts;
}

function downloadArtifact(a: Artifact) {
  const mime =
    a.kind === 'csv' ? 'text/csv;charset=utf-8'
    : a.kind === 'md' ? 'text/markdown;charset=utf-8'
    : 'application/json;charset=utf-8';
  const blob = new Blob([a.build()], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = a.name;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
}

function downloadAll(arts: Artifact[]) {
  arts.forEach((a, i) => setTimeout(() => downloadArtifact(a), i * 120));
}

// ---------- Seed conversations ----------
function seedConvo(id: string, title: string, days: number, prompt: string): Conversation {
  const ans = findAnswer(prompt);
  return {
    id, title, updatedAt: Date.now() - 1000 * 60 * 60 * 24 * days,
    messages: [
      { id: 'u', role: 'user', content: prompt },
      { id: 'a', role: 'assistant', content: ans.content, visuals: ans.visuals, followUps: ans.followUps, artifacts: ans.artifacts },
    ],
  };
}
const SEED: Conversation[] = [
  seedConvo('s01', "June executive summary", 1, "Draft an executive summary of this month's performance."),
  seedConvo('s02', 'Top branch last month', 2, 'Which branch performed best last month?'),
  seedConvo('s03', 'CFC vs Mall of Arabia', 3, 'Compare Cairo Festival City vs Mall of Arabia side by side.'),
  seedConvo('s04', 'NPS trend — 6 months', 4, 'Show me the NPS trend for the last 6 months.'),
  seedConvo('s05', 'Where to focus next', 5, 'Where am I underperforming geographically?'),
  seedConvo('s06', 'Top customer complaints', 7, 'What are customers complaining about most?'),
  seedConvo('s07', 'Mission ROI this quarter', 9, 'What is my ROI on missions this quarter?'),
  seedConvo('s08', 'Agent quality check', 11, 'Are my agents catching real issues?'),
  seedConvo('s09', 'Peak hours & service dip', 13, 'When are my busiest hours and how is service holding up?'),
  seedConvo('s10', 'Stockouts across branches', 15, 'How often are products out of stock across branches?'),
  seedConvo('s11', 'Competitor benchmark', 17, 'How do I compare to competitors on service and cleanliness?'),
  seedConvo('s12', 'Staff friendliness trend', 19, 'How is staff friendliness trending across my network?'),
  seedConvo('s13', 'Anomaly detection', 21, "Find anomalies in this month's visits."),
  seedConvo('s14', 'Q3 CX & NPS forecast', 24, 'Forecast my CX and NPS for the next 3 months.'),
  seedConvo('s15', 'Fake submissions check', 27, 'Are any agents submitting fake or copy-paste answers?'),
  seedConvo('s16', '30-day action plan', 30, 'Give me a 30-day action plan to improve CX.'),
  seedConvo('s17', 'Next branch to open', 34, 'Where should I open my next branch?'),
  seedConvo('s18', 'TBS Pilot scorecard', 1, 'Show the TBS Mystery Shopping Pilot scorecard for last month.'),
];


const QUICK_COMMANDS = [
  { id: 'q1', label: 'Compare Cairo Festival City vs Mall of Arabia side by side.', short: 'Compare two branches', icon: BarChart3 },
  { id: 'q2', label: "Draft an executive summary of this month's performance.", short: 'Executive summary', icon: FileText },
  { id: 'q3', label: "Find anomalies in this month's visits.", short: 'Find anomalies', icon: Sparkles },
  { id: 'q4', label: 'Suggest which branches need attention.', short: 'Branches to fix', icon: TrendingUp },
];

// ---------- Markdown (inline) ----------
function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const isBullet = /^\s*[-*]\s/.test(line);
    const clean = line.replace(/^\s*[-*]\s/, '');
    const parts = clean.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={j} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
        : <span key={j}>{p}</span>
    );
    if (isBullet) {
      return (
        <div key={i} className="flex gap-2 my-1">
          <span className="text-muted-foreground shrink-0">•</span>
          <div>{parts}</div>
        </div>
      );
    }
    return <p key={i} className="my-1 leading-relaxed">{parts}</p>;
  });
}

// ---------- Visual renderer ----------
const iconMap = { trophy: Trophy, alert: AlertTriangle, check: CheckCircle2, star: Star, x: XCircle };

function VisualBlock({ v }: { v: Visual }) {
  const title = 'title' in v && v.title ? (
    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{v.title}</div>
  ) : null;

  if (v.kind === 'hero') {
    const Ico = v.icon ? iconMap[v.icon] : Trophy;
    return (
      <div className="mt-3 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Ico className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          {v.badge && <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">{v.badge}</div>}
          <div className="text-base font-black">{v.title}</div>
          {v.subtitle && <div className="text-xs text-muted-foreground">{v.subtitle}</div>}
        </div>
        <div className="text-3xl font-black text-primary shrink-0">{v.value}</div>
      </div>
    );
  }

  if (v.kind === 'kpis') {
    return (
      <div className="mt-3 rounded-xl border border-border bg-card p-4">
        {title}
        <div className={cn('grid gap-3', v.items.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3')}>
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
              {k.hint && !k.delta && <div className="text-[11px] text-muted-foreground mt-0.5">{k.hint}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (v.kind === 'line') {
    return (
      <div className="mt-3 rounded-xl border border-border bg-card p-4">
        {title}
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={v.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={C.muted} />
              <YAxis tick={{ fontSize: 11 }} stroke={C.muted} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              {v.series.map(s => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color || C.primary} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (v.kind === 'bar') {
    return (
      <div className="mt-3 rounded-xl border border-border bg-card p-4">
        {title}
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={v.data} layout={v.horizontal ? 'vertical' : 'horizontal'}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              {v.horizontal ? (
                <>
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke={C.muted} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke={C.muted} width={100} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={C.muted} />
                  <YAxis tick={{ fontSize: 11 }} stroke={C.muted} />
                </>
              )}
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              {v.series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {v.series.map(s => (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color || C.primary} radius={v.horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (v.kind === 'donut') {
    return (
      <div className="mt-3 rounded-xl border border-border bg-card p-4">
        {title}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={v.data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {v.data.map((d, i) => <Cell key={i} fill={d.color || C.primary} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (v.kind === 'ranking') {
    const max = Math.max(...v.items.map(i => i.max));
    return (
      <div className="mt-3 rounded-xl border border-border bg-card p-4">
        {title}
        <div className="space-y-2.5">
          {v.items.map((r, i) => {
            const pct = (r.value / max) * 100;
            const barColor = r.tone === 'bad' ? C.bad : r.tone === 'good' ? C.good : C.primary;
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{r.name}</span>
                  <span className="font-mono font-semibold">{r.value}{r.unit ?? ''}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (v.kind === 'radar') {
    return (
      <div className="mt-3 rounded-xl border border-border bg-card p-4">
        {title}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={v.data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} stroke={C.muted} />
              <Radar name={v.a} dataKey="a" stroke={C.primary} fill={C.primary} fillOpacity={0.35} />
              <Radar name={v.b} dataKey="b" stroke={C.info} fill={C.info} fillOpacity={0.25} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (v.kind === 'table') {
    return (
      <div className="mt-3 rounded-xl border border-border bg-card p-4 overflow-x-auto">
        {title}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {v.headers.map((h, i) => (
                <th key={i} className={cn(
                  'py-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground',
                  i === 0 ? 'text-start' : 'text-end'
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v.rows.map((row, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className={cn(
                    'py-2',
                    j === 0 ? 'text-start' : 'text-end font-mono',
                    cell.strong && 'font-semibold',
                    cell.tone === 'good' && 'text-emerald-600',
                    cell.tone === 'bad' && 'text-red-600',
                  )}>{cell.text}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (v.kind === 'callouts') {
    return (
      <div className="mt-3 rounded-xl border border-border bg-card p-4">
        {title}
        <div className="space-y-2">
          {v.items.map((item, i) => {
            const Ico = iconMap[item.icon];
            const tone = item.icon === 'check' ? 'text-emerald-600 bg-emerald-500/10' :
                         item.icon === 'x' ? 'text-red-600 bg-red-500/10' :
                         'text-amber-600 bg-amber-500/10';
            return (
              <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/60 bg-background">
                <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0', tone)}>
                  <Ico className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

function formatRelative(ts: number) {
  const d = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

// ---------- + menu ----------
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
          <DropdownMenuSubTrigger><Paperclip className="h-4 w-4 me-2" />Attach</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-60">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">Attach</DropdownMenuLabel>
              <DropdownMenuItem><Paperclip className="h-4 w-4 me-2" />Upload file (CSV, PDF, image)</DropdownMenuItem>
              <DropdownMenuItem><FileText className="h-4 w-4 me-2" />Attach a saved report</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger><Command className="h-4 w-4 me-2" />Commands</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-72">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">Ready-made commands</DropdownMenuLabel>
              {QUICK_COMMANDS.map(c => {
                const Icon = c.icon;
                return (
                  <DropdownMenuItem key={c.id} onClick={() => onInsertPrompt(c.label)}>
                    <Icon className="h-4 w-4 me-2" />
                    <div className="flex flex-col">
                      <span className="text-sm">{c.short}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{c.label}</span>
                    </div>
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

// ---------- Page ----------
export default function ReportsV2Page() {
  const [conversations, setConversations] = useState<Conversation[]>(SEED);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find(c => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const isEmpty = !active;

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages.length, thinking]);
  useEffect(() => { inputRef.current?.focus(); }, [activeId]);

  const startNew = () => { setActiveId(null); setInput(''); setTimeout(() => inputRef.current?.focus(), 0); };

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
      setConversations(cs => cs.map(c => c.id === convoId ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() } : c));
    }
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const ans = findAnswer(trimmed);
      const asstMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: ans.content, visuals: ans.visuals, followUps: ans.followUps, artifacts: ans.artifacts };
      setConversations(cs => cs.map(c => c.id === convoId ? { ...c, messages: [...c.messages, asstMsg], updatedAt: Date.now() } : c));
      setThinking(false);
    }, 700);
  };

  const insertPrompt = (prompt: string) => { setInput(prompt); inputRef.current?.focus(); };
  const deleteConvo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(cs => cs.filter(c => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-[calc(100vh-8rem)] -mx-4 md:-mx-6 -my-4 md:-my-6 px-4 md:px-6 py-4 md:py-6">
        {/* Secondary nav */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-e border-border pe-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <img src={shadooLogo} alt="Shadoo" className="h-6 w-auto" />
            <span className="text-sm font-black tracking-tight">Shadoo AI</span>
          </div>
          <Button onClick={startNew} variant="outline" className="justify-start gap-2 mb-3">
            <MessageSquarePlus className="h-4 w-4" />New conversation
          </Button>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">Recent conversations</div>
          <ScrollArea className="flex-1 -me-2 pe-2">
            <div className="space-y-0.5">
              {conversations.map(c => (
                <div key={c.id} onClick={() => setActiveId(c.id)}
                  className={cn('group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-sm transition-colors',
                    activeId === c.id ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-foreground/80')}>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">{formatRelative(c.updatedAt)}</div>
                  </div>
                  <button onClick={(e) => deleteConvo(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded transition"
                    aria-label="Delete conversation">
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

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 max-w-3xl mx-auto w-full">
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={shadooCap} alt="Shadoo" className="h-16 w-auto" />
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Shadoo AI</h1>
              </div>
              <p className="text-sm md:text-base text-muted-foreground text-center max-w-lg mb-8 leading-relaxed">
                Ask anything about your branches, agents, and visits — get straight answers with charts, in seconds.
              </p>
              <div className="w-full max-w-2xl">
                <div className="rounded-2xl border border-border bg-card shadow-lg focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 transition">
                  <Textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                    placeholder="Ask Shadoo about your branches, agents, visits, or trends…"
                    rows={2}
                    className="resize-none border-0 shadow-none focus-visible:ring-0 min-h-[72px] max-h-40 bg-transparent px-5 pt-4 text-base" />
                  <div className="flex items-center justify-between px-2 pb-2">
                    <ComposerPlusMenu onInsertPrompt={insertPrompt} />
                    <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || thinking} className="h-9 w-9 rounded-full">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {ANSWERS.map(s => (
                    <button key={s.id} onClick={() => insertPrompt(s.prompt)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-accent text-muted-foreground hover:text-foreground transition">
                      {s.pill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto pt-2 pb-4 space-y-6">
                {messages.map((msg, idx) => {
                  const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1 && !thinking;
                  return (
                  <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                      msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground')}>
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
                          {msg.visuals?.map((v, i) => <VisualBlock key={i} v={v} />)}
                          {msg.artifacts && msg.artifacts.length > 0 && (
                            <div className="mt-4 rounded-xl border border-border bg-card p-4">
                              <div className="flex items-center justify-between mb-3 gap-3">
                                <div className="flex items-center gap-2">
                                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Artifacts · {msg.artifacts.length}
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadAll(msg.artifacts!)}
                                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" />Download all
                                </button>
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {msg.artifacts.map(a => {
                                  const Icon = a.kind === 'csv' ? FileSpreadsheet : a.kind === 'md' ? FileType2 : FileText;
                                  return (
                                    <button
                                      key={a.id}
                                      onClick={() => downloadArtifact(a)}
                                      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background p-2.5 text-start hover:border-primary/50 hover:bg-accent/40 transition"
                                    >
                                      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="text-xs font-semibold truncate">{a.label}</div>
                                        <div className="text-[10px] text-muted-foreground truncate">{a.name}</div>
                                      </div>
                                      <Download className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {isLastAssistant && msg.followUps && msg.followUps.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-border/60">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" />Suggested follow-ups
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
                                {msg.followUps.map((f, i) => (
                                  <button key={i} onClick={() => send(f)} disabled={thinking}
                                    className="shrink-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-accent text-foreground/80 hover:text-foreground transition disabled:opacity-50">
                                    {f}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
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
              <div className="pt-3 pb-3">
                <div className="rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition">
                  <Textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                    placeholder="Ask a follow-up…" rows={1}
                    className="resize-none border-0 shadow-none focus-visible:ring-0 min-h-[52px] max-h-40 bg-transparent px-4 pt-3.5" />
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
