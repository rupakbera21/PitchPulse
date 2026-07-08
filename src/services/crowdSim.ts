export const STADIUM_ZONES_CONFIG = [
  // Pitch
  { id: 'pitch', name: 'The Pitch', type: 'pitch', cx: 50, cy: 50, w: 40, h: 60, status: 'low', occupancy_pct: 0 },
  
  // Lower Tiers
  { id: 'lower_n', name: 'Lower North', type: 'stand', cx: 50, cy: 15, w: 40, h: 10, status: 'low', occupancy_pct: 30 },
  { id: 'lower_s', name: 'Lower South', type: 'stand', cx: 50, cy: 85, w: 40, h: 10, status: 'low', occupancy_pct: 35 },
  { id: 'lower_e', name: 'Lower East', type: 'stand', cx: 75, cy: 50, w: 10, h: 60, status: 'low', occupancy_pct: 40 },
  { id: 'lower_w', name: 'Lower West (VIP)', type: 'stand', cx: 25, cy: 50, w: 10, h: 60, status: 'low', occupancy_pct: 20 },
  
  // Upper Tiers
  { id: 'upper_n', name: 'Upper North', type: 'stand', cx: 50, cy: 3, w: 50, h: 14, status: 'low', occupancy_pct: 60 },
  { id: 'upper_s', name: 'Upper South', type: 'stand', cx: 50, cy: 97, w: 50, h: 14, status: 'amber', occupancy_pct: 75 },
  { id: 'upper_e', name: 'Upper East', type: 'stand', cx: 90, cy: 50, w: 16, h: 70, status: 'amber', occupancy_pct: 80 },
  { id: 'upper_w', name: 'Upper West', type: 'stand', cx: 10, cy: 50, w: 16, h: 70, status: 'low', occupancy_pct: 50 },
  
  // Corners
  { id: 'corner_ne', name: 'Northeast Corner', type: 'stand', cx: 83, cy: 11, w: 15, h: 15, status: 'low', occupancy_pct: 45 },
  { id: 'corner_nw', name: 'Northwest Corner', type: 'stand', cx: 17, cy: 11, w: 15, h: 15, status: 'low', occupancy_pct: 40 },
  { id: 'corner_se', name: 'Southeast Corner', type: 'stand', cx: 83, cy: 89, w: 15, h: 15, status: 'amber', occupancy_pct: 70 },
  { id: 'corner_sw', name: 'Southwest Corner', type: 'stand', cx: 17, cy: 89, w: 15, h: 15, status: 'low', occupancy_pct: 55 },

  // Gates
  { id: 'gate_n', name: 'North Gate', type: 'gate', cx: 50, cy: -8, status: 'low', occupancy_pct: 20, wait_time_min: 2 },
  { id: 'gate_s', name: 'South Gate', type: 'gate', cx: 50, cy: 108, status: 'red', occupancy_pct: 95, wait_time_min: 25 },
  { id: 'gate_e', name: 'East Gate', type: 'gate', cx: 103, cy: 50, status: 'low', occupancy_pct: 40, wait_time_min: 5 },
  { id: 'gate_w', name: 'West Gate', type: 'gate', cx: -3, cy: 50, status: 'amber', occupancy_pct: 75, wait_time_min: 15 },
];

export const initialCrowdState = {
  total_fans: 68500,
  busiest_gate: 'South Gate',
  match_status: 'ongoing',
  zones: STADIUM_ZONES_CONFIG
};

type CrowdZone = { id: string; type: string; occupancy_pct: number; status: string; is_closed?: boolean; wait_time_min?: number; name: string; [key: string]: unknown; };
type CrowdState = { zones: CrowdZone[]; match_status: string; total_fans: number; busiest_gate: string; [key: string]: unknown; };

export function simulateCrowdUpdate(currentState: CrowdState) {
  let busiestGate = currentState.zones.find((z) => z.id.startsWith('gate')) || currentState.zones[4];
  
  const newZones = currentState.zones.map((zone: CrowdZone) => {
    if (zone.type === 'pitch') return zone; // pitch doesn't change

    // Determine occupancy delta
    let diff = Math.floor(Math.random() * 15) - 5;
    if (currentState.match_status === 'over') {
      diff = -(Math.floor(Math.random() * 10) + 5); // Rapid drain between -5% and -15%
    }
    if (zone.is_closed) {
      diff = 0; // Frozen if closed
    }

    const newPct = Math.max(0, Math.min(100, zone.occupancy_pct + diff));
    
    const newZone = { ...zone, occupancy_pct: newPct, is_closed: zone.is_closed };
    
    if (newZone.type === 'gate') {
      newZone.wait_time_min = Math.floor(newPct / 4);
    }

    if (newPct < 50) newZone.status = 'low';
    else if (newPct < 85) newZone.status = 'amber';
    else newZone.status = 'red';
    
    if (newZone.type === 'gate' && newZone.occupancy_pct > busiestGate.occupancy_pct && !newZone.is_closed) {
      busiestGate = newZone;
    }
    return newZone;
  });
  
  let newTotalFans = currentState.total_fans;
  if (currentState.match_status === 'over') {
    newTotalFans = Math.max(0, newTotalFans - (Math.floor(Math.random() * 2000) + 500));
  } else {
    newTotalFans = currentState.total_fans + (Math.floor(Math.random() * 500) - 100);
  }
  
  return {
    ...currentState,
    total_fans: newTotalFans,
    busiest_gate: busiestGate.name,
    zones: newZones
  };
}
