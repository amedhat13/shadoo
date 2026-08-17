import type { CompletedVisit, CompletedVisitAnswer } from '@/components/missions/CompletedVisitsDialog';
import type { PhotoSlot, Question, QuestionSection } from '@/types';

type Bilingual = { en?: string; ar?: string };

const bi = (v: unknown): Bilingual => {
  if (!v) return {};
  if (typeof v === 'string') return { en: v };
  return v as Bilingual;
};

export interface RawVisit {
  id: string;
  status?: string | null;
  purchase_amount?: number | null;
  submitted_at?: string | null;
  started_at?: string | null;
  created_at?: string | null;
  answers?: unknown;
  photos?: string[] | null;
  receipt_photo?: string | null;
  client_rating?: number | null;
  client_feedback?: string | null;
  rated_at?: string | null;
}

export interface MissionLike {
  questions?: unknown;
  question_sections?: unknown;
  photo_requirements?: unknown;
  receipt?: unknown;
}

interface RawAnswer {
  question_id?: string;
  value?: unknown;
  na?: boolean;
  not_applicable?: boolean;
  comment?: string;
}

/** Builds the enriched completed-visit payload (sections, descriptions, N/A, comments). */
export function buildCompletedVisits(mission: MissionLike | null | undefined, visits: RawVisit[]): CompletedVisit[] {
  if (!mission) return [];
  const questions = (Array.isArray(mission.questions) ? mission.questions : []) as Question[];
  const sections = (Array.isArray(mission.question_sections) ? mission.question_sections : []) as QuestionSection[];
  const sectionLabel = (id?: string) => {
    if (!id) return undefined;
    const s = sections.find((x) => x.id === id);
    const label = bi(s?.label);
    return label.en || label.ar || undefined;
  };
  const qMap = new Map<string, Question>();
  questions.forEach((q) => qMap.set(q.id, q));

  return visits.map((v) => {
    const arr = (Array.isArray(v.answers) ? v.answers : []) as RawAnswer[];
    const answers: CompletedVisitAnswer[] = arr.map((a) => {
      const q = a.question_id ? qMap.get(a.question_id) : undefined;
      const text = bi(q?.text);
      const desc = bi(q?.description);
      return {
        question: text.en || text.ar || a.question_id || '—',
        question_ar: text.ar,
        description: desc.en,
        description_ar: desc.ar,
        section: sectionLabel(q?.section_id),
        type: q?.type || 'short_text',
        max_rating: q?.max_rating,
        answer: (a.value ?? '') as string | number | boolean,
        not_applicable: Boolean(a.na ?? a.not_applicable),
        comment: a.comment || undefined,
      };
    });

    return {
      id: v.id,
      agent_name: 'Mystery Shopper',
      completed_at: v.submitted_at || v.started_at || v.created_at || new Date().toISOString(),
      purchase_amount: Number(v.purchase_amount || 0),
      photos: v.photos || [],
      receipt_photo: v.receipt_photo ?? undefined,
      answers,
      client_rating: v.client_rating ?? undefined,
      client_feedback: v.client_feedback ?? undefined,
      rated_at: v.rated_at ?? undefined,
    };
  });
}

/** Named photo slots configured on the mission, if any. */
export function getMissionPhotoSlots(mission: MissionLike | null | undefined): PhotoSlot[] {
  const pr = mission?.photo_requirements as { slots?: PhotoSlot[] } | undefined;
  return Array.isArray(pr?.slots) ? pr!.slots! : [];
}

/** Reimbursement cap from the mission receipt config. */
export function getMissionReceiptCap(mission: MissionLike | null | undefined): number | undefined {
  const r = mission?.receipt as { enabled?: boolean; capEGP?: number } | undefined;
  return r?.enabled ? r.capEGP : undefined;
}
