"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMatch } from '@/contexts/MatchContext';
import { MemphisElements } from './MemphisElements';

export function Hero() {
  const { t } = useLanguage();
  const { match } = useMatch();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target date from match context
    const targetDate = new Date(match.date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match.date]);

  return (
    <section className="relative min-h-screen pt-32 pb-12 flex flex-col justify-center overflow-hidden bg-transparent">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent z-10" />
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"
        />
        
        {/* Memphis / FC26 Vibes */}
        <MemphisElements />

        {/* Dynamic sweeping light effect */}
        <motion.div 
          animate={{ 
            x: ['-100%', '200%'],
            opacity: [0, 0.5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-[-45deg] z-10"
        />
      </div>

      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary text-background shadow-[0_0_20px_rgba(0,210,106,0.6)] mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-background animate-pulse" />
          <span className="text-background text-xs font-black uppercase tracking-[0.2em]">{t('round_of_16')}</span>
        </motion.div>
        
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

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="text-[12vw] md:text-[10rem] leading-[0.8] font-black uppercase tracking-tighter text-center flex flex-col items-center drop-shadow-2xl mb-4"
        >
          <span 
            className="text-transparent bg-clip-text premium-text-gradient"
            style={{ backgroundImage: `linear-gradient(to right, var(--team-home) 0%, var(--team-home) 35%, #ffffff 50%, var(--team-home) 65%, var(--team-home) 100%)` }}
          >
            {match.home.name}
          </span>
          <br className="hidden md:block"/>
          <span className="text-foreground/40 text-4xl md:text-6xl tracking-widest mx-4 md:mx-0">VS</span>
          <br className="hidden md:block"/>
          <span 
            className="text-transparent bg-clip-text premium-text-gradient"
            style={{ backgroundImage: `linear-gradient(to right, var(--team-away) 0%, var(--team-away) 35%, #ffffff 50%, var(--team-away) 65%, var(--team-away) 100%)` }}
          >
            {match.away.name}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-foreground/50 uppercase tracking-[0.3em] font-medium mb-12 text-sm md:text-base"
        >
          {match.venue}, {match.city}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          className="flex flex-col items-center mb-8"
        >
          <div className="text-xs text-foreground/40 uppercase tracking-widest mb-4">{t('kickoff_in')}</div>
          <div className="flex gap-4 md:gap-8 justify-center">
            {Object.entries(timeLeft).map(([unit, value], index, array) => (
              <div key={unit} className="flex items-start gap-4 md:gap-8">
                <div className="flex flex-col items-center">
                  <div className="text-5xl md:text-7xl font-black font-mono text-foreground tracking-tighter w-24 md:w-32 text-center drop-shadow-[0_0_15px_rgba(0,210,106,0.3)]">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <span className="text-xs md:text-sm uppercase tracking-[0.2em] mt-2 text-primary">{t(unit as any)}</span>
                </div>
                {index < array.length - 1 && (
                  <div className="text-5xl md:text-7xl font-black font-mono text-foreground/30 tracking-tighter self-start pt-1">:</div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 1.2 } }}
          whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
          className="relative p-[3px] rounded-full bg-gradient-to-r from-team-home via-primary to-team-away animate-text-gradient group cursor-pointer hover:shadow-[0_0_40px_rgba(0,210,106,0.8)] transition-all duration-300 z-40"
        >
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openChat'))}
            className="no-scale px-8 py-3 bg-background rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2 relative z-10 w-full h-full"
          >
            <span className="relative z-10">{t('ask_ai')}</span>
            <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={18} />
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
