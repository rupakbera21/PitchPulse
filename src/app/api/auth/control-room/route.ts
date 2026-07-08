import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    
    // Fallback to 'admin2026' if env var is not set, just to ensure it doesn't break locally if not configured yet,
    // but the actual password will be set via environment variable.
    const expectedPassword = process.env.CONTROL_ROOM_PASSWORD || 'admin2026';
    
    if (password === expectedPassword) {
      const res = NextResponse.json({ success: true });
      res.cookies.set('control_room_session', 'authenticated', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        path: '/' 
      });
      return res;
    }
    
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
