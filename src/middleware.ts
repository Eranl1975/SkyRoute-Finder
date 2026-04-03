/**
 * Next.js Middleware — Admin route protection.
 *
 * The /admin route is protected by a secret set as ADMIN_SECRET in Vercel
 * environment variables (server-side only — never NEXT_PUBLIC_).
 *
 * Access pattern:
 *   1. First visit: /admin?secret=YOUR_SECRET  → sets httpOnly cookie → redirects to /admin
 *   2. Subsequent visits: cookie is checked automatically
 *   3. No valid cookie/secret → redirected to /user with error param
 *
 * To set your secret in Vercel:
 *   Dashboard → Project → Settings → Environment Variables → ADMIN_SECRET
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'skyroute_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const adminSecret = process.env.ADMIN_SECRET;

  // If no ADMIN_SECRET is configured, admin is open (useful in development)
  if (!adminSecret) {
    return NextResponse.next();
  }

  // Check if ?secret= param is provided (first-time access)
  const secretParam = request.nextUrl.searchParams.get('secret');
  if (secretParam === adminSecret) {
    // Valid secret — set cookie and redirect cleanly (remove ?secret= from URL)
    const cleanUrl = new URL(request.nextUrl.pathname, request.url);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(COOKIE_NAME, adminSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return response;
  }

  // Check session cookie
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  if (sessionCookie === adminSecret) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to user page with info
  const redirectUrl = new URL('/user?admin_denied=1', request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
