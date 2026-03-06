import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { Question, QuestionType, QuestionOption } from '@/types';
import { QuestionTemplate, METHODOLOGY_CATEGORIES, METHODOLOGY_KEYS } from '@/hooks/useQuestionTemplates';
import { ensureBilingual } from '@/i18n/utils';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: QuestionTemplate | null;
  onSave: (data: {
    name: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    category?: string;
    methodology?: string;
    questions: Question[];
    is_public?: boolean;
  }) => Promise<void>;
  isSaving: boolean;
}

export function TemplateFormDialog({ open, onOpenChange, template, onSave, isSaving }: TemplateFormDialogProps) {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [category, setCategory] = useState('Custom');
  const [methodology, setMethodology] = useState('custom');
  const [isPublic, setIsPublic] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setNameAr(template.name_ar || '');
      setDescription(template.description || '');
      setDescriptionAr(template.description_ar || '');
      setCategory(template.category || 'Custom');
      setMethodology(template.methodology || 'custom');
      setIsPublic(template.is_public);
      setQuestions(template.questions || []);
    } else {
      setName('');
      setNameAr('');
      setDescription('');
      setDescriptionAr('');
      setCategory('Custom');
      setMethodology('custom');
      setIsPublic(true);
      setQuestions([]);
    }
  }, [template, open]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setMethodology(METHODOLOGY_KEYS[cat] || 'custom');
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      id: `q-${Date.now()}`,
      type: 'short_text' as QuestionType,
      text: { en: '', ar: '' },
      required: true,
    }]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleTypeChange = (qId: string, type: QuestionType) => {
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
    updateQuestion(qId, updates);
  };

  const addOption = (qId: string) => {
    const q = questions.find(x => x.id === qId);
    if (!q) return;
    updateQuestion(qId, {
      options: [...(q.options || []), { id: `opt-${Date.now()}`, text: { en: '', ar: '' } }],
    });
  };

  const updateOption = (qId: string, optId: string, text: { en: string; ar: string }) => {
    const q = questions.find(x => x.id === qId);
    if (!q?.options) return;
    updateQuestion(qId, {
      options: q.options.map(o => o.id === optId ? { ...o, text } : o),
    });
  };

  const removeOption = (qId: string, optId: string) => {
    const q = questions.find(x => x.id === qId);
    if (!q?.options) return;
    updateQuestion(qId, { options: q.options.filter(o => o.id !== optId) });
  };

  const handleSave = async () => {
    await onSave({
      name,
      name_ar: nameAr,
      description,
      description_ar: descriptionAr,
      category,
      methodology,
      questions,
      is_public: isPublic,
    });
    onOpenChange(false);
  };

  const isEdit = !!template;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-start">
          <DialogTitle className="font-black uppercase tracking-tight">
            {isEdit ? t('templates.edit_template') : t('templates.create_template')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wide">{t('templates.template_name')} *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('english')}</span>
                <Input value={name} onChange={e => setName(e.target.value)} dir="ltr" placeholder="e.g. NPS Score Template" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('arabic')}</span>
                <Input value={nameAr} onChange={e => setNameAr(e.target.value)} dir="rtl" className="font-ar" placeholder="مثال: قالب NPS" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wide">{t('templates.description')}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('english')}</span>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} dir="ltr" rows={2} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('arabic')}</span>
                <Textarea value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} dir="rtl" className="font-ar" rows={2} />
              </div>
            </div>
          </div>

          {/* Category, Methodology & Public */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wide">{t('templates.category')}</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODOLOGY_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wide">{t('templates.methodology')}</Label>
              <Select value={methodology} onValueChange={setMethodology}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(METHODOLOGY_KEYS).map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <Label className="text-sm">{t('templates.public')}</Label>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wide">
                {t('templates.questions')} ({questions.length})
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('templates.add_question')}
              </Button>
            </div>

            {questions.length === 0 && (
              <div className="border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">{t('templates.no_questions')}</p>
              </div>
            )}

            {questions.map((q, idx) => (
              <div key={q.id} className="border border-border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">{idx + 1}</div>
                  <div className="flex-1 space-y-3">
                    {/* Bilingual question text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('english')}</span>
                        <Input
                          value={ensureBilingual(q.text).en}
                          onChange={e => updateQuestion(q.id, { text: { ...ensureBilingual(q.text), en: e.target.value } })}
                          dir="ltr"
                          placeholder={t('templates.question_placeholder')}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">{tc('arabic')}</span>
                        <Input
                          value={ensureBilingual(q.text).ar}
                          onChange={e => updateQuestion(q.id, { text: { ...ensureBilingual(q.text), ar: e.target.value } })}
                          dir="rtl"
                          className="font-ar"
                          placeholder={t('templates.question_placeholder')}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <Select value={q.type} onValueChange={v => handleTypeChange(q.id, v as QuestionType)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short_text">{t('templates.short_text')}</SelectItem>
                          <SelectItem value="multiple_choice">{t('templates.multiple_choice')}</SelectItem>
                          <SelectItem value="yes_no">{t('templates.yes_no')}</SelectItem>
                          <SelectItem value="rating">{t('templates.rating')}</SelectItem>
                        </SelectContent>
                      </Select>

                      {q.type === 'rating' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{t('templates.max')}</span>
                          <Select value={String(q.max_rating || 5)} onValueChange={v => updateQuestion(q.id, { max_rating: parseInt(v) })}>
                            <SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Switch checked={q.required} onCheckedChange={v => updateQuestion(q.id, { required: v })} />
                        <span className="text-xs">{t('templates.required')}</span>
                      </div>
                    </div>

                    {/* Multiple choice options */}
                    {q.type === 'multiple_choice' && (
                      <div className="space-y-2 ps-4 border-s-2 border-muted">
                        {q.options?.map(opt => (
                          <div key={opt.id} className="flex items-start gap-2">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                placeholder={`${t('templates.option')} (EN)`}
                                value={ensureBilingual(opt.text).en}
                                onChange={e => updateOption(q.id, opt.id, { ...ensureBilingual(opt.text), en: e.target.value })}
                                dir="ltr"
                              />
                              <Input
                                placeholder={`${t('templates.option')} (AR)`}
                                value={ensureBilingual(opt.text).ar}
                                onChange={e => updateOption(q.id, opt.id, { ...ensureBilingual(opt.text), ar: e.target.value })}
                                dir="rtl"
                                className="font-ar"
                              />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeOption(q.id, opt.id)} disabled={(q.options?.length || 0) <= 2}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => addOption(q.id)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          {t('templates.add_option')}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tc('cancel')}</Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? tc('saving') : isEdit ? tc('save') : t('templates.create_template')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
