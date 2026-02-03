import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAdminClientsList } from '@/hooks/useAdminClients';
import { Loader2 } from 'lucide-react';

interface ClientSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ClientSelector({
  value,
  onValueChange,
  label = 'Client',
  required = false,
  disabled = false,
}: ClientSelectorProps) {
  const { data: clients, isLoading } = useAdminClientsList();

  return (
    <div className="grid gap-2">
      {label && (
        <Label>
          {label} {required && '*'}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
        <SelectTrigger>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading clients...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a client" />
          )}
        </SelectTrigger>
        <SelectContent>
          {clients?.map((client) => (
            <SelectItem key={client.userId} value={client.userId}>
              {client.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
