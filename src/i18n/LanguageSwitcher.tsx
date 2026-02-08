import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from './LanguageProvider';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

export function LanguageSwitcher({ variant = 'full', className }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLanguage}
        className={cn('shrink-0', className)}
        title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
      >
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  if (variant === 'text') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className={cn('text-xs font-bold uppercase tracking-wide', className)}
      >
        {language === 'en' ? 'عربي' : 'EN'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={cn('gap-2 text-xs font-semibold', className)}
    >
      <Globe className="h-4 w-4" />
      {language === 'en' ? 'عربي' : 'English'}
    </Button>
  );
}
