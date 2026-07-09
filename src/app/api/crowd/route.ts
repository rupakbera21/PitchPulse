import { NextResponse } from 'next/server';
import { simulateCrowdUpdate, initialCrowdState, STADIUM_ZONES_CONFIG } from '@/services/crowdSim';

type CrowdZone = typeof STADIUM_ZONES_CONFIG[0] & { is_closed?: boolean };
type CrowdState = {
  total_fans: number;
  busiest_gate: string;
  match_status: string;
  zones: CrowdZone[];
};

let crowdState: CrowdState = initialCrowdState as CrowdState;
let lastUpdateTime = Date.now();

export async function GET() {
  const now = Date.now();
  
  // Simulate crowd movement every 5 seconds
  if (now - lastUpdateTime > 5000) {
    crowdState = simulateCrowdUpdate(crowdState) as CrowdState;
    lastUpdateTime = now;
  }

  return NextResponse.json(crowdState);
}

export async function POST(req: Request) {
  try {
    const { gateId, action, newZonesData } = await req.json();
    
    if (action === 'upload') {
      if (!Array.isArray(newZonesData)) {
        return NextResponse.json({ error: 'Invalid data format. Expected an array of zones.' }, { status: 400 });
      }

      // Re-map and validate schema to ensure no runtime errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedZones = newZonesData.map((z: any) => {
        const existingZone = crowdState.zones.find((ez) => ez.id === z.id) || ({} as Partial<CrowdZone>);
        return {
          cx: 0,
          cy: 0,
          ...existingZone,
          id: String(z.id || ''),
          name: String(z.name || existingZone.name || ''),
          type: String(z.type || existingZone.type || 'stand'),
          occupancy_pct: Math.min(100, Math.max(0, Number(z.occupancy_pct ?? 0))),
          wait_time_min: Math.max(0, Number(z.wait_time_min ?? 0)),
          status: String(z.status || 'low'),
          capacity: Math.max(1, Number(z.capacity ?? 1000)),
          is_closed: Boolean(z.is_closed ?? false)
        } as unknown as CrowdZone;
      });

      // Override the server-side simulation state
      crowdState.zones = updatedZones;
      
      // Recalculate total_fans based on capacities and occupancies
      crowdState.total_fans = updatedZones.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, z: any) => sum + Math.round((z.capacity * z.occupancy_pct) / 100),
        0
      );

      // Recalculate busiest_gate
      let busiest = crowdState.zones.find((z) => z.id.startsWith('gate')) || crowdState.zones[4];
      crowdState.zones.forEach((z) => {
        if (z.type === 'gate' && z.occupancy_pct > busiest.occupancy_pct && !z.is_closed) {
          busiest = z;
        }
      });
      crowdState.busiest_gate = busiest.name;

      return NextResponse.json({ success: true, state: crowdState });
    }

    if (action === 'match_over') {
      crowdState.match_status = crowdState.match_status === 'over' ? 'ongoing' : 'over';
      return NextResponse.json({ success: true, state: crowdState });
    }

    // Find the gate and update it manually
    const gateIndex = crowdState.zones.findIndex((z) => z.id === gateId);
    if (gateIndex !== -1) {
      if (action === 'close') {
        crowdState.zones[gateIndex].status = 'red';
        crowdState.zones[gateIndex].occupancy_pct = 100;
        crowdState.zones[gateIndex].wait_time_min = 45;
        crowdState.zones[gateIndex].is_closed = true;
      } else if (action === 'open') {
        crowdState.zones[gateIndex].status = 'low';
        crowdState.zones[gateIndex].occupancy_pct = 10;
        crowdState.zones[gateIndex].wait_time_min = 2;
        crowdState.zones[gateIndex].is_closed = false;
      }
      
      // Force an update to the busiest gate logic if needed
      let busiest = crowdState.zones.find((z) => z.id.startsWith('gate')) || crowdState.zones[4];
      crowdState.zones.forEach((z) => {
        if (z.type === 'gate' && z.occupancy_pct > busiest.occupancy_pct && !z.is_closed) busiest = z;
      });
      crowdState.busiest_gate = busiest.name;
    }
    
    return NextResponse.json({ success: true, state: crowdState });
  } catch (error) {
    console.error("Failed to update crowd state", error);
    return NextResponse.json({ error: 'Failed to update gate' }, { status: 500 });
  }
}
