import { render, screen } from '@testing-library/react';
import { MatchProvider, useMatch } from '../src/contexts/MatchContext';
import React from 'react';

// A mock component to consume the context
const MockComponent = () => {
  const { match, matches } = useMatch();
  return (
    <div>
      <span data-testid="match-id">{match?.id}</span>
      <span data-testid="match-home">{match?.home?.name}</span>
      <span data-testid="match-count">{matches?.length}</span>
    </div>
  );
};

describe('MatchContext Provider', () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ live_schedule: [], fallback_matches: [] }),
      })
    ) as jest.Mock;
  });

  it('provides default match state on initialization', () => {
    render(
      <MatchProvider>
        <MockComponent />
      </MatchProvider>
    );

    // The default match ID should be 'M1' according to fallback data inside MatchContext
    expect(screen.getByTestId('match-id').textContent).toBe('m1');
    expect(screen.getByTestId('match-home').textContent).toBe('Argentina');
    
    // There are 5 fallback matches
    expect(screen.getByTestId('match-count').textContent).toBe('3');
  });
});
