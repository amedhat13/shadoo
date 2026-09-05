import { Button } from '@/components/ui/button';
import { Pin, PinOff } from 'lucide-react';
import { getLocalizedValue } from '@/i18n/utils';
import { useReportPins } from '@/hooks/useReportPins';
import { isMeasurable, questionKey } from '@/lib/reportInsights';

/** Pin / unpin a measurable question so it shows in the Reports overview. */
export function QuestionPinToggle({ question, language, ownerId }: { question: any; language: string; ownerId?: string }) {
  const { isPinned, toggle, canEdit } = useReportPins(ownerId);
  if (!canEdit || !isMeasurable(question)) return null;

  const key = questionKey(question);
  if (!key) return null;
  const pinned = isPinned(key);
  const label = getLocalizedValue(question.text, language) || key;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      title={pinned ? 'Unpin from overview' : 'Pin to overview'}
      onClick={() => toggle({ question_key: key, label })}
    >
      {pinned ? <PinOff className="h-4 w-4 text-primary" /> : <Pin className="h-4 w-4 text-muted-foreground" />}
    </Button>
  );
}
