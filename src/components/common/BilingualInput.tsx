import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { BilingualValue } from '@/i18n/utils';
import { cn } from '@/lib/utils';

interface BilingualInputProps {
  label: string;
  value: BilingualValue;
  onChange: (value: BilingualValue) => void;
  placeholder?: { en?: string; ar?: string };
  required?: boolean;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function BilingualInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  id,
  className,
  disabled,
}: BilingualInputProps) {
  const { t } = useTranslation('common');

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-xs font-bold uppercase tracking-wide">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('english')}
          </span>
          <Input
            id={id ? `${id}-en` : undefined}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            placeholder={placeholder?.en}
            dir="ltr"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('arabic')}
          </span>
          <Input
            id={id ? `${id}-ar` : undefined}
            value={value.ar}
            onChange={(e) => onChange({ ...value, ar: e.target.value })}
            placeholder={placeholder?.ar}
            dir="rtl"
            className="font-ar"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

interface BilingualTextareaProps {
  label: string;
  value: BilingualValue;
  onChange: (value: BilingualValue) => void;
  placeholder?: { en?: string; ar?: string };
  required?: boolean;
  id?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

export function BilingualTextarea({
  label,
  value,
  onChange,
  placeholder,
  required,
  id,
  className,
  rows = 3,
  disabled,
}: BilingualTextareaProps) {
  const { t } = useTranslation('common');

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-xs font-bold uppercase tracking-wide">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('english')}
          </span>
          <Textarea
            id={id ? `${id}-en` : undefined}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            placeholder={placeholder?.en}
            dir="ltr"
            rows={rows}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('arabic')}
          </span>
          <Textarea
            id={id ? `${id}-ar` : undefined}
            value={value.ar}
            onChange={(e) => onChange({ ...value, ar: e.target.value })}
            placeholder={placeholder?.ar}
            dir="rtl"
            className="font-ar"
            rows={rows}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
