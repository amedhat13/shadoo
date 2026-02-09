import { Check, ChevronsUpDown, X, AlertCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ClientSelector } from '@/components/admin/common/ClientSelector';
import { useTranslation } from 'react-i18next';
import { BilingualInput } from '@/components/common/BilingualInput';

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface AdminMissionFormData {
  clientUserId: string;
  name: string;
  name_ar?: string;
  branch_ids: string[];
}

interface AdminStepBasicsProps {
  data: AdminMissionFormData;
  onChange: (updates: Partial<AdminMissionFormData>) => void;
  branches: Branch[];
}

export function AdminStepBasics({ data, onChange, branches }: AdminStepBasicsProps) {
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

  const handleClientChange = (clientUserId: string) => {
    onChange({ clientUserId, branch_ids: [] });
  };

  const getMissionsCountText = () => {
    const count = data.branch_ids.length;
    if (count === 0) return '';
    if (count === 1) return t('admin.missions_count_single');
    return t('admin.missions_count_multi', { count });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ClientSelector
          value={data.clientUserId}
          onValueChange={handleClientChange}
          required
        />
      </div>

      <div className="space-y-2">
        <BilingualInput
          label={t('admin.mission_name')}
          value={{ en: data.name || '', ar: data.name_ar || '' }}
          onChange={(val) => onChange({ name: val.en, name_ar: val.ar })}
          placeholder={{ en: t('admin.mission_name_placeholder'), ar: t('admin.mission_name_placeholder') }}
          required
          id="name"
        />
        <p className="text-xs text-muted-foreground">
          {t('admin.mission_name_help')}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wide">
          {t('admin.branches')}<span className="text-destructive">*</span>
        </Label>

        {!data.clientUserId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('admin.select_client_first')}</AlertTitle>
            <AlertDescription>
              {t('admin.select_client_first_desc')}
            </AlertDescription>
          </Alert>
        ) : branches.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('admin.no_branches_for_client')}</AlertTitle>
            <AlertDescription>
              {t('admin.no_branches_for_client_desc')}
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
                      ? t('admin.select_branches')
                      : t('admin.branches_selected', { count: data.branch_ids.length })}
                  </span>
                  <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder={t('admin.search_branches')} />
                  <CommandList>
                    <CommandEmpty>{t('admin.no_branches_found')}</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => (allSelected ? clearAll() : selectAll())}
                        className="font-semibold"
                      >
                        <Check
                          className={cn('me-2 h-4 w-4', allSelected ? 'opacity-100' : 'opacity-0')}
                        />
                        {t('admin.select_all_branches')}
                      </CommandItem>
                      {branches.map((branch) => (
                        <CommandItem
                          key={branch.id}
                          value={branch.name}
                          onSelect={() => toggleBranch(branch.id)}
                        >
                          <Check
                            className={cn(
                              'me-2 h-4 w-4',
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

            {selectedBranches.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedBranches.map((branch) => (
                  <Badge key={branch.id} variant="secondary" className="gap-1 pe-1">
                    {branch.name}
                    <button
                      type="button"
                      onClick={() => removeBranch(branch.id)}
                      className="ms-1 hover:bg-muted rounded-sm p-0.5"
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
                    {t('admin.clear_all')}
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {t('admin.branches_help')}
            </p>

            {data.branch_ids.length > 0 && (
              <p className="text-xs font-medium text-primary">{getMissionsCountText()}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
