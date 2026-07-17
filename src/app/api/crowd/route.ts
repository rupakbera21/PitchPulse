import { NextResponse } from 'next/server';
import { simulateCrowdUpdate, initialCrowdState } from '@/services/crowdSim';
import { CrowdState, CrowdZone } from '@/lib/types';

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
      const updatedZones = newZonesData.map((z: Partial<CrowdZone>) => {
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
        (sum: number, z: CrowdZone) => sum + Math.round(((z.capacity ?? 1000) * z.occupancy_pct) / 100),
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

    if (action === 'deploy_squad' && gateId) {
      // Here gateId actually represents targetZoneId from the deployment
      const targetZoneId = gateId;
      const targetZone = crowdState.zones.find(z => z.id === targetZoneId);
      
      if (targetZone && targetZone.occupancy_pct > 60) {
        const originalOccupancy = targetZone.occupancy_pct;
        const targetDrop = 30; // drop occupancy by 30%
        const newOccupancy = Math.max(30, originalOccupancy - targetDrop);
        const diffOccupancy = originalOccupancy - newOccupancy;
        
        targetZone.occupancy_pct = newOccupancy;
        targetZone.status = newOccupancy > 80 ? 'red' : (newOccupancy > 50 ? 'amber' : 'low');

        // Redistribute to other available zones of the same type under 60%
        const otherZones = crowdState.zones.filter(z => z.id !== targetZoneId && z.type === targetZone.type && !z.is_closed && z.occupancy_pct < 60);
        if (otherZones.length > 0) {
          const splitDiff = diffOccupancy / otherZones.length;
          otherZones.forEach(oz => {
            oz.occupancy_pct = Math.min(100, Math.round(oz.occupancy_pct + splitDiff));
            oz.status = oz.occupancy_pct > 80 ? 'red' : (oz.occupancy_pct > 50 ? 'amber' : 'low');
          });
        }
      }
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
