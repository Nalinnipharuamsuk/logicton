import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Secure Admin Routes (Priority Check)
  // Check if it's an admin route (excluding login)
  if (pathname.includes('/admin/dashboard')) {
    const token = await getToken({ req: request });

    if (!token) {
      // Redirect to login if not authenticated
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
  }

  // 2. Run Internationalization Middleware
  // First run the internationalization middleware
  const intlResponse = intlMiddleware(request);

  // If intl middleware modified the response, return it
  if (intlResponse) {
    return intlResponse;
  }

  return intlResponse;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(th|en)/:path*', '/admin/:path*', '/login'],
};
