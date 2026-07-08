"use client";

import { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, BarChart3, ScanLine, Activity, Zap } from 'lucide-react';
import { useMatch } from '@/contexts/MatchContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGLTF, Float, Environment } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { PredictionCard } from './PredictionCard';
import { TournamentBracket } from './TournamentBracket';
import { HeadToHead } from './HeadToHead';

function Trophy3D() {
  const { scene } = useGLTF('/world_cup_trophy.glb');
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={group} scale={3.5} position={[0, -1, 0]}>
        <primitive object={scene} />
      </group>
      <Environment preset="city" />
    </Float>
  );
}
useGLTF.preload('/world_cup_trophy.glb');

export function FanZone() {
  const { match } = useMatch();
  const { formatDate, formatTime } = useLanguage();
  const [feedMessages, setFeedMessages] = useState<{name: string, flag: string, text: string, isNews?: boolean}[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);



  const trophyImage = useMemo(() => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center relative">
      <NextImage 
        src="/Trophy.png" 
        alt="FIFA World Cup 2026 Trophy" 
        width={250}
        height={350}
        className="w-[200px] md:w-[250px] object-contain" 
      />
    </div>
  ), []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadFeed() {
      const baseMessages = [
        { name: 'Alex M.', flag: match.home.flag, text: `Let's go ${match.home.name}!! 🏆`, isNews: false },
        { name: 'Sarah T.', flag: match.away.flag, text: `We are winning this tonight 🔥`, isNews: false },
        { name: 'Diego R.', flag: match.home.flag, text: `Unbelievable atmosphere for ${match.home.name} fans!`, isNews: false },
        { name: 'Kenji Y.', flag: 'jp', text: `Watching live from Tokyo, amazing match!`, isNews: false },
        { name: 'Liam P.', flag: match.away.flag, text: `${match.away.name} defense is solid.`, isNews: false },
        { name: 'Maria C.', flag: 'br', text: `Can't wait for kickoff! ⚽`, isNews: false },
        { name: 'Carlos V.', flag: match.home.flag, text: `${match.home.name} will dominate!`, isNews: false },
        { name: 'Emma W.', flag: match.away.flag, text: `Come on ${match.away.name}!! 💙`, isNews: false },
      ];

      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        if (data.news && data.news.length > 0) {
          const newsMessages = data.news.map((item: any) => ({
            name: 'Latest News',
            flag: 'un', // United Nations flag or similar generic flag icon
            text: `BREAKING: ${item.title}`,
            isNews: true
          }));
          
          // Interleave news with fan messages
          const combined = [];
          for (let i = 0; i < Math.max(baseMessages.length, newsMessages.length); i++) {
            if (baseMessages[i]) combined.push(baseMessages[i]);
            if (newsMessages[i]) combined.push(newsMessages[i]);
          }
          setFeedMessages(combined);
        } else {
          setFeedMessages(baseMessages);
        }
      } catch (e) {
        console.error("Failed to fetch news", e);
        setFeedMessages(baseMessages);
      }

      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        if (data.live_schedule) {
           setFixtures(data.live_schedule);
        }
      } catch (e) {
        console.error("Failed to fetch matches", e);
      }
    }
    
    loadFeed();
    const interval = setInterval(loadFeed, 15000);
    return () => clearInterval(interval);
  }, [match]);



  return (
    <>
      <section className="py-24 relative overflow-hidden bg-transparent border-t border-primary/20">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(117,170,219,0.1)_50%,transparent_75%)] bg-[length:40px_40px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50 drop-shadow-2xl">
            Fan Zone
          </h2>
          <p className="text-foreground/50 uppercase tracking-[0.3em] font-bold">The Ultimate Matchday Experience</p>
        </div>

        <PredictionCard match={match} />

        <div className="grid lg:grid-cols-2 gap-16 items-stretch">
          <div className="flex flex-col justify-between gap-16 h-full">
            <HeadToHead match={match} />
            {/* Global Fan Feed */}
            <div className="w-full bg-secondary/40 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-primary/20 shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black uppercase tracking-widest text-white">Live Fan Feed</h3>
                <div className="flex items-center gap-2 bg-danger/20 px-4 py-2 rounded-full border border-danger/50">
                  <span className="w-3 h-3 rounded-full bg-danger animate-pulse"></span>
                  <span className="text-xs font-bold tracking-widest text-danger uppercase">Live</span>
                </div>
              </div>
              
              <div className="relative h-[300px] overflow-hidden rounded-2xl">
                {/* Fade masks */}
                <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#0b0c10] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0b0c10] to-transparent z-10 pointer-events-none"></div>
                
                <motion.div 
                  animate={{ y: [0, -350] }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="flex flex-col gap-4 pt-4"
                >
                  {feedMessages.map((msg, i) => (
                    <div key={i} className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-white/10">
                      {msg.isNews ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,210,106,0.3)] border border-primary/30 shrink-0">
                          <Zap size={18} className="text-background" fill="currentColor" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner overflow-hidden border border-white/20 shrink-0">
                          <span className={`fi fi-${msg.flag} text-2xl h-full w-full object-cover scale-150`}></span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold uppercase tracking-widest ${msg.isNews ? 'text-primary' : 'text-foreground/50'}`}>
                          {msg.name}
                        </span>
                        <span className="text-md font-semibold text-white">{msg.text}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Grandiose VIP Pass and Fixtures */}
          <div className="flex flex-col items-center justify-start min-h-[500px] gap-16">
            <motion.div 
              whileHover={{ rotateY: -15, rotateX: 15, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-[500px] rounded-[3rem] bg-gradient-to-br from-team-home via-background to-team-away border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.8),_inset_0_0_40px_rgba(255,255,255,0.2)] p-[4px] cursor-grab group overflow-hidden"
            >
              <motion.div 
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent skew-x-[-45deg] z-20 pointer-events-none"
              />

              <div className="h-full w-full bg-background/95 backdrop-blur-3xl rounded-[2.8rem] p-10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-[-50px] w-64 h-64 bg-team-home/10 blur-[60px] rounded-full pointer-events-none"></div>

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-sm text-foreground/50 tracking-[0.3em] uppercase font-black">FIFA World Cup 2026™</p>
                    <span className="px-4 py-2 bg-primary/20 text-primary text-xs uppercase tracking-widest rounded font-black border border-primary/40 animate-pulse">VIP Access</span>
                  </div>

                  <div className="flex justify-between items-center mb-10">
                    <div className="flex flex-col">
                      <h4 
                        className="text-6xl leading-none font-black uppercase tracking-tighter bg-clip-text text-transparent drop-shadow-2xl premium-text-gradient"
                        style={{ backgroundImage: `linear-gradient(to right, var(--team-home) 0%, var(--team-home) 35%, #ffffff 50%, var(--team-home) 65%, var(--team-home) 100%)` }}
                      >
                        {match.home.code}
                      </h4>
                      <h4 
                        className="text-6xl leading-none font-black uppercase tracking-tighter bg-clip-text text-transparent drop-shadow-2xl mt-2 premium-text-gradient"
                        style={{ backgroundImage: `linear-gradient(to right, var(--team-away) 0%, var(--team-away) 35%, #ffffff 50%, var(--team-away) 65%, var(--team-away) 100%)` }}
                      >
                        {match.away.code}
                      </h4>
                    </div>
                    <div className="flex flex-col gap-4 items-center">
                      <span className={`fi fi-${match.home.flag} text-6xl rounded-lg shadow-2xl`}></span>
                      <span className="text-sm text-foreground/40 font-black tracking-[0.3em]">VS</span>
                      <span className={`fi fi-${match.away.flag} text-6xl rounded-lg shadow-2xl`}></span>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/60 rounded-3xl p-6 border border-white/10 space-y-6 shadow-inner mb-8 relative overflow-hidden">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-foreground/40 uppercase tracking-[0.2em] mb-2 font-bold">Date</p>
                        <p className="font-mono font-bold text-lg">{mounted ? formatDate(match.date) : '---'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/40 uppercase tracking-[0.2em] mb-2 font-bold">Time</p>
                        <p className="font-mono font-bold text-lg">{mounted ? formatTime(match.date) : '---'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 uppercase tracking-[0.2em] mb-2 font-bold">Venue</p>
                      <p className="font-black uppercase tracking-widest text-lg text-primary">{match.venue}</p>
                      <p className="text-sm text-foreground/50 font-mono mt-1">{match.city}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-b from-team-home/20 to-transparent p-6 rounded-2xl border border-team-home/30 flex flex-col items-center justify-center">
                      <p className="text-xs text-foreground/60 uppercase tracking-[0.2em] mb-2 font-bold">Gate</p>
                      <p className="font-mono font-black text-5xl text-white">{match.gate}</p>
                    </div>
                    <div className="bg-gradient-to-b from-white/10 to-transparent p-6 rounded-2xl border border-white/20 flex flex-col items-center justify-center">
                      <p className="text-xs text-foreground/60 uppercase tracking-[0.2em] mb-2 font-bold">Block</p>
                      <p className="font-mono font-black text-5xl text-white">{match.block}</p>
                    </div>
                    <div className="bg-gradient-to-b from-team-away/20 to-transparent p-6 rounded-2xl border border-team-away/30 flex flex-col items-center justify-center">
                      <p className="text-xs text-foreground/60 uppercase tracking-[0.2em] mb-2 font-bold">Seat</p>
                      <p className="font-mono font-black text-5xl text-white">{match.seat}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t-[3px] border-dashed border-foreground/20 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-3 text-primary">
                      <ScanLine size={28} className="animate-pulse" />
                      <span className="text-sm font-black uppercase tracking-widest">Ready to Scan</span>
                    </div>
                    <p className="font-mono text-sm tracking-widest text-foreground/40">MBS-04112</p>
                  </div>
                  
                  {/* Dense Barcode */}
                  <div className="w-full h-24 flex gap-[2px] justify-center opacity-80">
                    {[...Array(80)].map((_, i) => {
                      // Deterministic pseudorandom values based on index to prevent hydration mismatch
                      const w = Math.abs(Math.sin(i * 1.5)) % 1;
                      const width = w > 0.8 ? '6px' : w > 0.5 ? '3px' : '2px';
                      const opacity = Math.abs(Math.cos(i * 2.3)) % 1 > 0.15 ? 1 : 0.2;
                      return (
                        <div key={i} className="bg-foreground h-full rounded-full" style={{ width, opacity }} />
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

        </div>

        {/* Tournament Bracket */}
        <TournamentBracket fixtures={fixtures} trophyImage={trophyImage} />
      </div>
    </section>
    </>
  );
}
