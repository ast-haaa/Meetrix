import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionUserCookie = request.cookies.get('session_user')?.value;

  const protectedRoutes = [
    '/dashboard',
    '/meetings',
    '/decisions',
    '/action-items',
    '/accountability',
    '/admin',
    '/settings',
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 1. Unauthenticated visitors redirected to home landing page
  if (isProtectedRoute && !sessionUserCookie) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role-based Admin Route Gate: ONLY users with role === 'admin' allowed on /admin routes
  if (pathname.startsWith('/admin') && sessionUserCookie) {
    try {
      const user = JSON.parse(sessionUserCookie);
      const isAuthorizedAdmin = user.role?.toLowerCase() === 'admin';
      if (!isAuthorizedAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/meetings/:path*',
    '/decisions/:path*',
    '/action-items/:path*',
    '/accountability/:path*',
    '/admin/:path*',
    '/settings/:path*',
  ],
};
