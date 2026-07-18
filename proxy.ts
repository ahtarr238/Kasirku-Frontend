import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/'];
const GUEST_ONLY = ['/login', '/register'];

export default function middleware(req: NextRequest) {
  const token = req.cookies.get('kasirku_token')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  const isGuest = GUEST_ONLY.some((p) => pathname === p);

  // Belum login → ke halaman login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Sudah login → jangan masuk ke halaman login/register lagi
  if (isGuest && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Jangan intercept request ke _next (static), favicon, dan API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
