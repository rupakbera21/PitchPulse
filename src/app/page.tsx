"use client";

import { Hero } from '@/components/features/dashboard/Hero';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { MatchSchedule } from '@/components/features/match-data/MatchSchedule';
import { StadiumMap } from '@/components/features/stadium-map/StadiumMap';
import { FanZone } from '@/components/features/dashboard/FanZone';
import { ChatWidget } from '@/components/features/concierge-chat/ChatWidget';
import { StadiumServices } from '@/components/features/dashboard/StadiumServices';
import { LanguageSwitcher } from '@/components/features/navigation/LanguageSwitcher';
import { MatchSwitcher } from '@/components/features/navigation/MatchSwitcher';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMatch } from '@/contexts/MatchContext';

const ScrollReveal = ({ children, delay = 0, speed = 1 }: { children: React.ReactNode, delay?: number, speed?: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Parallax translation: slower movement for deeper layers
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const { t } = useLanguage();
  const { match } = useMatch();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-transparent relative overflow-x-hidden">
      <div className="fixed inset-0 -z-50 moving-gradient-bg" />
      {/* Basic Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 transition-all duration-300 ${isScrolled ? 'bg-background/60 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-gradient-to-b from-background to-transparent'}`}>
        <div className="font-black italic text-xl uppercase tracking-widest text-white flex items-center gap-2">
          PitchPulse.
        </div>
        <div className="flex items-center gap-4">
          <MatchSwitcher />
          <LanguageSwitcher />
          <Link href="/control-room" className="text-sm font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors border border-primary/30 px-4 py-2 rounded-full backdrop-blur">
            {t('control_room')}
          </Link>
        </div>
      </nav>

      {/* Main Sections with Parallax */}
      <Hero />
      
      {/* Floating Parallax Background Elements */}
      <ScrollReveal speed={2.5}>
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      </ScrollReveal>
      <ScrollReveal speed={-1.5}>
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[#75AADB]/5 rounded-full blur-[120px] pointer-events-none" />
      </ScrollReveal>

      <ScrollReveal delay={0.1} speed={0.5}>
        <MatchSchedule />
      </ScrollReveal>
      
      {/* Map Section */}
      <div className="py-12 bg-transparent relative z-10 border-t border-primary/20">
        <ScrollReveal speed={0.3}>
          <div className="max-w-7xl mx-auto px-4 mb-2">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-center">
              {t('living_stadium')}
            </h2>
            <p className="text-center text-foreground/60 max-w-2xl mx-auto">
              {t('interact_map')}
            </p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1} speed={0.8}>
          <StadiumMap />
        </ScrollReveal>
        <ScrollReveal delay={0.1} speed={0.6}>
          <StadiumServices />
        </ScrollReveal>
        <ScrollReveal delay={0.1} speed={1.2}>
          <FanZone />
        </ScrollReveal>
      </div>

      <ChatWidget />
      
      {/* Footer */}
      <footer className="py-12 border-t border-primary/10 text-center text-foreground/40 text-sm">
        <p>2026 Smart Stadium Platform. Built for the Global Stage.</p>
      </footer>
    </main>
  );
}
