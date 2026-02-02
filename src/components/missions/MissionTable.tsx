import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Edit, Pause, Play, Archive } from 'lucide-react';
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
import { Mission } from '@/types/mission';
import { MissionStatusBadge } from './MissionStatusBadge';
import { CURRENCY } from '@/lib/constants';

interface MissionTableProps {
  missions: Mission[];
  onPause?: (mission: Mission) => void;
  onResume?: (mission: Mission) => void;
  onArchive?: (mission: Mission) => void;
}

export function MissionTable({ missions, onPause, onResume, onArchive }: MissionTableProps) {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Mission</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Quota</TableHead>
            <TableHead className="text-right">Reward</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission) => (
            <TableRow 
              key={mission.id}
              className="cursor-pointer"
              onClick={() => navigate(`/missions/${mission.id}`)}
            >
              <TableCell>
                <div className="font-medium text-foreground">
                  {mission.title}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {mission.description}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {mission.branch?.name || 'No branch'}
              </TableCell>
              <TableCell>
                <MissionStatusBadge status={mission.status} />
              </TableCell>
              <TableCell className="text-right font-medium">
                {mission.completed_runs || 0}/{mission.quota}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(mission.fixed_reward)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {mission.published_at
                  ? format(new Date(mission.published_at), 'MMM d, yyyy')
                  : '—'}
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
