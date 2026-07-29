import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileFrame } from './AgentAppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, IdCard, Camera, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import shadooCap from '@/assets/shadoo-cap.png';

type Q = { id: string; label: string; options: string[]; multi?: boolean };

const QUESTIONS: Q[] = [
  { id: 'age', label: 'What is your age group?', options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
  { id: 'gender', label: 'Gender', options: ['Male', 'Female'] },
  { id: 'city', label: 'Which city do you live in?', options: ['Cairo', 'Giza', 'Alexandria', 'Luxor', 'Aswan'] },
  { id: 'district', label: 'Which district?', options: ['Nasr City', 'Heliopolis', 'Maadi', 'Zamalek', 'Mohandessin', 'Dokki'] },
  { id: 'education', label: 'Highest education level', options: ['High school', 'Bachelor', 'Master', 'PhD'] },
  { id: 'employment', label: 'Employment status', options: ['Full-time', 'Part-time', 'Student', 'Freelancer', 'Unemployed'] },
  { id: 'income', label: 'Monthly household income (EGP)', options: ['< 10,000', '10,000 - 25,000', '25,000 - 50,000', '50,000+'] },
  { id: 'transport', label: 'How do you usually get around?', options: ['Own car', 'Motorcycle', 'Ride hailing', 'Public transport', 'Walking'] },
  { id: 'interests', label: 'Which mission categories interest you?', multi: true, options: ['F&B', 'Retail', 'Banking', 'Telecom', 'Pharmacy', 'Automotive'] },
  { id: 'availability', label: 'When are you usually available?', multi: true, options: ['Weekday mornings', 'Weekday evenings', 'Weekends', 'Anytime'] },
];

export default function AgentSignup() {
  const nav = useNavigate();
  const [step, setStep] = useState(0); // 0 account, 1 docs, 2..n questionnaire, last: submitted
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({ name: 'Ahmed Youssef', email: 'ahmed.youssef@gmail.com', phone: '+20 100 234 5678', nid: '29804151201573' });
  const [docs, setDocs] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [approved, setApproved] = useState(false);

  const qIndex = step - 2;
  const totalSteps = 2 + QUESTIONS.length;
  const progress = Math.min(100, Math.round((step / totalSteps) * 100));

  const pick = (q: Q, opt: string) => {
    setAnswers((a) => {
      const cur = a[q.id] || [];
      if (q.multi) return { ...a, [q.id]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] };
      return { ...a, [q.id]: [opt] };
    });
  };

  const back = () => (step === 0 ? nav('/agent-app') : setStep((s) => s - 1));
  const next = () => setStep((s) => s + 1);

  if (submitted) {
    return (
      <MobileFrame>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
          {approved ? (
            <>
              <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold uppercase tracking-wide">You're verified</h1>
              <p className="text-sm text-muted-foreground">Admin approved your application. You've been placed in <span className="font-bold text-foreground">Tier A</span> based on your profile.</p>
              <Button size="lg" className="w-full mt-2" onClick={() => nav('/agent-app')}>Start browsing visits</Button>
            </>
          ) : (
            <>
              <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
              <h1 className="text-xl font-bold uppercase tracking-wide">Application submitted</h1>
              <p className="text-sm text-muted-foreground">Our team is reviewing your ID and questionnaire. This usually takes less than 24 hours.</p>
              <div className="w-full rounded-xl border p-3 text-left text-xs space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-semibold">{form.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Answers</span><span className="font-semibold">{Object.keys(answers).length}/{QUESTIONS.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Documents</span><span className="font-semibold">{docs.length} uploaded</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-semibold text-amber-600">Pending review</span></div>
              </div>
              <Button variant="outline" size="lg" className="w-full mt-2" onClick={() => setApproved(true)}>Simulate admin approval</Button>
            </>
          )}
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="sticky top-0 z-30 bg-background">
        <div className="flex items-center gap-2 h-14 px-3">
          <button onClick={back} aria-label="Back" className="p-2 rounded-full hover:bg-muted"><ChevronLeft className="h-5 w-5" /></button>
          <img src={shadooCap} alt="" className="h-6 w-6 object-contain" />
          <div className="font-bold uppercase tracking-wide text-sm">Become a shopper</div>
        </div>
        <div className="h-1 bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        {step === 0 && (
          <>
            <div>
              <h2 className="text-lg font-bold">Create your account</h2>
              <p className="text-sm text-muted-foreground">We use this to match you with nearby visits.</p>
            </div>
            {[
              { k: 'name', l: 'Full name*' },
              { k: 'email', l: 'Email*' },
              { k: 'phone', l: 'Phone number*' },
              { k: 'nid', l: 'National ID*' },
            ].map((f) => (
              <div key={f.k} className="space-y-1.5">
                <Label className="text-xs uppercase font-bold tracking-wide">{f.l}</Label>
                <Input value={(form as Record<string, string>)[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} />
              </div>
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="text-lg font-bold">Verify your identity</h2>
              <p className="text-sm text-muted-foreground">Upload both sides of your national ID. Photos must be clear and unedited.</p>
            </div>
            {['National ID — front', 'National ID — back', 'Selfie holding your ID'].map((d) => {
              const done = docs.includes(d);
              return (
                <button key={d} onClick={() => setDocs((x) => (done ? x.filter((i) => i !== d) : [...x, d]))}
                  className={cn('w-full rounded-xl border-2 border-dashed p-4 flex items-center gap-3 text-left transition',
                    done ? 'border-emerald-400 bg-emerald-50' : 'hover:bg-muted/40')}>
                  <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', done ? 'bg-emerald-100' : 'bg-muted')}>
                    {done ? <Check className="h-5 w-5 text-emerald-600" /> : <IdCard className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{d}</div>
                    <div className="text-xs text-muted-foreground">{done ? 'Uploaded' : 'Tap to capture'}</div>
                  </div>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </>
        )}

        {qIndex >= 0 && qIndex < QUESTIONS.length && (() => {
          const q = QUESTIONS[qIndex];
          const sel = answers[q.id] || [];
          return (
            <>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wide text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Profile questionnaire · {qIndex + 1} of {QUESTIONS.length}
              </div>
              <h2 className="text-lg font-bold leading-snug">{q.label}</h2>
              {q.multi && <p className="text-xs text-muted-foreground">Select all that apply.</p>}
              <div className="space-y-2">
                {q.options.map((o) => {
                  const on = sel.includes(o);
                  return (
                    <button key={o} onClick={() => pick(q, o)}
                      className={cn('w-full rounded-xl border p-3.5 text-left text-sm font-medium flex items-center justify-between transition',
                        on ? 'border-primary bg-primary/5 text-foreground' : 'hover:bg-muted/40')}>
                      {o}
                      {on && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">Your answers decide which tiers and missions you qualify for.</p>
            </>
          );
        })()}
      </div>

      <div className="sticky bottom-0 bg-background border-t p-3">
        {step < totalSteps - 1 ? (
          <Button size="lg" className="w-full" onClick={next}
            disabled={(step === 1 && docs.length < 3) || (qIndex >= 0 && !(answers[QUESTIONS[qIndex].id]?.length))}>
            Continue
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={() => setSubmitted(true)}
            disabled={!(answers[QUESTIONS[QUESTIONS.length - 1].id]?.length)}>
            Submit application
          </Button>
        )}
      </div>
    </MobileFrame>
  );
}
