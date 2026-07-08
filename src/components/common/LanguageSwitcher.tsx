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
    requestLocation();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'auto') {
      requestLocation();
    } else {
      const loc = LOCATIONS.find(l => l.id === val);
      if (loc) {
        setCurrentLoc(loc);
        setLanguage(loc.lang as any);
      }
    }
  };

  return (
    <div className="relative inline-block">
      {/* Invisible Native Select for 100% reliable mobile/desktop interaction */}
      <select 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        value={currentLoc.id}
        onChange={handleSelectChange}
      >
        <option value="auto" className="bg-background text-foreground">Auto-Detect Location</option>
        {LOCATIONS.map(loc => (
          <option key={loc.id} value={loc.id} className="bg-background text-foreground">
            {loc.name} ({loc.lang})
          </option>
        ))}
      </select>
      
      {/* Visual Button UI (Pointer events pass through to select) */}
      <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md border border-primary/30 rounded-full px-4 py-2 transition-colors">
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
        <ChevronDown size={14} className="text-foreground/50" />
      </div>
    </div>
  );
}
