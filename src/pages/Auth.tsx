import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDirectionalIcons } from '@/i18n/utils';
import logo from '@/assets/shadoo-logo.png';
import { generateDemoCredentials } from '@/lib/auth/demoAccount';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation('common');
  const { ArrowStart } = useDirectionalIcons();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const from = (location.state as { from?: string })?.from || '/dashboard';
        navigate(from, { replace: true });
      }
    };
    checkAuth();
  }, [navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      toast({ title: t('welcome_back'), description: t('login_success') });
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: t('login_failed'), description: err.message || t('login_failed_desc'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const emailRedirectTo = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail, password: signupPassword,
        options: { data: { full_name: signupName }, emailRedirectTo },
      });
      if (error) throw error;
      if (data.session) {
        toast({ title: t('account_created'), description: t('account_created_session') });
        const from = (location.state as { from?: string })?.from || '/dashboard';
        navigate(from, { replace: true });
      } else {
        toast({ title: t('account_created'), description: t('account_created_verify') });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: t('signup_failed'), description: err.message || t('signup_failed_desc'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDemoAccount = async () => {
    setIsLoading(true);
    try {
      const creds = generateDemoCredentials();
      const emailRedirectTo = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email: creds.email, password: creds.password,
        options: { data: { full_name: creds.fullName }, emailRedirectTo },
      });
      if (error) throw error;
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: creds.email, password: creds.password });
        if (signInError) throw signInError;
      }
      try { await navigator.clipboard?.writeText(`Email: ${creds.email}\nPassword: ${creds.password}`); } catch {}
      toast({ title: t('demo_ready'), description: `Email: ${creds.email} | Password: ${creds.password} (copied)` });
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: t('demo_failed'), description: err.message || t('signup_failed_desc'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" className="gap-2" onClick={() => navigate('/')}>
            <ArrowStart className="h-4 w-4" />
            {tc('back')}
          </Button>
          <img src={logo} alt="Shadoo" className="h-8" />
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-primary/10 text-primary">
                <Building2 className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl font-bold uppercase tracking-tight">{t('client_portal')}</CardTitle>
              <CardDescription>{t('sign_in_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t('login')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('signup')}</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <form onSubmit={handleLogin} className="space-y-4 text-start">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('email')}</Label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="login-email" type="email" placeholder={t('email_placeholder')} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="ps-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('password')}</Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder={t('password_placeholder')} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="ps-10 pe-10" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-3 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="me-2 h-4 w-4 animate-spin" />{t('logging_in')}</> : t('login_button')}
                    </Button>
                  </form>
                  <div className="mt-4">
                    <Button type="button" variant="secondary" className="w-full" onClick={handleCreateDemoAccount} disabled={isLoading}>
                      {isLoading ? <><Loader2 className="me-2 h-4 w-4 animate-spin" />{t('creating_demo')}</> : t('create_demo')}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground text-start">{t('demo_desc')}</p>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <form onSubmit={handleSignup} className="space-y-4 text-start">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t('full_name')}</Label>
                      <div className="relative">
                        <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="signup-name" type="text" placeholder={t('full_name_placeholder')} value={signupName} onChange={(e) => setSignupName(e.target.value)} className="ps-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('email')}</Label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="signup-email" type="email" placeholder={t('email_placeholder')} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="ps-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('password')}</Label>
                      <div className="relative">
                        <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder={t('password_placeholder')} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="ps-10 pe-10" minLength={6} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-3 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('password_min')}</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="me-2 h-4 w-4 animate-spin" />{t('creating_account')}</> : t('create_account')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground">{tc('by_continuing_agree')}</p>
        </div>
      </main>
    </div>
  );
}
