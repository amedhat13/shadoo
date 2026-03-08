import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus, Trash2, GripVertical, Save, Loader2,
  FileText, Type, List, ToggleLeft, Hash, Paperclip,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

type BilingualString = string | { en: string; ar: string };

export interface AttachmentFieldConfig {
  allowed_types?: string[]; // e.g. ['image', 'pdf', 'document']
  max_files?: number;
  instructions?: BilingualString;
}

export interface QuestionField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'number' | 'attachment';
  label: BilingualString;
  placeholder?: BilingualString;
  required: boolean;
  options?: (string | { en: string; ar: string })[];
  helpText?: BilingualString;
  attachment_config?: AttachmentFieldConfig;
}

interface AgentQuestionnaireEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEMPLATE_NAME = 'agent_registration_questionnaire';

const questionTypeIcons: Record<string, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  textarea: <FileText className="h-4 w-4" />,
  select: <List className="h-4 w-4" />,
  multiselect: <List className="h-4 w-4" />,
  boolean: <ToggleLeft className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  attachment: <Paperclip className="h-4 w-4" />,
};

const questionTypeLabels: Record<string, string> = {
  text: 'Short Text',
  textarea: 'Long Text',
  select: 'Single Select',
  multiselect: 'Multi Select',
  boolean: 'Yes/No',
  number: 'Number',
  attachment: 'Attachment',
};

function getEn(val: BilingualString | undefined): string {
  if (!val) return '';
  return typeof val === 'string' ? val : val.en || '';
}
function getAr(val: BilingualString | undefined): string {
  if (!val) return '';
  return typeof val === 'string' ? '' : val.ar || '';
}
function makeBilingual(en: string, ar: string): BilingualString {
  return { en, ar };
}

function getOptionEn(opt: string | { en: string; ar: string }): string {
  return typeof opt === 'string' ? opt : opt.en || '';
}
function getOptionAr(opt: string | { en: string; ar: string }): string {
  return typeof opt === 'string' ? '' : opt.ar || '';
}

