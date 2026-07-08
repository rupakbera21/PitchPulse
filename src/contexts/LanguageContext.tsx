"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type LanguageCode = 'EN' | 'EN-IN' | 'ES-AR' | 'AR-EG' | 'EN-US';

interface Translations {
  [key: string]: {
    smart_stadium: string;
    control_room: string;
    stage_group: string;
    stage_round_of_16: string;
    stage_quarter_final: string;
    stage_semi_final: string;
    kickoff_in: string;
    ask_ai: string;
    living_stadium: string;
    interact_map: string;
    hours: string;
    minutes: string;
    seconds: string;
    days: string;
  }
}

const TRANSLATIONS: Translations = {
  'EN': {
    smart_stadium: 'Smart Stadium',
    control_room: 'Control Room',
    stage_group: 'Group Stage Matchday',
    stage_round_of_16: 'Round of 16 Matchday',
    stage_quarter_final: 'Quarter-Final Matchday',
    stage_semi_final: 'Semi-Final Matchday',
    kickoff_in: 'Kickoff In',
    ask_ai: 'Ask AI Concierge',
    living_stadium: 'Living Stadium',
    interact_map: 'Interact with the map below to check real-time gate wait times, concourse congestion, and find the fastest route to your seat.',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    days: 'days'
  },
  'ES-AR': {
    smart_stadium: 'Estadio Inteligente',
    control_room: 'Sala de Control',
    stage_group: 'Fase de Grupos',
    stage_round_of_16: 'Octavos de Final',
    stage_quarter_final: 'Cuartos de Final',
    stage_semi_final: 'Semifinal',
    kickoff_in: 'Inicio En',
    ask_ai: 'Conserje de IA',
    living_stadium: 'Estadio Vivo',
    interact_map: 'Interactúa con el mapa a continuación para consultar los tiempos de espera en las puertas en tiempo real y encontrar la ruta más rápida a tu asiento.',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
    days: 'días'
  },
  'AR-EG': {
    smart_stadium: 'الملعب الذكي',
    control_room: 'غرفة التحكم',
    stage_group: 'دور المجموعات',
    stage_round_of_16: 'دور الـ 16',
    stage_quarter_final: 'ربع النهائي',
    stage_semi_final: 'نصف النهائي',
    kickoff_in: 'بداية المباراة في',
    ask_ai: 'المساعد الذكي',
    living_stadium: 'الملعب الحي',
    interact_map: 'تفاعل مع الخريطة أدناه للتحقق من أوقات الانتظار عند البوابات في الوقت الفعلي، والعثور على أسرع طريق لمقعدك.',
    hours: 'ساعات',
    minutes: 'دقائق',
    seconds: 'ثواني',
    days: 'أيام'
  }
};

TRANSLATIONS['EN-IN'] = TRANSLATIONS['EN'];
TRANSLATIONS['EN-US'] = TRANSLATIONS['EN'];

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  t: (key: keyof Translations['EN']) => string;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const getTimeZoneForLanguage = (lang: LanguageCode) => {
  switch (lang) {
    case 'EN-IN': return 'Asia/Kolkata'; // IST
    case 'ES-AR': return 'America/Argentina/Buenos_Aires'; // ART
    case 'AR-EG': return 'Africa/Cairo'; // EEST
    case 'EN-US': return 'America/New_York'; // EST/EDT
    default: return undefined; // Browser local
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('EN');
  const [showSplash, setShowSplash] = useState(true);

  const t = (key: keyof Translations['EN']) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['EN'][key];
  };

  const formatTime = (dateString: string) => {
    const tz = getTimeZoneForLanguage(language);
    return new Date(dateString).toLocaleTimeString(language.toLowerCase(), {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
      timeZoneName: 'short'
    });
  };

  const formatDate = (dateString: string) => {
    const tz = getTimeZoneForLanguage(language);
    return new Date(dateString).toLocaleDateString(language.toLowerCase(), {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      timeZone: tz
    });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, showSplash, setShowSplash, t, formatTime, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
