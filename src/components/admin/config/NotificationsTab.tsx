import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Mail, MessageSquare } from 'lucide-react';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { LoadingState } from '@/components/common/LoadingState';

export function NotificationsTab() {
  const { t, i18n } = useTranslation('admin');
  const isRTL = i18n.dir() === 'rtl';
  const { templates, templatesLoading, updateTemplate } = useSystemConfig();
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ subject: '', subject_ar: '', body: '', body_ar: '', is_active: true });

  if (templatesLoading) return <LoadingState />;

  const openEdit = (tpl: any) => {
    setForm({
      subject: tpl.subject,
      subject_ar: tpl.subject_ar || '',
      body: tpl.body,
      body_ar: tpl.body_ar || '',
      is_active: tpl.is_active,
    });
    setEditing(tpl);
  };

  const saveTemplate = async () => {
    if (!editing) return;
    await updateTemplate({ id: editing.id, ...form });
    setEditing(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="text-start">
          <CardTitle className="text-base font-bold uppercase">{t('config.notification_templates')}</CardTitle>
          <CardDescription>{t('config.notification_templates_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map(tpl => (
            <div key={tpl.id} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-3 text-start">
                {tpl.channel === 'sms' ? <MessageSquare className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <p className="font-medium">{isRTL && tpl.name_ar ? tpl.name_ar : tpl.name}</p>
                  <p className="text-sm text-muted-foreground">{isRTL && tpl.description_ar ? tpl.description_ar : tpl.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tpl.is_active ? 'default' : 'secondary'}>
                  {tpl.is_active ? t('config.active') : t('config.inactive')}
                </Badge>
                <Badge variant="outline">{tpl.channel}</Badge>
                <Button variant="outline" size="sm" onClick={() => openEdit(tpl)}>
                  <Pencil className="h-3.5 w-3.5 me-1" />
                  {t('config.edit')}
                </Button>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t('config.no_templates')}</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Template Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('config.edit_template')}: {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('config.template_active')}</Label>
              <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
            </div>

            <Tabs defaultValue="en">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="space-y-4 mt-4">
                <div>
                  <Label>{t('config.subject')}</Label>
                  <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>{t('config.body')}</Label>
                  <Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="mt-1 min-h-[120px]" />
                </div>
              </TabsContent>
              <TabsContent value="ar" className="space-y-4 mt-4">
                <div>
                  <Label>{t('config.subject_ar')}</Label>
                  <Input value={form.subject_ar} onChange={e => setForm(p => ({ ...p, subject_ar: e.target.value }))} className="mt-1" dir="rtl" />
                </div>
                <div>
                  <Label>{t('config.body_ar')}</Label>
                  <Textarea value={form.body_ar} onChange={e => setForm(p => ({ ...p, body_ar: e.target.value }))} className="mt-1 min-h-[120px]" dir="rtl" />
                </div>
              </TabsContent>
            </Tabs>

            {editing?.variables && Array.isArray(editing.variables) && editing.variables.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">{t('config.available_variables')}</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {editing.variables.map((v: string) => (
                    <Badge key={v} variant="outline" className="font-mono text-xs">{`{{${v}}}`}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('config.cancel')}</Button>
            <Button onClick={saveTemplate}>{t('config.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
