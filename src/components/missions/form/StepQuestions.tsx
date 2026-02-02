import { useState } from 'react';
import { Plus, Trash2, Camera, GripVertical } from 'lucide-react';
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
import { MissionFormData, Question, QuestionType, QuestionOption } from '@/types';
import { QUESTION_TYPE_LABELS, EMPTY_STATES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StepQuestionsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

export function StepQuestions({ data, onChange }: StepQuestionsProps) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
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
            <p className="text-muted-foreground text-sm">{EMPTY_STATES.questions.description}</p>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              {EMPTY_STATES.questions.action}
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

                    <div className="flex items-center gap-4">
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

                      {/* Required toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={question.required}
                          onCheckedChange={(checked) =>
                            updateQuestion(question.id, { required: checked })
                          }
                        />
                        <span className="text-xs text-muted-foreground">Required</span>
                      </div>
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

      {/* Photo Requirements */}
      <div className="border-t border-border pt-6 space-y-4">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Camera className="h-4 w-4" />
          Photo Requirements
        </Label>

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
