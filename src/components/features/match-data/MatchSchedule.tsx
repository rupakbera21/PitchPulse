"use client";

import { useRealtimeMatches } from '@/hooks/useRealtimeData';
import { motion } from 'framer-motion';
import 'flag-icons/css/flag-icons.min.css';

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

export function MatchSchedule() {
  const { data, loading } = useRealtimeMatches();

  if (loading || !data) return (
    <div className="w-full h-32 py-12 flex justify-center items-center text-primary bg-secondary/10 border-y border-primary/10">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const matches = data.live_schedule || [];
  // Duplicate array for seamless infinite marquee
  const marqueeItems = [...matches, ...matches, ...matches];

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="py-8 bg-secondary/20 relative border-t border-b border-primary/10 overflow-hidden"
    >
      
      {/* Gradient masks for smooth edge fading */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="w-full relative flex">
        <motion.div 
          className="flex gap-6 w-max pl-6"
          animate={{ x: [0, -100 * matches.length * 2] }} // rough estimate to keep it moving
          transition={{ 
            duration: matches.length * 10, 
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
        >
          {marqueeItems.map((match: { home: string; away: string; date: string; status: string; kickoff_local?: string; home_score?: number; away_score?: number; score?: string; stage?: string; venue?: string; [key: string]: unknown }, i: number) => (
            <div 
              key={`${match.home}-${match.away}-${i}`}
              className={`flex-shrink-0 w-80 rounded-2xl bg-background/60 backdrop-blur-md border p-6 flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] ${match.status === 'live' ? 'border-primary shadow-[0_0_20px_rgba(0,210,106,0.15)]' : 'border-primary/20'}`}
            >
              <div className="flex justify-between items-center mb-6 text-xs uppercase tracking-[0.2em]">
                <span className="text-foreground/50">{new Date(match.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                <span className={match.status === 'live' ? 'text-primary font-bold flex items-center gap-2' : match.status === 'completed' ? 'text-foreground/40 font-bold' : 'text-foreground/50 font-bold'}>
                  {match.status === 'live' && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>}
                  {match.status === 'completed' ? 'FT' : match.status === 'live' ? 'LIVE' : (match.kickoff_local ? match.kickoff_local.replace(/(\d{2})(\d{2})/, '$1:$2') : 'Scheduled')}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`fi fi-${FLAG_MAP[match.home] || 'un'} text-3xl rounded shadow-md object-cover`}></span>
                    <span className="font-bold text-xl">{match.home}</span>
                  </div>
                  {match.score && <span className="font-mono font-black text-2xl tracking-tighter">{match.score.split('-')[0]}</span>}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`fi fi-${FLAG_MAP[match.away] || 'un'} text-3xl rounded shadow-md object-cover`}></span>
                    <span className="font-bold text-xl">{match.away}</span>
                  </div>
                  {match.score && <span className="font-mono font-black text-2xl tracking-tighter">{match.score.split('-')[1]}</span>}
                </div>
              </div>

              <div className="mt-6 text-xs text-foreground/40 pt-4 border-t border-primary/10 tracking-widest uppercase truncate">
                {match.venue}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
