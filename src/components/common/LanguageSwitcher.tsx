"use client";

import { useEffect, useState, useRef } from 'react';
import { Globe, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const LOCATIONS = [
  { id: 'global', name: 'Global', lang: 'EN' },
  { id: 'india', name: 'India', lang: 'EN-IN' },
  { id: 'argentina', name: 'Argentina', lang: 'ES-AR' },
  { id: 'egypt', name: 'Egypt', lang: 'AR-EG' },
  { id: 'usa', name: 'USA', lang: 'EN-US' }
];

export function LanguageSwitcher() {
  const { setLanguage } = useLanguage();
  const [currentLoc, setCurrentLoc] = useState(LOCATIONS[0]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const requestLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          let detectedLoc = LOCATIONS[0];
          if (latitude > 8 && latitude < 37 && longitude > 68 && longitude < 97) {
            detectedLoc = LOCATIONS[1]; // India
          } else if (latitude < 0 && longitude < -50) {
            detectedLoc = LOCATIONS[2]; // Argentina
          } else if (latitude > 22 && latitude < 31 && longitude > 24 && longitude < 36) {
            detectedLoc = LOCATIONS[3]; // Egypt
          } else if (latitude > 24 && latitude < 49 && longitude < -66 && longitude > -125) {
             detectedLoc = LOCATIONS[4]; // USA
          }
          setCurrentLoc(detectedLoc);
          setLanguage(detectedLoc.lang as any);
          setLoading(false);
        },
        (error) => {
          console.error("Location access denied or failed", error);
          setCurrentLoc(LOCATIONS[0]);
          setLanguage(LOCATIONS[0].lang as any);
          setLoading(false);
        }
      );
    } else {
      setCurrentLoc(LOCATIONS[0]);
      setLoading(false);
    }
  };

  useEffect(() => {
    // The overlay is shown by default on mount (showOverlay = true).
    // The user action on the overlay will trigger requestLocation() or skip.
  }, []);

  const selectLocation = (loc: typeof LOCATIONS[0]) => {
    setCurrentLoc(loc);
    setLanguage(loc.lang as any);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Invisible overlay to catch clicks outside the dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}

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
                  onPointerDown={() => selectLocation(loc)}
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
      <AnimatePresence>
        {showOverlay && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          >
            <motion.div 
              initial={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              className="bg-white/5 border border-white/10 p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center max-w-md text-center"
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
