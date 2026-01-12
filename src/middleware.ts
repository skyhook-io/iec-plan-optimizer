import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const locales = ['he', 'en'] as const;
export const defaultLocale = 'he';

export type Locale = (typeof locales)[number];

function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];

  if (locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // static files like .ico, .svg, etc.
  ) {
    return NextResponse.next();
  }

  const localeInPath = getLocaleFromPath(pathname);

  // If we're on /he/*, redirect to /* (Hebrew is the default, no prefix needed)
  if (localeInPath === 'he') {
    const newPathname = pathname.replace(/^\/he/, '') || '/';
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  // If we have /en/*, let it through (English uses /en prefix)
  if (localeInPath === 'en') {
    return NextResponse.next();
  }

  // No locale in path - this is the default (Hebrew), let it through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|images|.*\\..*).*)'],
};
