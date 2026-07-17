import { render, screen } from '@testing-library/react';
import { KPISummaryStrip } from '../src/components/features/control-room/KPISummaryStrip';
import React from 'react';

describe('KPISummaryStrip Component', () => {
  it('renders KPI values from realtime data', () => {
    render(<KPISummaryStrip totalFans={50000} busiestGate="Gate North" />);
    
    expect(screen.getByText('Total Attendance')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
    
    expect(screen.getByText('Critical Bottleneck')).toBeInTheDocument();
    expect(screen.getByText('Gate North')).toBeInTheDocument();
  });
});
