import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';

// ─── types ────────────────────────────────────────────────────

interface Tournament { id: string; name: string; status: string; }
interface PlayerRow  { id: string; name: string; }
interface GameResult { winner_id: string | null; player1_id: string; player2_id: string; }

interface StandingEntry {
  player:   PlayerRow;
  wins:     number;
  losses:   number;
  points:   number;   // 10×wins + Σwins_of_defeated_opponents
  tb1:      number;   // Σ final_points of defeated opponents
  tb2:      number;   // Σ final_points of victorious opponents
  rank:     number;
}

// ─── helpers ──────────────────────────────────────────────────

function computeStandings(players: PlayerRow[], games: GameResult[]): StandingEntry[] {
  const completed = games.filter(g => g.winner_id !== null);

  // Pass 1: wins per player
  const wins: Record<string, number>  = {};
  const losses: Record<string, number> = {};
  for (const p of players) { wins[p.id] = 0; losses[p.id] = 0; }
  for (const g of completed) {
    const loserId = g.winner_id === g.player1_id ? g.player2_id : g.player1_id;
    wins[g.winner_id!]  = (wins[g.winner_id!]  ?? 0) + 1;
    losses[loserId]     = (losses[loserId]      ?? 0) + 1;
  }

  // Pass 2: points = 10×wins + Σwins[defeated_opponent]
  // Also track who each player defeated / lost to
  const defeated: Record<string, string[]> = {};  // player -> list of opponents they beat
  const lostTo:   Record<string, string[]> = {};  // player -> list of opponents who beat them
  for (const p of players) { defeated[p.id] = []; lostTo[p.id] = []; }
  for (const g of completed) {
    const loserId = g.winner_id === g.player1_id ? g.player2_id : g.player1_id;
    defeated[g.winner_id!].push(loserId);
    lostTo[loserId].push(g.winner_id!);
  }

  const points: Record<string, number> = {};
  for (const p of players) {
    const bonus = defeated[p.id].reduce((sum, oppId) => sum + (wins[oppId] ?? 0), 0);
    points[p.id] = 10 * (wins[p.id] ?? 0) + bonus;
  }

  // Pass 3: tie-breakers using final points
  const entries: StandingEntry[] = players.map(p => {
    const tb1 = defeated[p.id].reduce((sum, oppId) => sum + (points[oppId] ?? 0), 0);
    const tb2 = lostTo[p.id].reduce((sum, oppId)   => sum + (points[oppId] ?? 0), 0);
    return { player: p, wins: wins[p.id] ?? 0, losses: losses[p.id] ?? 0, points: points[p.id] ?? 0, tb1, tb2, rank: 0 };
  });

  // Sort: points desc, tb1 desc, tb2 desc, name asc
  entries.sort((a, b) =>
    b.points - a.points ||
    b.tb1    - a.tb1    ||
    b.tb2    - a.tb2    ||
    a.player.name.localeCompare(b.player.name)
  );

  // Assign ranks (ties share rank)
  let rank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0) {
      const prev = entries[i - 1];
      const curr = entries[i];
      if (curr.points !== prev.points || curr.tb1 !== prev.tb1 || curr.tb2 !== prev.tb2) {
        rank = i + 1;
      }
    }
    entries[i].rank = rank;
  }

  return entries;
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );
}