export function AgentQuestionnaireEditor({ open, onOpenChange }: AgentQuestionnaireEditorProps) {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionField[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) loadQuestionnaire();
  }, [open]);

  const loadQuestionnaire = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .eq('name', TEMPLATE_NAME)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading questionnaire:', error);
        toast.error(t('questionnaire.load_error', 'Failed to load questionnaire'));
      }

      if (data) {
        setTemplateId(data.id);
        const questionsData = data.questions;
        if (Array.isArray(questionsData)) {
          setQuestions(questionsData as unknown as QuestionField[]);
        } else {
          setQuestions(getDefaultQuestions());
        }
      } else {
        setQuestions(getDefaultQuestions());
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultQuestions = (): QuestionField[] => [
    {
      id: crypto.randomUUID(),
      type: 'textarea',
      label: { en: 'Tell us about your experience with mystery shopping or similar work', ar: 'أخبرنا عن خبرتك في التسوق الخفي أو العمل المشابه' },
      placeholder: { en: 'Describe any relevant experience...', ar: 'صف أي خبرة ذات صلة...' },
      required: true,
    },
    {
      id: crypto.randomUUID(),
      type: 'select',
      label: { en: 'Which city are you based in?', ar: 'في أي مدينة تقيم؟' },
      required: true,
      options: [
        { en: 'Cairo', ar: 'القاهرة' },
        { en: 'Alexandria', ar: 'الإسكندرية' },
        { en: 'Giza', ar: 'الجيزة' },
        { en: 'Luxor', ar: 'الأقصر' },
        { en: 'Aswan', ar: 'أسوان' },
        { en: 'Mansoura', ar: 'المنصورة' },
        { en: 'Other', ar: 'أخرى' },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'select',
      label: { en: 'What is your preferred mode of transportation?', ar: 'ما هي وسيلة النقل المفضلة لديك؟' },
      required: true,
      options: [
        { en: 'Car', ar: 'سيارة' },
        { en: 'Motorcycle', ar: 'دراجة نارية' },
        { en: 'Public Transport', ar: 'مواصلات عامة' },
        { en: 'Walking', ar: 'مشي' },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'multiselect',
      label: { en: 'What times are you typically available?', ar: 'ما هي الأوقات التي تكون فيها متاحاً عادةً؟' },
      required: true,
      options: [
        { en: 'Morning (8AM-12PM)', ar: 'صباحاً (8ص-12م)' },
        { en: 'Afternoon (12PM-5PM)', ar: 'ظهراً (12م-5م)' },
        { en: 'Evening (5PM-9PM)', ar: 'مساءً (5م-9م)' },
        { en: 'Weekend', ar: 'نهاية الأسبوع' },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: 'boolean',
      label: { en: 'Do you have a smartphone with a good camera?', ar: 'هل لديك هاتف ذكي بكاميرا جيدة؟' },
      required: true,
    },
  ];

  const handleAddQuestion = () => {
    const newQuestion: QuestionField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: { en: '', ar: '' },
      required: false,
    };
    setQuestions([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuestionField>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, lang: 'en' | 'ar', value: string) => {
    const q = questions[qIndex];
    if (!q.options) return;
    const newOptions = [...q.options];
    const opt = newOptions[optIndex];
    if (typeof opt === 'string') {
      newOptions[optIndex] = lang === 'en' ? { en: value, ar: '' } : { en: opt, ar: value };
    } else {
      newOptions[optIndex] = { ...opt, [lang]: value };
    }
    handleUpdateQuestion(qIndex, { options: newOptions });
  };

  const handleAddOption = (qIndex: number) => {
    const q = questions[qIndex];
    const newOptions = [...(q.options || []), { en: '', ar: '' }];
    handleUpdateQuestion(qIndex, { options: newOptions });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    if (!q.options) return;
    handleUpdateQuestion(qIndex, { options: q.options.filter((_, i) => i !== optIndex) });
  };

  const handleSave = async () => {
    const invalidQuestions = questions.filter(q => !getEn(q.label).trim());
    if (invalidQuestions.length > 0) {
      toast.error(t('questionnaire.label_required', 'All questions must have an English label'));
      return;
    }

    setSaving(true);
    try {
      const questionsJson = JSON.parse(JSON.stringify(questions));
      if (templateId) {
        const { error } = await supabase
          .from('question_templates')
          .update({ questions: questionsJson, updated_at: new Date().toISOString() })
          .eq('id', templateId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('question_templates').insert({
          name: TEMPLATE_NAME,
          description: 'Questions for agent registration and verification',
          description_ar: 'أسئلة تسجيل الوكيل والتحقق',
          category: 'agent',
          is_public: false,
          questions: questionsJson,
        });
        if (error) throw error;
      }

      toast.success(t('questionnaire.saved', 'Questionnaire saved successfully'));
      queryClient.invalidateQueries({ queryKey: ['question_templates'] });
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving:', err);
      toast.error(t('questionnaire.save_error', 'Failed to save questionnaire'));
    } finally {
      setSaving(false);
    }
  };

  const displayLabel = (q: QuestionField) => getEn(q.label) || getAr(q.label) || t('questionnaire.untitled', 'Untitled question');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase">
            {t('questionnaire.title', 'Agent Registration Questionnaire')}
          </DialogTitle>
          <DialogDescription>
            {t('questionnaire.description', 'Configure bilingual questions agents must answer when registering.')}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {questions.map((question, index) => (
              <Card key={question.id} className={`transition-all ${editingIndex === index ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  {editingIndex === index ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
                        <div className="flex-1 space-y-4">
                          {/* Bilingual Label */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">{t('questionnaire.label_en', 'Label (English)')}</Label>
                              <Input
                                value={getEn(question.label)}
                                onChange={(e) => handleUpdateQuestion(index, { label: makeBilingual(e.target.value, getAr(question.label)) })}
                                placeholder="Enter question in English..."
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">{t('questionnaire.label_ar', 'Label (Arabic)')}</Label>
                              <Input
                                dir="rtl"
                                className="text-end"
                                value={getAr(question.label)}
                                onChange={(e) => handleUpdateQuestion(index, { label: makeBilingual(getEn(question.label), e.target.value) })}
                                placeholder="أدخل السؤال بالعربية..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">{t('questionnaire.type', 'Question Type')}</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value: QuestionField['type']) => {
                                  const updates: Partial<QuestionField> = {
                                    type: value,
                                    options: (value === 'select' || value === 'multiselect')
                                      ? question.options || [{ en: 'Option 1', ar: 'خيار 1' }, { en: 'Option 2', ar: 'خيار 2' }]
                                      : undefined,
                                    attachment_config: value === 'attachment'
                                      ? { allowed_types: ['image', 'pdf'], max_files: 1, instructions: { en: '', ar: '' } }
                                      : undefined,
                                  };
                                  handleUpdateQuestion(index, updates);
                                }}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(questionTypeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center gap-2">{questionTypeIcons[key]}{label}</div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">{t('questionnaire.placeholder_en', 'Placeholder (EN)')}</Label>
                              <Input
                                value={getEn(question.placeholder)}
                                onChange={(e) => handleUpdateQuestion(index, { placeholder: makeBilingual(e.target.value, getAr(question.placeholder)) })}
                                placeholder="Placeholder text..."
                              />
                            </div>
                          </div>

                          {/* Bilingual Options */}
                          {(question.type === 'select' || question.type === 'multiselect') && (
                            <div className="space-y-2">
                              <Label className="text-xs">{t('questionnaire.options', 'Options')}</Label>
                              <div className="space-y-2">
                                {(question.options || []).map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <Input
                                      className="flex-1"
                                      value={getOptionEn(opt)}
                                      onChange={(e) => handleUpdateOption(index, optIdx, 'en', e.target.value)}
                                      placeholder={`Option ${optIdx + 1} (EN)`}
                                    />
                                    <Input
                                      className="flex-1 text-end"
                                      dir="rtl"
                                      value={getOptionAr(opt)}
                                      onChange={(e) => handleUpdateOption(index, optIdx, 'ar', e.target.value)}
                                      placeholder={`خيار ${optIdx + 1} (AR)`}
                                    />
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleRemoveOption(index, optIdx)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => handleAddOption(index)}>
                                  <Plus className="h-3.5 w-3.5 mr-1" />{t('questionnaire.add_option', 'Add Option')}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Attachment Config */}
                          {question.type === 'attachment' && (
                            <div className="space-y-3 border border-dashed border-border rounded-lg p-3">
                              <div className="space-y-2">
                                <Label className="text-xs">{t('questionnaire.allowed_file_types', 'Allowed File Types')}</Label>
                                <div className="flex items-center gap-4 flex-wrap">
                                  {(['image', 'pdf', 'document'] as const).map(ft => {
                                    const config = question.attachment_config || { allowed_types: ['image', 'pdf'], max_files: 1 };
                                    const checked = config.allowed_types?.includes(ft) ?? false;
                                    const labels = { image: t('questionnaire.file_type_image', 'Images'), pdf: 'PDF', document: t('questionnaire.file_type_document', 'Documents') };
                                    return (
                                      <label key={ft} className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(v) => {
                                            const current = config.allowed_types || [];
                                            const next = v ? [...current, ft] : current.filter(t => t !== ft);
                                            if (next.length === 0) return;
                                            handleUpdateQuestion(index, {
                                              attachment_config: { ...config, allowed_types: next },
                                            });
                                          }}
                                        />
                                        <span className="text-sm">{labels[ft]}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Label className="text-xs">{t('questionnaire.max_files', 'Max Files')}</Label>
                                <Select
                                  value={String(question.attachment_config?.max_files || 1)}
                                  onValueChange={v => handleUpdateQuestion(index, {
                                    attachment_config: { ...(question.attachment_config || {}), max_files: parseInt(v) },
                                  })}
                                >
                                  <SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-xs">{t('questionnaire.upload_instructions_en', 'Upload Instructions (EN)')}</Label>
                                  <Input
                                    value={getEn(question.attachment_config?.instructions)}
                                    onChange={(e) => handleUpdateQuestion(index, {
                                      attachment_config: {
                                        ...(question.attachment_config || {}),
                                        instructions: makeBilingual(e.target.value, getAr(question.attachment_config?.instructions)),
                                      },
                                    })}
                                    placeholder="e.g. Upload a clear photo of your National ID"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">{t('questionnaire.upload_instructions_ar', 'Upload Instructions (AR)')}</Label>
                                  <Input
                                    dir="rtl" className="text-end"
                                    value={getAr(question.attachment_config?.instructions)}
                                    onChange={(e) => handleUpdateQuestion(index, {
                                      attachment_config: {
                                        ...(question.attachment_config || {}),
                                        instructions: makeBilingual(getEn(question.attachment_config?.instructions), e.target.value),
                                      },
                                    })}
                                    placeholder="ارفع صورة واضحة لبطاقة الرقم القومي"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Help Text (bilingual) */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">{t('questionnaire.help_en', 'Help Text (EN)')}</Label>
                              <Input
                                value={getEn(question.helpText)}
                                onChange={(e) => handleUpdateQuestion(index, { helpText: makeBilingual(e.target.value, getAr(question.helpText)) })}
                                placeholder="Additional guidance..."
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">{t('questionnaire.help_ar', 'Help Text (AR)')}</Label>
                              <Input
                                dir="rtl" className="text-end"
                                value={getAr(question.helpText)}
                                onChange={(e) => handleUpdateQuestion(index, { helpText: makeBilingual(getEn(question.helpText), e.target.value) })}
                                placeholder="توجيه إضافي..."
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch checked={question.required} onCheckedChange={(checked) => handleUpdateQuestion(index, { required: checked })} />
                              <Label className="cursor-pointer">{t('questionnaire.required', 'Required')}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleMoveQuestion(index, 'up')} disabled={index === 0}>↑</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleMoveQuestion(index, 'down')} disabled={index === questions.length - 1}>↓</Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteQuestion(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => setEditingIndex(null)}>{t('questionnaire.done', 'Done')}</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors"
                      onClick={() => setEditingIndex(index)}
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{displayLabel(question)}</span>
                          {question.required && <Badge variant="outline" className="text-xs">{t('questionnaire.required', 'Required')}</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          {questionTypeIcons[question.type]}
                          <span>{questionTypeLabels[question.type]}</span>
                          {question.options && <span className="text-xs">• {question.options.length} options</span>}
                          {getAr(question.label) && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">AR ✓</Badge>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full border-dashed" onClick={handleAddQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              {t('questionnaire.add_question', 'Add Question')}
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('questionnaire.cancel', 'Cancel')}</Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('questionnaire.saving', 'Saving...')}</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />{t('questionnaire.save', 'Save Questionnaire')}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
