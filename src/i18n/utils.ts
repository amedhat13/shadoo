import { useLanguage } from './LanguageProvider';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

export type BilingualValue = { en: string; ar: string };

/**
 * Get the localized value from a bilingual field.
 * Handles both legacy string values and new { en, ar } objects.
 */
export function getLocalizedValue(
  value: string | BilingualValue | undefined | null,
  lang: string
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang as keyof BilingualValue] || value.en || '';
}

/**
 * Hook to get directional chevron icons based on current language direction.
 */
export function useDirectionalIcons() {
  const { isRTL } = useLanguage();

  return {
    ChevronStart: isRTL ? ChevronRight : ChevronLeft,
    ChevronEnd: isRTL ? ChevronLeft : ChevronRight,
    ArrowStart: isRTL ? ArrowRight : ArrowLeft,
    ArrowEnd: isRTL ? ArrowLeft : ArrowRight,
  };
}

/**
 * Hook to get the side for Sheet/Drawer based on direction.
 */
export function useDirectionalSide() {
  const { isRTL } = useLanguage();
  return {
    start: isRTL ? 'right' as const : 'left' as const,
    end: isRTL ? 'left' as const : 'right' as const,
  };
}

/**
 * Create a bilingual value object.
 */
export function createBilingualValue(en: string = '', ar: string = ''): BilingualValue {
  return { en, ar };
}

/**
 * Get the text content from a field that may be string or BilingualValue.
 * For validation purposes, checks if any language has content.
 */
export function getBilingualText(value: string | BilingualValue | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.ar || '';
}

/**
 * Ensure a value is a BilingualValue object (convert plain strings).
 */
export function ensureBilingual(value: string | BilingualValue | undefined): BilingualValue {
  if (!value) return { en: '', ar: '' };
  if (typeof value === 'string') return { en: value, ar: '' };
  return value;
}
