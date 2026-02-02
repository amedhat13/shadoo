import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Pause, Play, Archive, ChevronRight, Copy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mission } from '@/types';
import { MissionStatusBadge } from './MissionStatusBadge';
import { CURRENCY } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-mobile';

interface MissionTableProps {
  missions: Mission[];
  onPause?: (mission: Mission) => void;
  onResume?: (mission: Mission) => void;
  onArchive?: (mission: Mission) => void;
  onDuplicate?: (mission: Mission) => void;
}

export function MissionTable({ missions, onPause, onResume, onArchive, onDuplicate }: MissionTableProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
  };

  // Mobile: Card-based layout
  if (isMobile) {
    return (
      <div className="space-y-3">
        {missions.map((mission) => (
          <Card 
            key={mission.id}
            className="border border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(`/missions/${mission.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MissionStatusBadge status={mission.status} />
                  </div>
                  <h3 className="font-semibold text-foreground truncate">{mission.name}</h3>
                  <p className="text-sm text-muted-foreground">{mission.branch?.name || 'No branch'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/missions/${mission.id}`);
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {mission.status === 'draft' && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/missions/${mission.id}/edit`);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(mission);
                        }}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {mission.status === 'published' && onPause && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onPause(mission);
                        }}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </DropdownMenuItem>
                      )}
                      {mission.status === 'paused' && onResume && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onResume(mission);
                        }}>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </DropdownMenuItem>
                      )}
                      {(mission.status === 'published' || mission.status === 'paused') && onArchive && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onArchive(mission);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Visits</p>
                  <p className="font-semibold">
                    <span className="text-success">{mission.visits_completed}</span>
                    <span className="text-muted-foreground"> / {mission.number_of_visits}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Budget</p>
                  <p className="font-semibold">{formatCurrency(mission.total_purchase_budget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop: Table layout
  return (
    <div className="border border-border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="w-[250px] text-xs font-bold uppercase tracking-wide">Mission</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wide">Branch</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wide">Status</TableHead>
            <TableHead className="text-center text-xs font-bold uppercase tracking-wide">Visits</TableHead>
            <TableHead className="text-right text-xs font-bold uppercase tracking-wide">Budget/Visit</TableHead>
            <TableHead className="text-right text-xs font-bold uppercase tracking-wide">Total Budget</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission, index) => (
            <TableRow 
              key={mission.id}
              className={`cursor-pointer border-b border-border ${index % 2 === 1 ? 'bg-muted/30' : ''}`}
              onClick={() => navigate(`/missions/${mission.id}`)}
            >
              <TableCell>
                <div className="font-semibold text-foreground">
                  {mission.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mission.questions.length} questions • {mission.photo_requirements.required_count} photos
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {mission.branch?.name || 'No branch'}
              </TableCell>
              <TableCell>
                <MissionStatusBadge status={mission.status} />
              </TableCell>
              <TableCell className="text-center">
                <span className="text-success font-bold">{mission.visits_completed}</span>
                <span className="text-muted-foreground"> / {mission.number_of_visits}</span>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(mission.purchase_budget_per_visit)}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(mission.total_purchase_budget)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/missions/${mission.id}`);
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {mission.status === 'draft' && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/missions/${mission.id}/edit`);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDuplicate && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(mission);
                      }}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {mission.status === 'published' && onPause && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onPause(mission);
                      }}>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </DropdownMenuItem>
                    )}
                    {mission.status === 'paused' && onResume && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onResume(mission);
                      }}>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </DropdownMenuItem>
                    )}
                    {(mission.status === 'published' || mission.status === 'paused') && onArchive && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive(mission);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
