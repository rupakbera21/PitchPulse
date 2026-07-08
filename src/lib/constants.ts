/**
 * Global constants for the Smart Stadium Platform.
 * Centralizes magic numbers, color thresholds, and API configurations.
 */

export const OCCUPANCY_THRESHOLDS = {
  HIGH: 85,
  MEDIUM: 60,
};

export const REFRESH_INTERVALS = {
  CROWD_DATA: 3000,
  MATCH_DATA: 5000,
};

export const COLORS = {
  RED: 'rgba(239, 68, 68, {opacity})',
  AMBER: 'rgba(234, 179, 8, {opacity})',
  GREEN: 'rgba(0, 210, 106, {opacity})',
  GREY: 'rgba(80, 80, 80, 0.6)',
  BORDER_GREY: 'rgba(120, 120, 120, 1)',
  BORDER_WHITE: 'rgba(255, 255, 255, 1)'
};

export const ZONES = {
  PITCH: 'pitch',
  STAND: 'stand',
  GATE: 'gate',
};
