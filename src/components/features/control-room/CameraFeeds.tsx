import { Dispatch, SetStateAction } from 'react';

interface CameraFeedsProps {
  activeCamera: number | null;
  setActiveCamera: Dispatch<SetStateAction<number | null>>;
}

export function CameraFeeds({ activeCamera, setActiveCamera }: CameraFeedsProps) {
  return (
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
  );
}
