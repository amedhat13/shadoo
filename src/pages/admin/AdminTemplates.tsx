import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileQuestion, Plus, Edit2, Trash2, Shield, Search } from 'lucide-react';
import { useQuestionTemplates, QuestionTemplate, METHODOLOGY_CATEGORIES } from '@/hooks/useQuestionTemplates';
import { TemplateFormDialog } from '@/components/admin/templates/TemplateFormDialog';
import { LoadingState } from '@/components/common/LoadingState';

export default function AdminTemplatesPage() {
  const { t, i18n } = useTranslation('admin');
  const isRTL = i18n.dir() === 'rtl';
  const {
    templates, isLoading, categoryStats,
    createTemplate, updateTemplate, deleteTemplate,
    isCreating, isUpdating, isDeleting,
  } = useQuestionTemplates();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuestionTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const openCreate = () => {
    setEditingTemplate(null);
    setFormOpen(true);
  };

  const openEdit = (tpl: QuestionTemplate) => {
    setEditingTemplate(tpl);
    setFormOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingTemplate) {
      await updateTemplate({ id: editingTemplate.id, ...data });
    } else {
      await createTemplate(data);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteTemplate(deleteId);
    setDeleteId(null);
  };

  const getName = (tpl: QuestionTemplate) => isRTL && tpl.name_ar ? tpl.name_ar : tpl.name;
  const isSystemTemplate = (tpl: QuestionTemplate) => tpl.created_by === null;

  const filteredTemplates = templates.filter(tpl => {
    if (filterCategory !== 'all' && (tpl.category || 'Custom') !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return tpl.name.toLowerCase().includes(q) || (tpl.name_ar || '').includes(q);
    }
    return true;
  });

  if (isLoading) return <AdminLayout><LoadingState /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('templates.title')}
          description={t('templates.description')}
          actions={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t('templates.create_template')}
            </Button>
          }
        />

        {/* Category Cards */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {METHODOLOGY_CATEGORIES.map(cat => (
            <Card key={cat} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilterCategory(cat === filterCategory ? 'all' : cat)}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="text-start">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground truncate">{cat}</p>
                    <p className="text-xl font-black">{categoryStats[cat] || 0}</p>
                  </div>
                  <FileQuestion className="h-6 w-6 text-muted-foreground/40 shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-start">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('templates.total_templates')}</p>
                  <p className="text-xl font-black">{templates.length}</p>
                </div>
                <FileQuestion className="h-6 w-6 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('templates.search_templates')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('templates.all_categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('templates.all_categories')}</SelectItem>
              {METHODOLOGY_CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('templates.all_templates')}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('templates.no_templates')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">{t('templates.template_name')}</TableHead>
                    <TableHead className="text-start">{t('templates.category')}</TableHead>
                    <TableHead className="text-start">{t('templates.methodology')}</TableHead>
                    <TableHead className="text-start">{t('templates.questions')}</TableHead>
                    <TableHead className="text-start">{t('templates.status')}</TableHead>
                    <TableHead className="text-end">{t('templates.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map(tpl => (
                    <TableRow key={tpl.id}>
                      <TableCell className="font-medium text-start">
                        <div className="flex items-center gap-2">
                          {getName(tpl)}
                          {isSystemTemplate(tpl) && (
                            <Badge variant="outline" className="gap-1 text-[10px]">
                              <Shield className="h-3 w-3" />
                              {t('templates.system')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-start">
                        <Badge variant="outline">{tpl.category || 'Custom'}</Badge>
                      </TableCell>
                      <TableCell className="text-start">
                        <span className="text-xs text-muted-foreground">{tpl.methodology || '—'}</span>
                      </TableCell>
                      <TableCell className="text-start">
                        {t('templates.question_count', { count: tpl.questions?.length || 0 })}
                      </TableCell>
                      <TableCell className="text-start">
                        <Badge variant={tpl.is_public ? 'default' : 'secondary'}>
                          {tpl.is_public ? t('templates.public') : t('templates.private')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(tpl)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(tpl.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <TemplateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        template={editingTemplate}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('templates.delete_template')}</AlertDialogTitle>
            <AlertDialogDescription>{t('templates.delete_confirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('config.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('templates.delete_template')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
