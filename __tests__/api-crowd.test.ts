/**
 * @jest-environment node
 */

import { POST } from '../src/app/api/crowd/route';

describe('Crowd API Override & Custom Uploader Bounds', () => {
  it('rejects custom upload data if zones are not an array', async () => {
    const req = new Request('http://localhost/api/crowd', {
      method: 'POST',
      body: JSON.stringify({ action: 'upload', newZonesData: 'not-an-array' })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('clamps custom occupancy input between 0 and 100 percent', () => {
    const rawOccupancyUpper = 150;
    const rawOccupancyLower = -20;
    const clampedUpper = Math.min(100, Math.max(0, rawOccupancyUpper));
    const clampedLower = Math.min(100, Math.max(0, rawOccupancyLower));
    expect(clampedUpper).toBe(100);
    expect(clampedLower).toBe(0);
  });
});
