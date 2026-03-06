import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { MultiSelect } from '@/components/ui/multi-select';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ReportFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  branchIds: string[];
}

interface ReportsFilterBarProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  branches: { id: string; name: string; name_ar?: string | null }[];
  language: string;
}

const DATE_PRESETS = ['this_month', 'last_month', 'last_3_months', 'last_6_months', 'this_year', 'all_time'] as const;

function getPresetDates(preset: string): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (preset) {
    case 'this_month': return { from: startOfMonth(now), to: now };
    case 'last_month': return { from: startOfMonth(subMonths(now, 1)), to: endOfMonth(subMonths(now, 1)) };
    case 'last_3_months': return { from: startOfMonth(subMonths(now, 2)), to: now };
    case 'last_6_months': return { from: startOfMonth(subMonths(now, 5)), to: now };
    case 'this_year': return { from: startOfYear(now), to: now };
    case 'all_time': return { from: null, to: null };
    default: return { from: null, to: null };
  }
}

export function ReportsFilterBar({ filters, onFiltersChange, branches, language }: ReportsFilterBarProps) {
  const { t } = useTranslation('reports');
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const hasActiveFilters = filters.dateFrom !== null || filters.dateTo !== null || filters.branchIds.length > 0;

  const branchOptions = branches.map(b => ({
    value: b.id,
    label: language === 'ar' && b.name_ar ? b.name_ar : b.name,
  }));

  const handlePreset = (preset: string) => {
    const { from, to } = getPresetDates(preset);
    onFiltersChange({ ...filters, dateFrom: from, dateTo: to });
    setDatePopoverOpen(false);
  };

  const clearAll = () => {
    onFiltersChange({ dateFrom: null, dateTo: null, branchIds: [] });
  };

  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          {/* Date Filter */}
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {filters.dateFrom ? (
                  <span className="text-xs">
                    {format(filters.dateFrom, 'MMM d')} - {filters.dateTo ? format(filters.dateTo, 'MMM d, yyyy') : '...'}
                  </span>
                ) : (
                  <span className="text-xs">{t('filters.all_time', { defaultValue: 'All Time' })}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {DATE_PRESETS.map(preset => (
                    <Button key={preset} variant="ghost" size="sm" className="text-xs h-7" onClick={() => handlePreset(preset)}>
                      {t(`filters.${preset}`, { defaultValue: preset })}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('filters.from', { defaultValue: 'From' })}</p>
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom || undefined}
                      onSelect={d => onFiltersChange({ ...filters, dateFrom: d || null })}
                      className={cn("p-2 pointer-events-auto text-xs")}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('filters.to', { defaultValue: 'To' })}</p>
                    <Calendar
                      mode="single"
                      selected={filters.dateTo || undefined}
                      onSelect={d => onFiltersChange({ ...filters, dateTo: d || null })}
                      className={cn("p-2 pointer-events-auto text-xs")}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Branch Filter */}
          <div className="w-48 sm:w-56">
            <MultiSelect
              options={branchOptions}
              selected={filters.branchIds}
              onChange={ids => onFiltersChange({ ...filters, branchIds: ids })}
              placeholder={t('filters.all_branches', { defaultValue: 'All Branches' })}
              searchPlaceholder={t('filters.search_branches', { defaultValue: 'Search branches...' })}
              className="h-8 text-xs"
              maxDisplayed={1}
            />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={clearAll}>
              <X className="h-3 w-3 me-1" />
              {t('filters.clear_all', { defaultValue: 'Clear All' })}
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {filters.dateFrom && (
              <Badge variant="secondary" className="text-xs gap-1">
                {format(filters.dateFrom, 'MMM d')} - {filters.dateTo ? format(filters.dateTo, 'MMM d, yyyy') : '...'}
                <button onClick={() => onFiltersChange({ ...filters, dateFrom: null, dateTo: null })}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {filters.branchIds.length > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                {filters.branchIds.length} {t('filters.branches_selected', { defaultValue: 'branches selected' })}
                <button onClick={() => onFiltersChange({ ...filters, branchIds: [] })}><X className="h-3 w-3" /></button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
