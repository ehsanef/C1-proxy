/**
 * Internationalization coordinator with genuine RTL detection.
 */

import { en, TranslationKey } from './en';
import { fa } from './fa';
import { parseCookies } from '../auth/session';

export type { TranslationKey };
export type Language = 'en' | 'fa';

export function getLanguage(request: Request): Language {
  const url = new URL(request.url);
  const queryLang = url.searchParams.get('lang')?.toLowerCase();
  if (queryLang === 'fa' || queryLang === 'en') {
    return queryLang;
  }

  const cookies = parseCookies(request.headers.get('Cookie'));
  if (cookies['c1_lang'] === 'fa' || cookies['c1_lang'] === 'en') {
    return cookies['c1_lang'] as Language;
  }

  const acceptLang = (request.headers.get('accept-language') || '').toLowerCase();
  if (acceptLang.includes('fa')) {
    return 'fa';
  }

  return 'en';
}

export function t(lang: Language, key: TranslationKey): string {
  if (lang === 'fa') {
    return fa[key] || en[key] || String(key);
  }
  return en[key] || String(key);
}

export function getDir(lang: Language): 'rtl' | 'ltr' {
  return lang === 'fa' ? 'rtl' : 'ltr';
}
