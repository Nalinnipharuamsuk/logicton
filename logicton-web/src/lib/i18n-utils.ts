import { Locale, LocalizedContent } from '@/types';

// Get localized content based on current locale
export function getLocalizedContent(content: LocalizedContent, locale: Locale): string {
  return content[locale] || content.en || content.th || '';
}

// Check if locale is valid
export function isValidLocale(locale: string): locale is Locale {
  return ['th', 'en'].includes(locale);
}

// Get default locale based on user preferences or location
export function getDefaultLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return 'en';

  // Check if Thai is preferred
  if (acceptLanguage.includes('th')) return 'th';

  // Default to English
  return 'en';
}

// Format date based on locale
export function formatDate(date: string | Date, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return dateObj.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', options);
}

// Get opposite locale
export function getOppositeLocale(locale: Locale): Locale {
  return locale === 'th' ? 'en' : 'th';
}

// Create localized URL
export function createLocalizedUrl(path: string, locale: Locale): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Return localized path
  return `/${locale}${cleanPath ? `/${cleanPath}` : ''}`;
}

// Extract locale from pathname
export function extractLocaleFromPathname(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return {
      locale: segments[0] as Locale,
      path: '/' + segments.slice(1).join('/'),
    };
  }
  
  return {
    locale: 'en', // default locale
    path: pathname,
  };
}