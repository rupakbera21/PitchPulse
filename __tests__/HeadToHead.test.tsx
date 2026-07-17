import { render, screen } from '@testing-library/react';
import { HeadToHead } from '../src/components/features/dashboard/HeadToHead';
import { Match } from '../src/contexts/MatchContext';
import React from 'react';

describe('HeadToHead Component', () => {
  const mockMatch = {
    id: 'M1',
    home: { name: 'HomeTeam', code: 'HOM', flag: 'us' },
    away: { name: 'AwayTeam', code: 'AWA', flag: 'ar' },
    date: '2026-07-15',
    time: '20:00',
    status: 'scheduled',
    score: '0-0'
  } as unknown as Match;

  it('renders team names and statistics bars', () => {
    render(<HeadToHead match={mockMatch} />);
    
    expect(screen.getByText('HomeTeam')).toBeInTheDocument();
    expect(screen.getByText('AwayTeam')).toBeInTheDocument();
    
    // Check that stat labels are rendered
    expect(screen.getByText('Attack')).toBeInTheDocument();
    expect(screen.getByText('Defense')).toBeInTheDocument();
    expect(screen.getByText('Midfield')).toBeInTheDocument();
    expect(screen.getByText('Stamina')).toBeInTheDocument();
  });
});
