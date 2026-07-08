import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/control-room') {
    const authCookie = request.cookies.get('control_room_session');
    if (!authCookie) {
      const proto = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
      const redirectUrl = `${proto}://${host}/control-room/login`;
      return NextResponse.redirect(new URL(redirectUrl));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/control-room',
};