function rankLabel(rank: number) {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

function rankAccent(rank: number) {
  if (rank === 1) return 'var(--color-accent)';
  if (rank === 2) return 'var(--color-text-dim)';
  if (rank === 3) return '#c08050';
  return 'var(--color-muted)';
}

// ─── main component ───────────────────────────────────────────

export default function Standings() {
  const [tournaments,    setTournaments]    = useState<Tournament[]>([]);
  const [selectedId,     setSelectedId]     = useState('');
  const [standings,      setStandings]      = useState<StandingEntry[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [loadingTourneys,setLoadingTourneys]= useState(true);
  const [error,          setError]          = useState('');

  // ── load tournament list ──────────────────────────────────
  useEffect(() => {
    supabase.from('tournaments').select('id, name, status')
      .order('start_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('standings tournaments:', error); setError(error.message); }
        else {
          const list = data ?? [];
          setTournaments(list);
          const active = list.find(t => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE');
          if (active) setSelectedId(active.id);
        }
        setLoadingTourneys(false);
      });
  }, []);

  // ── compute standings when tournament selected ────────────
  useEffect(() => {
    if (!selectedId) { setStandings([]); return; }
    setLoading(true);
    setError('');

    Promise.all([
      supabase.from('tournament_players')
        .select('player_id, players(id, name)')
        .eq('tournament_id', selectedId),
      supabase.from('games')
        .select('player1_id, player2_id, winner_id, rounds!inner(tournament_id)')
        .eq('rounds.tournament_id', selectedId)
        .eq('status', 'COMPLETED'),
    ]).then(([enrolledRes, gamesRes]) => {
      if (enrolledRes.error) { setError(enrolledRes.error.message); setLoading(false); return; }
      if (gamesRes.error)    { setError(gamesRes.error.message);    setLoading(false); return; }

      const players: PlayerRow[] = (enrolledRes.data ?? []).map((r: any) => r.players).filter(Boolean);
      const games: GameResult[]  = gamesRes.data ?? [];
      setStandings(computeStandings(players, games));
      setLoading(false);
    });
  }, [selectedId]);

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Field Report</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Standings
          </h1>
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            disabled={loadingTourneys}
            style={{
              background: 'var(--color-bg)',
              color: selectedId ? 'var(--color-text)' : 'var(--color-muted)',
              border: '1px solid var(--color-border)',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              padding: '0.4rem 2rem 0.4rem 0.75rem',
              outline: 'none',
              appearance: 'none',
              cursor: loadingTourneys ? 'wait' : 'pointer',
              opacity: loadingTourneys ? 0.6 : 1,
              minWidth: '220px',
            }}
          >
            <option value="">Select Tournament…</option>
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: '0.6rem', pointerEvents: 'none' }}>▼</span>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <Spinner />
        ) : !selectedId ? (
          <div className="empty-state">
            <div className="empty-state-code">ST-00</div>
            <p className="serif-body" style={{ margin: 0 }}>Choose a tournament above to view its standings</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-code">ST-00</div>
            <p className="serif-body" style={{ margin: 0 }}>No players enrolled in this tournament</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th style={{ width: '3rem', textAlign: 'center' }}>#</th>
                  <th>Player</th>
                  <th style={{ textAlign: 'center' }}>W</th>
                  <th style={{ textAlign: 'center' }}>L</th>
                  <th style={{ textAlign: 'right' }}>Base</th>
                  <th style={{ textAlign: 'right' }}>Bonus</th>
                  <th style={{ textAlign: 'right', color: 'var(--color-accent)' }}>Pts</th>
                  <th style={{ textAlign: 'right' }}>TB1</th>
                  <th style={{ textAlign: 'right' }}>TB2</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => {
                  const base  = s.wins * 10;
                  const bonus = s.points - base;
                  const isTied = standings.filter(x => x.rank === s.rank).length > 1;
                  return (
                    <tr key={s.player.id}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: '0.8rem',
                          letterSpacing: '0.1em',
                          color: rankAccent(s.rank),
                          fontWeight: s.rank <= 3 ? 600 : 400,
                        }}>
                          {rankLabel(s.rank)}{isTied ? '=' : ''}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '1rem' }}>
                        {s.player.name}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--color-green-dim)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem' }}>
                        {s.wins}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--color-red)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem' }}>
                        {s.losses}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        {base}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        +{bonus}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                        {s.points}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
                        {s.tb1}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
                        {s.tb2}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scoring legend */}
      {selectedId && !loading && standings.length > 0 && (
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--color-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span><span style={{ color: 'var(--color-accent)' }}>PTS</span> = 10 per win + 1 per win earned by each defeated opponent</span>
          <span><span style={{ color: 'var(--color-text-dim)' }}>TB1</span> = sum of defeated opponents' final points</span>
          <span><span style={{ color: 'var(--color-text-dim)' }}>TB2</span> = sum of victorious opponents' final points</span>
        </div>
      )}
    </div>
  );
}
