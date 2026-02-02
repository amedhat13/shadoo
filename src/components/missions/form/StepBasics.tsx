import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MissionFormData, Branch } from '@/types';

interface StepBasicsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
  branches: Branch[];
}

export function StepBasics({ data, onChange, branches }: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wide">
          Mission Name<span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter a descriptive name for this mission"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch" className="text-xs font-bold uppercase tracking-wide">
          Branch<span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.branch_id}
          onValueChange={(value) => onChange({ branch_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select the location where this mission will be executed.
        </p>
      </div>
    </div>
  );
}
