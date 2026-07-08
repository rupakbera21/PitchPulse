"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Team = {
  name: string;
  code: string;
  flag: string; // ISO code for flag-icons
  color: string; // Hex color for CSS variables
};

export type Match = {
  id: string;
  home: Team;
  away: Team;
  date: string;
  venue: string;
  city: string;
  gate: string;
  block: string;
  seat: string;
  stageKey: 'stage_group' | 'stage_round_of_16' | 'stage_quarter_final' | 'stage_semi_final';
};

export const MATCHES: Match[] = [
  {
    id: 'm1',
    home: { name: 'Argentina', code: 'ARG', flag: 'ar', color: '#75AADB' },
    away: { name: 'Egypt', code: 'EGY', flag: 'eg', color: '#CE1126' },
    date: '2026-07-07T16:00:00Z',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta, GA',
    gate: '4',
    block: '112',
    seat: 'A4',
    stageKey: 'stage_group'
  },
  {
    id: 'm2',
    home: { name: 'France', code: 'FRA', flag: 'fr', color: '#002654' },
    away: { name: 'Morocco', code: 'MOR', flag: 'ma', color: '#c1272d' },
    date: '2026-07-09T15:00:00Z',
    venue: 'Gillette Stadium',
    city: 'Boston, MA',
    gate: '7',
    block: '215',
    seat: 'C12',
    stageKey: 'stage_quarter_final'
  },
  {
    id: 'm3',
    home: { name: 'USA', code: 'USA', flag: 'us', color: '#0A3161' },
    away: { name: 'Argentina', code: 'ARG', flag: 'ar', color: '#75AADB' },
    date: '2026-07-11T15:00:00Z',
    venue: 'Hard Rock Stadium',
    city: 'Miami, FL',
    gate: '1',
    block: 'VIP',
    seat: '1A',
    stageKey: 'stage_quarter_final'
  }
];

type MatchContextType = {
  match: Match;
  setMatch: (id: string) => void;
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

const getActiveMatch = (): Match => {
  if (typeof window === 'undefined') return MATCHES[0]; // SSR Fallback
  
  const now = new Date().getTime();
  const upcoming = MATCHES.filter(m => new Date(m.date).getTime() > now);
  
  if (upcoming.length > 0) {
    return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }
  return MATCHES[MATCHES.length - 1]; // Fallback to last match if all are past
};

export function MatchProvider({ children }: { children: ReactNode }) {
  const [match, setMatchState] = useState<Match>(MATCHES[0]);

  // Set active match on mount to avoid hydration mismatch
  useEffect(() => {
    const active = getActiveMatch();
    if (active.id !== match.id) {
      setMatchState(active);
    }
  }, [match.id]);

  const setMatch = (id: string) => {
    const newMatch = MATCHES.find(m => m.id === id);
    if (newMatch) setMatchState(newMatch);
  };

  return (
    <MatchContext.Provider value={{ match, setMatch }}>
      <div 
        style={{ 
          '--team-home': match.home.color, 
          '--team-away': match.away.color,
        } as React.CSSProperties}
        className="contents"
      >
        {children}
      </div>
    </MatchContext.Provider>
  );
}

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) throw new Error('useMatch must be used within MatchProvider');
  return context;
};
