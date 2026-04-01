import { supabase } from '@/config/supabase';
import { type StandingEntry, type PlayerRow, type GameResult, computeStandings } from '@/utils/standingsPdf';
import { openPlayerReportPdf } from '@/utils/playerReportPdf';
import { useEffect, useState } from 'react';
import StandingsReportButton from '@/components/StandingsReport';
import { ChevronDown, ExternalLink } from 'lucide-react';

// ─── types ────────────────────────────────────────────────────

interface Tournament { id: string; name: string; status: string; }

// ─── helpers ──────────────────────────────────────────────────

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
          if (list.length > 0) setSelectedId(list[0].id);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
          <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none', display: 'inline-flex' }}><ChevronDown size={12} /></span>
        </div>
        {selectedId && !loading && (() => {
          const t = tournaments.find(x => x.id === selectedId);
          return t ? (
            <StandingsReportButton
              standings={standings}
              tournamentName={t.name}
              style={{ fontSize: '0.7rem', padding: '0.4rem 0.9rem' }}
            />
          ) : null;
        })()}
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <Spinner />
        ) : !selectedId ? (
          <div className="empty-state">
            <p className="serif-body" style={{ margin: 0 }}>Choose a tournament above to view its standings</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="empty-state">
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
                {standings.map((s) => {
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {s.player.name}
                          <button
                            onClick={() => {
                              const t = tournaments.find(x => x.id === selectedId);
                              const playerById = Object.fromEntries(standings.map(x => [x.player.id, x.player.name]));
                              openPlayerReportPdf(s.player.id, s.player.name, selectedId, t?.name ?? '', playerById);
                            }}
                            title="View Player Report"
                            className="icon-btn"
                            style={{ fontSize: '0.65rem', padding: '0.1rem 0.25rem', opacity: 0.6 }}
                          ><ExternalLink size={14} /></button>
                        </span>
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
