import { useState } from 'react';
import { Plus, Minus, Trash2, Calendar, Clock, Timer, Copy, AlertCircle, MapPin, Building2 } from 'lucide-react';
import { format, addDays, parseISO, isBefore, addHours, differenceInHours } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { VisitSchedule, Branch } from '@/types';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';

interface VisitScheduleEditorProps {
  schedules: VisitSchedule[];
  onChange: (schedules: VisitSchedule[]) => void;
  maxVisits?: number;
  /** Branches selected in step 1 — when provided, slots are managed per branch */
  branches?: Branch[];
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
];

// Generate 12-hour time options
const TIME_OPTIONS_12H: { value: string; label_en: string; label_ar: string }[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    const h24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const period_en = h < 12 ? 'AM' : 'PM';
    const period_ar = h < 12 ? 'ص' : 'م';
    const label_en = `${h12}:${String(m).padStart(2, '0')} ${period_en}`;
    const label_ar = `${h12}:${String(m).padStart(2, '0')} ${period_ar}`;
    TIME_OPTIONS_12H.push({ value: h24, label_en, label_ar });
  }
}

function formatTime12h(time24: string, isRTL: boolean): string {
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr);
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const period = isRTL ? (h < 12 ? 'ص' : 'م') : (h < 12 ? 'AM' : 'PM');
  return `${h12}:${mStr} ${period}`;
}

