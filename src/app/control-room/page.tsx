"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRealtimeCrowd } from '@/hooks/useRealtimeData';
import { Activity, ShieldAlert, Users, Clock, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchSwitcher } from '@/components/features/navigation/MatchSwitcher';
import { StadiumMap } from '@/components/features/stadium-map/StadiumMap';

export default function ControlRoom() {
  const router = useRouter();
  const { data: crowdData, loading: crowdLoading } = useRealtimeCrowd();
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [generatingAlerts, setGeneratingAlerts] = useState(false);
  const [aiLatency, setAiLatency] = useState<number | null>(null);
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<number>>(new Set());
  const [optimisticGates, setOptimisticGates] = useState<Record<string, boolean>>({});
  
  const [activeCamera, setActiveCamera] = useState<number | null>(null);
  const [deployingUnitId, setDeployingUnitId] = useState<number | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  
  const [staffUnits, setStaffUnits] = useState([
    { id: 1, team: 'Medical Unit Alpha', status: 'Available', color: 'text-blue-400', hex: '#60a5fa', eta: null as string | null },
    { id: 2, team: 'Security Detail B', status: 'Deployed - East Gate', color: 'text-accent', hex: '#eab308', targetId: 'gate_e', eta: '2m 15s' },
    { id: 3, team: 'Crowd Control Squad', status: 'Available', color: 'text-orange-500', hex: '#f97316', eta: null as string | null },
    { id: 4, team: 'Emergency Maintenance', status: 'Available', color: 'text-purple-400', hex: '#c084fc', eta: null as string | null },
    { id: 5, team: 'Tactical Overwatch', status: 'Available', color: 'text-cyan-400', hex: '#22d3ee', eta: null as string | null }
  ]);

  const toggleStaff = (id: number) => {
    setStaffUnits(prev => prev.map(unit => {
      if (unit.id === id) {
        if (unit.targetId) {
          return { ...unit, status: 'Available', targetId: undefined, eta: null };
        }
      }
      return unit;
    }));
  };

  const confirmDeployment = (unitId: number, targetId: string) => {
    const sectorName = targetId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const mockEta = `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60).toString().padStart(2, '0')}s`;
    
    setStaffUnits(prev => prev.map(unit => {
      if (unit.id === unitId) {
        return { ...unit, status: 'Deployed - ' + sectorName, targetId, eta: mockEta };
      }
      return unit;
    }));
    setDeployingUnitId(null);
    setHoveredZoneId(null);
  };

  const toggleMatchStatus = async () => {
    try {
      await fetch('/api/crowd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'match_over' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const activeDeployments = staffUnits.filter(u => u.targetId);

  // Optimistic Map Rendering for Gates
  let optimisticCrowdData = crowdData;
  if (crowdData && Object.keys(optimisticGates).length > 0) {
    optimisticCrowdData = JSON.parse(JSON.stringify(crowdData));
    optimisticCrowdData.zones.forEach((z: any) => {
      if (z.type === 'gate' && optimisticGates[z.id] !== undefined) {
        z.is_closed = optimisticGates[z.id];
        z.status = optimisticGates[z.id] ? 'red' : 'low';
      }
    });
  }

  // Poll for AI Alerts
  useEffect(() => {
    if (!crowdData) return;
    
    const fetchAlerts = async () => {
      setGeneratingAlerts(true);
      const startTime = performance.now();
      try {
        const res = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crowdState: crowdData })
        });
        const result = await res.json();
        const endTime = performance.now();
        setAiLatency(Math.round(endTime - startTime));
        if (result.alerts) {
          setAlerts(prev => {
            const newAlerts = [...result.alerts.map((a: string, i: number) => ({ id: Date.now() + i, text: a })), ...prev].slice(0, 5);
            return newAlerts;
          });
        }
      } catch (err) {
        console.error(err);
      }
      setGeneratingAlerts(false);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Every 15s for the demo
    return () => clearInterval(interval);
  }, [crowdData]);

  // Handle Gate Override
  const overrideGate = async (gateId: string, action: 'open' | 'close') => {
    // Optimistic UI update for instant feedback
    setOptimisticGates(prev => ({ ...prev, [gateId]: action === 'close' }));
    
    try {
      await fetch('/api/crowd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateId, action })
      });
      // The useRealtimeCrowd hook will catch the permanent update on the next poll
    } catch (e) {
      console.error(e);
      // Revert optimistic update on failure
      setOptimisticGates(prev => {
        const next = { ...prev };
        delete next[gateId];
        return next;
      });
    }
  };

  const resolveAlert = (id: number) => {
    const newSet = new Set(resolvedAlerts);
    newSet.add(id);
    setResolvedAlerts(newSet);
  };

  return (
    <div className="min-h-screen p-6 font-mono text-sm relative z-0">
      <div className="fixed inset-0 -z-10 moving-gradient-bg" />
      <div className="absolute inset-0 -z-10 bg-background/50 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger via-primary to-danger animate-pulse z-10" />
      
      <header className="flex justify-between items-end mb-8 border-b border-primary/20 pb-4 mt-4 relative z-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">Operations Center</h1>
          <p className="text-foreground/50 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
            Live Deployment • Atlanta
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMatchStatus}
            className="px-4 py-2 border border-danger/50 text-danger bg-danger/10 rounded hover:bg-danger/20 transition-colors uppercase tracking-widest text-xs font-bold"
          >
            Toggle Match Status
          </button>
          <div className="hidden md:block">
            <MatchSwitcher />
          </div>
          <motion.button 
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            Return to Public View
          </motion.button>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-secondary/40 border border-primary/20 p-6 rounded-xl flex items-center gap-4">
          <Users className="text-primary" size={32} />
          <div>
            <p className="text-foreground/50 uppercase tracking-widest text-xs mb-1">Total Attendance</p>
            <p className="text-2xl font-bold">{crowdLoading ? '---' : crowdData?.total_fans.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-secondary/40 border border-danger/40 p-6 rounded-xl flex items-center gap-4">
          <AlertTriangle className="text-danger animate-pulse" size={32} />
          <div>
            <p className="text-foreground/50 uppercase tracking-widest text-xs mb-1">Critical Bottleneck</p>
            <p className="text-2xl font-bold text-danger">{crowdLoading ? '---' : crowdData?.busiest_gate}</p>
          </div>
        </div>
        <div className="bg-secondary/40 border border-primary/20 p-6 rounded-xl flex items-center gap-4">
          <Clock className="text-primary" size={32} />
          <div>
            <p className="text-foreground/50 uppercase tracking-widest text-xs mb-1">System Uptime</p>
            <p className="text-2xl font-bold">99.99%</p>
          </div>
        </div>
        <div className="bg-secondary/40 border border-primary/20 p-6 rounded-xl flex items-center gap-4">
          <Activity className="text-primary" size={32} />
          <div>
            <p className="text-foreground/50 uppercase tracking-widest text-xs mb-1">AI Latency</p>
            <p className="text-2xl font-bold">{aiLatency ? `${aiLatency}ms` : '---'}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Incident Dispatch Panel */}
        <div className="bg-secondary/20 border border-primary/20 rounded-xl p-6 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest">Incident Dispatch</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 uppercase">GenAI Cerebras</span>
              {generatingAlerts && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <AnimatePresence>
              {alerts.map((alert) => {
                const isResolved = resolvedAlerts.has(alert.id);
                return (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isResolved ? 0.5 : 1, x: 0 }}
                    className={`p-4 rounded border ${isResolved ? 'border-primary/20 bg-secondary/10' : 'border-danger/30 bg-danger/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-sm leading-relaxed ${isResolved ? 'line-through text-foreground/50' : 'text-foreground/90'}`}>{alert.text}</p>
                      {!isResolved && (
                        <button onClick={() => resolveAlert(alert.id)} className="shrink-0 p-1 hover:text-primary transition-colors text-foreground/50">
                          <CheckCircle2 size={20} />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-foreground/40 font-mono flex justify-between">
                      <span>ID: {alert.id.toString().slice(-6)}</span>
                      <span>{isResolved ? 'RESOLVED' : 'ACTIVE'}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {alerts.length === 0 && !generatingAlerts && (
              <div className="text-center text-foreground/40 mt-12 uppercase tracking-widest">Awaiting Intel...</div>
            )}
          </div>
        </div>

        {/* Manual Gate Overrides */}
        <div className="bg-secondary/20 border border-primary/20 rounded-xl p-6 h-[500px] overflow-y-auto">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Gate Overrides</h2>
          
          <div className="space-y-4">
            {crowdData?.zones.filter((z:any) => z.type === 'gate').map((gate: any) => {
              const isClosed = optimisticGates[gate.id] !== undefined ? optimisticGates[gate.id] : gate.is_closed;
              return (
                <div key={gate.id} className="p-4 rounded border border-primary/20 bg-background/50 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold uppercase tracking-widest">{gate.name}</h3>
                      <p className={`text-xs mt-1 uppercase ${gate.status === 'red' ? 'text-danger' : gate.status === 'amber' ? 'text-accent' : 'text-primary'}`}>
                        {gate.occupancy_pct}% Occupied • {gate.wait_time_min}m Wait
                      </p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: isClosed ? '0px 0px 10px rgba(0,210,106,0.5)' : '0px 0px 10px rgba(239,68,68,0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => overrideGate(gate.id, isClosed ? 'open' : 'close')}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                        isClosed 
                          ? 'bg-danger text-background border border-danger shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                          : 'bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20'
                      }`}
                    >
                      {isClosed ? 'LOCKED' : 'OPEN'}
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Live Stadium Feed */}
      <div className="mt-8 bg-secondary/20 border border-primary/20 rounded-xl p-6 min-h-[950px] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold uppercase tracking-widest">Live Topographic Routing</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/50 uppercase tracking-widest">Routing Engine</span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,210,106,0.5)]"></span>
            <span className="text-xs text-primary font-bold tracking-widest uppercase">Live Sync</span>
          </div>
        </div>

        <div className="flex-1 relative -mx-6 -mb-6 pb-6 overflow-hidden flex items-center justify-center">
          <StadiumMap compact={true} deployments={activeDeployments} hoveredZoneId={hoveredZoneId} crowdData={optimisticCrowdData} />
        </div>
      </div>

      {/* Row 3: Security & Staffing */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        
        {/* Security Feeds */}
        <div className="bg-secondary/20 border border-primary/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest">Live Security Feeds</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 uppercase tracking-widest">Recording</span>
              <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse"></span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} onClick={() => setActiveCamera(i)} className="relative aspect-video bg-black border border-primary/30 rounded-lg overflow-hidden group cursor-pointer">
                <video preload="auto" autoPlay muted loop playsInline src={`/videos/cam${i}.mp4`} className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale sepia-[0.3] hue-rotate-130 transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/10 mix-blend-color-burn pointer-events-none" />
                
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/80 backdrop-blur px-2 py-1 rounded border border-primary/20 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"></span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-primary">CAM 0{i} • Z-{['A','B','C','VIP'][i-1]}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/60 backdrop-blur-sm transition-opacity z-20">
                  <span className="text-[10px] uppercase font-bold tracking-widest border border-primary px-3 py-1.5 rounded text-primary bg-primary/20">Expand Feed</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded bg-background/50 border border-primary/20 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Live Stadium Analytics</span>
              <span className="text-[10px] text-primary bg-primary/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest animate-pulse">Active</span>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed font-mono">
              Live metrics are currently tracking crowd density and general stadium flow across all sectors. Real-time data streams indicate normal movement patterns with anomalies within acceptable thresholds (Z-A: 64%, Z-B: 42%, Z-C: 81%, Z-VIP: 12%). All stadium operational systems are functioning optimally.
            </p>
          </div>
        </div>

        {/* Staff Deployment */}
        <div className="bg-secondary/20 border border-primary/20 rounded-xl p-6 flex flex-col">
          <h2 className="text-xl font-bold uppercase tracking-widest mb-6">Rapid Response Deployment</h2>
          <div className="flex-1 space-y-3">
            {staffUnits.map((unit) => {
              const isDeployed = unit.status.includes('Deployed');
              return (
                <div key={unit.id} className="p-4 rounded border border-primary/20 bg-background/50 flex flex-col group hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-bold ${unit.color}`}>{unit.team}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-foreground/60">{unit.status}</p>
                        {unit.eta && <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full border border-accent/40 font-mono tracking-widest">ETA: {unit.eta}</span>}
                      </div>
                    </div>
                    {isDeployed ? (
                      <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(239,68,68,0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleStaff(unit.id)}
                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase border border-danger/50 bg-danger/10 text-danger hover:bg-danger/20 transition-all"
                      >
                        Recall
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(0,210,106,0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDeployingUnitId(deployingUnitId === unit.id ? null : unit.id)}
                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                      >
                        {deployingUnitId === unit.id ? 'Cancel' : 'Deploy'}
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Inline Target Selection */}
                  {deployingUnitId === unit.id && !isDeployed && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <p className="text-[10px] uppercase text-foreground/50 tracking-widest mb-2">Select Target Sector</p>
                      <div className="flex flex-wrap gap-2">
                        {crowdData?.zones.filter((z:any) => z.type === 'stand' || z.type === 'gate').map((zone: any) => (
                          <button
                            key={zone.id}
                            onMouseEnter={() => setHoveredZoneId(zone.id)}
                            onMouseLeave={() => setHoveredZoneId(null)}
                            onClick={() => confirmDeployment(unit.id, zone.id)}
                            className="px-2 py-1 bg-background border border-primary/30 hover:border-primary hover:bg-primary/20 text-primary rounded text-[9px] font-mono tracking-widest transition-colors uppercase"
                          >
                            {zone.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {activeCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
          >
            <div className="w-full max-w-5xl bg-black border border-primary/30 rounded-xl overflow-hidden shadow-2xl relative aspect-video">
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-2 rounded border border-primary/20 z-10">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
                <span className="text-xs font-mono uppercase tracking-widest text-foreground">LIVE • CAM 0{activeCamera} • SECTOR {['A','B','C','VIP'][activeCamera-1]}</span>
              </div>
              <button onClick={() => setActiveCamera(null)} className="absolute top-4 right-4 z-10 p-2 bg-background/80 rounded hover:bg-danger/20 hover:text-danger transition-colors">
                <XCircle size={24} />
              </button>
              {/* Real video feed */}
              <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
                 <video preload="auto" autoPlay muted loop playsInline src={`/videos/cam${activeCamera}.mp4`} className="w-full h-full object-cover grayscale opacity-90 sepia-[0.2] hue-rotate-[130deg]" />
                 
                 {/* Technical Grid Overlay */}
                 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDAsIDIxMCwgMTA2LCAwLjE1KSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCAwdjQwaDQwdi00MHoiLz48L2c+PC9zdmc+')] pointer-events-none opacity-50 mix-blend-screen" />
                 
                 {/* Live Timestamp overlay */}
                 <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur border border-primary/20 px-4 py-2 rounded text-primary font-mono text-xs tracking-widest">
                   {new Date().toLocaleTimeString()} • REAL-TIME FEED
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
