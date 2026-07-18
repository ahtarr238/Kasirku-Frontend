import { NextRequest, NextResponse } from 'next/server';

// Route yang butuh login
const PROTECTED_ROUTES = ['/', '/import'];
// Route yang hanya untuk guest (sudah login → redirect ke dashboard)
const GUEST_ROUTES = ['/login', '/register'];

export function proxy(req: NextRequest) {
  const token = req.cookies.get('kasirku_token')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  const isGuest = GUEST_ROUTES.some((p) => pathname === p);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (isGuest && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
