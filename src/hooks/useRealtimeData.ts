import { useState, useEffect } from 'react';
import { REFRESH_INTERVALS } from '@/lib/constants';

/**
 * Hook to fetch and poll live match schedule data.
 */
export function useRealtimeMatches() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchMatches() {
      try {
        const res = await fetch('/api/matches');
        const json = await res.json();
        if (mounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching matches", err);
      }
    }

    fetchMatches();
    const interval = setInterval(fetchMatches, REFRESH_INTERVALS.MATCH_DATA);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading };
}
/**
 * Hook to fetch and poll live crowd density simulation data.
 */
export function useRealtimeCrowd() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchCrowd() {
      try {
        const res = await fetch('/api/crowd');
        const json = await res.json();
        if (mounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching crowd data", err);
      }
    }

    fetchCrowd();
    const interval = setInterval(fetchCrowd, REFRESH_INTERVALS.CROWD_DATA);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading };
}
