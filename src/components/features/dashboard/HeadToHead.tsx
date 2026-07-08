"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Match } from '@/contexts/MatchContext';

interface HeadToHeadProps {
  match: Match;
}

export function HeadToHead({ match }: HeadToHeadProps) {
  const powerStats = useMemo(() => {
    // Generate deterministic stats based on team names
    const getStat = (name: string, offset: number) => 65 + ((name.charCodeAt(0) + name.charCodeAt(name.length - 1) + offset) % 30);
    return [
      { label: 'Attack', home: getStat(match.home.name, 1), away: getStat(match.away.name, 2) },
      { label: 'Defense', home: getStat(match.home.name, 3), away: getStat(match.away.name, 4) },
      { label: 'Midfield', home: getStat(match.home.name, 5), away: getStat(match.away.name, 6) },
      { label: 'Stamina', home: getStat(match.home.name, 7), away: getStat(match.away.name, 8) },
    ];
  }, [match]);

  return (
    <div className="bg-secondary/40 backdrop-blur-xl border border-primary/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 mb-10 text-primary relative z-20">
        <Activity size={28} className="animate-pulse" />
        <h3 className="text-2xl font-black uppercase tracking-widest">Head-to-Head Power</h3>
      </div>
      
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-3">
          <span className={`fi fi-${match.home.flag} text-2xl rounded-sm overflow-hidden`}></span>
          <span className="font-black text-[var(--team-home)] uppercase tracking-wider">{match.home.name}</span>
        </div>
        <span className="text-foreground/40 font-black text-sm uppercase">VS</span>
        <div className="flex items-center gap-3">
          <span className="font-black text-[var(--team-away)] uppercase tracking-wider">{match.away.name}</span>
          <span className={`fi fi-${match.away.flag} text-2xl rounded-sm overflow-hidden`}></span>
        </div>
      </div>

      <div className="flex flex-col gap-6 relative z-20 flex-1 justify-center">
        {powerStats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-foreground/50 uppercase tracking-widest px-1">
              <span>{stat.home}</span>
              <span>{stat.label}</span>
              <span>{stat.away}</span>
            </div>
            <div className="flex h-3 w-full bg-background/50 rounded-full overflow-hidden">
              {/* Home Stat Bar */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stat.home / (stat.home + stat.away)) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 * i, type: "spring" }}
                className="h-full bg-[var(--team-home)] origin-left"
              />
              {/* Divider */}
              <div className="w-1 h-full bg-background z-10" />
              {/* Away Stat Bar */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stat.away / (stat.home + stat.away)) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 * i, type: "spring" }}
                className="h-full bg-[var(--team-away)] origin-right"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
