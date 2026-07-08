"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, BarChart3, ScanLine, Activity, Zap } from 'lucide-react';
import { useMatch } from '@/contexts/MatchContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGLTF, Float, Environment } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState({ home: 65, away: 35 });
  const [feedMessages, setFeedMessages] = useState<{name: string, flag: string, text: string, isNews?: boolean}[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);

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



  const trophyImage = useMemo(() => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center relative">
      <img 
        src="/Trophy.png" 
        alt="World Cup 2026" 
        className="w-[200px] md:w-[250px] object-contain" 
      />
    </div>
  ), []);

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

  const powerStats = useMemo(() => {
    // Generate deterministic stats based on team names
    const getStat = (name: string, offset: number) => 65 + ((name.charCodeAt(0) + name.charCodeAt(name.length-1) + offset) % 30);
    return [
      { label: 'Attack', home: getStat(match.home.name, 1), away: getStat(match.away.name, 2) },
      { label: 'Defense', home: getStat(match.home.name, 3), away: getStat(match.away.name, 4) },
      { label: 'Midfield', home: getStat(match.home.name, 5), away: getStat(match.away.name, 6) },
      { label: 'Stamina', home: getStat(match.home.name, 7), away: getStat(match.away.name, 8) },
    ];
  }, [match]);

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

        {/* Massive Prediction Card */}
        <div className="mb-24">
          <div className="bg-secondary/40 backdrop-blur-3xl border border-primary/20 p-12 md:p-16 rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-team-home/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-team-away/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-12 text-primary relative z-10 justify-center">
              <BarChart3 size={32} />
              <h3 className="text-3xl font-black uppercase tracking-widest text-white">Live Prediction</h3>
            </div>
            
            <p className="text-4xl md:text-5xl font-black mb-16 relative z-10 text-center uppercase tracking-tight text-foreground/80">Who advances to the Quarter-Finals?</p>
            
            <div className="space-y-12 relative z-10 max-w-5xl mx-auto">
              <div>
                <div className="flex justify-between mb-4 font-black uppercase text-2xl md:text-4xl">
                  <span 
                    className="text-transparent bg-clip-text premium-text-gradient drop-shadow-lg"
                    style={{ backgroundImage: `linear-gradient(to right, var(--team-home) 0%, var(--team-home) 35%, #ffffff 50%, var(--team-home) 65%, var(--team-home) 100%)` }}
                  >
                    {match.home.name}
                  </span>
                  {voted && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-team-home">{homePct}%</motion.span>}
                </div>
                <button 
                  onClick={() => handleVote('home')}
                  disabled={voted}
                  className={`relative w-full h-24 md:h-32 rounded-2xl overflow-hidden bg-background border-2 transition-all duration-300 ${voted ? 'border-team-home/20 cursor-default' : 'border-team-home/50 hover:border-team-home hover:[box-shadow:0_0_40px_color-mix(in_srgb,var(--team-home)_40%,transparent)] hover:scale-[1.02]'}`}
                >
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: voted ? `${homePct}%` : '0%' }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-team-home/60 to-team-home/20"
                  />
                  {!voted && <span className="absolute inset-0 flex items-center justify-center font-black text-2xl md:text-3xl tracking-[0.4em] text-team-home hover:scale-110 transition-transform">VOTE {match.home.code}</span>}
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
                  {voted && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-team-away">{awayPct}%</motion.span>}
                </div>
                <button 
                  onClick={() => handleVote('away')}
                  disabled={voted}
                  className={`relative w-full h-24 md:h-32 rounded-2xl overflow-hidden bg-background border-2 transition-all duration-300 ${voted ? 'border-team-away/20 cursor-default' : 'border-team-away/50 hover:border-team-away hover:[box-shadow:0_0_40px_color-mix(in_srgb,var(--team-away)_40%,transparent)] hover:scale-[1.02]'}`}
                >
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: voted ? `${awayPct}%` : '0%' }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-team-away/60 to-team-away/20"
                  />
                  {!voted && <span className="absolute inset-0 flex items-center justify-center font-black text-2xl md:text-3xl tracking-[0.4em] text-team-away hover:scale-110 transition-transform">VOTE {match.away.code}</span>}
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

        <div className="grid lg:grid-cols-2 gap-16 items-stretch">
          
          <div className="flex flex-col justify-between gap-16 h-full">
            {/* Head-to-Head Power Index */}
            <div className="bg-secondary/40 backdrop-blur-xl border border-primary/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 mb-10 text-primary relative z-20">
                <Activity size={28} className="animate-pulse" />
                <h3 className="text-2xl font-black uppercase tracking-widest">Head-to-Head Power</h3>
              </div>
              
              <div className="flex justify-between items-center mb-8 px-2">
                <div className="flex items-center gap-3">
                  <span className={`fi fi-${match.home.flag} text-2xl rounded-sm overflow-hidden`}></span>
                  <span className="font-black text-team-home uppercase tracking-wider">{match.home.name}</span>
                </div>
                <span className="text-foreground/40 font-black text-sm uppercase">VS</span>
                <div className="flex items-center gap-3">
                  <span className="font-black text-team-away uppercase tracking-wider">{match.away.name}</span>
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
                        className="h-full bg-team-home origin-left"
                      />
                      {/* Divider */}
                      <div className="w-1 h-full bg-background z-10" />
                      {/* Away Stat Bar */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.away / (stat.home + stat.away)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 * i, type: "spring" }}
                        className="h-full bg-team-away origin-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                      {getCountryCode(fixture.home) && <img src={`https://flagcdn.com/w40/${getCountryCode(fixture.home)}.png`} width="28" alt={fixture.home} className="rounded-sm shadow-sm" />}
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
                      {getCountryCode(fixture.away) && <img src={`https://flagcdn.com/w40/${getCountryCode(fixture.away)}.png`} width="28" alt={fixture.away} className="rounded-sm shadow-sm" />}
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
                      {getCountryCode(fixture.home) && <img src={`https://flagcdn.com/w40/${getCountryCode(fixture.home)}.png`} width="28" alt={fixture.home} className="rounded-sm shadow-sm" />}
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
                      {getCountryCode(fixture.away) && <img src={`https://flagcdn.com/w40/${getCountryCode(fixture.away)}.png`} width="28" alt={fixture.away} className="rounded-sm shadow-sm" />}
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
      </div>
    </section>
    </>
  );
}
