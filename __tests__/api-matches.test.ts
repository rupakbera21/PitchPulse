/**
 * @jest-environment node
 */
import { GET } from '../src/app/api/matches/route';

describe('Match Data Service API', () => {
  it('returns valid JSON structure including live_schedule and results', async () => {
    const req = new Request('http://localhost/api/matches');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('tournament');
    expect(data).toHaveProperty('live_schedule');
    expect(data).toHaveProperty('results');
    
    // Fallback data or fetched data must have arrays
    expect(Array.isArray(data.live_schedule)).toBe(true);
    expect(Array.isArray(data.results)).toBe(true);
  });
});
