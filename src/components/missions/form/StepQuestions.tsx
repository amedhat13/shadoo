import { useState } from 'react';
import { Plus, Trash2, Camera, GripVertical, FileText, Image, Upload } from 'lucide-react';
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
import { MissionFormData, Question, QuestionType, QuestionOption, QuestionPhotoRequirement } from '@/types';
import { QUESTION_TYPE_LABELS, QUESTION_TEMPLATES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StepQuestionsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

export function StepQuestions({ data, onChange }: StepQuestionsProps) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'short_text',
      text: '',
      required: true,
    };
    onChange({ questions: [...data.questions, newQuestion] });
    setEditingQuestionId(newQuestion.id);
  };

  const applyTemplate = (templateId: string) => {
    const template = QUESTION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const newQuestions: Question[] = template.questions.map((q, index) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
      options: q.options?.map((opt, optIndex) => ({
        ...opt,
        id: `opt-${Date.now()}-${index}-${optIndex}`,
      })),
    }));

    onChange({ questions: [...data.questions, ...newQuestions] });
    setTemplateDialogOpen(false);
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
      text: '',
    };
    updateQuestion(questionId, {
      options: [...(question.options || []), newOption],
    });
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
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
    
    // Initialize options for multiple choice
    if (type === 'multiple_choice') {
      updates.options = [
        { id: `opt-${Date.now()}-1`, text: '' },
        { id: `opt-${Date.now()}-2`, text: '' },
      ];
    } else {
      updates.options = undefined;
    }
    
    // Initialize max_rating for rating type
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
      return 'Require photo for low ratings (1-2)';
    }
    if (question.type === 'yes_no') {
      return 'Require photo for negative answers';
    }
    if (question.type === 'multiple_choice') {
      return 'Require photo for specific options';
    }
    return '';
  };

  const canHavePhotoRequirement = (type: QuestionType) => {
    return type !== 'short_text';
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="border border-dashed border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">Quick Start with Templates</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Use pre-built question sets for common metrics like NPS, CSAT, and more.
            </p>
          </div>
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Use Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-black uppercase tracking-tight">
                  Question Templates
                </DialogTitle>
                <DialogDescription>
                  Select a template to add pre-built questions that measure standard metrics.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
                {QUESTION_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.id)}
                    className="flex items-start gap-4 border border-border p-4 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.questions.length} question{template.questions.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wide">
            Questions ({data.questions.length})
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {data.questions.length === 0 ? (
          <div className="border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground text-sm">No questions added yet. Add questions manually or use a template above.</p>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.questions.map((question, index) => (
              <div
                key={question.id}
                className={cn(
                  'border border-border p-4 space-y-4',
                  editingQuestionId === question.id && 'ring-2 ring-primary'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    {/* Question Text */}
                    <Input
                      placeholder="Enter your question"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      onFocus={() => setEditingQuestionId(question.id)}
                    />

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
                          <SelectItem value="short_text">Short Text</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="yes_no">Yes / No</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Rating max value */}
                      {question.type === 'rating' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Max:</span>
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
                              <SelectItem value="10">10</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Multiple Choice Options */}
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        {question.options?.map((option) => (
                          <div key={option.id} className="flex items-center gap-2">
                            <Input
                              placeholder="Option text"
                              value={option.text}
                              onChange={(e) =>
                                updateOption(question.id, option.id, e.target.value)
                              }
                              className="flex-1"
                            />
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
                          Add Option
                        </Button>
                      </div>
                    )}

                    {/* Photo Requirement for non-text questions */}
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
                                  : question.type === 'yes_no'
                                  ? 'negative_answer'
                                  : 'specific_options'
                              })
                            }
                          />
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getPhotoTriggerLabel(question)}</span>
                          </div>
                        </div>

                        {question.photoRequirement?.enabled && (
                          <div className="pl-8 space-y-3">
                            {/* Sample photo upload */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Sample Photo (Optional)
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
                                    <span className="text-xs text-muted-foreground">Upload sample</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          // For demo, create a local URL
                                          const url = URL.createObjectURL(file);
                                          updatePhotoRequirement(question.id, { samplePhotoUrl: url });
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Show agents an example of what photo to capture.
                              </p>
                            </div>

                            {/* Photo instructions */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Photo Instructions (Optional)
                              </Label>
                              <Textarea
                                placeholder="E.g., Take a photo of the issue observed"
                                value={question.photoRequirement.instructions || ''}
                                onChange={(e) =>
                                  updatePhotoRequirement(question.id, { instructions: e.target.value || undefined })
                                }
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(question.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General Photo Requirements */}
      <div className="border-t border-border pt-6 space-y-4">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Camera className="h-4 w-4" />
          General Photo Requirements
        </Label>
        <p className="text-xs text-muted-foreground">
          These are additional photos required regardless of question answers.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="photoCount" className="text-xs text-muted-foreground">
              Required Photos
            </Label>
            <Input
              id="photoCount"
              type="number"
              min={0}
              value={data.photo_requirements.required_count}
              onChange={(e) =>
                onChange({
                  photo_requirements: {
                    ...data.photo_requirements,
                    required_count: parseInt(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photoInstructions" className="text-xs text-muted-foreground">
            Photo Instructions (Optional)
          </Label>
          <Textarea
            id="photoInstructions"
            placeholder="E.g., Take photos of store entrance, checkout area, and product displays"
            value={data.photo_requirements.instructions || ''}
            onChange={(e) =>
              onChange({
                photo_requirements: {
                  ...data.photo_requirements,
                  instructions: e.target.value || undefined,
                },
              })
            }
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
