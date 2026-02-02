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
    <div className="flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search missions..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9 border-border"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value as MissionStatus | 'all' })}
      >
        <SelectTrigger className="w-[160px] border-border">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="All statuses" />
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
        <SelectTrigger className="w-[180px] border-border">
          <SelectValue placeholder="All branches" />
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
        <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
