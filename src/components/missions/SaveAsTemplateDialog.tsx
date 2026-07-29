import { useEffect, useState } from 'react';
import { BookmarkPlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useQuestionTemplates } from '@/hooks/useQuestionTemplates';
import { Question } from '@/types';
import { useTranslation } from 'react-i18next';

export interface SaveAsTemplateSource {
  name: string;
  name_ar?: string | null;
  methodology?: string | null;
  category?: string | null;
  questions: Question[];
}

interface SaveAsTemplateDialogProps {
  mission: SaveAsTemplateSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveAsTemplateDialog({ mission, open, onOpenChange }: SaveAsTemplateDialogProps) {
  const { t } = useTranslation('missions');
  const { t: tc } = useTranslation('common');
  const { createTemplate } = useQuestionTemplates();

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (open && mission) {
      setName(mission.name || '');
      setNameAr(mission.name_ar || '');
      setDescription('');
      setDescriptionAr('');
      setIsPublic(false);
    }
  }, [open, mission]);

  if (!mission) return null;

  const questionCount = mission.questions?.length || 0;
  const sectionCount = new Set(
    (mission.questions || [])
      .map((q) => (q as unknown as Record<string, unknown>).section_id as string | undefined)
      .filter(Boolean)
  ).size;

  const handleSave = async () => {
    await createTemplate.mutateAsync({
      name: name.trim(),
      name_ar: nameAr.trim() || undefined,
      description: description.trim() || undefined,
      description_ar: descriptionAr.trim() || undefined,
      category: mission.category || undefined,
      methodology: mission.methodology || undefined,
      questions: mission.questions || [],
      is_public: isPublic,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            {t('save_as_template.title')}
          </DialogTitle>
          <DialogDescription>{t('save_as_template.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap items-center gap-2 border border-border bg-muted/30 p-3">
            <Badge variant="secondary">{t('save_as_template.questions_count', { count: questionCount })}</Badge>
            {sectionCount > 0 && (
              <Badge variant="secondary">{t('save_as_template.sections_count', { count: sectionCount })}</Badge>
            )}
            {mission.methodology && <Badge variant="outline">{mission.methodology}</Badge>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tpl-name">{t('save_as_template.name_en')}*</Label>
              <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-name-ar">{t('save_as_template.name_ar')}</Label>
              <Input id="tpl-name-ar" dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tpl-desc">{t('save_as_template.description_en')}</Label>
              <Textarea id="tpl-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-desc-ar">{t('save_as_template.description_ar')}</Label>
              <Textarea id="tpl-desc-ar" dir="rtl" rows={2} value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between border border-border p-3">
            <div>
              <p className="text-sm font-medium">{t('save_as_template.share_label')}</p>
              <p className="text-xs text-muted-foreground">{t('save_as_template.share_helper')}</p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tc('cancel')}</Button>
          <Button onClick={handleSave} disabled={!name.trim() || createTemplate.isPending} className="gap-2">
            {createTemplate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
            {t('save_as_template.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
