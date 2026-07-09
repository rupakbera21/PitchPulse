"use client";

import { useMatch } from '@/contexts/MatchContext';

export function MatchSwitcher() {
  const { match, setMatch, matches } = useMatch();

  return (
    <select 
      value={match.id}
      onChange={(e) => setMatch(e.target.value)}
      className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm font-bold uppercase tracking-widest hover:border-primary transition-colors cursor-pointer outline-none"
    >
      {matches.map(m => (
        <option key={m.id} value={m.id} className="bg-background text-foreground">
          {m.home.code} vs {m.away.code}
        </option>
      ))}
    </select>
  );
}
