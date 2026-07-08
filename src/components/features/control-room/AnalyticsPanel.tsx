import { Users, AlertTriangle, Clock, Activity } from 'lucide-react';

interface AnalyticsPanelProps {
  crowdLoading: boolean;
  crowdData: any;
  aiLatency: number | null;
}

export function AnalyticsPanel({ crowdLoading, crowdData, aiLatency }: AnalyticsPanelProps) {
  return (
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
  );
}
