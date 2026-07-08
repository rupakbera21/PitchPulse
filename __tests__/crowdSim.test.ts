import test from 'node:test';
import assert from 'node:assert';
import { simulateCrowdUpdate } from '../src/services/crowdSim.ts';

test('Crowd Simulation Updates Correctly', (t) => {
  const initialState = {
    total_fans: 10000,
    busiest_gate: 'Gate 1',
    zones: [
      { id: 'gate_1', name: 'Gate 1', type: 'gate', occupancy_pct: 10, status: 'low' },
      { id: 'gate_2', name: 'Gate 2', type: 'gate', occupancy_pct: 90, status: 'red' },
    ]
  };

  const newState = simulateCrowdUpdate(initialState);
  
  // Total fans should change slightly
  assert.notStrictEqual(newState.total_fans, 10000);
  
  // Occupancy should remain within 0-100 bounds
  newState.zones.forEach((zone: any) => {
    assert.ok(zone.occupancy_pct >= 0 && zone.occupancy_pct <= 100);
  });
  
  // Wait times should be calculated for gates
  newState.zones.forEach((zone: any) => {
    if (zone.type === 'gate') {
      assert.ok(zone.wait_time_min !== undefined);
      assert.strictEqual(zone.wait_time_min, Math.floor(zone.occupancy_pct / 4));
    }
  });

  // Busiest gate should correctly point to the highest gate
  const expectedBusiest = [...newState.zones].sort((a,b) => b.occupancy_pct - a.occupancy_pct)[0];
  assert.strictEqual(newState.busiest_gate, expectedBusiest.name);
});
