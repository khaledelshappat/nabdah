import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ['/login'];
  if (publicRoutes.includes(pathname)) {
    // If already logged in, redirect to dashboard
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return res;
  }

  // Protected routes — redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
