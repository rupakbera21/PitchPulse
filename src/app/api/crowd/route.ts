import { NextResponse } from 'next/server';
import { simulateCrowdUpdate, initialCrowdState } from '@/services/crowdSim';

let crowdState = initialCrowdState;
let lastUpdateTime = Date.now();

export async function GET() {
  const now = Date.now();
  
  // Simulate crowd movement every 5 seconds
  if (now - lastUpdateTime > 5000) {
    crowdState = simulateCrowdUpdate(crowdState);
    lastUpdateTime = now;
  }

  return NextResponse.json(crowdState);
}

export async function POST(req: Request) {
  try {
    const { gateId, action } = await req.json();
    
    if (action === 'match_over') {
      crowdState.match_status = crowdState.match_status === 'over' ? 'ongoing' : 'over';
      return NextResponse.json({ success: true, state: crowdState });
    }

    // Find the gate and update it manually
    const gateIndex = crowdState.zones.findIndex((z: any) => z.id === gateId);
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
      let busiest = crowdState.zones.find((z:any) => z.id.startsWith('gate')) || crowdState.zones[4];
      crowdState.zones.forEach((z:any) => {
        if (z.type === 'gate' && z.occupancy_pct > busiest.occupancy_pct && !z.is_closed) busiest = z;
      });
      crowdState.busiest_gate = busiest.name;
    }
    
    return NextResponse.json({ success: true, state: crowdState });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update gate' }, { status: 500 });
  }
}
