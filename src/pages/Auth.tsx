import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/shadoo-logo.png';
import { generateDemoCredentials } from '@/lib/auth/demoAccount';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const from = (location.state as { from?: string })?.from || '/missions';
        navigate(from, { replace: true });
      }
    };
    checkAuth();
  }, [navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });

      const from = (location.state as { from?: string })?.from || '/missions';
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Login failed',
        description: err.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailRedirectTo = `${window.location.origin}/missions`;
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
          },
          emailRedirectTo,
        },
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: 'Account created!',
          description: 'You are now signed in.',
        });

        const from = (location.state as { from?: string })?.from || '/missions';
        navigate(from, { replace: true });
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account before logging in.',
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Signup failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDemoAccount = async () => {
    setIsLoading(true);
    try {
      const creds = generateDemoCredentials();
      const emailRedirectTo = `${window.location.origin}/missions`;

      const { data, error } = await supabase.auth.signUp({
        email: creds.email,
        password: creds.password,
        options: {
          data: { full_name: creds.fullName },
          emailRedirectTo,
        },
      });

      if (error) throw error;

      // If email-confirm is enabled, session may be null. Try logging in directly.
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: creds.email,
          password: creds.password,
        });
        if (signInError) throw signInError;
      }

      // Best-effort clipboard copy
      try {
        await navigator.clipboard?.writeText(`Email: ${creds.email}\nPassword: ${creds.password}`);
      } catch {
        // ignore clipboard failures
      }

      toast({
        title: 'Demo account ready',
        description: `Email: ${creds.email} | Password: ${creds.password} (copied)`,
      });

      navigate('/missions', { replace: true });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Could not create demo account',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="Shadoo" className="h-12 w-auto" />
        </div>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black uppercase tracking-tight">
              Welcome to Shadoo
            </CardTitle>
            <CardDescription>
              Sign in to manage your mystery shopping missions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@company.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'LOGIN'
                    )}
                  </Button>
                </form>

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleCreateDemoAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating demo account...
                      </>
                    ) : (
                      'CREATE DEMO ACCOUNT'
                    )}
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Creates a disposable account and signs you in automatically.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@company.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'CREATE ACCOUNT'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
