import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, MapPin, ChevronRight } from 'lucide-react';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { LoadingState } from '@/components/common/LoadingState';

export function LocationsTab() {
  const { t, i18n } = useTranslation('admin');
  const isRTL = i18n.dir() === 'rtl';
  const {
    cities, citiesLoading, createCity, updateCity, deleteCity,
    districts, districtsLoading, createDistrict, updateDistrict, deleteDistrict,
  } = useSystemConfig();

  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [cityDialog, setCityDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [districtDialog, setDistrictDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'city' | 'district'; id: string; name: string } | null>(null);

  // City form state
  const [cityForm, setCityForm] = useState({ code: '', name: '', name_ar: '' });
  // District form state
  const [districtForm, setDistrictForm] = useState({ code: '', name: '', name_ar: '' });

  const selectedCity = cities.find(c => c.id === selectedCityId);
  const cityDistricts = districts.filter(d => d.city_id === selectedCityId);

  if (citiesLoading || districtsLoading) return <LoadingState />;

  const openCityDialog = (city?: any) => {
    if (city) {
      setCityForm({ code: city.code, name: city.name, name_ar: city.name_ar || '' });
      setCityDialog({ open: true, editing: city });
    } else {
      setCityForm({ code: '', name: '', name_ar: '' });
      setCityDialog({ open: true });
    }
  };

  const saveCityForm = async () => {
    if (cityDialog.editing) {
      await updateCity({ id: cityDialog.editing.id, ...cityForm });
    } else {
      await createCity({ ...cityForm, sort_order: cities.length + 1 });
    }
    setCityDialog({ open: false });
  };

  const openDistrictDialog = (district?: any) => {
    if (district) {
      setDistrictForm({ code: district.code, name: district.name, name_ar: district.name_ar || '' });
      setDistrictDialog({ open: true, editing: district });
    } else {
      setDistrictForm({ code: '', name: '', name_ar: '' });
      setDistrictDialog({ open: true });
    }
  };

  const saveDistrictForm = async () => {
    if (!selectedCityId) return;
    if (districtDialog.editing) {
      await updateDistrict({ id: districtDialog.editing.id, ...districtForm });
    } else {
      await createDistrict({ city_id: selectedCityId, ...districtForm, sort_order: cityDistricts.length + 1 });
    }
    setDistrictDialog({ open: false });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'city') await deleteCity(deleteTarget.id);
    else await deleteDistrict(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cities List */}
        <Card>
          <CardHeader className="text-start">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold uppercase">{t('config.cities')}</CardTitle>
                <CardDescription>{t('config.cities_desc')}</CardDescription>
              </div>
              <Button size="sm" onClick={() => openCityDialog()} className="gap-1">
                <Plus className="h-4 w-4" />
                {t('config.add_city')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cities.map(city => {
                const count = districts.filter(d => d.city_id === city.id).length;
                return (
                  <div
                    key={city.id}
                    className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors hover:bg-muted/50 ${selectedCityId === city.id ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedCityId(city.id)}
                  >
                    <div className="flex items-center gap-3 text-start">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{isRTL && city.name_ar ? city.name_ar : city.name}</p>
                        <p className="text-xs text-muted-foreground">{count} {t('config.districts_count')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!city.is_active && <Badge variant="secondary">{t('config.inactive')}</Badge>}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openCityDialog(city); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'city', id: city.id, name: city.name }); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                );
              })}
              {cities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('config.no_cities')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Districts List */}
        <Card>
          <CardHeader className="text-start">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold uppercase">
                  {selectedCity
                    ? `${t('config.districts_of')} ${isRTL && selectedCity.name_ar ? selectedCity.name_ar : selectedCity.name}`
                    : t('config.districts')}
                </CardTitle>
                <CardDescription>{t('config.districts_desc')}</CardDescription>
              </div>
              {selectedCityId && (
                <Button size="sm" onClick={() => openDistrictDialog()} className="gap-1">
                  <Plus className="h-4 w-4" />
                  {t('config.add_district')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedCityId ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('config.select_city')}</p>
            ) : cityDistricts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('config.no_districts')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">{t('config.district_name')}</TableHead>
                    <TableHead className="text-start">{t('config.district_name_ar')}</TableHead>
                    <TableHead className="text-start">{t('config.code')}</TableHead>
                    <TableHead className="text-end">{t('config.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cityDistricts.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-start">{d.name}</TableCell>
                      <TableCell className="text-start">{d.name_ar || '-'}</TableCell>
                      <TableCell className="text-start font-mono text-xs">{d.code}</TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDistrictDialog(d)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget({ type: 'district', id: d.id, name: d.name })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* City Dialog */}
      <Dialog open={cityDialog.open} onOpenChange={(o) => !o && setCityDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{cityDialog.editing ? t('config.edit_city') : t('config.add_city')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('config.code')}</Label>
              <Input value={cityForm.code} onChange={e => setCityForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. cairo" className="mt-1" />
            </div>
            <div>
              <Label>{t('config.city_name_en')}</Label>
              <Input value={cityForm.name} onChange={e => setCityForm(p => ({ ...p, name: e.target.value }))} placeholder="Cairo" className="mt-1" />
            </div>
            <div>
              <Label>{t('config.city_name_ar')}</Label>
              <Input value={cityForm.name_ar} onChange={e => setCityForm(p => ({ ...p, name_ar: e.target.value }))} placeholder="القاهرة" className="mt-1" dir="rtl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCityDialog({ open: false })}>{t('config.cancel')}</Button>
            <Button onClick={saveCityForm} disabled={!cityForm.code || !cityForm.name}>{t('config.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* District Dialog */}
      <Dialog open={districtDialog.open} onOpenChange={(o) => !o && setDistrictDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{districtDialog.editing ? t('config.edit_district') : t('config.add_district')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('config.code')}</Label>
              <Input value={districtForm.code} onChange={e => setDistrictForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. cairo-maadi" className="mt-1" />
            </div>
            <div>
              <Label>{t('config.district_name')}</Label>
              <Input value={districtForm.name} onChange={e => setDistrictForm(p => ({ ...p, name: e.target.value }))} placeholder="Maadi" className="mt-1" />
            </div>
            <div>
              <Label>{t('config.district_name_ar')}</Label>
              <Input value={districtForm.name_ar} onChange={e => setDistrictForm(p => ({ ...p, name_ar: e.target.value }))} placeholder="المعادي" className="mt-1" dir="rtl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDistrictDialog({ open: false })}>{t('config.cancel')}</Button>
            <Button onClick={saveDistrictForm} disabled={!districtForm.code || !districtForm.name}>{t('config.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('config.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('config.delete_confirm_desc', { name: deleteTarget?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('config.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('config.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
