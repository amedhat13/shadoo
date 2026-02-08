import { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, Timer, Copy } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { VisitSchedule } from '@/types';
import { useTranslation } from 'react-i18next';

interface VisitScheduleEditorProps {
  schedules: VisitSchedule[];
  onChange: (schedules: VisitSchedule[]) => void;
  maxVisits?: number;
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

export function VisitScheduleEditor({ schedules, onChange, maxVisits = 100 }: VisitScheduleEditorProps) {
  const [bulkCount, setBulkCount] = useState(5);
  const { t } = useTranslation('missions');

  const addSchedule = () => {
    if (schedules.length >= maxVisits) return;
    
    const lastSchedule = schedules[schedules.length - 1];
    const newDate = lastSchedule 
      ? format(addDays(parseISO(lastSchedule.date), 1), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');
    
    const newSchedule: VisitSchedule = {
      id: crypto.randomUUID(),
      date: newDate,
      time: lastSchedule?.time || '10:00',
      duration: lastSchedule?.duration || 60,
    };
    onChange([...schedules, newSchedule]);
  };

  const addBulkSchedules = () => {
    const remaining = maxVisits - schedules.length;
    const toAdd = Math.min(bulkCount, remaining);
    if (toAdd <= 0) return;

    const lastSchedule = schedules[schedules.length - 1];
    let startDate = lastSchedule 
      ? addDays(parseISO(lastSchedule.date), 1)
      : new Date();

    const newSchedules: VisitSchedule[] = [];
    for (let i = 0; i < toAdd; i++) {
      newSchedules.push({
        id: crypto.randomUUID(),
        date: format(addDays(startDate, i), 'yyyy-MM-dd'),
        time: lastSchedule?.time || '10:00',
        duration: lastSchedule?.duration || 60,
      });
    }
    onChange([...schedules, ...newSchedules]);
  };

  const updateSchedule = (id: string, updates: Partial<VisitSchedule>) => {
    onChange(
      schedules.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeSchedule = (id: string) => {
    onChange(schedules.filter((s) => s.id !== id));
  };

  const duplicateSchedule = (schedule: VisitSchedule) => {
    if (schedules.length >= maxVisits) return;
    
    const newSchedule: VisitSchedule = {
      ...schedule,
      id: crypto.randomUUID(),
      date: format(addDays(parseISO(schedule.date), 1), 'yyyy-MM-dd'),
    };
    const index = schedules.findIndex((s) => s.id === schedule.id);
    const newSchedules = [...schedules];
    newSchedules.splice(index + 1, 0, newSchedule);
    onChange(newSchedules);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold uppercase tracking-wide">
          <Calendar className="h-4 w-4 inline mr-2" />
          {t('funding.visit_schedules', { count: schedules.length })}
        </Label>
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
            onClick={addBulkSchedules}
            disabled={schedules.length >= maxVisits}
          >
            {t('funding.add_bulk')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSchedule}
            disabled={schedules.length >= maxVisits}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="border border-dashed border-border p-6 text-center">
          <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{t('funding.no_visits_scheduled')}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSchedule}
            className="mt-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('funding.add_first_visit')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className="flex items-center gap-2 p-3 border border-border bg-card"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">
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
                      !schedule.date && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {schedule.date
                      ? format(parseISO(schedule.date), 'MMM d, yyyy')
                      : t('funding.pick_date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={schedule.date ? parseISO(schedule.date) : undefined}
                    onSelect={(date) =>
                      date && updateSchedule(schedule.id, { date: format(date, 'yyyy-MM-dd') })
                    }
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* Time Input */}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => updateSchedule(schedule.id, { time: e.target.value })}
                  className="w-[100px] h-8"
                />
              </div>

              {/* Duration Select */}
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={String(schedule.duration)}
                  onValueChange={(value) =>
                    updateSchedule(schedule.id, { duration: parseInt(value) })
                  }
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

              {/* Actions */}
              <div className="flex items-center gap-1 ml-auto">
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
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {t('funding.schedule_help')}
      </p>
    </div>
  );
}
