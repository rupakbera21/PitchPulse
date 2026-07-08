"use client";

import { useMemo } from 'react';
import NextImage from 'next/image';
import { BarChart3 } from 'lucide-react';

interface Fixture {
  match_id?: string;
  home: string;
  away: string;
  score?: string;
  status: string;
  type?: string;
  isoDate?: string;
  kickoff_local?: string;
  time?: string;
  date?: string;
}

interface TournamentBracketProps {
  fixtures: Fixture[];
  trophyImage: React.ReactNode;
}

const getCountryCode = (name: string) => {
  if (!name || name === 'TBD') return null;
  const map: Record<string, string> = {
    'Argentina': 'ar', 'Brazil': 'br', 'France': 'fr', 'Germany': 'de',
    'Spain': 'es', 'Portugal': 'pt', 'England': 'gb-eng', 'Netherlands': 'nl',
    'United States': 'us', 'Mexico': 'mx', 'Canada': 'ca', 'Uruguay': 'uy',
    'Colombia': 'co', 'Morocco': 'ma', 'Senegal': 'sn', 'Japan': 'jp',
    'South Korea': 'kr', 'Australia': 'au', 'Ecuador': 'ec', 'Switzerland': 'ch',
    'Croatia': 'hr', 'Belgium': 'be', 'Sweden': 'se', 'Italy': 'it', 'Nigeria': 'ng',
    'Norway': 'no', 'Denmark': 'dk', 'Poland': 'pl', 'Wales': 'gb-wls', 'Scotland': 'gb-sct',
    'Serbia': 'rs', 'Chile': 'cl', 'Peru': 'pe', 'Iran': 'ir', 'Saudi Arabia': 'sa',
    'Qatar': 'qa', 'Ghana': 'gh', 'Cameroon': 'cm', 'Tunisia': 'tn', 'Costa Rica': 'cr',
    'Egypt': 'eg', 'Algeria': 'dz', 'Mali': 'ml', 'Ivory Coast': 'ci', 'Turkey': 'tr',
    'Ukraine': 'ua', 'Austria': 'at', 'Hungary': 'hu', 'Czech Republic': 'cz'
  };
  return map[name] || null;
};

const getTeamColor = (name: string) => {
  if (!name || name === 'TBD') return '#888888';
  const colors: Record<string, string> = {
    'France': '#0055A4', 'Morocco': '#c1272d', 'Spain': '#AA151B', 'Belgium': '#E30613',
    'Norway': '#BA0C2F', 'England': '#cf081f', 'Argentina': '#75AADB', 'Switzerland': '#FF0000',
    'Mexico': '#006847', 'United States': '#002868', 'Portugal': '#046A38', 'Brazil': '#FFDF00',
    'Germany': '#FFCE00', 'Netherlands': '#F36C21', 'Uruguay': '#87CEEB', 'Colombia': '#FCD116',
    'Senegal': '#00853F', 'Japan': '#000555', 'South Korea': '#C60C30', 'Australia': '#FFCD00',
    'Croatia': '#FF0000', 'Italy': '#0064AA', 'Egypt': '#CE1126', 'Canada': '#FF0000'
  };
  return colors[name] || '#ffffff';
};

