import { Check, ChevronsUpDown, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MissionFormData, Branch } from '@/types';

const MISSION_CATEGORIES = [
  'F&B',
  'Retail',
  'Service',
  'Banking',
  'Telecom',
  'Pharmacy',
  'Fashion',
  'Grocery',
  'Automotive',
  'Hospitality',
];

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BilingualInput } from '@/components/common/BilingualInput';

interface StepBasicsProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
  branches: Branch[];
}

export function StepBasics({ data, onChange, branches }: StepBasicsProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('missions');

  const selectedBranches = branches.filter((b) => data.branch_ids.includes(b.id));
  const allSelected = data.branch_ids.length === branches.length && branches.length > 0;

  const toggleBranch = (branchId: string) => {
    if (data.branch_ids.includes(branchId)) {
      onChange({ branch_ids: data.branch_ids.filter((id) => id !== branchId) });
    } else {
      onChange({ branch_ids: [...data.branch_ids, branchId] });
    }
  };

  const selectAll = () => {
    onChange({ branch_ids: branches.map((b) => b.id) });
  };

  const clearAll = () => {
    onChange({ branch_ids: [] });
  };

  const removeBranch = (branchId: string) => {
    onChange({ branch_ids: data.branch_ids.filter((id) => id !== branchId) });
  };

  const getMissionsCountText = () => {
    const count = data.branch_ids.length;
    if (count === 0) return '';
    if (count === 1) return t('form.missions_count_single');
    return t('form.missions_count_multi', { count });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <BilingualInput
          label={t('form.mission_name')}
          value={{ en: data.name || '', ar: data.name_ar || '' }}
          onChange={(val) => onChange({ name: val.en, name_ar: val.ar })}
          placeholder={{ en: t('form.mission_name_placeholder'), ar: t('form.mission_name_placeholder') }}
          required
          id="name"
        />
        <p className="text-xs text-muted-foreground">
          {t('form.mission_name_help')}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">
          {t('form.branches_label')}<span className="text-destructive">*</span>
        </Label>
        
        {branches.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('form.no_verified_branches')}</AlertTitle>
            <AlertDescription>
              {t('form.no_verified_branches_desc')}{' '}
              <Link to="/branches" className="underline font-medium text-primary hover:text-primary/80">
                {t('form.go_to_branches')}
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-auto min-h-10"
                >
                  <span className="text-muted-foreground">
                    {data.branch_ids.length === 0
                      ? t('form.select_branches')
                      : t('form.branches_selected', { count: data.branch_ids.length })}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder={t('form.search_branches')} />
                  <CommandList>
                    <CommandEmpty>{t('form.no_branches_found')}</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => (allSelected ? clearAll() : selectAll())}
                        className="font-semibold"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            allSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {t('form.select_all')}
                      </CommandItem>
                      {branches.map((branch) => (
                        <CommandItem
                          key={branch.id}
                          value={branch.name}
                          onSelect={() => toggleBranch(branch.id)}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              data.branch_ids.includes(branch.id) ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{branch.name}</span>
                            <span className="text-xs text-muted-foreground">{branch.city}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected branches badges */}
            {selectedBranches.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedBranches.map((branch) => (
                  <Badge
                    key={branch.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {branch.name}
                    <button
                      type="button"
                      onClick={() => removeBranch(branch.id)}
                      className="ml-1 hover:bg-muted rounded-sm p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedBranches.length > 1 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    {t('form.clear_all')}
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {t('form.branches_help')}
            </p>
            
            {data.branch_ids.length > 0 && (
              <p className="text-xs font-medium text-primary">
                {getMissionsCountText()}
              </p>
            )}
          </>
        )}
      </div>




      {/* Timing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expected-minutes" className="text-xs font-bold uppercase tracking-wide">
            Expected time on site (min)
          </Label>
          <Input
            id="expected-minutes"
            type="number"
            min={5}
            value={data.expected_minutes ?? 30}
            onChange={(e) => onChange({ expected_minutes: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Shown in the brief so the shopper knows how long the visit takes.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="completion-deadline" className="text-xs font-bold uppercase tracking-wide">
            Completion deadline (min)
          </Label>
          <Input
            id="completion-deadline"
            type="number"
            min={10}
            value={data.completion_deadline_min ?? 120}
            onChange={(e) => onChange({ completion_deadline_min: parseInt(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">
            Countdown from starting the visit until the report must be submitted.
          </p>
        </div>
      </div>
    </div>
  );
}

