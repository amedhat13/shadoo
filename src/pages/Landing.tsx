import { useNavigate } from 'react-router-dom';
import { Building2, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '@/assets/shadoo-logo.png';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
          <img src={logo} alt="Shadoo" className="h-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
              Welcome to Shadoo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Egypt's premier mystery shopping platform. Choose your portal to continue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Portal */}
            <Card 
              className="group cursor-pointer transition-all hover:border-primary hover:shadow-lg"
              onClick={() => navigate('/auth')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-primary/10 text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold uppercase">Client Portal</CardTitle>
                <CardDescription>
                  For businesses managing mystery shopping campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Create and manage missions
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Track visit reports and analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Manage branches and locations
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Fund wallet and control budgets
                  </li>
                </ul>
                <Button className="w-full gap-2 group-hover:bg-primary">
                  Enter Client Portal
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Admin Portal */}
            <Card 
              className="group cursor-pointer transition-all hover:border-warning hover:shadow-lg"
              onClick={() => navigate('/admin/auth')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-warning/10 text-warning">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold uppercase">Admin Portal</CardTitle>
                <CardDescription>
                  For platform administrators and operations team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-warning" />
                    Manage clients and subscriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-warning" />
                    Approve and manage agents
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-warning" />
                    Monitor platform operations
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-warning" />
                    Handle payouts and finance
                  </li>
                </ul>
                <Button variant="outline" className="w-full gap-2 border-warning text-warning hover:bg-warning hover:text-warning-foreground">
                  Enter Admin Portal
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Are you a mystery shopper? Download our mobile app to start earning.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Shadoo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
