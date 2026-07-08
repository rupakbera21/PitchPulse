"use client";

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

  return (
    <div className="flex items-center gap-2">
      <select 
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="bg-secondary/50 border border-primary/30 text-foreground text-sm rounded px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
      >
        {LOCATIONS.map(loc => (
          <option key={loc.id} value={loc.lang} className="bg-background">
            {loc.name} ({loc.lang})
          </option>
        ))}
      </select>
    </div>
  );
}
