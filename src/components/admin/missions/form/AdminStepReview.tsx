import { CheckCircle, MapPin, HelpCircle, DollarSign, Users, MapPinned, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MissionFormData, Question } from '@/types';
import { AGENT_TIERS, QUESTION_TYPE_LABELS } from '@/lib/constants';

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface AdminMissionFormData extends MissionFormData {
  clientUserId: string;
}

interface AdminStepReviewProps {
  data: AdminMissionFormData;
  branches: Branch[];
  onCreate: () => void;
  isSubmitting: boolean;
}

export function AdminStepReview({ data, branches, onCreate, isSubmitting }: AdminStepReviewProps) {
  const selectedBranches = branches.filter((b) => data.branch_ids.includes(b.id));
  const branchCount = selectedBranches.length || 1;
  const totalBudget = data.number_of_visits * data.purchase_budget_per_visit * branchCount;
  const totalVisits = data.number_of_visits * branchCount;
  const selectedTier = AGENT_TIERS.find((t) => t.tier === data.agent_tier);

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <h3 className="text-lg font-bold">Review Your Mission</h3>
        <p className="text-sm text-muted-foreground">
          Please review the details before creating.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mission Name</span>
              <span className="font-medium">{data.name || 'Not set'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Branches</span>
              <span className="font-medium">{selectedBranches.length} selected</span>
            </div>
            {selectedBranches.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedBranches.slice(0, 3).map((b) => (
                  <Badge key={b.id} variant="outline" className="text-xs">
                    {b.name}
                  </Badge>
                ))}
                {selectedBranches.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedBranches.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Geo-Tagged</span>
              <Badge variant={data.is_geo_tagged ? 'default' : 'secondary'}>
                {data.is_geo_tagged ? (
                  <>
                    <MapPinned className="h-3 w-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  'Disabled'
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Agent Tier */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agent Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selected Tier</span>
              <Badge variant="outline">{selectedTier?.name || data.agent_tier}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedTier?.description}
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Questions</span>
              <span className="font-medium">{data.questions.length}</span>
            </div>
            {data.questions.length > 0 && (
              <div className="space-y-1 mt-2">
                {data.questions.slice(0, 3).map((q: Question, i: number) => (
                  <div key={q.id} className="text-xs text-muted-foreground truncate">
                    {i + 1}. {q.text} ({QUESTION_TYPE_LABELS[q.type]})
                  </div>
                ))}
                {data.questions.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{data.questions.length - 3} more questions
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Funding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visits per Mission</span>
              <span className="font-medium">{data.number_of_visits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget per Visit</span>
              <span className="font-medium">{data.purchase_budget_per_visit.toLocaleString()} EGP</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total Budget</span>
              <span>{totalBudget.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total Visits</span>
              <span>{totalVisits} visits across {branchCount} mission(s)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <Button
          size="lg"
          className="w-full sm:w-auto px-12 gap-2"
          onClick={onCreate}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          {branchCount > 1 ? `Create ${branchCount} Missions` : 'Create Mission'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Missions will be saved as drafts. You can publish them later.
        </p>
      </div>
    </div>
  );
}
