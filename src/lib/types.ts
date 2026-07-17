// Shared Type Definitions for the Smart Stadium Platform

export interface MatchData {
  tournament?: string;
  results?: Record<string, unknown>[];
  live_schedule?: MatchScheduleItem[];
  lastUpdated?: string;
}

export interface MatchScheduleItem {
  match_id: string;
  date: string;
  time: string;
  isoDate: string;
  stadium: string;
  home: string;
  away: string;
  score: string;
  status: string;
  type: string;
  kickoff_local?: string;
  venue?: string;
  stage?: string;
  home_score?: number;
  away_score?: number;
  [key: string]: unknown;
}

export interface CrowdState {
  total_fans: number;
  busiest_gate: string;
  match_status: string;
  zones: CrowdZone[];
  [key: string]: unknown;
}

export interface CrowdZone {
  id: string;
  name: string;
  type: string;
  status: string;
  occupancy_pct: number;
  capacity?: number;
  is_closed?: boolean;
  wait_time_min?: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  [key: string]: unknown;
}
