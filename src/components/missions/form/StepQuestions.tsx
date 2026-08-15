import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Camera, GripVertical, FileText, Image, Upload, X, Shield, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MissionFormData, Question, QuestionType, QuestionOption, QuestionPhotoRequirement, QuestionSection } from '@/types';
import { QUESTION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { BilingualValue, ensureBilingual, getBilingualText, getLocalizedValue } from '@/i18n/utils';
import { useQuestionTemplates, QuestionTemplate, TEMPLATE_GROUPS } from '@/hooks/useQuestionTemplates';
import { LoadingState } from '@/components/common/LoadingState';

interface StepQuestionsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

export function StepQuestions({ data, onChange }: StepQuestionsProps) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const { t, i18n } = useTranslation('missions');
  const { t: tc } = useTranslation('common');
  const lang = i18n.language;

  const { templates: dbTemplates, isLoading: templatesLoading } = useQuestionTemplates();

  // ===== Sections (required — at least one) =====
  const sections: QuestionSection[] = data.question_sections && data.question_sections.length > 0
    ? data.question_sections
    : [{ id: `sec-default`, label: { en: 'General', ar: 'عام' } }];

  // Ensure at least one section exists in form state on mount, and every question has a section_id.
  useEffect(() => {
    const hasSections = data.question_sections && data.question_sections.length > 0;
    const firstSectionId = hasSections ? data.question_sections![0].id : 'sec-default';
    const needsSectionFallback = data.questions.some((q) => !q.section_id);
    if (!hasSections || needsSectionFallback) {
      onChange({
        question_sections: hasSections
          ? data.question_sections
          : [{ id: firstSectionId, label: { en: 'General', ar: 'عام' } }],
        questions: data.questions.map((q) => (q.section_id ? q : { ...q, section_id: firstSectionId })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSections = (next: QuestionSection[]) => onChange({ question_sections: next });

  const addSection = () => {
    const newSection: QuestionSection = {
      id: `sec-${Date.now()}`,
      label: { en: '', ar: '' },
    };
    updateSections([...sections, newSection]);
  };

  const updateSection = (id: string, patch: Partial<QuestionSection>) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) return; // must keep at least one
    const remaining = sections.filter((s) => s.id !== id);
    const fallbackId = remaining[0].id;
    updateSections(remaining);
    onChange({
      questions: data.questions.map((q) => (q.section_id === id ? { ...q, section_id: fallbackId } : q)),
    });
  };

  const addQuestion = (sectionId?: string) => {
    const targetSection = sectionId || sections[0].id;
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'short_text',
      text: { en: '', ar: '' },
      required: true,
      section_id: targetSection,
    };
    onChange({ questions: [...data.questions, newQuestion] });
    setEditingQuestionId(newQuestion.id);
  };

  const applyTemplate = (template: QuestionTemplate) => {
    // Templates land in their own section named after the template.
    const newSectionId = `sec-${Date.now()}`;
    const newSection: QuestionSection = {
      id: newSectionId,
      label: { en: template.name, ar: (template as any).name_ar || template.name },
    };
    const newQuestions: Question[] = template.questions.map((q, index) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
      section_id: newSectionId,
      options: q.options?.map((opt, optIndex) => ({
        ...opt,
        id: `opt-${Date.now()}-${index}-${optIndex}`,
      })),
    }));

    onChange({
      question_sections: [...sections, newSection],
      questions: [...data.questions, ...newQuestions],
      methodology: template.methodology || 'custom',
    });
    setTemplateDialogOpen(false);
  };

  const clearMethodology = () => {
    onChange({ methodology: 'custom' });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onChange({
      questions: data.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    });
  };

  const removeQuestion = (id: string) => {
    onChange({ questions: data.questions.filter((q) => q.id !== id) });
    if (editingQuestionId === id) {
      setEditingQuestionId(null);
    }
  };

  const addOption = (questionId: string) => {
    const question = data.questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      text: { en: '', ar: '' },
    };
    updateQuestion(questionId, {
      options: [...(question.options || []), newOption],
    });
  };

  const updateOption = (questionId: string, optionId: string, text: string | BilingualValue) => {
    const question = data.questions.find((q) => q.id === questionId);
    if (!question?.options) return;

    updateQuestion(questionId, {
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    });
  };

  const removeOption = (questionId: string, optionId: string) => {
    const question = data.questions.find((q) => q.id === questionId);
    if (!question?.options) return;

    updateQuestion(questionId, {
      options: question.options.filter((opt) => opt.id !== optionId),
    });
  };

  const handleTypeChange = (questionId: string, type: QuestionType) => {
    const updates: Partial<Question> = { type };
    
    if (type === 'multiple_choice') {
      updates.options = [
        { id: `opt-${Date.now()}-1`, text: { en: '', ar: '' } },
        { id: `opt-${Date.now()}-2`, text: { en: '', ar: '' } },
      ];
    } else {
      updates.options = undefined;
    }
    
    if (type === 'rating') {
      updates.max_rating = 5;
    } else {
      updates.max_rating = undefined;
    }
    
    updateQuestion(questionId, updates);
  };

  const updatePhotoRequirement = (questionId: string, photoReq: Partial<QuestionPhotoRequirement>) => {
    const question = data.questions.find((q) => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      photoRequirement: {
        enabled: question.photoRequirement?.enabled || false,
        ...question.photoRequirement,
        ...photoReq,
      },
    });
  };

  const getPhotoTriggerLabel = (question: Question) => {
    if (question.type === 'rating') {
      const threshold = question.photoRequirement?.ratingThreshold || 70;
      return t('questions_section.require_photo_rating', { threshold });
    }
    if (question.type === 'yes_no') {
      return t('questions_section.require_photo_no');
    }
    return '';
  };

  const canHavePhotoRequirement = (type: QuestionType) => {
    return type === 'rating' || type === 'yes_no';
  };

  // Group templates for display
  const getGroupedTemplates = () => {
    const filtered = dbTemplates.filter(tpl => {
      if (!templateSearch) return true;
      const q = templateSearch.toLowerCase();
      return tpl.name.toLowerCase().includes(q) || (tpl.name_ar || '').includes(q);
    });

    const groups: { key: string; label: string; templates: QuestionTemplate[] }[] = [];
    
    for (const [, group] of Object.entries(TEMPLATE_GROUPS)) {
      const groupTemplates = filtered.filter(t => group.categories.includes(t.category || 'Custom'));
      if (groupTemplates.length > 0) {
        groups.push({ key: group.key, label: t(`questions_section.group_${group.key}`, { defaultValue: group.key }), templates: groupTemplates });
      }
    }

    return groups;
  };

  const getTemplateName = (tpl: QuestionTemplate) => {
    if (lang === 'ar' && tpl.name_ar) return tpl.name_ar;
    return tpl.name;
  };

  const getTemplateDesc = (tpl: QuestionTemplate) => {
    if (lang === 'ar' && tpl.description_ar) return tpl.description_ar;
    return tpl.description || '';
  };

  return (
    <div className="space-y-6">
      {/* Methodology Badge */}
      {data.methodology && data.methodology !== 'custom' && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20">
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            {t('questions_section.using_template')}{' '}
            {dbTemplates.find(t => t.methodology === data.methodology)?.name || data.methodology}
          </Badge>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearMethodology}>
            <X className="h-3 w-3 me-1" />
            {t('questions_section.clear_template')}
          </Button>
        </div>
      )}

      {/* Template Selection */}
      <div className="border border-dashed border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">{t('questions_section.templates_title')}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t('questions_section.templates_desc')}
            </p>
          </div>
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                {t('questions_section.use_template')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-black uppercase tracking-tight">
                  {t('questions_section.templates_dialog_title')}
                </DialogTitle>
                <DialogDescription>
                  {t('questions_section.templates_dialog_desc')}
                </DialogDescription>
              </DialogHeader>

              {/* Search */}
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('questions_section.search_templates')}
                  value={templateSearch}
                  onChange={e => setTemplateSearch(e.target.value)}
                  className="ps-9"
                />
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-6 py-2">
                {templatesLoading ? (
                  <LoadingState />
                ) : (
                  getGroupedTemplates().map(group => (
                    <div key={group.key}>
                      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
                        {group.label}
                      </h4>
                      <div className="grid gap-2">
                        {group.templates.map(template => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            className="flex items-start gap-4 border border-border p-3 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm">{getTemplateName(template)}</h4>
                                {template.created_by === null && (
                                  <Badge variant="outline" className="gap-1 text-[10px]">
                                    <Shield className="h-3 w-3" />
                                    {t('questions_section.system_template')}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px]">
                                  {template.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {getTemplateDesc(template)}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {t('questions_section.question_count', { count: template.questions.length })}
                              </p>
                            </div>
                            <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sections & Questions — at least one section is required */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wide">
              Sections
            </Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t('questions_section.count', { count: data.questions.length })} · {sections.length} {sections.length === 1 ? 'section' : 'sections'} (at least one required)
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addSection} className="gap-2">
            <Plus className="h-4 w-4" /> Add section
          </Button>
        </div>

        <div className="space-y-6">
          {sections.map((section, sIdx) => {
            const sectionQuestions = data.questions.filter((q) => (q.section_id || sections[0].id) === section.id);
            return (
              <div key={section.id} className="border border-border">
                <div className="bg-muted/40 border-b border-border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Section {sIdx + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      disabled={sections.length <= 1}
                      title={sections.length <= 1 ? 'At least one section is required' : 'Remove section'}
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      dir="ltr"
                      placeholder="Section name (EN) — e.g. Welcome & Greeting"
                      value={section.label.en}
                      onChange={(e) => updateSection(section.id, { label: { ...section.label, en: e.target.value } })}
                    />
                    <Input
                      dir="rtl"
                      placeholder="اسم القسم (AR) — مثال: الترحيب والاستقبال"
                      value={section.label.ar}
                      onChange={(e) => updateSection(section.id, { label: { ...section.label, ar: e.target.value } })}
                      className="font-ar"
                    />
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  {sectionQuestions.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No questions in this section yet.
                    </p>
                  )}
                  {sectionQuestions.map((question) => {
                    const index = data.questions.findIndex((q) => q.id === question.id);
                    return (
              <div
                key={question.id}
                className={cn(
                  'border border-border',
                  editingQuestionId === question.id && 'ring-2 ring-primary'
                )}
              >
                {(() => {
                  const isEditing = editingQuestionId === question.id;
                  const textEn = ensureBilingual(question.text).en;
                  const textAr = ensureBilingual(question.text).ar;
                  const preview =
                    (lang === 'ar' && textAr ? textAr : textEn) || textAr || t('questions_section.enter_question');
                  const typeLabel = QUESTION_TYPE_LABELS[question.type] || question.type;
                  const tags: { label: string; tone?: 'primary' }[] = [];
                  tags.push({
                    label:
                      question.type === 'rating'
                        ? `${typeLabel} ${question.max_rating || 5}`
                        : question.type === 'multiple_choice'
                        ? `${typeLabel} · ${question.options?.length || 0}`
                        : typeLabel,
                  });
                  if (!question.required) tags.push({ label: 'Optional' });
                  const canHaveNA = question.type !== 'short_text' && question.type !== 'multiple_choice';
                  if (canHaveNA && question.allowNA) tags.push({ label: 'N/A', tone: 'primary' });
                  const commentMode = question.commentMode ?? 'optional';
                  if (question.type !== 'short_text' && commentMode === 'required') tags.push({ label: 'Comment req.', tone: 'primary' });
                  if (question.type !== 'short_text' && (question.suggestedComments?.length || 0) > 0)
                    tags.push({ label: `${question.suggestedComments!.length} suggested` });
                  if (question.photoRequirement?.enabled) {
                    if (question.type === 'yes_no') {
                      tags.push({ label: `Photo on ${question.photoRequirement.triggerAnswer ?? 'no'}`, tone: 'primary' });
                    } else if (question.type === 'rating') {
                      tags.push({
                        label:
                          question.photoRequirement.triggerAnswer === 'any'
                            ? 'Photo · any'
                            : `Photo <${question.photoRequirement.ratingThreshold || 70}%`,
                        tone: 'primary',
                      });
                    }
                  }
                  const descEn = (ensureBilingual(question.description || '').en || '').trim();
                  const descAr = (ensureBilingual(question.description || '').ar || '').trim();
                  if (descEn || descAr) tags.push({ label: 'Why we ask' });
                  return (
                    <>
                      {/* Compact header — always visible */}
                      <div className="flex items-center gap-3 p-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">
                          {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingQuestionId(isEditing ? null : question.id)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="text-sm font-medium truncate">{preview}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tags.map((tag, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                  tag.tone === 'primary'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setEditingQuestionId(isEditing ? null : question.id)}
                        >
                          <ChevronDown className={cn('h-4 w-4 transition-transform', isEditing && 'rotate-180')} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {isEditing && (
                        <div className="border-t border-border p-3">
                          <div className="space-y-3">
                    {/* Question Text - Bilingual */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" onFocus={() => setEditingQuestionId(question.id)}>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('english')}</span>
                        <Input
                          placeholder={t('questions_section.enter_question')}
                          value={ensureBilingual(question.text).en}
                          onChange={(e) => updateQuestion(question.id, { text: { ...ensureBilingual(question.text), en: e.target.value } })}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('arabic')}</span>
                        <Input
                          placeholder={t('questions_section.enter_question')}
                          value={ensureBilingual(question.text).ar}
                          onChange={(e) => updateQuestion(question.id, { text: { ...ensureBilingual(question.text), ar: e.target.value } })}
                          dir="rtl"
                          className="font-ar"
                        />
                      </div>
                    </div>

                    {/* "Why we ask" — bilingual description shown under the question in the agent app */}
                    <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Why we ask?</span>
                        <span className="text-[10px] text-muted-foreground">(shown to the agent — 2 lines max, bilingual)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Textarea
                          rows={2}
                          placeholder="Keywords the agent should evaluate. e.g. greeting within 30s, eye contact, felt welcomed."
                          value={ensureBilingual(question.description || '').en}
                          onChange={(e) => updateQuestion(question.id, { description: { ...ensureBilingual(question.description || ''), en: e.target.value } })}
                          dir="ltr"
                          className="text-xs resize-none bg-background"
                        />
                        <Textarea
                          rows={2}
                          placeholder="مثال: تحية خلال 30 ثانية، تواصل بصري، شعور بالترحيب."
                          value={ensureBilingual(question.description || '').ar}
                          onChange={(e) => updateQuestion(question.id, { description: { ...ensureBilingual(question.description || ''), ar: e.target.value } })}
                          dir="rtl"
                          className="text-xs resize-none font-ar bg-background"
                        />
                      </div>
                    </div>



                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Question Type */}
                      <Select
                        value={question.type}
                        onValueChange={(value) => handleTypeChange(question.id, value as QuestionType)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short_text">{t('questions_section.short_text')}</SelectItem>
                          <SelectItem value="multiple_choice">{t('questions_section.multiple_choice')}</SelectItem>
                          <SelectItem value="yes_no">{t('questions_section.yes_no')}</SelectItem>
                          <SelectItem value="rating">{t('questions_section.rating')}</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Rating max value */}
                      {question.type === 'rating' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{t('questions_section.max_label')}</span>
                          <Select
                            value={String(question.max_rating || 5)}
                            onValueChange={(value) =>
                              updateQuestion(question.id, { max_rating: parseInt(value) })
                            }
                          >
                            <SelectTrigger className="w-[70px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Multiple Choice Options */}
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3 ps-4 border-s-2 border-muted">
                        {question.options?.map((option) => (
                          <div key={option.id} className="flex items-start gap-2">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                placeholder={`${t('questions_section.option_text')} (EN)`}
                                value={ensureBilingual(option.text).en}
                                onChange={(e) =>
                                  updateOption(question.id, option.id, { ...ensureBilingual(option.text), en: e.target.value })
                                }
                                dir="ltr"
                              />
                              <Input
                                placeholder={`${t('questions_section.option_text')} (AR)`}
                                value={ensureBilingual(option.text).ar}
                                onChange={(e) =>
                                  updateOption(question.id, option.id, { ...ensureBilingual(option.text), ar: e.target.value })
                                }
                                dir="rtl"
                                className="font-ar"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(question.id, option.id)}
                              disabled={(question.options?.length || 0) <= 2}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addOption(question.id)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {t('questions_section.add_option')}
                        </Button>
                      </div>
                    )}

                    {/* Answer behaviour in the agent app */}
                    <div className="border-t border-border pt-3 mt-3 space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Answer behaviour in the app
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Allow N/A — not available for short_text or multiple_choice */}
                        {question.type !== 'short_text' && question.type !== 'multiple_choice' && (
                          <div className="flex items-start gap-3 rounded-md border border-border p-3">
                            <Switch
                              checked={question.allowNA ?? false}
                              onCheckedChange={(checked) => updateQuestion(question.id, { allowNA: checked })}
                            />
                            <div>
                              <div className="text-sm font-semibold">Allow "Not applicable"</div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                N/A skips any photo or comment requirement on this question and excludes it from scoring.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>


                      {/* Comment — not available for short_text */}
                      {question.type !== 'short_text' && (
                        <div className="flex flex-wrap items-center gap-3">
                          <Label className="text-xs text-muted-foreground">Comment</Label>
                          <Select
                            value={question.commentMode ?? 'optional'}
                            onValueChange={(value) =>
                              updateQuestion(question.id, { commentMode: value as 'off' | 'optional' | 'required' })
                            }
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="off">Off</SelectItem>
                              <SelectItem value="optional">Optional (default)</SelectItem>
                              <SelectItem value="required">Required</SelectItem>
                            </SelectContent>
                          </Select>
                          {(question.commentMode ?? 'optional') !== 'off' && (
                            <span className="text-[11px] text-muted-foreground">
                              The app shows an "Add a comment" button under the answer.
                            </span>
                          )}
                          {(question.commentMode ?? 'optional') === 'required' && question.allowNA && (
                            <span className="text-[11px] text-primary">
                              Choosing N/A skips the required comment.
                            </span>
                          )}
                        </div>
                      )}

                      {/* Suggested comments — up to 4 bilingual chips */}
                      {question.type !== 'short_text' && (question.commentMode ?? 'optional') !== 'off' && (
                        <div className="space-y-2 rounded-md border border-dashed border-border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Suggested comments (max 4)
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                One-tap chips shown above the keyboard in the app.
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1 shrink-0"
                              disabled={(question.suggestedComments?.length || 0) >= 4}
                              onClick={() =>
                                updateQuestion(question.id, {
                                  suggestedComments: [
                                    ...(question.suggestedComments || []),
                                    { id: `sc-${Date.now()}`, en: '', ar: '' },
                                  ],
                                })
                              }
                            >
                              <Plus className="h-3.5 w-3.5" /> Add chip
                            </Button>
                          </div>

                          {(question.suggestedComments || []).map((sc) => (
                            <div key={sc.id} className="flex items-start gap-2">
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Input
                                  dir="ltr"
                                  className="text-xs"
                                  placeholder="e.g. Staff was friendly"
                                  value={sc.en}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      suggestedComments: (question.suggestedComments || []).map((x) =>
                                        x.id === sc.id ? { ...x, en: e.target.value } : x
                                      ),
                                    })
                                  }
                                />
                                <Input
                                  dir="rtl"
                                  className="text-xs font-ar"
                                  placeholder="مثال: الموظف كان ودودًا"
                                  value={sc.ar}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      suggestedComments: (question.suggestedComments || []).map((x) =>
                                        x.id === sc.id ? { ...x, ar: e.target.value } : x
                                      ),
                                    })
                                  }
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() =>
                                  updateQuestion(question.id, {
                                    suggestedComments: (question.suggestedComments || []).filter((x) => x.id !== sc.id),
                                  })
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Photo Requirement for rating and yes/no questions only */}
                    {canHavePhotoRequirement(question.type) && (

                      <div className="border-t border-border pt-3 mt-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={question.photoRequirement?.enabled || false}
                            onCheckedChange={(checked) =>
                              updatePhotoRequirement(question.id, { 
                                enabled: checked,
                                triggerCondition: question.type === 'rating' 
                                  ? 'low_rating' 
                                  : 'negative_answer',
                                ratingThreshold: question.type === 'rating' ? 70 : undefined,
                              })
                            }
                          />
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Photo attachment</span>
                          </div>
                        </div>

                        {/* Which answer triggers the photo (yes/no questions) */}
                        {question.photoRequirement?.enabled && question.type === 'yes_no' && (
                          <div className="pl-8 flex flex-wrap items-center gap-3">
                            <Label className="text-xs text-muted-foreground">Ask for a photo when the answer is</Label>
                            <Select
                              value={question.photoRequirement.triggerAnswer ?? 'no'}
                              onValueChange={(value) =>
                                updatePhotoRequirement(question.id, { triggerAnswer: value as 'yes' | 'no' | 'any' })
                              }
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="any">Any answer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {question.photoRequirement?.enabled && question.allowNA && (
                          <p className="pl-8 text-[11px] text-primary">
                            Choosing "Not applicable" skips this photo requirement.
                          </p>
                        )}

                        {/* Rating trigger — any rating or below a threshold */}
                        {question.photoRequirement?.enabled && question.type === 'rating' && (
                          <div className="pl-8 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <Label className="text-xs text-muted-foreground">Ask for a photo when the rating is</Label>
                              <Select
                                value={question.photoRequirement.triggerAnswer === 'any' ? 'any' : 'low'}
                                onValueChange={(value) =>
                                  updatePhotoRequirement(question.id, {
                                    triggerAnswer: value === 'any' ? 'any' : undefined,
                                    ratingThreshold: value === 'any' ? undefined : question.photoRequirement?.ratingThreshold || 70,
                                  })
                                }
                              >
                                <SelectTrigger className="w-[170px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Below a threshold</SelectItem>
                                  <SelectItem value="any">Any rating</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {question.photoRequirement.triggerAnswer !== 'any' && (
                              <>
                                <div className="flex items-center gap-4">
                                  <input
                                    type="range"
                                    min={10}
                                    max={90}
                                    step={10}
                                    value={question.photoRequirement.ratingThreshold || 70}
                                    onChange={(e) =>
                                      updatePhotoRequirement(question.id, { ratingThreshold: parseInt(e.target.value) })
                                    }
                                    className="flex-1"
                                  />
                                  <span className="text-sm font-semibold w-12 text-right">
                                    {question.photoRequirement.ratingThreshold || 70}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {t('questions_section.trigger_stars', {
                                    max: question.max_rating || 5,
                                    threshold: Math.ceil(((question.photoRequirement.ratingThreshold || 70) / 100) * (question.max_rating || 5)),
                                  })}
                                </p>
                              </>
                            )}
                          </div>
                        )}


                        {question.photoRequirement?.enabled && (
                          <div className="pl-8 space-y-3">
                            {/* Sample photo upload */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                {t('questions_section.sample_photo')}
                              </Label>
                              <div className="flex items-center gap-3">
                                {question.photoRequirement.samplePhotoUrl ? (
                                  <div className="relative w-20 h-20 border border-border rounded overflow-hidden">
                                    <img
                                      src={question.photoRequirement.samplePhotoUrl}
                                      alt="Sample"
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updatePhotoRequirement(question.id, { samplePhotoUrl: undefined })
                                      }
                                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border cursor-pointer hover:border-primary transition-colors">
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{t('questions_section.upload_sample')}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const url = URL.createObjectURL(file);
                                          updatePhotoRequirement(question.id, { samplePhotoUrl: url });
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {t('questions_section.show_agents_example')}
                              </p>
                            </div>

                            {/* Photo instructions - bilingual */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                {t('questions_section.photo_instructions')}
                              </Label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('english')}</span>
                                  <Textarea
                                    placeholder={t('questions_section.photo_instructions_placeholder')}
                                    value={typeof question.photoRequirement.instructions === 'object' ? (question.photoRequirement.instructions as any).en || '' : question.photoRequirement.instructions || ''}
                                    onChange={(e) => {
                                      const current = typeof question.photoRequirement!.instructions === 'object' ? question.photoRequirement!.instructions as any : { en: question.photoRequirement!.instructions || '', ar: '' };
                                      updatePhotoRequirement(question.id, { instructions: { ...current, en: e.target.value } as any });
                                    }}
                                    rows={2}
                                    dir="ltr"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('arabic')}</span>
                                  <Textarea
                                    placeholder={t('questions_section.photo_instructions_placeholder')}
                                    value={typeof question.photoRequirement.instructions === 'object' ? (question.photoRequirement.instructions as any).ar || '' : ''}
                                    onChange={(e) => {
                                      const current = typeof question.photoRequirement!.instructions === 'object' ? question.photoRequirement!.instructions as any : { en: question.photoRequirement!.instructions || '', ar: '' };
                                      updatePhotoRequirement(question.id, { instructions: { ...current, ar: e.target.value } as any });
                                    }}
                                    rows={2}
                                    dir="rtl"
                                    className="font-ar"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(section.id)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('questions_section.add_question')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Photo Requirements */}
      <div className="border-t border-border pt-6 space-y-4">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Camera className="h-4 w-4" />
          {t('questions_section.general_photo_req')}
        </Label>
        <p className="text-xs text-muted-foreground">
          {t('questions_section.general_photo_desc')}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="photoCount" className="text-xs text-muted-foreground">
              {t('questions_section.required_photos')}
            </Label>
            <Input
              id="photoCount"
              type="number"
              min={0}
              value={data.photo_requirements.required_count}
              onChange={(e) => {
                const count = Math.max(0, parseInt(e.target.value) || 0);
                const current = data.photo_requirements.slots || [];
                const next = [...current];
                while (next.length < count) {
                  next.push({
                    id: crypto.randomUUID(),
                    label: { en: '', ar: '' },
                    hint: { en: '', ar: '' },
                    required: true,
                  });
                }
                next.length = Math.max(count, 0);
                onChange({
                  photo_requirements: {
                    ...data.photo_requirements,
                    required_count: count,
                    slots: next,
                  },
                });
              }}
            />

          </div>
        </div>

        {/* Named Photo Slots */}
        {(() => {
          const slots = data.photo_requirements.slots || [];
          const updateSlots = (next: typeof slots) =>
            onChange({ photo_requirements: { ...data.photo_requirements, slots: next } });
          const addSlot = () =>
            updateSlots([
              ...slots,
              { id: crypto.randomUUID(), label: { en: '', ar: '' }, hint: { en: '', ar: '' }, required: true },
            ]);
          const removeSlot = (id: string) => updateSlots(slots.filter((s) => s.id !== id));
          const setSlot = (
            id: string,
            patch: Partial<{ label: { en: string; ar: string }; hint: { en: string; ar: string }; required: boolean }>
          ) => updateSlots(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));


          return (
            <div className="space-y-3 rounded-md border border-dashed border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Named Photo Slots</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Give each photo a title (e.g. "Front door", "Food plate", "Receipt"). The agent sees these as separate upload slots.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSlot} className="gap-1 shrink-0">
                  <Plus className="h-3.5 w-3.5" /> Add slot
                </Button>
              </div>

              {slots.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No named slots — the agent will see {data.photo_requirements.required_count || 0} generic photo uploads.
                </p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot, idx) => (
                    <div key={slot.id} className="rounded-md border border-border bg-background p-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Slot {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {slot.required === false ? 'Optional' : 'Required'}
                          </span>
                          <Switch
                            checked={slot.required !== false}
                            onCheckedChange={(checked) => setSlot(slot.id, { required: checked })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeSlot(slot.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          dir="ltr"
                          placeholder="Title (EN) — e.g. Front door"
                          value={slot.label.en}
                          onChange={(e) => setSlot(slot.id, { label: { ...slot.label, en: e.target.value } })}
                          className="text-sm"
                        />
                        <Input
                          dir="rtl"
                          placeholder="العنوان (AR) — مثال: الواجهة"
                          value={slot.label.ar}
                          onChange={(e) => setSlot(slot.id, { label: { ...slot.label, ar: e.target.value } })}
                          className="text-sm font-ar"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          dir="ltr"
                          placeholder="Framing hint (EN) — optional"
                          value={slot.hint?.en || ''}
                          onChange={(e) =>
                            setSlot(slot.id, { hint: { en: e.target.value, ar: slot.hint?.ar || '' } })
                          }
                          className="text-xs"
                        />
                        <Input
                          dir="rtl"
                          placeholder="تلميح التقاط الصورة (AR) — اختياري"
                          value={slot.hint?.ar || ''}
                          onChange={(e) =>
                            setSlot(slot.id, { hint: { en: slot.hint?.en || '', ar: e.target.value } })
                          }
                          className="text-xs font-ar"
                        />
                      </div>
                      {/* Sample photo (optional) */}
                      <div className="flex items-start gap-2 pt-1">
                        {slot.sample_url ? (
                          <div className="relative shrink-0">
                            <img
                              src={slot.sample_url}
                              alt="Sample"
                              className="h-16 w-16 rounded-md border border-border object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setSlot(slot.id, { sample_url: undefined } as any)}
                              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
                              aria-label="Remove sample"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="h-16 w-16 shrink-0 rounded-md border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center text-[9px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-muted/60 transition">
                            <Plus className="h-3.5 w-3.5 mb-0.5" />
                            Sample
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () =>
                                  setSlot(slot.id, { sample_url: String(reader.result) } as any);
                                reader.readAsDataURL(file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                        <div className="text-[11px] text-muted-foreground leading-snug pt-0.5">
                          <span className="font-semibold text-foreground">Sample photo</span> (optional)
                          <br />
                          Shown to the agent as a reference of the expected framing.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}



        <div className="space-y-2">
          <Label htmlFor="photoInstructions" className="text-xs text-muted-foreground">
            {t('questions_section.photo_instructions_general')}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('english')}</span>
              <Textarea
                id="photoInstructions-en"
                placeholder={t('questions_section.photo_instructions_general_placeholder')}
                value={typeof data.photo_requirements.instructions === 'object' ? (data.photo_requirements.instructions as any).en || '' : data.photo_requirements.instructions || ''}
                onChange={(e) => {
                  const current = typeof data.photo_requirements.instructions === 'object' ? data.photo_requirements.instructions as any : { en: data.photo_requirements.instructions || '', ar: '' };
                  onChange({
                    photo_requirements: {
                      ...data.photo_requirements,
                      instructions: { ...current, en: e.target.value } as any,
                    },
                  });
                }}
                rows={2}
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('arabic')}</span>
              <Textarea
                id="photoInstructions-ar"
                placeholder={t('questions_section.photo_instructions_general_placeholder')}
                value={typeof data.photo_requirements.instructions === 'object' ? (data.photo_requirements.instructions as any).ar || '' : ''}
                onChange={(e) => {
                  const current = typeof data.photo_requirements.instructions === 'object' ? data.photo_requirements.instructions as any : { en: data.photo_requirements.instructions || '', ar: '' };
                  onChange({
                    photo_requirements: {
                      ...data.photo_requirements,
                      instructions: { ...current, ar: e.target.value } as any,
                    },
                  });
                }}
                rows={2}
                dir="rtl"
                className="font-ar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
