import { render, screen } from '@testing-library/react';
import { AlertFeed } from '../src/components/features/control-room/AlertFeed';
import React from 'react';

describe('AlertFeed Component', () => {
  it('renders a list of alerts correctly', () => {
    const alerts = [
      { id: '1', text: 'Crowd surging at gate' },
      { id: '2', text: 'All clear' }
    ];

    render(<AlertFeed alerts={alerts} resolvedAlerts={new Set()} onResolve={() => {}} />);
    
    expect(screen.getByText('Crowd surging at gate')).toBeInTheDocument();
    expect(screen.getByText('All clear')).toBeInTheDocument();
  });
  
  it('renders a fallback message when no alerts are present', () => {
    render(<AlertFeed alerts={[]} resolvedAlerts={new Set()} onResolve={() => {}} />);
    expect(screen.getByText('Awaiting AI analysis...')).toBeInTheDocument();
  });
});
