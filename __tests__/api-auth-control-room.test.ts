/**
 * @jest-environment node
 */
import { POST } from '../src/app/api/auth/control-room/route';
import { NextRequest } from 'next/server';

describe('Control Room Authentication API', () => {
  it('rejects incorrect passwords', async () => {
    const req = new NextRequest('http://localhost/api/auth/control-room', {
      method: 'POST',
      body: JSON.stringify({ password: 'wrong-password' })
    });
    
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Incorrect password');
  });

  it('accepts correct password and sets a cookie', async () => {
    // According to the code, the correct password is 'pitchpulse2026'
    const req = new NextRequest('http://localhost/api/auth/control-room', {
      method: 'POST',
      body: JSON.stringify({ password: 'admin2026' })
    });
    
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Ensure the cookie is set correctly
    const cookies = res.headers.get('Set-Cookie');
    expect(cookies).toBeTruthy();
    expect(cookies).toContain('control_room_session=authenticated');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).not.toContain('Secure');
  });
});
