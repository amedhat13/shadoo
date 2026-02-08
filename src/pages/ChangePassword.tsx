import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/shadoo-logo.png';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation('auth');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (newPassword.length < 8) newErrors.newPassword = t('change_password.password_min');
    if (newPassword !== confirmPassword) newErrors.confirmPassword = t('change_password.passwords_no_match');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      if (user) {
        const { error: profileError } = await supabase.from('profiles').update({ must_change_password: false }).eq('user_id', user.id);
        if (profileError) console.error('Error updating profile:', profileError);
      }
      toast({ title: t('change_password.success'), description: t('change_password.success_desc') });
      navigate('/missions', { replace: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: t('change_password.failed'), description: err.message || t('change_password.failed_desc'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <img src={logo} alt="Shadoo" className="h-12 w-auto" />
        </div>
        <Card className="border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <ShieldCheck className="h-6 w-6 text-warning" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight">{t('change_password.title')}</CardTitle>
            <CardDescription>{t('change_password.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t('change_password.new_password')}</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="new-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="ps-10 pe-10" minLength={8} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-3 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
                <p className="text-xs text-muted-foreground">{t('change_password.password_min')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('change_password.confirm_password')}</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="confirm-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="ps-10 pe-10" minLength={8} required />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="me-2 h-4 w-4 animate-spin" />{t('change_password.updating')}</> : t('change_password.set_password')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
