"use client";

import { useEffect, useState, useRef } from 'react';
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
  const { setLanguage } = useLanguage();
  const [currentLoc, setCurrentLoc] = useState(LOCATIONS[0]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    // Automatically ask for location access on mount
    requestLocation();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const selectLocation = (loc: typeof LOCATIONS[0]) => {
    setCurrentLoc(loc);
    setLanguage(loc.lang as any);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-background/50 backdrop-blur-md border border-primary/30 rounded-full px-4 py-2 cursor-pointer hover:bg-background/80 transition-colors"
      >
        <MapPin size={16} className={loading ? "text-foreground/40 animate-pulse" : "text-primary"} />
        <div className="flex flex-col">
          <span className="text-[9px] text-foreground/50 uppercase tracking-widest leading-none mb-1">
            {loading ? 'Requesting Location...' : currentLoc.name}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground leading-none flex items-center gap-1">
            <Globe size={10} className="text-foreground/70" />
            {currentLoc.lang}
          </span>
        </div>
        <ChevronDown size={14} className={`text-foreground/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-background/95 backdrop-blur-xl border border-primary/30 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50">
          <div className="p-2 border-b border-primary/10 bg-secondary/30">
            <button 
              type="button"
              onClick={() => { requestLocation(); setIsOpen(false); }}
              className="text-[10px] text-primary uppercase tracking-widest font-bold w-full text-left px-2 py-1 hover:bg-primary/10 rounded"
            >
              Auto-Detect Location
            </button>
          </div>
          <ul className="p-1">
            {LOCATIONS.map(loc => (
              <li key={loc.id}>
                <button 
                  type="button"
                  onClick={() => selectLocation(loc)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex justify-between items-center ${currentLoc.id === loc.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-foreground'}`}
                >
                  <span className="font-semibold">{loc.name}</span>
                  <span className="text-[10px] uppercase tracking-widest opacity-60">{loc.lang}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
