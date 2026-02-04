import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, User, MapPin, Camera, MessageSquare, Receipt, Loader2, Calendar, Clock, Timer } from 'lucide-react';
import { AdminVisit, useApproveVisit, useRejectVisit } from '@/hooks/useAdminVisits';
import { format, parseISO } from 'date-fns';

interface VisitReviewDialogProps {
  visit: AdminVisit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisitReviewDialog({ visit, open, onOpenChange }: VisitReviewDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const approveVisit = useApproveVisit();
  const rejectVisit = useRejectVisit();

  const handleApprove = async () => {
    if (!visit) return;
    await approveVisit.mutateAsync(visit.id);
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!visit || !rejectionReason.trim()) return;
    await rejectVisit.mutateAsync({ visitId: visit.id, reason: rejectionReason });
    setRejectionReason('');
    setShowRejectForm(false);
    onOpenChange(false);
  };

  if (!visit) return null;

  const questions = visit.mission?.questions || [];
  const answers = visit.answers || [];
  const photos = visit.photos || [];
  const isSubmitted = visit.status === 'submitted';
  const isReviewed = visit.status === 'approved' || visit.status === 'rejected';

  // Get schedule info - either from denormalized fields or lookup from mission schedules
  const scheduleInfo = visit.scheduled_date 
    ? {
        date: visit.scheduled_date,
        time: visit.scheduled_time,
        duration: visit.scheduled_duration,
      }
    : visit.schedule_id && visit.mission?.visit_schedules
      ? (visit.mission.visit_schedules as any[])?.find((s: any) => s.id === visit.schedule_id)
      : null;

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Review Visit Submission
            <Badge 
              className={
                visit.status === 'approved' ? 'bg-success text-success-foreground' :
                visit.status === 'rejected' ? 'bg-destructive text-destructive-foreground' :
                'bg-warning text-warning-foreground'
              }
            >
              {visit.status?.replace('_', ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Mission: {visit.mission?.name} • Submitted: {visit.submitted_at ? format(new Date(visit.submitted_at), 'PPpp') : 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Agent Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Agent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 font-medium">{visit.agent?.full_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tier:</span>
                  <span className="ml-2 font-medium">{visit.agent?.tier || 'C'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{visit.agent?.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="ml-2">{visit.agent?.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Info */}
            {scheduleInfo && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Scheduled Visit Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground block text-xs">Date</span>
                      <span className="font-medium">
                        {scheduleInfo.date 
                          ? format(parseISO(scheduleInfo.date), 'MMM d, yyyy')
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground block text-xs">Time</span>
                      <span className="font-medium">{scheduleInfo.time || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground block text-xs">Duration</span>
                      <span className="font-medium">{formatDuration(scheduleInfo.duration)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchase Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Purchase Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount Spent:</span>
                  <span className="ml-2 font-medium">{visit.purchase_amount?.toLocaleString() || 0} EGP</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget Allowed:</span>
                  <span className="ml-2">{visit.mission?.purchase_budget_per_visit?.toLocaleString() || 0} EGP</span>
                </div>
              </CardContent>
            </Card>

            {/* Answers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Question Responses ({answers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No questions configured for this mission.</p>
                ) : (
                  questions.map((question: any, index: number) => {
                    const answer = answers.find((a: any) => a.question_id === question.id);
                    return (
                      <div key={question.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                        <p className="text-sm font-medium">
                          {index + 1}. {question.text}
                          {question.required && <span className="text-destructive ml-1">*</span>}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">Answer: </span>
                          {answer?.value !== undefined ? String(answer.value) : <span className="italic">No answer provided</span>}
                        </p>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photos ({photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {photos.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No photos submitted.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo: string, index: number) => (
                      <a 
                        key={index} 
                        href={photo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="aspect-square bg-muted rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img 
                          src={photo} 
                          alt={`Visit photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {visit.receipt_photo && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Receipt Photo:</p>
                    <a 
                      href={visit.receipt_photo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <img 
                        src={visit.receipt_photo} 
                        alt="Receipt"
                        className="max-w-[200px] rounded-lg border border-border"
                      />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rejection Reason (if rejected) */}
            {visit.status === 'rejected' && visit.rejection_reason && (
              <Card className="border-destructive">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Rejection Reason
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{visit.rejection_reason}</p>
                </CardContent>
              </Card>
            )}

            {/* Reject Form */}
            {showRejectForm && (
              <Card className="border-destructive">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Rejection Reason</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || rejectVisit.isPending}
                    >
                      {rejectVisit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Rejection
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {isSubmitted && !showRejectForm && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowRejectForm(true)}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveVisit.isPending}
              className="gap-2"
            >
              {approveVisit.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve Visit
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
