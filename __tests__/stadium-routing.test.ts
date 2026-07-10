/**
 * Unit tests for stadium-routing utilities
 */

import { isStandClosed, getZoneColor, getBorderColor, getBorderRadius } from '../src/lib/stadium-routing';

const mockCrowdData = {
  zones: [
    { id: 'gate_n', type: 'gate', is_closed: false },
    { id: 'gate_s', type: 'gate', is_closed: true },
    { id: 'lower_n', type: 'stand', is_closed: false },
    { id: 'lower_s', type: 'stand', is_closed: false },
  ]
};

describe('isStandClosed', () => {
  it('returns false for a stand whose gate is open', () => {
    expect(isStandClosed('lower_n', mockCrowdData)).toBe(false);
  });

  it('returns true for a stand whose gate is closed', () => {
    expect(isStandClosed('lower_s', mockCrowdData)).toBe(true);
  });

  it('returns false when crowdData is null', () => {
    expect(isStandClosed('lower_n', null)).toBe(false);
  });

  it('returns true if zone itself is_closed', () => {
    const data = { zones: [{ id: 'upper_n', type: 'stand', is_closed: true }] };
    expect(isStandClosed('upper_n', data)).toBe(true);
  });
});

describe('getZoneColor', () => {
  it('returns grey for a closed zone', () => {
    expect(getZoneColor('low', 50, true)).toMatch(/rgba\(80, 80, 80/);
  });

  it('returns red for status red', () => {
    expect(getZoneColor('red', 90)).toMatch(/rgba\(239, 68, 68/);
  });

  it('returns amber for status amber', () => {
    expect(getZoneColor('amber', 75)).toMatch(/rgba\(234, 179, 8/);
  });

  it('returns green for status low', () => {
    expect(getZoneColor('low', 40)).toMatch(/rgba\(0, 210, 106/);
  });
});

describe('getBorderColor', () => {
  it('returns white when zone is target-hovered', () => {
    expect(getBorderColor('low', false, true)).toBe('rgba(255, 255, 255, 1)');
  });

  it('returns grey for closed zone', () => {
    expect(getBorderColor('low', true)).toBe('rgba(120, 120, 120, 1)');
  });
});

describe('getBorderRadius', () => {
  it('returns north radius for _n zones', () => {
    expect(getBorderRadius({ id: 'lower_n', type: 'stand' })).toBe('40% 40% 10% 10%');
  });

  it('returns south radius for _s zones', () => {
    expect(getBorderRadius({ id: 'upper_s', type: 'stand' })).toBe('10% 10% 40% 40%');
  });

  it('returns default radius for other zones', () => {
    expect(getBorderRadius({ id: 'pitch', type: 'pitch' })).toBe('20px');
  });
});
