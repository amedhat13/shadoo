import { Camera, FileText, Receipt, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MissionFormData } from '@/types/mission';

interface StepRequirementsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
}

// Mock data for quizzes and forms
const mockQuizzes = [
  { id: 'quiz-1', name: 'Customer Service Evaluation' },
  { id: 'quiz-2', name: 'Product Knowledge Test' },
  { id: 'quiz-3', name: 'Store Compliance Checklist' },
];

const mockForms = [
  { id: 'form-1', name: 'Standard Visit Report' },
  { id: 'form-2', name: 'Detailed Observation Form' },
  { id: 'form-3', name: 'Quick Feedback Form' },
];

export function StepRequirements({ data, onChange }: StepRequirementsProps) {
  return (
    <div className="space-y-6">
      {/* Quiz Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Attach Quiz (Optional)
        </Label>
        <Select
          value={data.quiz_id || ''}
          onValueChange={(value) => onChange({ quiz_id: value || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a quiz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No quiz</SelectItem>
            {mockQuizzes.map((quiz) => (
              <SelectItem key={quiz.id} value={quiz.id}>
                {quiz.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Agents will need to complete this quiz after the mission
        </p>
      </div>

      {/* Form Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Attach Form (Optional)
        </Label>
        <Select
          value={data.form_id || ''}
          onValueChange={(value) => onChange({ form_id: value || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No form</SelectItem>
            {mockForms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Agents will fill this form to report their findings
        </p>
      </div>

      {/* Photo Requirements */}
      <div className="space-y-2">
        <Label htmlFor="photos" className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Required Photos *
        </Label>
        <Input
          id="photos"
          type="number"
          min={0}
          max={20}
          value={data.required_photos_count}
          onChange={(e) =>
            onChange({ required_photos_count: parseInt(e.target.value) || 0 })
          }
        />
        <p className="text-xs text-muted-foreground">
          Number of photos agents must submit with their report
        </p>
      </div>

      {/* Receipt Requirement (Locked) */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Receipt Required</div>
              <div className="text-sm text-muted-foreground">
                Agents must submit a purchase receipt
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Always required</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-secondary/50 p-4">
        <h4 className="font-medium mb-2">Requirements Summary</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {data.quiz_id && (
            <li className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Quiz: {mockQuizzes.find((q) => q.id === data.quiz_id)?.name}
            </li>
          )}
          {data.form_id && (
            <li className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Form: {mockForms.find((f) => f.id === data.form_id)?.name}
            </li>
          )}
          <li className="flex items-center gap-2">
            <Camera className="h-3.5 w-3.5" />
            {data.required_photos_count} photo(s) required
          </li>
          <li className="flex items-center gap-2">
            <Receipt className="h-3.5 w-3.5" />
            Receipt required
          </li>
        </ul>
      </div>
    </div>
  );
}
