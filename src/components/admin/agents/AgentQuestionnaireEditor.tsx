import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  FileText,
  Type,
  List,
  ToggleLeft,
  Hash,
} from 'lucide-react';

export interface QuestionField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select/multiselect
  helpText?: string;
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
};

const questionTypeLabels: Record<string, string> = {
  text: 'Short Text',
  textarea: 'Long Text',
  select: 'Single Select',
  multiselect: 'Multi Select',
  boolean: 'Yes/No',
  number: 'Number',
};

export function AgentQuestionnaireEditor({
  open,
  onOpenChange,
}: AgentQuestionnaireEditorProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionField[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load existing questionnaire
  useEffect(() => {
    if (open) {
      loadQuestionnaire();
    }
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
        toast.error('Failed to load questionnaire');
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
        // Create default questionnaire
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
      label: 'Tell us about your experience with mystery shopping or similar work',
      placeholder: 'Describe any relevant experience...',
      required: true,
    },
    {
      id: crypto.randomUUID(),
      type: 'select',
      label: 'Which city are you based in?',
      required: true,
      options: ['Cairo', 'Alexandria', 'Giza', 'Other'],
    },
    {
      id: crypto.randomUUID(),
      type: 'select',
      label: 'What is your preferred mode of transportation?',
      required: true,
      options: ['Car', 'Motorcycle', 'Public Transport', 'Walking'],
    },
    {
      id: crypto.randomUUID(),
      type: 'multiselect',
      label: 'What times are you typically available?',
      required: true,
      options: ['Morning (8AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-9PM)', 'Weekend'],
    },
    {
      id: crypto.randomUUID(),
      type: 'boolean',
      label: 'Do you have a smartphone with a good camera?',
      required: true,
    },
  ];

  const handleAddQuestion = () => {
    const newQuestion: QuestionField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: '',
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
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
  };

  const handleSave = async () => {
    // Validate
    const invalidQuestions = questions.filter((q) => !q.label.trim());
    if (invalidQuestions.length > 0) {
      toast.error('All questions must have a label');
      return;
    }

    setSaving(true);
    try {
      const questionsJson = JSON.parse(JSON.stringify(questions));
      
      if (templateId) {
        // Update existing
        const { error } = await supabase
          .from('question_templates')
          .update({
            questions: questionsJson,
            updated_at: new Date().toISOString(),
          })
          .eq('id', templateId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from('question_templates').insert({
          name: TEMPLATE_NAME,
          description: 'Questions for agent registration and verification',
          category: 'agent',
          is_public: false,
          questions: questionsJson,
        });

        if (error) throw error;
      }

      toast.success('Questionnaire saved successfully');
      queryClient.invalidateQueries({ queryKey: ['question_templates'] });
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Failed to save questionnaire');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase">
            Agent Registration Questionnaire
          </DialogTitle>
          <DialogDescription>
            Configure the questions agents must answer when registering. These answers help you
            evaluate and approve agent applications.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className={`transition-all ${
                  editingIndex === index ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  {editingIndex === index ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label>Question Label</Label>
                            <Input
                              value={question.label}
                              onChange={(e) =>
                                handleUpdateQuestion(index, { label: e.target.value })
                              }
                              placeholder="Enter your question..."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value: QuestionField['type']) =>
                                  handleUpdateQuestion(index, {
                                    type: value,
                                    options:
                                      value === 'select' || value === 'multiselect'
                                        ? question.options || ['Option 1', 'Option 2']
                                        : undefined,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(questionTypeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center gap-2">
                                        {questionTypeIcons[key]}
                                        {label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Placeholder (optional)</Label>
                              <Input
                                value={question.placeholder || ''}
                                onChange={(e) =>
                                  handleUpdateQuestion(index, { placeholder: e.target.value })
                                }
                                placeholder="Placeholder text..."
                              />
                            </div>
                          </div>

                          {(question.type === 'select' || question.type === 'multiselect') && (
                            <div className="space-y-2">
                              <Label>Options (one per line)</Label>
                              <Textarea
                                value={question.options?.join('\n') || ''}
                                onChange={(e) =>
                                  handleUpdateQuestion(index, {
                                    options: e.target.value.split('\n').filter((o) => o.trim()),
                                  })
                                }
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                rows={4}
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Help Text (optional)</Label>
                            <Input
                              value={question.helpText || ''}
                              onChange={(e) =>
                                handleUpdateQuestion(index, { helpText: e.target.value })
                              }
                              placeholder="Additional guidance for this question..."
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={question.required}
                                onCheckedChange={(checked) =>
                                  handleUpdateQuestion(index, { required: checked })
                                }
                              />
                              <Label className="cursor-pointer">Required</Label>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveQuestion(index, 'up')}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveQuestion(index, 'down')}
                                disabled={index === questions.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteQuestion(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => setEditingIndex(null)}>
                                Done
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 -m-4 p-4 rounded-lg transition-colors"
                      onClick={() => setEditingIndex(index)}
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{question.label || 'Untitled question'}</span>
                          {question.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          {questionTypeIcons[question.type]}
                          <span>{questionTypeLabels[question.type]}</span>
                          {question.options && (
                            <span className="text-xs">• {question.options.length} options</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={handleAddQuestion}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Questionnaire
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
