import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MissionStatus, Branch } from '@/types';
import { MISSION_STATUS_LABELS } from '@/lib/constants';

export interface MissionFilters {
  search: string;
  status: MissionStatus | 'all';
  branch: string;
}

interface MissionFiltersComponentProps {
  filters: MissionFilters;
  onFiltersChange: (filters: MissionFilters) => void;
  branches: Branch[];
}

export function MissionFiltersComponent({
  filters,
  onFiltersChange,
  branches,
}: MissionFiltersComponentProps) {
  const handleClear = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      branch: 'all',
    });
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.branch !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search missions..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9 border-border w-full"
        />
      </div>

      <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as MissionStatus | 'all' })}
        >
          <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px] border-border">
            <Filter className="mr-2 h-4 w-4 shrink-0" />
            <SelectValue placeholder="Status" className="truncate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(MISSION_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Branch Filter */}
        <Select
          value={filters.branch}
          onValueChange={(value) => onFiltersChange({ ...filters, branch: value })}
        >
          <SelectTrigger className="flex-1 sm:flex-none sm:w-[160px] border-border">
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

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={handleClear} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
