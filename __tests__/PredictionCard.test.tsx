import { render, screen, fireEvent } from '@testing-library/react';
import { PredictionCard } from '../src/components/features/dashboard/PredictionCard';
import { Match } from '../src/contexts/MatchContext';
import React from 'react';

describe('PredictionCard Component', () => {
  const mockMatch = {
    id: 'M1',
    home: { name: 'HomeTeam', code: 'HOM', flag: 'us' },
    away: { name: 'AwayTeam', code: 'AWA', flag: 'ar' },
    date: '2026-07-15',
    time: '20:00',
    status: 'scheduled',
    score: '0-0'
  } as unknown as Match;

  it('renders both team names and vote buttons', () => {
    render(<PredictionCard match={mockMatch} />);
    
    expect(screen.getByText('HomeTeam')).toBeInTheDocument();
    expect(screen.getByText('AwayTeam')).toBeInTheDocument();
    expect(screen.getByText('VOTE HOM')).toBeInTheDocument();
    expect(screen.getByText('VOTE AWA')).toBeInTheDocument();
  });

  it('allows voting and shows confirmation', () => {
    render(<PredictionCard match={mockMatch} />);
    
    const voteHomeBtn = screen.getByText('VOTE HOM').closest('button');
    fireEvent.click(voteHomeBtn!);
    
    expect(screen.getByText('Vote Registered!')).toBeInTheDocument();
    expect(screen.queryByText('VOTE HOM')).not.toBeInTheDocument();
  });
});
