/**
 * Unit tests for crowd simulation logic
 */

import { simulateCrowdUpdate, initialCrowdState } from '@/services/crowdSim';

describe('simulateCrowdUpdate', () => {
  it('returns an object with zones array', () => {
    const result = simulateCrowdUpdate({ ...initialCrowdState });
    expect(Array.isArray(result.zones)).toBe(true);
  });

  it('keeps zone count the same', () => {
    const initial = { ...initialCrowdState };
    const result = simulateCrowdUpdate(initial);
    expect(result.zones.length).toBe(initial.zones.length);
  });

  it('keeps pitch zone occupancy at 0', () => {
    const result = simulateCrowdUpdate({ ...initialCrowdState });
    const pitch = result.zones.find((z) => z.type === 'pitch');
    expect(pitch?.occupancy_pct).toBe(0);
  });

  it('clamps occupancy between 0 and 100', () => {
    for (let i = 0; i < 20; i++) {
      const result = simulateCrowdUpdate({ ...initialCrowdState });
      result.zones.forEach((z) => {
        expect(z.occupancy_pct).toBeGreaterThanOrEqual(0);
        expect(z.occupancy_pct).toBeLessThanOrEqual(100);
      });
    }
  });

  it('drains total_fans when match is over', () => {
    const overState = { ...initialCrowdState, match_status: 'over' };
    const result = simulateCrowdUpdate(overState);
    expect(result.total_fans).toBeLessThanOrEqual(overState.total_fans);
  });
});
