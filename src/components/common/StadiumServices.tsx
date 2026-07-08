"use client";

import { motion } from 'framer-motion';
import { Utensils, Droplets, ShoppingBag, ChevronRight } from 'lucide-react';

import { useMatch } from '@/contexts/MatchContext';

export function StadiumServices() {
  const { match } = useMatch();
  
  const SERVICES = [
    {
      id: 1,
      title: "Express Food",
      icon: <Utensils size={24} />,
      status: "good",
      metric: "3 min",
      desc: "Find top-rated concessions and fast food options near the stadium.",
      color: "text-primary",
      actionUrl: `https://www.google.com/maps/search/food+near+${encodeURIComponent(match.venue)}`
    },
    {
      id: 2,
      title: "Restrooms",
      icon: <Droplets size={24} />,
      status: "warn",
      metric: "8 min",
      desc: "Locate the nearest restrooms and public facilities around the venue.",
      color: "text-accent",
      actionUrl: `https://www.google.com/maps/search/restrooms+near+${encodeURIComponent(match.venue)}`
    },
    {
      id: 3,
      title: "Merch Drop",
      icon: <ShoppingBag size={24} />,
      status: "alert",
      metric: "LIVE NOW",
      desc: "Shop exclusive official FIFA World Cup merchandise online.",
      color: "text-danger",
      actionUrl: "https://store.fifa.com/"
    }
  ];

  return (
    <section className="py-24 border-t border-primary/20 relative z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
              Live Services
            </h2>
            <p className="text-foreground/50 uppercase tracking-widest text-sm mt-2">Real-time facility status & Locations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <motion.a
              key={service.id}
              href={service.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-secondary/30 backdrop-blur-md border border-primary/20 rounded-2xl p-6 flex flex-col hover:border-primary/80 hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,210,106,0.2)] active:scale-95 active:bg-white/20 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-3 rounded-xl bg-background border border-primary/10 ${service.color}`}>
                  {service.icon}
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xl font-black tracking-tighter ${service.color}`}>
                    {service.metric}
                  </span>
                  <span className="text-[10px] text-foreground/50 uppercase tracking-widest">
                    {service.status === 'good' ? 'Wait Time' : service.status === 'warn' ? 'Est. Wait' : 'Status'}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed mb-6 flex-1">
                {service.desc}
              </p>
              
              <div className="w-full mt-auto flex items-center justify-between pt-4 border-t border-primary/10 group-hover:bg-white/5 p-2 -mx-2 rounded transition-colors group/nav">
                <span className="text-xs uppercase tracking-widest font-semibold text-foreground/50 group-hover/nav:text-foreground transition-colors">
                  Tap to Navigate
                </span>
                <ChevronRight size={16} className="text-foreground/30 group-hover/nav:text-primary transition-colors group-hover:translate-x-1" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
