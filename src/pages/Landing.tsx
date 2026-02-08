import { useNavigate } from 'react-router-dom';
import { Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logo from '@/assets/shadoo-logo.png';
import { useTranslation } from 'react-i18next';
import { useDirectionalIcons } from '@/i18n/utils';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('landing');
  const { t: tc } = useTranslation('common');
  const { ArrowEnd } = useDirectionalIcons();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-20" />
          <img src={logo} alt="Shadoo" className="h-10" />
          <div className="w-20 flex justify-end">
            <LanguageSwitcher variant="text" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
              {t('welcome')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
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
                <CardTitle className="text-xl font-bold uppercase">{t('client_portal')}</CardTitle>
                <CardDescription>{t('client_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {(t('client_features', { returnObjects: true }) as string[]).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ArrowEnd className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full gap-2 group-hover:bg-primary">
                  {t('enter_client')}
                  <ArrowEnd className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
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
                <CardTitle className="text-xl font-bold uppercase">{t('admin_portal')}</CardTitle>
                <CardDescription>{t('admin_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {(t('admin_features', { returnObjects: true }) as string[]).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ArrowEnd className="h-4 w-4 text-warning shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full gap-2 border-warning text-warning hover:bg-warning hover:text-warning-foreground">
                  {t('enter_admin')}
                  <ArrowEnd className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {t('agent_cta')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          {tc('copyright', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
}
