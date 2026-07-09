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

const FLAG_MAP: Record<string, string> = {
  "USA": "us", "United States": "us", "United States of America": "us", "Mexico": "mx", "Canada": "ca",
  "Argentina": "ar", "Brazil": "br", "England": "gb-eng", "France": "fr",
  "Germany": "de", "Spain": "es", "Portugal": "pt", "Netherlands": "nl",
  "Belgium": "be", "Croatia": "hr", "Morocco": "ma", "Switzerland": "ch",
  "Colombia": "co", "Egypt": "eg", "South Africa": "za", "Japan": "jp",
  "Paraguay": "py", "Senegal": "sn", "DR Congo": "cd", "Congo DR": "cd", "Sweden": "se",
  "Norway": "no", "Ivory Coast": "ci", "Côte d'Ivoire": "ci", "Ecuador": "ec", "Bosnia and Herzegovina": "ba",
  "Austria": "at", "Algeria": "dz", "Cape Verde": "cv", "Ghana": "gh", "Australia": "au",
  "Italy": "it", "Uruguay": "uy", "Denmark": "dk", "Serbia": "rs", "Poland": "pl",
  "South Korea": "kr", "Korea Republic": "kr", "Iran": "ir", "IR Iran": "ir",
  "Saudi Arabia": "sa", "Qatar": "qa", "Nigeria": "ng", "Cameroon": "cm",
  "Tunisia": "tn", "Mali": "ml", "New Zealand": "nz", "Costa Rica": "cr",
  "Panama": "pa", "Jamaica": "jm", "Honduras": "hn", "El Salvador": "sv",
  "Peru": "pe", "Chile": "cl", "Venezuela": "ve", "Bolivia": "bo", "Jordan": "jo",
  "Wales": "gb-wls", "Scotland": "gb-sct", "Republic of Ireland": "ie",
  "UAE": "ae", "United Arab Emirates": "ae", "Iraq": "iq", "Oman": "om",
  "Uzbekistan": "uz", "China": "cn", "China PR": "cn", "Vietnam": "vn",
  "Thailand": "th", "Indonesia": "id", "Guinea": "gn", "Burkina Faso": "bf",
  "Gabon": "ga", "Zambia": "zm"
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
  matches: Match[];
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matchList, setMatchList] = useState<Match[]>(MATCHES);
  const [match, setMatchState] = useState<Match>(MATCHES[0]);

  useEffect(() => {
    fetch('/api/matches')
      .then((res) => res.json())
      .then((data) => {
        const liveMatches = data.live_schedule || [];
        if (liveMatches.length > 0) {
          const mapped: Match[] = liveMatches.map((m: { match_id: string; home: string; away: string; stadium: string; type: string; date?: string; time?: string; isoDate?: string }, index: number) => {
            const homeCode = (m.home || '').slice(0, 3).toUpperCase();
            const awayCode = (m.away || '').slice(0, 3).toUpperCase();
            const homeFlag = FLAG_MAP[m.home] || 'un';
            const awayFlag = FLAG_MAP[m.away] || 'un';
            
            const stadiumParts = (m.stadium || '').split(',');
            const venue = stadiumParts[0] || 'Mercedes-Benz Stadium';
            const city = stadiumParts[1]?.trim() || 'Atlanta, GA';
            
            let stageKey: Match['stageKey'] = 'stage_group';
            if (m.type === 'qf') stageKey = 'stage_quarter_final';
            else if (m.type === 'sf') stageKey = 'stage_semi_final';
            else if (m.type === 'r32' || m.type === 'r16') stageKey = 'stage_round_of_16';

            return {
              id: m.match_id || `dynamic_${index}`,
              home: { name: m.home, code: homeCode, flag: homeFlag, color: '#75AADB' },
              away: { name: m.away, code: awayCode, flag: awayFlag, color: '#CE1126' },
              date: m.isoDate || `${m.date}T${m.time || '12:00'}:00-04:00`,
              venue,
              city,
              gate: String((index % 8) + 1),
              block: String(101 + index * 5),
              seat: `${String.fromCharCode(65 + (index % 10))}${index + 1}`,
              stageKey
            };
          });

          setMatchList(mapped);

          // Auto-select the next upcoming match dynamically
          const now = Date.now();
          const upcoming = mapped.filter((m) => new Date(m.date).getTime() > now);
          if (upcoming.length > 0) {
            const active = upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
            setMatchState(active);
          } else {
            setMatchState(mapped[mapped.length - 1]);
          }
        }
      })
      .catch((err) => console.error('Failed to load dynamic MatchProvider matches', err));
  }, []);

  const setMatch = (id: string) => {
    const newMatch = matchList.find(m => m.id === id);
    if (newMatch) setMatchState(newMatch);
  };

  return (
    <MatchContext.Provider value={{ match, setMatch, matches: matchList }}>
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
