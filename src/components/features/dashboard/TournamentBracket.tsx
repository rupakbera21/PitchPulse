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
  const finalMatch = useMemo(() => {
    return fixtures.find((f) => f.type?.toLowerCase() === 'final') || { home: 'TBD', away: 'TBD', score: '0-0', status: 'scheduled' };
  }, [fixtures]);

  return (
    <div className="mt-24 w-full bg-gradient-to-b from-secondary/60 to-background/80 backdrop-blur-xl border border-primary/20 p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <div className="flex flex-col items-center gap-4 mb-16 text-primary justify-center">
        <div className="flex items-center gap-3">
          <BarChart3 size={32} />
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white">Finals Stage</h3>
        </div>
        <div className="text-center mt-2 bg-background/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
          <span className={`text-sm uppercase tracking-widest font-bold ${finalMatch.status === 'live' ? 'text-danger animate-pulse' : 'text-foreground/80'}`}>
            {finalMatch.status} • {formatLocalTime(finalMatch.isoDate, finalMatch.kickoff_local || finalMatch.time || finalMatch.date)}
          </span>
        </div>
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
        {/* Left Team (Home) */}
        <div className="flex flex-col justify-center w-full lg:flex-1 relative z-10 py-8">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-10 shadow-2xl relative z-20 backdrop-blur-md hover:scale-[1.02] transition-transform">
            <div className="flex flex-col items-center gap-8">
              {getCountryCode(finalMatch.home) && <NextImage src={`https://flagcdn.com/w160/${getCountryCode(finalMatch.home)}.png`} width={160} height={100} alt={`${finalMatch.home} flag`} className="rounded-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]" unoptimized />}
              <span 
                className="font-black text-4xl md:text-5xl uppercase tracking-wider bg-clip-text text-transparent drop-shadow-md premium-text-gradient text-center"
                style={{ backgroundImage: `linear-gradient(to right, ${getTeamColor(finalMatch.home)} 0%, ${getTeamColor(finalMatch.home)} 35%, #ffffff 50%, ${getTeamColor(finalMatch.home)} 65%, ${getTeamColor(finalMatch.home)} 100%)` }}
              >
                {finalMatch.home}
              </span>
              <span className="font-black text-7xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{finalMatch.score?.split('-')[0] || 0}</span>
            </div>
          </div>
          {/* Connecting Border */}
          <div className="hidden lg:block absolute top-1/2 right-[-80px] w-20 h-0 border-t-[4px] border-white/30 pointer-events-none" />
        </div>

        {/* Center Trophy */}
        <div className="w-full lg:w-[400px] shrink-0 h-[400px] lg:h-auto flex flex-col items-center justify-center relative z-20 order-first lg:order-none">
          {trophyImage}
        </div>

        {/* Right Team (Away) */}
        <div className="flex flex-col justify-center w-full lg:flex-1 relative z-10 py-8">
          <div className="bg-gradient-to-bl from-white/10 to-white/5 border border-white/20 rounded-3xl p-10 shadow-2xl relative z-20 backdrop-blur-md hover:scale-[1.02] transition-transform">
            <div className="flex flex-col items-center gap-8">
              {getCountryCode(finalMatch.away) && <NextImage src={`https://flagcdn.com/w160/${getCountryCode(finalMatch.away)}.png`} width={160} height={100} alt={`${finalMatch.away} flag`} className="rounded-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]" unoptimized />}
              <span 
                className="font-black text-4xl md:text-5xl uppercase tracking-wider bg-clip-text text-transparent drop-shadow-md premium-text-gradient text-center"
                style={{ backgroundImage: `linear-gradient(to left, ${getTeamColor(finalMatch.away)} 0%, ${getTeamColor(finalMatch.away)} 35%, #ffffff 50%, ${getTeamColor(finalMatch.away)} 65%, ${getTeamColor(finalMatch.away)} 100%)` }}
              >
                {finalMatch.away}
              </span>
              <span className="font-black text-7xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{finalMatch.score?.split('-')[1] || 0}</span>
            </div>
          </div>
          {/* Connecting Border */}
          <div className="hidden lg:block absolute top-1/2 left-[-80px] w-20 h-0 border-t-[4px] border-white/30 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
