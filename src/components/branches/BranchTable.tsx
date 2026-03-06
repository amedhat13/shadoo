import { Branch } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BranchStatusBadge } from './BranchStatusBadge';
import { ExternalLink, Pencil, Trash2, MapPin } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useDirectionalIcons } from '@/i18n/utils';
import { useLanguage } from '@/i18n/LanguageProvider';

interface BranchTableProps {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
  onViewOnMap: (branch: Branch) => void;
  isDemo?: boolean;
  demoBranchIds?: string[];
}

export function BranchTable({ branches, onEdit, onDelete, onViewOnMap, isDemo = false, demoBranchIds = [] }: BranchTableProps) {
  const isDemoBranch = (branchId: string) => isDemo && demoBranchIds.includes(branchId);
  const isMobile = useIsMobile();
  const { t } = useTranslation('branches');
  const { ChevronEnd } = useDirectionalIcons();
  const { isRTL } = useLanguage();

  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{t('no_branches')}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('no_branches_description')}
        </p>
      </div>
    );
  }

  // Mobile: Card layout
  if (isMobile) {
    return (
      <div className="space-y-3">
        {branches.map((branch) => (
          <Card key={branch.id} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <BranchStatusBadge status={branch.status} />
                    {isDemoBranch(branch.id) && (
                      <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">{t('demo_branch', { defaultValue: 'Demo' })}</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mt-2 truncate">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{branch.address}</p>
                  <p className="text-sm text-muted-foreground">{branch.city}</p>
                </div>
              </div>
              
              {branch.status === 'rejected' && branch.rejection_reason && (
                <div className="mb-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                  {branch.rejection_reason}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <a
                  href={branch.google_maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <MapPin className="h-3 w-3" />
                  {t('view_map')}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewOnMap(branch)}
                    className="h-8 w-8"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(branch)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!isDemoBranch(branch.id) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('delete_branch')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('delete_confirmation', { name: branch.name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(branch.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
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
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('address')}</TableHead>
              <TableHead>{t('city')}</TableHead>
              <TableHead>{t('district')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('status')}</TableHead>
              <TableHead>{t('google_maps')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell className="font-medium">{branch.name}</TableCell>
                <TableCell className="text-muted-foreground">{branch.address}</TableCell>
                <TableCell>{branch.city}</TableCell>
                <TableCell className="text-muted-foreground">{branch.district || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <BranchStatusBadge status={branch.status} />
                    {branch.status === 'rejected' && branch.rejection_reason && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-destructive cursor-help truncate max-w-[150px]">
                            {branch.rejection_reason}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[300px]">{branch.rejection_reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={branch.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {t('view')} <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewOnMap(branch)}
                      title={t('view_map')}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(branch)}
                      title={t('edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title={t('delete')}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('delete_branch')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('delete_confirmation', { name: branch.name })} {t('delete_confirmation_missions')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(branch.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}