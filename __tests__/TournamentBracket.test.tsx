import { render, screen } from '@testing-library/react';
import { TournamentBracket } from '../src/components/features/dashboard/TournamentBracket';
import React from 'react';

// Mock match context
jest.mock('@/contexts/MatchContext', () => ({
  useMatch: () => ({
    match: { id: 'M1', home: { name: 'Home' }, away: { name: 'Away' } },
    matches: [
      { id: 'M1', home: { code: 'HOM' }, away: { code: 'AWA' }, score: '0-0', status: 'live' }
    ]
  })
}));

import { MatchScheduleItem } from '../src/lib/types';

describe('TournamentBracket Component', () => {
  it('renders the tournament bracket visually', () => {
    const mockFixtures = [
      { type: 'final', home: 'Home1', away: 'Away1', score: '0-0', status: 'live' }
    ];
    render(<TournamentBracket fixtures={mockFixtures as MatchScheduleItem[]} />);
    
    expect(screen.getByText('Home1')).toBeInTheDocument();
    expect(screen.getByText('Away1')).toBeInTheDocument();
  });
});
