import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/shadoo-logo.png';

// Fixed demo admin credentials
const DEMO_ADMIN_EMAIL = 'admin@demo.shadoo.app';
const DEMO_ADMIN_PASSWORD = 'Demo@Admin123!';

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if already logged in as admin
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has admin role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .in('role', ['super_admin', 'admin', 'support', 'finance', 'operations']);

        if (roles && roles.length > 0) {
          navigate('/admin');
        }
      }
      setCheckingAuth(false);
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .in('role', ['super_admin', 'admin', 'support', 'finance', 'operations']);

        if (rolesError) {
          setError('Failed to verify admin privileges');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (!roles || roles.length === 0) {
          setError('Access denied. You do not have administrator privileges.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        toast.success('Welcome back, Admin!');
        navigate('/admin');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setCreatingDemo(true);

    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD,
      });

      if (signInError) {
        // If user doesn't exist, create the account
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: DEMO_ADMIN_EMAIL,
            password: DEMO_ADMIN_PASSWORD,
            options: {
              data: { full_name: 'Demo Admin' },
            },
          });

          if (signUpError) {
            setError(signUpError.message);
            setCreatingDemo(false);
            return;
          }

          if (!signUpData.user) {
            setError('Failed to create demo account');
            setCreatingDemo(false);
            return;
          }

          // Wait for profile trigger
          await new Promise(resolve => setTimeout(resolve, 500));

          // Assign super_admin role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: signUpData.user.id, role: 'super_admin' });

          if (roleError) {
            console.error('Role assignment error:', roleError);
          }

          toast.success('Demo admin account created and logged in!');
          navigate('/admin');
          return;
        }
        
        setError(signInError.message);
        setCreatingDemo(false);
        return;
      }

      // Sign in successful, verify admin role
      if (signInData.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', signInData.user.id)
          .in('role', ['super_admin', 'admin', 'support', 'finance', 'operations']);

        if (!roles || roles.length === 0) {
          // Add super_admin role if missing
          await supabase
            .from('user_roles')
            .insert({ user_id: signInData.user.id, role: 'super_admin' });
        }

        toast.success('Welcome back, Demo Admin!');
        navigate('/admin');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setCreatingDemo(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <img src={logo} alt="Shadoo" className="h-8" />
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-warning/10 text-warning">
              <Shield className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-bold uppercase">Admin Portal</CardTitle>
            <CardDescription>
              Sign in with your administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
                disabled={loading || creatingDemo}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Demo credentials box */}
              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Demo Admin Credentials
                </p>
                <div className="space-y-1 font-mono text-sm">
                  <p><span className="text-muted-foreground">Email:</span> {DEMO_ADMIN_EMAIL}</p>
                  <p><span className="text-muted-foreground">Password:</span> {DEMO_ADMIN_PASSWORD}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleDemoLogin}
                  disabled={loading || creatingDemo}
                >
                  {creatingDemo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Use Demo Account'
                  )}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Admin accounts are created by super administrators.
              <br />
              Contact your system admin if you need access.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
