import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/control-room') {
    const authCookie = request.cookies.get('control_room_session');
    if (!authCookie) {
      return NextResponse.redirect(new URL('/control-room/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/control-room',
};
