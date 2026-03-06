import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminSalesCallRequests } from '@/hooks/useSalesCallRequests';
import { LoadingState } from '@/components/common/LoadingState';
import { Phone, CheckCircle, MessageSquare, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function AdminSalesRequestsPage() {
  const { t } = useTranslation('admin');
  const { requests, isLoading, updateStatus } = useAdminSalesCallRequests();
  const [statusFilter, setStatusFilter] = useState('all');
  const [notesDialog, setNotesDialog] = useState<{ id: string; notes: string } | null>(null);
  const [noteText, setNoteText] = useState('');

  const filtered = statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const contactedThisWeek = requests.filter(r => {
    if (r.status !== 'contacted') return false;
    const d = new Date(r.updated_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;
  const resolvedThisWeek = requests.filter(r => {
    if (r.status !== 'resolved') return false;
    const d = new Date(r.resolved_at || r.updated_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status });
      toast.success(`Request ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleSaveNotes = async () => {
    if (!notesDialog) return;
    try {
      await updateStatus({ id: notesDialog.id, status: requests.find(r => r.id === notesDialog.id)?.status || 'pending', admin_notes: noteText });
      toast.success('Notes saved');
      setNotesDialog(null);
    } catch {
      toast.error('Failed to save notes');
    }
  };

  if (isLoading) return <AdminLayout><LoadingState message="Loading..." /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader title={t('sales_requests.title', { defaultValue: 'Sales Requests' })} description={t('sales_requests.description', { defaultValue: 'Manage client subscription change requests.' })} />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">{pendingCount}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Contacted (week)</p><p className="text-2xl font-bold text-blue-600">{contactedThisWeek}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Resolved (week)</p><p className="text-2xl font-bold text-green-600">{resolvedThisWeek}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{requests.length}</p></CardContent></Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="p-3 text-start font-medium">Request Type</th>
                  <th className="p-3 text-start font-medium">Current Plan</th>
                  <th className="p-3 text-start font-medium">Preferred Time</th>
                  <th className="p-3 text-start font-medium">Phone</th>
                  <th className="p-3 text-start font-medium">Status</th>
                  <th className="p-3 text-start font-medium">Date</th>
                  <th className="p-3 text-start font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(req => (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">{req.request_type}</td>
                      <td className="p-3">{req.current_plan || '-'}</td>
                      <td className="p-3">{req.preferred_time || '-'}</td>
                      <td className="p-3">{req.phone_number || '-'}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={STATUS_COLORS[req.status] || ''}>{req.status}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {req.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(req.id, 'contacted')}><Phone className="h-3 w-3 me-1" />Contacted</Button>
                          )}
                          {(req.status === 'pending' || req.status === 'contacted') && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(req.id, 'resolved')}><CheckCircle className="h-3 w-3 me-1" />Resolve</Button>
                          )}
                          {req.status !== 'cancelled' && req.status !== 'resolved' && (
                            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(req.id, 'cancelled')}><XCircle className="h-3 w-3" /></Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => { setNotesDialog({ id: req.id, notes: req.admin_notes || '' }); setNoteText(req.admin_notes || ''); }}>
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Notes Dialog */}
        <Dialog open={!!notesDialog} onOpenChange={() => setNotesDialog(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Admin Notes</DialogTitle></DialogHeader>
            <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4} />
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