function getScheduleDateTime(schedule: VisitSchedule): Date {
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const date = parseISO(schedule.date);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function isWithinMinLeadTime(schedule: VisitSchedule): boolean {
  const scheduleTime = getScheduleDateTime(schedule);
  const minTime = addHours(new Date(), 2);
  return isBefore(scheduleTime, minTime);
}

function isUrgent(schedule: VisitSchedule): boolean {
  const scheduleTime = getScheduleDateTime(schedule);
  const hoursFromNow = differenceInHours(scheduleTime, new Date());
  return hoursFromNow >= 2 && hoursFromNow < 24;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function VisitScheduleEditor({ schedules, onChange, maxVisits = 100, branches }: VisitScheduleEditorProps) {
  const [bulkCount, setBulkCount] = useState(5);
  const { t } = useTranslation('missions');
  const { isRTL } = useLanguage();

  const perBranch = Boolean(branches && branches.length > 0);
  const hasInvalidSchedules = schedules.some(isWithinMinLeadTime);
  const hasUrgentSchedules = schedules.some(isUrgent);

  const makeSlot = (branchId: string | undefined, prev?: VisitSchedule, dayOffset = 1): VisitSchedule => ({
    id: crypto.randomUUID(),
    branch_id: branchId,
    date: prev
      ? format(addDays(parseISO(prev.date), dayOffset), 'yyyy-MM-dd')
      : format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: prev?.time || '10:00',
    duration: prev?.duration || 60,
  });

  const branchSlots = (branchId?: string) =>
    perBranch ? schedules.filter((s) => s.branch_id === branchId) : schedules;

  const addSchedule = (branchId?: string) => {
    if (schedules.length >= maxVisits) return;
    const list = branchSlots(branchId);
    onChange([...schedules, makeSlot(branchId, list[list.length - 1])]);
  };

  const addBulkSchedules = (branchId?: string, count = bulkCount) => {
    const remaining = maxVisits - schedules.length;
    const toAdd = Math.min(count, remaining);
    if (toAdd <= 0) return;
    const list = branchSlots(branchId);
    const last = list[list.length - 1];
    const newSchedules: VisitSchedule[] = [];
    for (let i = 0; i < toAdd; i++) {
      const prev = newSchedules[newSchedules.length - 1] || last;
      newSchedules.push(makeSlot(branchId, prev));
    }
    onChange([...schedules, ...newSchedules]);
  };

  const removeLastSlot = (branchId?: string) => {
    const list = branchSlots(branchId);
    const last = list[list.length - 1];
    if (!last) return;
    onChange(schedules.filter((s) => s.id !== last.id));
  };

  const updateSchedule = (id: string, updates: Partial<VisitSchedule>) => {
    onChange(schedules.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  /** Set the same start time (and optionally duration) for every slot of a branch */
  const setBranchTime = (branchId: string | undefined, time: string) => {
    onChange(schedules.map((s) => (perBranch ? (s.branch_id === branchId ? { ...s, time } : s) : { ...s, time })));
  };

  const setBranchDuration = (branchId: string | undefined, duration: number) => {
    onChange(
      schedules.map((s) => (perBranch ? (s.branch_id === branchId ? { ...s, duration } : s) : { ...s, duration }))
    );
  };

  const removeSchedule = (id: string) => onChange(schedules.filter((s) => s.id !== id));

  const duplicateSchedule = (schedule: VisitSchedule) => {
    if (schedules.length >= maxVisits) return;
    const copy = { ...schedule, id: crypto.randomUUID(), date: format(addDays(parseISO(schedule.date), 1), 'yyyy-MM-dd') };
    const index = schedules.findIndex((s) => s.id === schedule.id);
    const next = [...schedules];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const renderRow = (schedule: VisitSchedule, index: number) => {
    const invalid = isWithinMinLeadTime(schedule);
    const urgent = !invalid && isUrgent(schedule);
    return (
      <div
        key={schedule.id}
        className={cn(
          'flex flex-wrap items-center gap-2 p-3 border bg-card',
          invalid
            ? 'border-destructive/50 bg-destructive/5'
            : urgent
            ? 'border-orange-400/50 bg-orange-50/50 dark:bg-orange-950/10'
            : 'border-border'
        )}
      >
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold',
            invalid
              ? 'bg-destructive/20 text-destructive'
              : urgent
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              : 'bg-muted'
          )}
        >
          {index + 1}
        </span>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-[130px] justify-start text-left font-normal',
                !schedule.date && 'text-muted-foreground',
                invalid && 'border-destructive/50'
              )}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {schedule.date ? format(parseISO(schedule.date), 'MMM d, yyyy') : t('funding.pick_date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={schedule.date ? parseISO(schedule.date) : undefined}
              onSelect={(date) => date && updateSchedule(schedule.id, { date: format(date, 'yyyy-MM-dd') })}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Time */}
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Select value={schedule.time} onValueChange={(value) => updateSchedule(schedule.id, { time: value })}>
            <SelectTrigger className={cn('w-[120px] h-8', invalid && 'border-destructive/50')}>
              <SelectValue>{formatTime12h(schedule.time, isRTL)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {TIME_OPTIONS_12H.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {isRTL ? opt.label_ar : opt.label_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <Select
            value={String(schedule.duration)}
            onValueChange={(value) => updateSchedule(schedule.id, { duration: parseInt(value) })}
          >
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue>{formatDuration(schedule.duration)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {urgent && (
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shrink-0">
            {t('funding.urgent')}
          </span>
        )}

        <div className="flex items-center gap-1 ms-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => duplicateSchedule(schedule)}
            disabled={schedules.length >= maxVisits}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => removeSchedule(schedule.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Label className="text-xs font-bold uppercase tracking-wide">
          <Calendar className="h-4 w-4 inline mr-2" />
          {t('funding.visit_schedules', { count: schedules.length })}
        </Label>
        {!perBranch && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={maxVisits - schedules.length}
              value={bulkCount}
              onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBulkSchedules(undefined)}
              disabled={schedules.length >= maxVisits}
            >
              {t('funding.add_bulk')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addSchedule(undefined)}
              disabled={schedules.length >= maxVisits}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 2-hour lead time validation error */}
      {hasInvalidSchedules && (
        <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/5 p-3">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive font-medium">{t('funding.min_lead_time_error')}</p>
        </div>
      )}

      {/* Urgent mission warning */}
      {hasUrgentSchedules && !hasInvalidSchedules && (
        <div className="flex items-start gap-2 border border-orange-400/30 bg-orange-50 dark:bg-orange-950/20 p-3">
          <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">{t('funding.urgent_mission_warning')}</p>
        </div>
      )}

      {perBranch ? (
        <div className="space-y-4">
          {branches!.map((branch) => {
            const slots = branchSlots(branch.id);
            const branchName = isRTL ? branch.name_ar || branch.name : branch.name;
            const commonTime = slots.length && slots.every((s) => s.time === slots[0].time) ? slots[0].time : '';
            const commonDuration =
              slots.length && slots.every((s) => s.duration === slots[0].duration) ? String(slots[0].duration) : '';
            return (
              <div key={branch.id} className="border border-border">
                {/* Branch header */}
                <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/40 p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">{branchName}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <MapPin className="h-3 w-3" />
                        {[branch.district, branch.city].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ms-auto flex-wrap">
                    {/* Default start time for this location */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Select value={commonTime} onValueChange={(v) => setBranchTime(branch.id, v)}>
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue placeholder={t('funding.start_time_all')}>
                            {commonTime ? formatTime12h(commonTime, isRTL) : undefined}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {TIME_OPTIONS_12H.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {isRTL ? opt.label_ar : opt.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Default duration for this location */}
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <Select value={commonDuration} onValueChange={(v) => setBranchDuration(branch.id, parseInt(v))}>
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue placeholder={t('funding.duration_all')}>
                            {commonDuration ? formatDuration(Number(commonDuration)) : undefined}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={String(opt.value)}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Slots stepper */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeLastSlot(branch.id)}
                        disabled={slots.length === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center text-sm font-bold">{slots.length}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => addSchedule(branch.id)}
                        disabled={schedules.length >= maxVisits}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Slots */}
                {slots.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t('funding.no_slots_branch')}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => addSchedule(branch.id)}
                      disabled={schedules.length >= maxVisits}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('funding.add_slot')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3">{slots.map((s, i) => renderRow(s, i))}</div>
                )}
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">{t('funding.per_branch_help')}</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="border border-dashed border-border p-6 text-center">
          <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{t('funding.no_visits_scheduled')}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => addSchedule(undefined)} className="mt-3">
            <Plus className="h-4 w-4 mr-2" />
            {t('funding.add_first_visit')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">{schedules.map((s, i) => renderRow(s, i))}</div>
      )}

      {!perBranch && <p className="text-xs text-muted-foreground">{t('funding.schedule_help')}</p>}
    </div>
  );
}

/** Check if any schedule violates the 2-hour lead time rule */
export function hasInvalidLeadTime(schedules: VisitSchedule[]): boolean {
  return schedules.some(isWithinMinLeadTime);
}

/** Check if any schedule is within 24 hours (urgent) */
export function hasUrgentSchedules(schedules: VisitSchedule[]): boolean {
  return schedules.some(isUrgent) && !schedules.some(isWithinMinLeadTime);
}
