import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { MissionStatus } from '@/types/mission';
import { MISSION_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface MissionFilters {
  search: string;
  status: MissionStatus | 'all';
  branch: string | 'all';
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

interface MissionFiltersProps {
  filters: MissionFilters;
  onFiltersChange: (filters: MissionFilters) => void;
  branches: { id: string; name: string }[];
}

const statusOptions: (MissionStatus | 'all')[] = [
  'all',
  'draft',
  'ready_for_funding',
  'published',
  'paused',
  'expired',
  'archived',
];

export function MissionFiltersComponent({ 
  filters, 
  onFiltersChange, 
  branches 
}: MissionFiltersProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.branch !== 'all' || 
    filters.dateRange.from || 
    filters.dateRange.to;

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      status: 'all',
      branch: 'all',
      dateRange: {},
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search missions..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, status: value as MissionStatus | 'all' })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status === 'all' ? 'All Statuses' : MISSION_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Branch Filter */}
      <Select
        value={filters.branch}
        onValueChange={(value) => onFiltersChange({ ...filters, branch: value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range */}
      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {filters.dateRange.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, 'MMM d')} -{' '}
                  {format(filters.dateRange.to, 'MMM d')}
                </>
              ) : (
                format(filters.dateRange.from, 'MMM d, yyyy')
              )
            ) : (
              'Date Range'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: filters.dateRange.from,
              to: filters.dateRange.to,
            }}
            onSelect={(range) => {
              onFiltersChange({
                ...filters,
                dateRange: {
                  from: range?.from,
                  to: range?.to,
                },
              });
            }}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="gap-1 text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
