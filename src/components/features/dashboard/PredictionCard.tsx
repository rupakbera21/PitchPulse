import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Match } from '@/contexts/MatchContext';

interface PredictionCardProps {
  match: Match;
}

export function PredictionCard({ match }: PredictionCardProps) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState({ home: 65, away: 35 });

  const handleVote = (team: 'home' | 'away') => {
    if (voted) return;
    setVoted(true);
    if (team === 'home') setVotes({ home: votes.home + 1, away: votes.away });
    else setVotes({ home: votes.home, away: votes.away + 1 });
  };

  const total = votes.home + votes.away;
  const homePct = Math.round((votes.home / total) * 100);
  const awayPct = Math.round((votes.away / total) * 100);

  return (
    <div className="mb-24">
      <div className="bg-secondary/40 backdrop-blur-3xl border border-primary/20 p-12 md:p-16 rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--team-home)]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--team-away)]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-12 text-primary relative z-10 justify-center">
          <BarChart3 size={32} />
          <h3 className="text-3xl font-black uppercase tracking-widest text-white">Live Prediction</h3>
        </div>
        
        <p className="text-4xl md:text-5xl font-black mb-16 relative z-10 text-center uppercase tracking-tight text-foreground/80">Who will win the Final?</p>
        
        <div className="space-y-12 relative z-10 max-w-5xl mx-auto">
          <div>
            <div className="flex justify-between mb-4 font-black uppercase text-2xl md:text-4xl">
              <span 
                className="text-transparent bg-clip-text premium-text-gradient drop-shadow-lg"
                style={{ backgroundImage: `linear-gradient(to right, var(--team-home) 0%, var(--team-home) 35%, #ffffff 50%, var(--team-home) 65%, var(--team-home) 100%)` }}
              >
                {match.home.name}
              </span>
              {voted && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--team-home)]">{homePct}%</motion.span>}
            </div>
            <button 
              onClick={() => handleVote('home')}
              disabled={voted}
              className={`relative w-full h-24 md:h-32 rounded-2xl overflow-hidden bg-background border-2 transition-all duration-300 ${voted ? 'border-[var(--team-home)]/20 cursor-default' : 'border-[var(--team-home)]/50 hover:border-[var(--team-home)] hover:[box-shadow:0_0_40px_color-mix(in_srgb,var(--team-home)_40%,transparent)] hover:scale-[1.02]'}`}
            >
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: voted ? `${homePct}%` : '0%' }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--team-home)]/60 to-[var(--team-home)]/20"
              />
              {!voted && <span className="absolute inset-0 flex items-center justify-center font-black text-2xl md:text-3xl tracking-[0.4em] text-[var(--team-home)] hover:scale-110 transition-transform">VOTE {match.home.code}</span>}
            </button>
          </div>

          <div>
            <div className="flex justify-between mb-4 font-black uppercase text-2xl md:text-4xl">
              <span 
                className="text-transparent bg-clip-text premium-text-gradient drop-shadow-lg"
                style={{ backgroundImage: `linear-gradient(to right, var(--team-away) 0%, var(--team-away) 35%, #ffffff 50%, var(--team-away) 65%, var(--team-away) 100%)` }}
              >
                {match.away.name}
              </span>
              {voted && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--team-away)]">{awayPct}%</motion.span>}
            </div>
            <button 
              onClick={() => handleVote('away')}
              disabled={voted}
              className={`relative w-full h-24 md:h-32 rounded-2xl overflow-hidden bg-background border-2 transition-all duration-300 ${voted ? 'border-[var(--team-away)]/20 cursor-default' : 'border-[var(--team-away)]/50 hover:border-[var(--team-away)] hover:[box-shadow:0_0_40px_color-mix(in_srgb,var(--team-away)_40%,transparent)] hover:scale-[1.02]'}`}
            >
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: voted ? `${awayPct}%` : '0%' }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--team-away)]/60 to-[var(--team-away)]/20"
              />
              {!voted && <span className="absolute inset-0 flex items-center justify-center font-black text-2xl md:text-3xl tracking-[0.4em] text-[var(--team-away)] hover:scale-110 transition-transform">VOTE {match.away.code}</span>}
            </button>
          </div>
        </div>
        
        {voted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-16 p-6 bg-background/80 backdrop-blur-md rounded-2xl border border-white/20 text-center relative z-10 max-w-lg mx-auto"
          >
            <p className="text-white font-black tracking-widest uppercase text-xl">Vote Registered!</p>
            <p className="text-foreground/50 mt-2 text-sm uppercase tracking-widest">Global consensus is forming.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
