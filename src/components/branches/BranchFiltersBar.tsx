import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EGYPT_CITIES } from '@/lib/egypt-locations';
import { BranchStatus } from '@/types';
import { useTranslation } from 'react-i18next';

export interface BranchFilters {
  search: string;
  city: string;
  status: BranchStatus | 'all';
}

interface BranchFiltersBarProps {
  filters: BranchFilters;
  onFiltersChange: (filters: BranchFilters) => void;
}

export function BranchFiltersBar({ filters, onFiltersChange }: BranchFiltersBarProps) {
  const { t } = useTranslation('branches');
  const hasActiveFilters = filters.search || filters.city || filters.status !== 'all';

  const clearFilters = () => {
    onFiltersChange({ search: '', city: '', status: 'all' });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('search_placeholder')}
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="ps-9"
        />
      </div>

      {/* City Filter */}
      <Select
        value={filters.city || 'all'}
        onValueChange={(value) => onFiltersChange({ ...filters, city: value === 'all' ? '' : value })}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder={t('all_cities')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all_cities')}</SelectItem>
          {EGYPT_CITIES.map((city) => (
            <SelectItem key={city.id} value={city.name}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value as BranchStatus | 'all' })}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder={t('all_statuses')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('all_statuses')}</SelectItem>
          <SelectItem value="verified">{t('statuses.verified')}</SelectItem>
          <SelectItem value="pending_verification">{t('statuses.pending_verification')}</SelectItem>
          <SelectItem value="rejected">{t('statuses.rejected')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-4 w-4" />
          {t('clear')}
        </Button>
      )}
    </div>
  );
}