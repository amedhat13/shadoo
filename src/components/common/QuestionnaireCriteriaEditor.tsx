import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgentQuestionnaireTemplate, type AgentQuestion } from '@/hooks/useAgentQuestionnaireTemplate';
import type { QuestionnaireCriterion } from '@/lib/agentHelpers';

interface Props {
  value: QuestionnaireCriterion[];
  onChange: (next: QuestionnaireCriterion[]) => void;
  title?: string;
  description?: string;
  compact?: boolean;
}

/**
 * Renders every question from the agent registration questionnaire as a chip
 * filter. The client/admin selects the option values they want to allow per
 * question; any agent whose answer matches at least one selected option for
 * every configured question is considered a match.
 *
 * Operator mapping:
 *   - `select`      → `is_one_of`         (agent answer must be in selected values)
 *   - `multiselect` → `includes_any_of`   (any overlap between agent answers and selection)
 */
export function QuestionnaireCriteriaEditor({
  value,
  onChange,
  title,
  description,
  compact = false,
}: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: questions, isLoading } = useAgentQuestionnaireTemplate();

  const getCriterion = (q: AgentQuestion) =>
    value.find(c => c.question_label.en === q.label.en);

  const updateCriterion = (q: AgentQuestion, selected: string[]) => {
    const next = value.filter(c => c.question_label.en !== q.label.en);
    if (selected.length > 0) {
      next.push({
        question_label: { en: q.label.en, ar: q.label.ar },
        question_type: q.type,
        operator: q.type === 'multiselect' ? 'includes_any_of' : 'is_one_of',
        values: selected,
      });
    }
    onChange(next);
  };

  const toggleOption = (q: AgentQuestion, optionEn: string) => {
    const current = getCriterion(q)?.values || [];
    const next = current.includes(optionEn)
      ? current.filter(v => v !== optionEn)
      : [...current, optionEn];
    updateCriterion(q, next);
  };

  const clearQuestion = (q: AgentQuestion) => updateCriterion(q, []);

  const activeCount = value.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wide">
            {title || t('Questionnaire-based filters', { defaultValue: 'Questionnaire-Based Filters' })}
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            {description || t(
              'Pick allowed answers per question — agents whose registration answers fall outside any filter are excluded.',
              { defaultValue: 'Pick allowed answers per question. Agents are matched only if every configured question has at least one of the selected answers.' }
            )}
          </p>
        </div>
        {activeCount > 0 && (
          <Badge variant="outline" className="shrink-0">
            {activeCount} active
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="py-6 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></div>
      ) : !questions || questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No agent questionnaire configured.</p>
      ) : (
        <div className={cn('space-y-4', compact && 'space-y-3')}>
          {questions.map(q => {
            const criterion = getCriterion(q);
            const selected = criterion?.values || [];
            const isActive = selected.length > 0;
            const labelText = isAr && q.label.ar ? q.label.ar : q.label.en;

            return (
              <div
                key={q.id}
                className={cn(
                  'border rounded-md p-3 transition-colors',
                  isActive ? 'border-primary/40 bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Label className="text-xs font-semibold">
                    {labelText}
                    <span className="ml-2 text-[10px] uppercase text-muted-foreground">
                      {q.type === 'multiselect' ? 'any of' : 'one of'}
                    </span>
                  </Label>
                  {isActive && (
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground hover:text-destructive"
                      onClick={() => clearQuestion(q)}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map(opt => {
                    const isSelected = selected.includes(opt.en);
                    const optLabel = isAr && opt.ar ? opt.ar : opt.en;
                    return (
                      <button
                        key={opt.en}
                        type="button"
                        onClick={() => toggleOption(q, opt.en)}
                        className={cn(
                          'px-2 py-0.5 text-xs border rounded transition-all',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {optLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
