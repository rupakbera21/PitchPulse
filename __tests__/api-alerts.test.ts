/**
 * @jest-environment node
 */
import { POST } from '../src/app/api/alerts/route';
import { NextRequest } from 'next/server';

describe('Alerts Generation API', () => {
  it('returns valid alerts data structure even on AI generation error fallback', async () => {
    // We expect a 200 response with fallback data since we don't mock the AI client explicitly here
    // so it hits the rate limit fallback.
    const req = new NextRequest('http://localhost/api/alerts', {
      method: 'POST',
      body: JSON.stringify({
        crowdState: {
          busiest_gate: 'Gate 4'
        }
      })
    });
    
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    
    expect(Array.isArray(data.alerts)).toBe(true);
    
    // Check structure of first alert
    const firstAlert = data.alerts[0];
    expect(typeof firstAlert).toBe('string');
    expect(data).toHaveProperty('timestamp');
  });

  it('handles invalid requests gracefully', async () => {
    // Sending empty body
    const req = new NextRequest('http://localhost/api/alerts', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.alerts)).toBe(true);
  });
});
