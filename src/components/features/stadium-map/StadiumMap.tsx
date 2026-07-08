"use client";

import { useRealtimeCrowd } from '@/hooks/useRealtimeData';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatch } from '@/contexts/MatchContext';
import { isStandClosed, getZoneColor, getBorderColor, getBorderRadius } from '@/lib/stadium-routing';

/**
 * Main 2.5D Stadium Map Component
 * Handles the display of the stadium, live occupancy, routing overlays, and Right Insights panel.
 */
type ZoneData = { id: string; type: string; cx: number; cy: number; w: number; h: number; status: string; occupancy_pct: number; is_closed?: boolean; wait_time_min?: number; name: string; [key: string]: unknown };
type DeploymentUnit = { id: number | string; hex?: string; color?: string; targetId?: string; [key: string]: unknown };
type CrowdData = { total_fans: number; zones: ZoneData[]; [key: string]: unknown };

export function StadiumMap({ compact = false, deployments = [], hoveredZoneId = null, crowdData = null }: { compact?: boolean, deployments?: DeploymentUnit[], hoveredZoneId?: string | null, crowdData?: CrowdData | null }) {
  const { data: realtimeData, loading } = useRealtimeCrowd();
  const { match } = useMatch();
  
  // Use passed mock data or real-time context
  const data = crowdData || realtimeData;
  
  // Default zoom out once for public view (if not compact, scale = 0.8)
  const [scale, setScale] = useState(compact ? 1 : 0.8);
  const [hoveredZone, setHoveredZone] = useState<ZoneData | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  if (loading || !data) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-background border-y border-primary/20 text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }



  // Render small seat blocks for a stand using dense CSS patterns
  const renderSeats = (occupancyPct: number, isClosed?: boolean) => {
    if (isClosed) return null;
    return (
      <div className="absolute inset-1 pointer-events-none overflow-hidden rounded-[inherit] mix-blend-overlay opacity-50">
        {/* Empty Seats (Dark Dots) */}
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle,_rgba(0,0,0,0.2)_1px,_transparent_1px)] bg-[length:4px_4px]" />
        
        {/* Filled Seats (White Dots filling from bottom up) */}
        <div 
          className="absolute bottom-0 left-0 w-full bg-[radial-gradient(circle,_rgba(255,255,255,0.4)_1px,_transparent_1px)] bg-[length:4px_4px] transition-all duration-1000 ease-in-out"
          style={{ height: `${occupancyPct}%` }}
        />
      </div>
    );
  };

  return (
    <section className={`w-full ${compact ? 'py-0 h-full flex flex-col items-center justify-center' : 'pt-4 pb-12 md:pt-8 md:pb-24 bg-transparent min-h-[600px] flex flex-col justify-center'} relative z-10`}>      <div className="absolute top-6 left-6 z-20 flex lg:hidden gap-4">
        <div className="bg-background/90 backdrop-blur-md p-5 rounded-xl border border-primary/20 shadow-xl">
          <h3 className="uppercase tracking-widest text-xs text-foreground/50 mb-2">Live Occupancy</h3>
          <p className="text-4xl font-mono font-black text-primary drop-shadow-[0_0_10px_rgba(0,210,106,0.3)]">{data.total_fans.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 w-full h-full flex items-center justify-between w-full mx-auto ${compact ? 'px-2 lg:px-4' : 'px-2 md:px-4'} mt-16 md:mt-0 relative z-10`}>
        
        {/* Left Insights */}
        <div className={`hidden lg:flex flex-col gap-6 ${compact ? 'w-56' : 'w-72'}`}>

          {/* Live Occupancy (Desktop) */}
          <div className="bg-background/60 backdrop-blur-xl p-6 rounded-[2rem] border border-primary/20 shadow-2xl transition-transform hover:-translate-y-1">
            <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-foreground/50 mb-2">Live Occupancy</h3>
            <p className="text-4xl font-mono font-black text-primary drop-shadow-[0_0_10px_rgba(var(--team-home),0.3)]">{data.total_fans.toLocaleString()}</p>
          </div>

          {/* Weather & Conditions */}
          <div className="bg-background/60 backdrop-blur-xl p-6 rounded-[2rem] border border-primary/20 shadow-2xl transition-transform hover:-translate-y-1">
            <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-foreground/50 mb-4">Live Conditions</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70">External Temp</p>
                <p className="text-2xl font-mono font-black text-white">28°C</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Roof Status</p>
                <p className="text-2xl font-mono font-black text-primary">Closed</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Pitch Humidity</p>
                <p className="text-2xl font-mono font-black text-white">45%</p>
              </div>
            </div>
          </div>
          
          {/* Crowd Sentiment */}
          <div className="bg-background/60 backdrop-blur-xl p-6 rounded-[2rem] border border-primary/20 shadow-2xl transition-transform hover:-translate-y-1">
            <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-foreground/50 mb-4">Vibe Check</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70">Global Sentiment</p>
                <p className="text-2xl font-mono font-black text-accent drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">Electric</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Decibel Peak</p>
                <p className="text-2xl font-mono font-black text-white">114 dB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Down Map Container */}
        <div className="flex-1 h-full flex flex-col items-center justify-center relative z-0 mx-12">
          {/* Stadium Name Label */}
          <div className={`text-center relative z-20 ${compact ? 'mb-20 -mt-16' : 'mb-8 lg:mb-12'}`}>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-primary drop-shadow-[0_0_15px_rgba(0,210,106,0.5)]">{match.venue}</h2>
            <p className="text-xs md:text-sm text-foreground/50 uppercase tracking-[0.4em] mt-2 font-bold">{match.city}</p>
          </div>
          <motion.div 
            ref={mapRef}
            className={`relative ${compact ? 'w-[450px] h-[450px] flex-shrink-0' : 'w-[600px] h-[600px] md:w-[700px] md:h-[700px]'}`}
            animate={{ scale: compact ? 1 : scale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ touchAction: 'none' }}
          >
          {/* Outer Stadium Plaza Glow */}
          <div className="absolute inset-0 bg-primary/5 rounded-[40%] border border-primary/10 shadow-[0_0_100px_rgba(0,210,106,0.1)] pointer-events-none scale-110"></div>

          {/* Zones */}
          {data.zones.map((zone: ZoneData) => {
            const isHovered = hoveredZone?.id === zone.id;
            
            if (zone.type === 'pitch') {
              return (
                <div 
                  key={zone.id}
                  className="absolute flex items-center justify-center pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
                  style={{
                    left: `${zone.cx - zone.w/2}%`, top: `${zone.cy - zone.h/2}%`,
                    width: `${zone.w}%`, height: `${zone.h}%`,
                    backgroundColor: '#1a472a', // Deep grass green
                    border: '2px solid rgba(255,255,255,0.6)',
                  }}
                >
                  {/* Pitch markings */}
                  <div className="absolute w-full h-[2px] bg-white/60 top-1/2 -translate-y-1/2"></div>
                  <div className="absolute w-[20%] aspect-square border-2 border-white/60 rounded-full"></div>
                  <div className="absolute w-2 h-2 bg-white/60 rounded-full"></div>
                  {/* Penalty boxes */}
                  <div className="absolute top-0 w-[50%] h-[15%] border-2 border-t-0 border-white/60"></div>
                  <div className="absolute bottom-0 w-[50%] h-[15%] border-2 border-b-0 border-white/60"></div>
                  {/* 6-yard boxes */}
                  <div className="absolute top-0 w-[20%] h-[5%] border-2 border-t-0 border-white/60"></div>
                  <div className="absolute bottom-0 w-[20%] h-[5%] border-2 border-b-0 border-white/60"></div>
                </div>
              );
            }
            
            if (zone.type === 'stand') {
              // Create the bowl effect: Upper tiers are higher
              const baseZ = zone.id.startsWith('upper') ? 40 : 15;
              const closed = isStandClosed(zone.id, data);
              const isTargetHovered = hoveredZoneId === zone.id;
              
              return (
                <div 
                  key={zone.id}
                  className="absolute border-2 transition-all duration-700 ease-out cursor-pointer flex items-center justify-center"
                  style={{
                    left: `${zone.cx - zone.w/2}%`, top: `${zone.cy - zone.h/2}%`,
                    width: `${zone.w}%`, height: `${zone.h}%`,
                    backgroundColor: getZoneColor(zone.status, zone.occupancy_pct, closed),
                    borderColor: getBorderColor(zone.status, closed, isTargetHovered),
                    borderRadius: getBorderRadius(zone),
                    boxShadow: isTargetHovered 
                      ? 'inset 0 0 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,1)' 
                      : `inset 0 0 20px rgba(0,0,0,0.3), 0 0 ${isHovered ? '30px' : '10px'} ${getZoneColor(zone.status, zone.occupancy_pct, closed)}`,
                    backdropFilter: 'blur(8px)',
                    zIndex: isTargetHovered ? 50 : 10
                  }}
                  onPointerEnter={() => setHoveredZone(zone)}
                  onPointerLeave={() => setHoveredZone(null)}
                  onClick={() => setScale(1.2)}
                >
                  {closed && (
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.8)_10px,rgba(0,0,0,0.8)_20px)] rounded-[inherit] mix-blend-overlay z-10 pointer-events-none"></div>
                  )}
                  {renderSeats(zone.occupancy_pct, closed)}
                  <span 
                    className={`text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] text-center leading-tight z-10 relative px-2 pointer-events-none ${(zone.id.endsWith('_e') || zone.id.endsWith('_w') || zone.id.includes('east') || zone.id.includes('west')) ? 'whitespace-nowrap' : 'overflow-hidden text-ellipsis whitespace-nowrap max-w-full'}`}
                    style={{ transform: (zone.id.endsWith('_e') || zone.id.includes('east')) ? 'rotate(90deg)' : (zone.id.endsWith('_w') || zone.id.includes('west')) ? 'rotate(-90deg)' : 'none' }}
                  >
                    {zone.name.replace(' Stand', '').replace(' Corner', '').replace('Northeast', 'NE').replace('Northwest', 'NW').replace('Southeast', 'SE').replace('Southwest', 'SW')}
                  </span>
                </div>
              );
            }
            
            if (zone.type === 'gate') {
              return (
                <div 
                  key={zone.id}
                  className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center transition-all duration-700 ease-out cursor-pointer"
                  style={{
                    left: `${zone.cx}%`, top: `${zone.cy}%`,
                    backgroundColor: getBorderColor(zone.status, zone.is_closed),
                    transform: `scale(${isHovered ? 1.2 : 1})`,
                    boxShadow: zone.status === 'red' ? '0 0 30px rgba(239,68,68,0.9)' : '0 10px 20px rgba(0,0,0,0.5)'
                  }}
                  onPointerEnter={() => setHoveredZone(zone)}
                  onPointerLeave={() => setHoveredZone(null)}
                >
                  {zone.is_closed && (
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.8)_5px,rgba(0,0,0,0.8)_10px)] rounded-[inherit] mix-blend-overlay z-10 pointer-events-none"></div>
                  )}
                  <div className="w-4 h-4 bg-background rounded-full border-2 border-white/50 relative z-20"></div>
                </div>
              );
            }
          })}
          {/* Smart Routing Lines and Tooltips */}
          <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
              {/* Defs and Routing Lines Removed */}

              {/* Ops Center Rendering */}
              <g>
                <rect x="0" y="106" width="20" height="8" rx="2" fill="rgba(0,0,0,0.8)" stroke="rgba(0, 210, 106, 0.8)" strokeWidth="0.5" />
                <text x="10" y="110" fill="rgba(0, 210, 106, 1)" fontSize="1.8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" letterSpacing="0.2">OPS CENTER</text>
              </g>

              {/* Deployments Animation */}
              {deployments.map((deployment: DeploymentUnit) => {
                const target = data.zones.find((z: ZoneData) => z.id === deployment.targetId);
                if (!target) return null;
                const color = deployment.hex || (deployment.color?.includes('accent') ? '#eab308' : '#00d26a');
                return (
                  <g key={`deploy-${deployment.id}`}>
                    <motion.circle
                      r="1.5"
                      fill={color}
                      className="drop-shadow-[0_0_8px_currentColor]"
                      style={{ color }}
                      animate={{ 
                        cx: [10, target.cx], 
                        cy: [110, target.cy], 
                        opacity: [1, 0] 
                      }}
                      transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                    />
                    <motion.path 
                      d={`M 10 110 L ${target.cx} ${target.cy}`}
                      stroke={color}
                      strokeWidth="0.5"
                      strokeDasharray="1 2"
                      fill="none"
                      opacity="0.3"
                    />
                  </g>
                );
              })}
            </svg>

            {/* HTML Layer for tooltips Removed */}
          </div>
        </motion.div>
      </div>

        {/* Right Insights */}
        <div className={`hidden lg:flex flex-col gap-6 ${compact ? 'w-56' : 'w-72'}`}>
          {/* Operations */}
          <div className="bg-background/60 backdrop-blur-xl p-6 rounded-[2rem] border border-primary/20 shadow-2xl transition-transform hover:-translate-y-1">
            <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-foreground/50 mb-4">Operations</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70">Active Staff</p>
                <p className="text-2xl font-mono font-black text-white">1,240</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Medical Incidents</p>
                <p className="text-2xl font-mono font-black text-primary">0</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Security Alerts</p>
                <p className="text-2xl font-mono font-black text-primary">Normal</p>
              </div>
            </div>
          </div>
          
          {/* Commercial */}
          <div className="bg-background/60 backdrop-blur-xl p-6 rounded-[2rem] border border-primary/20 shadow-2xl transition-transform hover:-translate-y-1">
            <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-foreground/50 mb-4">Commercial</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70">Merch Sales</p>
                <p className="text-2xl font-mono font-black text-white">+34% <span className="text-xs text-foreground/40 font-sans tracking-normal font-normal">vs avg</span></p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">F&B Orders/min</p>
                <p className="text-2xl font-mono font-black text-white">420</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Hover Info Panel */}
      <AnimatePresence>
        {hoveredZone && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-xl border border-primary/40 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 min-w-[320px] md:min-w-[600px] pointer-events-none"
          >
            <h3 className="text-2xl font-black uppercase tracking-widest mb-4 border-b border-primary/20 pb-2">{hoveredZone.name}</h3>
            
            {(() => {
              // Deterministic simulated live data based on occupancy
              const acoustic = Math.floor(75 + (hoveredZone.occupancy_pct * 0.4));
              const temp = Math.floor(20 + (hoveredZone.occupancy_pct * 0.05));
              const fnbWait = Math.floor(2 + (hoveredZone.occupancy_pct * 0.15));
              const isStand = hoveredZone.type === 'stand';

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-foreground/50 uppercase tracking-[0.2em] mb-1">Occupancy</p>
                    <p className={`text-3xl font-mono font-bold ${hoveredZone.status === 'red' ? 'text-danger' : hoveredZone.status === 'amber' ? 'text-accent' : 'text-primary'}`}>
                      {hoveredZone.occupancy_pct}%
                    </p>
                  </div>
                  {hoveredZone.wait_time_min !== undefined && (
                    <div>
                      <p className="text-xs text-foreground/50 uppercase tracking-[0.2em] mb-1">Entry Wait</p>
                      <p className="text-3xl font-mono font-bold text-foreground">{hoveredZone.wait_time_min} <span className="text-sm">min</span></p>
                    </div>
                  )}
                  {isStand && (
                    <>
                      <div>
                        <p className="text-xs text-foreground/50 uppercase tracking-[0.2em] mb-1">Acoustics</p>
                        <p className="text-3xl font-mono font-bold text-foreground">{acoustic} <span className="text-sm">dB</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 uppercase tracking-[0.2em] mb-1">Temp</p>
                        <p className="text-3xl font-mono font-bold text-foreground">{temp}° <span className="text-sm">C</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 uppercase tracking-[0.2em] mb-1">F&B Wait</p>
                        <p className="text-3xl font-mono font-bold text-foreground">{fnbWait} <span className="text-sm">min</span></p>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
