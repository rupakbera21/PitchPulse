"use client";

import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const requestLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For demo purposes, we will default to Global if we get coordinates
          // unless they are explicitly in one of our regions. 
          // To prevent forcing Argentina, we just stay on Global.
          setLanguage('EN');
          setLoading(false);
          setShowOverlay(false);
        },
        (error) => {
          console.warn("Geolocation denied or failed", error);
          setLanguage('EN');
          setLoading(false);
          setShowOverlay(false);
        }
      );
    } else {
      setLanguage('EN');
      setLoading(false);
      setShowOverlay(false);
    }
  };

  return (
    <>
      <div className="relative group">
        {/* Background container for glass effect */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full transition-all duration-300 group-hover:bg-white/10 group-hover:border-primary/30" />
        
        {/* Visual content (sitting behind the invisible select) */}
        <div className="relative flex items-center gap-3 px-4 py-2 pointer-events-none z-10">
          <MapPin size={16} className={loading ? "text-foreground/40 animate-pulse" : "text-primary group-hover:scale-110 transition-transform"} />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-foreground/50 uppercase tracking-widest leading-none mb-1">
              {loading ? 'Detecting...' : currentLoc.name}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground leading-none flex items-center gap-1">
              <Globe size={10} className="text-foreground/70" />
              {currentLoc.lang}
            </span>
          </div>
          <ChevronDown size={14} className="text-foreground/50" />
        </div>

        {/* The actual native select element, invisible but covering the whole area */}
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        >
          {LOCATIONS.map(loc => (
            <option key={loc.id} value={loc.lang} className="bg-background text-foreground font-sans">
              {loc.name} ({loc.lang})
            </option>
          ))}
        </select>
      </div>

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
                onClick={requestLocation}
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
    </>
  );
}
