import { motion } from 'framer-motion';

interface GateOverridesProps {
  crowdData: any;
  optimisticGates: Record<string, boolean>;
  overrideGate: (gateId: string, action: 'open' | 'close') => void;
}

export function GateOverrides({ crowdData, optimisticGates, overrideGate }: GateOverridesProps) {
  return (
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
  );
}
