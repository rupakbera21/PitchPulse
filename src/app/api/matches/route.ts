import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface APIMatch {
  id: string;
  local_date?: string;
  stadium_id?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_score?: string;
  away_score?: string;
  finished?: string;
  time_elapsed?: string;
  type?: string;
  home_team_label?: string;
  away_team_label?: string;
}

interface FallbackMatch {
  match_id?: string;
  date?: string;
  time?: string;
  score?: string;
  status?: string;
}

interface FallbackData {
  tournament: string;
  sample_group_stage_results: Record<string, unknown>[];
  round_of_32_results: Record<string, unknown>[];
  round_of_16_schedule: FallbackMatch[];
  quarterfinals_schedule?: FallbackMatch[];
}

let fallbackData: FallbackData | null = null;

function loadFallbackData(): FallbackData {
  if (!fallbackData) {
    const dataPath = path.join(process.cwd(), 'src/data/worldcup2026_fallback_data.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    fallbackData = JSON.parse(fileContents) as FallbackData;
  }
  return fallbackData;
}

export async function GET() {
  const fallback = loadFallbackData();
  
  // Try Primary API (worldcup26.ir)
  try {
    const res = await fetch('https://worldcup26.ir/get/games', { next: { revalidate: 15 } });
    if (!res.ok) throw new Error('Primary API failed');
    const data = await res.json();
    
    const live_schedule = data.games
      .filter((m: APIMatch) => {
        if (!m.local_date) return false;
        const [datePart] = m.local_date.split(' ');
        const [month, day, year] = datePart.split('/');
        const matchDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
        const startDate = new Date('2026-06-25T00:00:00Z');
        return matchDate >= startDate;
      })
      .map((m: APIMatch) => {
        let isoDate = '';
        if (m.local_date) {
          const [d, t] = m.local_date.split(' ');
          const [mo, da, ye] = d.split('/');
          // Assuming North American Eastern Time (EDT) UTC-4 for general parsing 
          isoDate = `${ye}-${mo}-${da}T${t}:00-04:00`;
        }
        return {
          match_id: `M${m.id}`,
          date: m.local_date ? m.local_date.split(' ')[0] : '',
          time: m.local_date ? m.local_date.split(' ')[1] : '',
          isoDate,
          stadium: `Stadium ${m.stadium_id}`,
          home: m.home_team_name_en || m.home_team_label || 'TBD',
          away: m.away_team_name_en || m.away_team_label || 'TBD',
          score: `${m.home_score !== 'null' ? m.home_score : 0}-${m.away_score !== 'null' ? m.away_score : 0}`,
          status: m.finished === 'TRUE' ? 'completed' : (m.time_elapsed === 'notstarted' ? 'scheduled' : 'live'),
          type: m.type
        };
      });

    return NextResponse.json({
      tournament: fallback.tournament,
      results: fallback.sample_group_stage_results.concat(fallback.round_of_32_results),
      live_schedule: live_schedule,
      lastUpdated: new Date().toISOString(),
    });
  } catch (primaryError) {
    console.warn('Failed to fetch primary live API, attempting GitHub raw files', primaryError);
    
    // Try Secondary API Fallback (GitHub Raw Files)
    try {
      const matchesRes = await fetch('https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.matches.json');
      const teamsRes = await fetch('https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.teams.json');
      
      if (!matchesRes.ok || !teamsRes.ok) throw new Error('GitHub files fetch failed');
      
      const rawMatches = await matchesRes.json();
      const rawTeams = await teamsRes.json();
      
      // Map teams by ID
      const teamsMap: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rawTeams.forEach((t: any) => {
        teamsMap[t.id] = t.name_en;
      });

      const live_schedule = rawMatches
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((m: any) => {
          if (!m.local_date) return false;
          const [datePart] = m.local_date.split(' ');
          const [month, day, year] = datePart.split('/');
          const matchDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
          const startDate = new Date('2026-06-25T00:00:00Z');
          return matchDate >= startDate;
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => {
          let isoDate = '';
          if (m.local_date) {
            const [d, t] = m.local_date.split(' ');
            const [mo, da, ye] = d.split('/');
            isoDate = `${ye}-${mo}-${da}T${t}:00-04:00`;
          }
          return {
            match_id: `M${m.id}`,
            date: m.local_date ? m.local_date.split(' ')[0] : '',
            time: m.local_date ? m.local_date.split(' ')[1] : '',
            isoDate,
            stadium: `Stadium ${m.stadium_id}`,
            home: (m.home_team_id !== '0' && m.home_team_id !== 0) ? (teamsMap[m.home_team_id] || `Team ${m.home_team_id}`) : (m.home_team_label || 'TBD'),
            away: (m.away_team_id !== '0' && m.away_team_id !== 0) ? (teamsMap[m.away_team_id] || `Team ${m.away_team_id}`) : (m.away_team_label || 'TBD'),
            score: `${m.home_score !== 'null' ? m.home_score : 0}-${m.away_score !== 'null' ? m.away_score : 0}`,
            status: m.finished === 'TRUE' || m.finished === true ? 'completed' : (m.time_elapsed === 'notstarted' ? 'scheduled' : 'live'),
            type: m.type
          };
        });

      return NextResponse.json({
        tournament: fallback.tournament,
        results: fallback.sample_group_stage_results.concat(fallback.round_of_32_results),
        live_schedule: live_schedule,
        lastUpdated: new Date().toISOString(),
      });
    } catch (githubError) {
      console.error('Failed to fetch from GitHub raw fallback, using local static data', githubError);
      
      // Tertiary Fallback: Local static backup
      const allMatches = [
        ...fallback.round_of_16_schedule,
        ...(fallback.quarterfinals_schedule || [])
      ];
      
      // Filter to June 25th 2026 onwards
      const filteredMatches = allMatches.filter(m => {
         if (!m.date) return false;
         const matchDate = new Date(`${m.date}T00:00:00-04:00`);
         const startDate = new Date('2026-06-25T00:00:00-04:00');
         return matchDate >= startDate;
      });

      const currentMatches = filteredMatches.map(m => ({
        ...m,
        isoDate: m.date && m.time ? `${m.date}T${m.time}:00-04:00` : '',
        score: m.score || '0-0',
        status: m.status || 'scheduled',
        type: m.match_id?.includes('QF') ? 'qf' : 'r16'
      }));

      return NextResponse.json({
        tournament: fallback.tournament,
        results: fallback.sample_group_stage_results.concat(fallback.round_of_32_results),
        live_schedule: currentMatches,
        lastUpdated: new Date().toISOString(),
      });
    }
  }
}
