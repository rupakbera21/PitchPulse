/**
 * Stadium Routing and Mapping Utility
 * Separates heavy UI calculations from the component layer.
 */

type CrowdZone = { id: string; type: string; is_closed?: boolean; [key: string]: unknown };
type CrowdState = { zones: CrowdZone[] } | null | undefined;

export const isStandClosed = (zoneId: string, crowdData: CrowdState) => {
  const zone = crowdData?.zones?.find((z) => z.id === zoneId);
  if (zone?.is_closed) return true;
  
  if (zoneId.includes('_n') && crowdData?.zones?.find((z) => z.id === 'gate_n')?.is_closed) return true;
  if (zoneId.includes('_s') && crowdData?.zones?.find((z) => z.id === 'gate_s')?.is_closed) return true;
  if (zoneId.includes('_e') && crowdData?.zones?.find((z) => z.id === 'gate_e')?.is_closed) return true;
  if (zoneId.includes('_w') && crowdData?.zones?.find((z) => z.id === 'gate_w')?.is_closed) return true;
  
  return false;
};

export const getZoneColor = (status: string, occupancy: number, isClosed?: boolean) => {
  if (isClosed) return `rgba(80, 80, 80, 0.6)`; // Greyed out
  const opacity = Math.max(0.3, (occupancy / 100) * 0.9);
  if (status === 'red') return `rgba(239, 68, 68, ${opacity})`;
  if (status === 'amber') return `rgba(234, 179, 8, ${opacity})`;
  return `rgba(0, 210, 106, ${opacity})`;
};

export const getBorderColor = (status: string, isClosed?: boolean, isTargetHovered?: boolean) => {
  if (isTargetHovered) return 'rgba(255, 255, 255, 1)';
  if (isClosed) return 'rgba(120, 120, 120, 1)';
  if (status === 'red') return 'rgba(239, 68, 68, 0.8)';
  if (status === 'amber') return 'rgba(234, 179, 8, 0.8)';
  return 'rgba(0, 210, 106, 0.8)';
};

// Determine curved corners based on stand position
export const getBorderRadius = (zone: CrowdZone) => {
  if (zone.id.includes('north') || zone.id.includes('_n')) return '40% 40% 10% 10%';
  if (zone.id.includes('south') || zone.id.includes('_s')) return '10% 10% 40% 40%';
  if (zone.id.includes('east') || zone.id.includes('_e')) return '10% 40% 40% 10%';
  if (zone.id.includes('west') || zone.id.includes('_w')) return '40% 10% 10% 40%';
  return '20px';
};
