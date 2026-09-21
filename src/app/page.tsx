import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DEFAULT_LANG, type Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const headerList = await headers();
  const acceptLanguage = headerList.get('accept-language') ?? '';
  const isEn =
    acceptLanguage.toLowerCase().includes('en') &&
    (!acceptLanguage.toLowerCase().includes('es') ||
      acceptLanguage.toLowerCase().indexOf('en') < acceptLanguage.toLowerCase().indexOf('es'));
  const targetLang: Lang = isEn ? 'en' : DEFAULT_LANG;

  redirect(`/${targetLang}`);
}
