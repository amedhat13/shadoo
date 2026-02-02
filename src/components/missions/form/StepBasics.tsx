import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { MissionFormData } from '@/types/mission';
import { cn } from '@/lib/utils';

interface StepBasicsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
  branches: { id: string; name: string }[];
}

export function StepBasics({ data, onChange, branches }: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Mission Title *</Label>
        <Input
          id="title"
          placeholder="Enter a descriptive title for this mission"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch">Branch *</Label>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe what agents need to do during this mission"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !data.start_date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.start_date ? format(data.start_date, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.start_date}
                onSelect={(date) => onChange({ start_date: date })}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !data.end_date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.end_date ? format(data.end_date, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.end_date}
                onSelect={(date) => onChange({ end_date: date })}
                disabled={(date) => 
                  date < new Date() || 
                  (data.start_date && date < data.start_date)
                }
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quota">Quota (Number of Runs) *</Label>
        <Input
          id="quota"
          type="number"
          min={1}
          value={data.quota}
          onChange={(e) => onChange({ quota: parseInt(e.target.value) || 0 })}
        />
        <p className="text-xs text-muted-foreground">
          The total number of mission runs you want to complete
        </p>
      </div>
    </div>
  );
}