const formatLocalTime = (isoString?: string, fallbackTime?: string) => {
  if (!isoString) return fallbackTime;
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return fallbackTime;
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function TournamentBracket({ fixtures, trophyImage }: TournamentBracketProps) {
  const knockoutMatches = useMemo(() => {
    const qf = fixtures.filter((f) => f.type?.toLowerCase() === 'qf');
    const matches = qf.length >= 4 ? qf.slice(0, 4) : (fixtures.length >= 4 ? fixtures.slice(-4) : fixtures);
    
    const unique = [];
    const seen = new Set();
    for (const m of matches) {
      const key = m.match_id || `${m.home}-${m.away}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(m);
      }
    }
    while (unique.length < 4) {
      unique.push({ home: 'TBD', away: 'TBD', score: '0-0', status: 'scheduled' });
    }
    return unique.slice(0, 4);
  }, [fixtures]);

  return (
    <div className="mt-24 w-full bg-gradient-to-b from-secondary/60 to-background/80 backdrop-blur-xl border border-primary/20 p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-16 text-primary justify-center">
        <BarChart3 size={32} />
        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white">Quarter-Finals</h3>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradientMove {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .premium-text-gradient {
          background-size: 200% auto !important;
          animation: gradientMove 4s linear infinite !important;
        }
      `}} />
      
      <div className="relative flex flex-col lg:flex-row justify-center items-center lg:items-stretch min-h-[500px] gap-8 lg:gap-0">
        {/* Left Bracket */}
        <div className="flex flex-col justify-around w-full lg:flex-1 relative z-10 gap-16 py-8">
          {knockoutMatches.slice(0, 2).map((fixture, idx) => (
            <div key={idx} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 shadow-xl relative z-20 backdrop-blur-md hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  {getCountryCode(fixture.home) && <NextImage src={`https://flagcdn.com/w40/${getCountryCode(fixture.home)}.png`} width={28} height={20} alt={`${fixture.home} flag`} className="rounded-sm shadow-sm" unoptimized />}
                  <span 
                    className="font-black uppercase tracking-wider bg-clip-text text-transparent drop-shadow-md premium-text-gradient"
                    style={{ backgroundImage: `linear-gradient(to right, ${getTeamColor(fixture.home)} 0%, ${getTeamColor(fixture.home)} 35%, #ffffff 50%, ${getTeamColor(fixture.home)} 65%, ${getTeamColor(fixture.home)} 100%)` }}
                  >
                    {fixture.home}
                  </span>
                </div>
                <span className="font-black text-2xl text-primary">{fixture.score?.split('-')[0] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {getCountryCode(fixture.away) && <NextImage src={`https://flagcdn.com/w40/${getCountryCode(fixture.away)}.png`} width={28} height={20} alt={`${fixture.away} flag`} className="rounded-sm shadow-sm" unoptimized />}
                  <span 
                    className="font-black uppercase tracking-wider bg-clip-text text-transparent drop-shadow-md premium-text-gradient"
                    style={{ backgroundImage: `linear-gradient(to right, ${getTeamColor(fixture.away)} 0%, ${getTeamColor(fixture.away)} 35%, #ffffff 50%, ${getTeamColor(fixture.away)} 65%, ${getTeamColor(fixture.away)} 100%)` }}
                  >
                    {fixture.away}
                  </span>
                </div>
                <span className="font-black text-2xl text-primary">{fixture.score?.split('-')[1] || 0}</span>
              </div>
              <div className="mt-4 text-center">
                <span className={`text-xs uppercase tracking-widest font-bold ${fixture.status === 'live' ? 'text-danger animate-pulse' : 'text-foreground/50'}`}>
                  {fixture.status} • {formatLocalTime(fixture.isoDate, fixture.kickoff_local || fixture.time || fixture.date)}
                </span>
              </div>
            </div>
          ))}
          {/* Connecting Border for Left (Hidden on Mobile) */}
          <div className="hidden lg:block absolute top-[20%] bottom-[20%] right-[-40px] w-10 border-r-[3px] border-y-[3px] border-white/20 rounded-r-2xl pointer-events-none" />
          <div className="hidden lg:block absolute top-1/2 right-[-80px] w-10 h-0 border-t-[3px] border-white/20 pointer-events-none" />
        </div>

        {/* Center Trophy */}
        <div className="w-full lg:w-[400px] shrink-0 h-[400px] lg:h-auto flex items-center justify-center relative z-20 order-first lg:order-none">
          {trophyImage}
        </div>

        {/* Right Bracket */}
        <div className="flex flex-col justify-around w-full lg:flex-1 relative z-10 gap-16 py-8">
          {knockoutMatches.slice(2, 4).map((fixture, idx) => (
            <div key={idx} className="bg-gradient-to-bl from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 shadow-xl relative z-20 backdrop-blur-md hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                <span className="font-black text-2xl text-primary">{fixture.score?.split('-')[0] || 0}</span>
                <div className="flex items-center gap-3">
                  <span 
                    className="font-black uppercase tracking-wider bg-clip-text text-transparent drop-shadow-md premium-text-gradient"
                    style={{ backgroundImage: `linear-gradient(to left, ${getTeamColor(fixture.home)} 0%, ${getTeamColor(fixture.home)} 35%, #ffffff 50%, ${getTeamColor(fixture.home)} 65%, ${getTeamColor(fixture.home)} 100%)` }}
                  >
                    {fixture.home}
                  </span>
                  {getCountryCode(fixture.home) && <NextImage src={`https://flagcdn.com/w40/${getCountryCode(fixture.home)}.png`} width={28} height={20} alt={`${fixture.home} flag`} className="rounded-sm shadow-sm" unoptimized />}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black text-2xl text-primary">{fixture.score?.split('-')[1] || 0}</span>
                <div className="flex items-center gap-3">
                  <span 
                    className="font-black uppercase tracking-wider bg-clip-text text-transparent drop-shadow-md premium-text-gradient"
                    style={{ backgroundImage: `linear-gradient(to left, ${getTeamColor(fixture.away)} 0%, ${getTeamColor(fixture.away)} 35%, #ffffff 50%, ${getTeamColor(fixture.away)} 65%, ${getTeamColor(fixture.away)} 100%)` }}
                  >
                    {fixture.away}
                  </span>
                  {getCountryCode(fixture.away) && <NextImage src={`https://flagcdn.com/w40/${getCountryCode(fixture.away)}.png`} width={28} height={20} alt={`${fixture.away} flag`} className="rounded-sm shadow-sm" unoptimized />}
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className={`text-xs uppercase tracking-widest font-bold ${fixture.status === 'live' ? 'text-danger animate-pulse' : 'text-foreground/50'}`}>
                  {fixture.status} • {formatLocalTime(fixture.isoDate, fixture.kickoff_local || fixture.time || fixture.date)}
                </span>
              </div>
            </div>
          ))}
          {/* Connecting Border for Right (Hidden on Mobile) */}
          <div className="hidden lg:block absolute top-[20%] bottom-[20%] left-[-40px] w-10 border-l-[3px] border-y-[3px] border-white/20 rounded-l-2xl pointer-events-none" />
          <div className="hidden lg:block absolute top-1/2 left-[-80px] w-10 h-0 border-t-[3px] border-white/20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
