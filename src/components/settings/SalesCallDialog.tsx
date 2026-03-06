import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Clock, MessageSquare } from 'lucide-react';
import { useSalesCallRequests } from '@/hooks/useSalesCallRequests';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const REQUEST_TYPES = [
  'upgrade', 'add_visits', 'add_users', 'change_billing', 'cancel', 'other'
] as const;

const TIME_SLOTS = [
  'morning', 'afternoon', 'evening', 'any_time'
] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export function SalesCallDialog() {
  const { t } = useTranslation('settings');
  const { currentPlan } = useSubscription();
  const { user } = useAuth();
  const { requests, submitRequest, isSubmitting } = useSalesCallRequests();
  const [open, setOpen] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!requestType || !preferredTime) return;
    try {
      await submitRequest({
        current_plan: currentPlan?.name || 'Unknown',
        request_type: requestType,
        preferred_time: preferredTime,
        phone_number: phone,
        notes: notes || undefined,
      });
      toast.success(t('sales.request_submitted'));
      setOpen(false);
      setRequestType('');
      setPreferredTime('');
      setNotes('');
    } catch {
      toast.error('Failed to submit request');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-5 w-5" />
            {t('sales.change_plan')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('sales.current_plan')}:</span>
              <Badge variant="secondary">{currentPlan.name}</Badge>
            </div>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">{t('sales.request_call')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('sales.request_call')}</DialogTitle>
                <DialogDescription>{t('sales.request_call_desc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {currentPlan && (
                  <div>
                    <Label>{t('sales.current_plan')}</Label>
                    <Input value={currentPlan.name} disabled />
                  </div>
                )}
                <div>
                  <Label>{t('sales.request_type')}</Label>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger><SelectValue placeholder={t('sales.select_type')} /></SelectTrigger>
                    <SelectContent>
                      {REQUEST_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{t(`sales.types.${type}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('sales.preferred_time')}</Label>
                  <Select value={preferredTime} onValueChange={setPreferredTime}>
                    <SelectTrigger><SelectValue placeholder={t('sales.select_time')} /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(slot => (
                        <SelectItem key={slot} value={slot}>{t(`sales.times.${slot}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('sales.phone')}</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label>{t('sales.notes')}</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} rows={3} />
                </div>
                <Button onClick={handleSubmit} disabled={isSubmitting || !requestType || !preferredTime} className="w-full">
                  {t('sales.submit')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Request History */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('sales.your_requests')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requests.slice(0, 5).map(req => (
                <div key={req.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{t(`sales.types.${req.request_type}`, { defaultValue: req.request_type })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className={STATUS_COLORS[req.status] || ''}>
                      {t(`sales.statuses.${req.status}`, { defaultValue: req.status })}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
