"use client";

import { useState, useEffect, useRef } from 'react';
import { Globe, MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LOCATIONS = [
  { id: 'global', name: 'Global', lang: 'EN' },
  { id: 'india', name: 'India', lang: 'EN-IN' },
  { id: 'argentina', name: 'Argentina', lang: 'ES-AR' },
  { id: 'egypt', name: 'Egypt', lang: 'AR-EG' },
  { id: 'usa', name: 'USA', lang: 'EN-US' }
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const currentLoc = LOCATIONS.find(loc => loc.lang === language) || LOCATIONS[0];
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const requestLocation = () => {
    setLoading(true);
    // Bulletproof simulation for demo purposes, as browser geolocation 
    // is often blocked by default or in iframe environments.
    setTimeout(() => {
      // For demo, we simulate detecting a location (e.g. Argentina)
      const detected = LOCATIONS.find(l => l.id === 'argentina') || LOCATIONS[1];
      setLanguage(detected.lang as any);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const selectLocation = (loc: typeof LOCATIONS[0]) => {
    setLanguage(loc.lang as any);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Premium Glass Button UI */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-50 flex items-center gap-3 bg-white/5 backdrop-blur-xl border ${isOpen ? 'border-primary/50 shadow-[0_0_20px_rgba(0,210,106,0.2)]' : 'border-white/10'} rounded-full px-4 py-2 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group`}
      >
        <MapPin size={16} className={loading ? "text-foreground/40 animate-pulse" : "text-primary group-hover:scale-110 transition-transform"} />
        <div className="flex flex-col text-left">
          <span className="text-[9px] text-foreground/50 uppercase tracking-widest leading-none mb-1">
            {loading ? 'Requesting Location...' : currentLoc.name}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground leading-none flex items-center gap-1">
            <Globe size={10} className="text-foreground/70" />
            {currentLoc.lang}
          </span>
        </div>
        <ChevronDown size={14} className={`text-foreground/50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {/* Premium Glass Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-3 right-0 w-56 bg-background/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-white/5 bg-white/5">
            <button 
              type="button"
              onClick={() => { requestLocation(); setIsOpen(false); }}
              className="text-[10px] text-primary uppercase tracking-widest font-bold w-full text-left px-3 py-2 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <MapPin size={12} />
              Auto-Detect Location
            </button>
          </div>
          <ul className="p-2 space-y-1">
            {LOCATIONS.map(loc => (
              <li key={loc.id}>
                <button 
                  type="button"
                  onClick={() => selectLocation(loc)}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all duration-200 flex justify-between items-center ${currentLoc.id === loc.id ? 'bg-primary/20 text-primary shadow-[inset_0_0_10px_rgba(0,210,106,0.2)]' : 'hover:bg-white/10 text-foreground/80 hover:text-foreground'}`}
                >
                  <span className="font-semibold">{loc.name}</span>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md ${currentLoc.id === loc.id ? 'bg-primary/20' : 'bg-black/30'}`}>{loc.lang}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full-Screen Entry Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-in fade-in duration-300">
          <div className="bg-white/5 border border-white/10 p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center max-w-md text-center animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black italic uppercase tracking-widest mb-2 text-white">PitchPulse.</h2>
            <div className="w-12 h-1 bg-primary mb-6 rounded-full" />
            
            <p className="text-foreground/70 mb-10 text-sm leading-relaxed">
              For the best live stadium experience, allow PitchPulse to auto-detect your location and set your language automatically.
            </p>
            
            <div className="flex flex-col w-full gap-3">
              <button 
                type="button"
                onClick={() => { requestLocation(); setShowOverlay(false); }}
                className="w-full bg-primary text-background font-bold uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-primary/80 transition-colors shadow-[0_0_20px_rgba(0,210,106,0.3)] hover:shadow-[0_0_30px_rgba(0,210,106,0.5)]"
              >
                Allow Location
              </button>
              <button 
                type="button"
                onClick={() => { setLoading(false); setShowOverlay(false); }}
                className="w-full bg-white/5 text-foreground/70 font-bold uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-white/10 hover:text-foreground transition-colors border border-white/10"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
