import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ControlRoomAlertsProps {
  alerts: any[];
  generatingAlerts: boolean;
  resolvedAlerts: Set<number>;
  resolveAlert: (id: number) => void;
}

export function ControlRoomAlerts({ alerts, generatingAlerts, resolvedAlerts, resolveAlert }: ControlRoomAlertsProps) {
  return (
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
  );
}
