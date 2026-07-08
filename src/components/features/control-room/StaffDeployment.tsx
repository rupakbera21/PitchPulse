import { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';

export interface StaffUnit {
  id: number;
  team: string;
  status: string;
  color: string;
  hex: string;
  eta: string | null;
  targetId?: string;
}

interface StaffDeploymentProps {
  staffUnits: StaffUnit[];
  toggleStaff: (id: number) => void;
  deployingUnitId: number | null;
  setDeployingUnitId: Dispatch<SetStateAction<number | null>>;
  setHoveredZoneId: Dispatch<SetStateAction<string | null>>;
  confirmDeployment: (unitId: number, targetId: string) => void;
  crowdData: any;
}

export function StaffDeployment({
  staffUnits,
  toggleStaff,
  deployingUnitId,
  setDeployingUnitId,
  setHoveredZoneId,
  confirmDeployment,
  crowdData,
}: StaffDeploymentProps) {
  return (
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
  );
}
