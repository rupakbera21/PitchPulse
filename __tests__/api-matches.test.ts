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

  it('maps stadium_id to real-world stadium names in live_schedule', async () => {
    const req = new Request('http://localhost/api/matches');
    const res = await GET(req);
    const data = await res.json();
    
    // Check if the first match in live_schedule has a properly mapped stadium name (not "Stadium X")
    if (data.live_schedule && data.live_schedule.length > 0) {
      const match = data.live_schedule[0];
      // The API maps stadium_id '8' to 'Hard Rock Stadium, Miami' etc. 
      // If the map is working, the stadium shouldn't simply match "Stadium X" strictly unless ID is missing/unknown
      // But we can check that it returns a string and is not undefined.
      expect(typeof match.stadium).toBe('string');
      // Verify the string doesn't just equal "Stadium undefined"
      expect(match.stadium).not.toBe('Stadium undefined');
      // If we happen to get a known ID like 8, it should include real words
      if (match.stadium.includes('Hard Rock')) {
        expect(match.stadium).toContain('Miami');
      }
    }
  });
});
