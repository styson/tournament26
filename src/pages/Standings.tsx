import { supabase } from '@/config/supabase';
import { type StandingEntry, type PlayerRow, type GameResult, computeStandings } from '@/utils/standingsPdf';
import { openPlayerReportPdf } from '@/utils/playerReportPdf';
import { useEffect, useState } from 'react';
import StandingsReportButton from '@/components/StandingsReport';
import CrosstableReportButton from '@/components/CrosstableReport';
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

function rankAccent(rank: number) {
  if (rank === 1) return 'var(--color-accent)';
  if (rank === 2) return 'var(--color-text-dim)';
  if (rank === 3) return '#c08050';
  return 'var(--color-muted)';
}

// ─── main component ───────────────────────────────────────────

export default function Standings() {
  const [tournaments,     setTournaments]     = useState<Tournament[]>([]);
  const [selectedId,      setSelectedId]      = useState('');
  const [standings,       setStandings]       = useState<StandingEntry[]>([]);
  const [roundNumbers,    setRoundNumbers]    = useState<number[]>([]);
  const [gameByPlayerRound, setGameByPlayerRound] = useState<Map<string, Map<number, any>>>(new Map());
  const [loading,         setLoading]         = useState(false);
  const [loadingTourneys, setLoadingTourneys] = useState(true);
  const [error,           setError]           = useState('');

  // ── load tournament list ──────────────────────────────────
  useEffect(() => {
    supabase.from('tournaments').select('id, name, status')
      .order('start_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('standings tournaments:', error); setError(error.message); }
        else {
          const list = data ?? [];
          setTournaments(list);
          const defaultTourney = list.find(t => t.status !== 'COMPLETED') ?? list[0];
          if (defaultTourney) setSelectedId(defaultTourney.id);
        }
        setLoadingTourneys(false);
      });
  }, []);

  // ── load standings + rounds when tournament selected ──────
  useEffect(() => {
    if (!selectedId) { setStandings([]); setRoundNumbers([]); setGameByPlayerRound(new Map()); return; }
    setLoading(true);
    setError('');

    Promise.all([
      supabase.from('tournament_players')
        .select('seed, players(id, name)')
        .eq('tournament_id', selectedId),
      supabase.from('games')
        .select('player1_id, player2_id, winner_id, rounds!inner(round_number, tournament_id)')
        .eq('rounds.tournament_id', selectedId)
        .eq('status', 'COMPLETED'),
      supabase.from('rounds')
        .select('round_number')
        .eq('tournament_id', selectedId)
        .order('round_number'),
    ]).then(([enrolledRes, gamesRes, roundsRes]) => {
      if (enrolledRes.error) { setError(enrolledRes.error.message); setLoading(false); return; }
      if (gamesRes.error)    { setError(gamesRes.error.message);    setLoading(false); return; }

      const players: PlayerRow[] = (enrolledRes.data ?? [])
        .map((r: any) => r.players ? { ...r.players, seed: r.seed ?? null } : null)
        .filter(Boolean);
      const games: GameResult[] = gamesRes.data ?? [];
      const computed = computeStandings(players, games);
      setStandings(computed);

      const rounds = (roundsRes.data ?? []).map((r: any) => r.round_number as number);
      setRoundNumbers(rounds);

      const byPlayerRound = new Map<string, Map<number, any>>();
      for (const s of computed) byPlayerRound.set(s.player.id, new Map());
      for (const g of (gamesRes.data ?? [])) {
        const rn = (g as any).rounds?.round_number as number;
        if (rn == null) continue;
        for (const pid of [g.player1_id, g.player2_id]) {
          if (byPlayerRound.has(pid)) byPlayerRound.get(pid)!.set(rn, g);
        }
      }
      setGameByPlayerRound(byPlayerRound);
      setLoading(false);
    });
  }, [selectedId]);

  // ── derived ───────────────────────────────────────────────
  const posByPlayerId = new Map(standings.map((s, i) => [s.player.id, i + 1]));

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Field Report</div>
          <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
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
              <>
                <StandingsReportButton
                  standings={standings}
                  tournamentName={t.name}
                  style={{ fontSize: '0.7rem', padding: '0.4rem 0.9rem' }}
                />
                <CrosstableReportButton
                  standings={standings}
                  tournamentId={selectedId}
                  tournamentName={t.name}
                  style={{ fontSize: '0.7rem', padding: '0.4rem 0.9rem' }}
                />
              </>
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
                  <th style={{ width: '2.5rem', textAlign: 'center' }}>#</th>
                  <th>Player</th>
                  {roundNumbers.map(rn => (
                    <th key={rn} style={{ textAlign: 'center', width: '3rem' }}>R{rn}</th>
                  ))}
                  <th style={{ textAlign: 'right', color: 'var(--color-accent)' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, idx) => {
                  const pos = idx + 1;
                  return (
                    <tr key={s.player.id}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: rankAccent(pos), fontWeight: pos <= 3 ? 600 : 400 }}>
                          {pos}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text)', fontSize: '1rem' }}>
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
                      {roundNumbers.map(rn => {
                        const game = gameByPlayerRound.get(s.player.id)?.get(rn);
                        if (!game) return <td key={rn} style={{ textAlign: 'center', color: 'var(--color-border-bright)' }}>—</td>;
                        const isWin = game.winner_id === s.player.id;
                        const oppId = game.player1_id === s.player.id ? game.player2_id : game.player1_id;
                        const oppPos = posByPlayerId.get(oppId);
                        return (
                          <td key={rn} style={{ textAlign: 'center' }}>
                            <span style={{
                              fontWeight: 600,
                              color: 'var(--color-text)',
                              ...(isWin ? { border: '1px solid var(--color-green-dim)', padding: '0.1rem 0.35rem' } : {}),
                            }}>
                              {oppPos ?? '?'}
                            </span>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                        {s.points}
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
        <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--color-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span><span style={{ border: '1px solid var(--color-green-dim)', padding: '0 0.25rem' }}>N</span> = win vs player N</span>
          <span>N = loss vs player N</span>
          <span><span style={{ color: 'var(--color-accent)' }}>PTS</span> = 10 per win + 1 per win earned by each defeated opponent</span>
        </div>
      )}
    </div>
  );
}
