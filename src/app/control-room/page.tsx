"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRealtimeCrowd } from '@/hooks/useRealtimeData';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchSwitcher } from '@/components/features/navigation/MatchSwitcher';
import { StadiumMap } from '@/components/features/stadium-map/StadiumMap';
import { APP_CONFIG } from '@/lib/constants';

import { AnalyticsPanel } from '@/components/features/control-room/AnalyticsPanel';
import { ControlRoomAlerts } from '@/components/features/control-room/ControlRoomAlerts';
import { GateOverrides } from '@/components/features/control-room/GateOverrides';
import { CameraFeeds } from '@/components/features/control-room/CameraFeeds';
import { StaffDeployment, StaffUnit } from '@/components/features/control-room/StaffDeployment';

export default function ControlRoom() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { data: crowdData, loading: crowdLoading } = useRealtimeCrowd();
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [generatingAlerts, setGeneratingAlerts] = useState(false);
  const [aiLatency, setAiLatency] = useState<number | null>(null);
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<number>>(new Set());
  const [optimisticGates, setOptimisticGates] = useState<Record<string, boolean>>({});
  
  const [activeCamera, setActiveCamera] = useState<number | null>(null);
  const [deployingUnitId, setDeployingUnitId] = useState<number | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  
  const [staffUnits, setStaffUnits] = useState<StaffUnit[]>([
    { id: 1, team: 'Medical Unit Alpha', status: 'Available', color: 'text-blue-400', hex: '#60a5fa', eta: null },
    { id: 2, team: 'Security Detail B', status: 'Deployed - East Gate', color: 'text-accent', hex: '#eab308', targetId: 'gate_e', eta: '2m 15s' },
    { id: 3, team: 'Crowd Control Squad', status: 'Available', color: 'text-orange-500', hex: '#f97316', eta: null },
    { id: 4, team: 'Emergency Maintenance', status: 'Available', color: 'text-purple-400', hex: '#c084fc', eta: null },
    { id: 5, team: 'Tactical Overwatch', status: 'Available', color: 'text-cyan-400', hex: '#22d3ee', eta: null }
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

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_CONFIG.ADMIN_ACCESS_CODE) setIsAuthenticated(true);
    else alert('Incorrect password');
  };

  // Poll for AI Alerts
  useEffect(() => {
    if (!isAuthenticated || !crowdData) return;
    
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
    const interval = setInterval(fetchAlerts, APP_CONFIG.ALERTS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, crowdData]);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden z-0">
        <div className="fixed inset-0 -z-10 moving-gradient-bg" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-danger/20 via-transparent to-transparent pointer-events-none" />
        
        <form onSubmit={handleLogin} className="relative z-10 w-full max-w-md bg-secondary/80 backdrop-blur border border-primary/20 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6 text-primary">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-center mb-2">Control Room</h1>
          <p className="text-foreground/50 text-center mb-6 uppercase tracking-widest text-xs">Authorized Personnel Only</p>
          
          <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-center shadow-[inset_0_0_15px_rgba(0,210,106,0.1)]">
            <p className="text-[10px] text-primary/80 font-mono uppercase tracking-widest mb-1">Prototype Access Code</p>
            <p className="text-lg font-bold font-mono tracking-[0.2em] text-primary select-all">admin2026</p>
          </div>

          <input 
            type="password"
            placeholder="ACCESS CODE"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-primary/30 rounded px-4 py-3 mb-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary font-mono"
          />
          <button type="submit" className="w-full bg-primary hover:bg-primary/80 text-background font-bold uppercase tracking-widest py-3 rounded transition-colors">
            Initialize
          </button>
        </form>
      </div>
    );
  }

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
      <AnalyticsPanel crowdLoading={crowdLoading} crowdData={crowdData} aiLatency={aiLatency} />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Incident Dispatch Panel */}
        <ControlRoomAlerts 
          alerts={alerts}
          generatingAlerts={generatingAlerts}
          resolvedAlerts={resolvedAlerts}
          resolveAlert={resolveAlert}
        />

        {/* Manual Gate Overrides */}
        <GateOverrides 
          crowdData={crowdData}
          optimisticGates={optimisticGates}
          overrideGate={overrideGate}
        />
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
        <CameraFeeds activeCamera={activeCamera} setActiveCamera={setActiveCamera} />

        {/* Staff Deployment */}
        <StaffDeployment 
          staffUnits={staffUnits}
          toggleStaff={toggleStaff}
          deployingUnitId={deployingUnitId}
          setDeployingUnitId={setDeployingUnitId}
          setHoveredZoneId={setHoveredZoneId}
          confirmDeployment={confirmDeployment}
          crowdData={crowdData}
        />
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
                <ShieldAlert size={24} />
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
