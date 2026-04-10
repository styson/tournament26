import { supabase } from '@/config/supabase';
import { type StandingEntry, type PlayerRow, type GameResult, computeStandings } from '@/utils/standingsPdf';
import { openPlayerReportPdf } from '@/utils/playerReportPdf';
import { useEffect, useState } from 'react';
import StandingsReportButton from '@/components/StandingsReport';
import CrosstableReportButton from '@/components/CrosstableReport';
import { ChevronDown, ExternalLink } from 'lucide-react';

// ─── types ────────────────────────────────────────────────────

interface Tournament {
  id: string;
  name: string;
  status: string;
}

// ─── helpers ──────────────────────────────────────────────────

function Spinner() {
  return (
    <div className='flex items-center justify-center p-16'>
      <div className='spinner' />
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
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [roundNumbers, setRoundNumbers] = useState<number[]>([]);
  const [gameByPlayerRound, setGameByPlayerRound] = useState<Map<string, Map<number, any>>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingTourneys, setLoadingTourneys] = useState(true);
  const [error, setError] = useState('');

  // ── load tournament list ──────────────────────────────────
  useEffect(() => {
    supabase
      .from('tournaments')
      .select('id, name, status')
      .order('start_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('standings tournaments:', error);
          setError(error.message);
        } else {
          const list = data ?? [];
          setTournaments(list);
          const defaultTourney = list.find((t) => t.status !== 'COMPLETED') ?? list[0];
          if (defaultTourney) setSelectedId(defaultTourney.id);
        }
        setLoadingTourneys(false);
      });
  }, []);

  // ── load standings + rounds when tournament selected ──────
  useEffect(() => {
    if (!selectedId) {
      setStandings([]);
      setRoundNumbers([]);
      setGameByPlayerRound(new Map());
      return;
    }
    setLoading(true);
    setError('');

    Promise.all([
      supabase.from('tournament_players').select('seed, players(id, name)').eq('tournament_id', selectedId),
      supabase
        .from('games')
        .select('player1_id, player2_id, winner_id, rounds!inner(round_number, tournament_id)')
        .eq('rounds.tournament_id', selectedId)
        .eq('status', 'COMPLETED'),
      supabase.from('rounds').select('round_number').eq('tournament_id', selectedId).order('round_number'),
    ]).then(([enrolledRes, gamesRes, roundsRes]) => {
      if (enrolledRes.error) {
        setError(enrolledRes.error.message);
        setLoading(false);
        return;
      }
      if (gamesRes.error) {
        setError(gamesRes.error.message);
        setLoading(false);
        return;
      }

      const players: PlayerRow[] = (enrolledRes.data ?? [])
        .map((r: any) => (r.players ? { ...r.players, seed: r.seed ?? null } : null))
        .filter(Boolean);
      const games: GameResult[] = gamesRes.data ?? [];
      const computed = computeStandings(players, games);
      setStandings(computed);

      const rounds = (roundsRes.data ?? []).map((r: any) => r.round_number as number);
      setRoundNumbers(rounds);

      const byPlayerRound = new Map<string, Map<number, any>>();
      for (const s of computed) byPlayerRound.set(s.player.id, new Map());
      for (const g of gamesRes.data ?? []) {
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
    <div className='flex flex-col gap-5'>
      {/* Header */}
      <div className='anim-0 flex items-end justify-between flex-wrap gap-3'>
        <div>
          <div className='section-label mb-[0.3rem]'>Field Report</div>
          <h1 className='text-[2.4rem] tracking-[0.06em] m-0'>Standings</h1>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={loadingTourneys}
              className={`bg-bg ${selectedId ? 'text-text' : 'text-muted'} border border-border text-[0.7rem] tracking-widest py-[0.4rem] pl-3 pr-8 outline-none appearance-none ${loadingTourneys ? 'cursor-wait opacity-60' : 'cursor-pointer'} min-w-55`}
            >
              <option value=''>Select Tournament…</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <span className='absolute right-[0.6rem] top-1/2 -translate-y-1/2 text-muted pointer-events-none inline-flex'>
              <ChevronDown size={12} />
            </span>
          </div>
          {selectedId &&
            !loading &&
            (() => {
              const t = tournaments.find((x) => x.id === selectedId);
              return t ? (
                <>
                  <StandingsReportButton standings={standings} tournamentName={t.name} />
                  <CrosstableReportButton standings={standings} tournamentId={selectedId} tournamentName={t.name} />
                </>
              ) : null;
            })()}
        </div>
      </div>

      {error && <div className='error-box'>{error}</div>}

      <div className='card anim-1 p-0 overflow-hidden'>
        {loading ? (
          <Spinner />
        ) : !selectedId ? (
          <div className='empty-state'>
            <p className='serif-body m-0'>Choose a tournament above to view its standings</p>
          </div>
        ) : standings.length === 0 ? (
          <div className='empty-state'>
            <p className='serif-body m-0'>No players enrolled in this tournament</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='ops-table'>
              <thead>
                <tr>
                  <th className='w-10 text-center'>#</th>
                  <th>Player</th>
                  {roundNumbers.map((rn) => (
                    <th key={rn} className='text-center w-12'>
                      R{rn}
                    </th>
                  ))}
                  <th className='text-right text-accent'>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, idx) => {
                  const pos = idx + 1;
                  return (
                    <tr key={s.player.id}>
                      <td className='text-center'>
                        <span className={`text-[0.8rem] tracking-widest ${pos <= 3 ? 'font-semibold' : 'font-normal'}`}>{pos}</span>
                      </td>
                      <td className='text-text text-base'>
                        <span className='flex items-center gap-[0.4rem]'>
                          {s.player.name}
                          <button
                            onClick={() => {
                              const t = tournaments.find((x) => x.id === selectedId);
                              const playerById = Object.fromEntries(standings.map((x) => [x.player.id, x.player.name]));
                              openPlayerReportPdf(s.player.id, s.player.name, selectedId, t?.name ?? '', playerById);
                            }}
                            title='View Player Report'
                            className='icon-btn text-[0.65rem] py-[0.1rem] px-1 opacity-60'
                          >
                            <ExternalLink size={14} />
                          </button>
                        </span>
                      </td>
                      {roundNumbers.map((rn) => {
                        const game = gameByPlayerRound.get(s.player.id)?.get(rn);
                        if (!game)
                          return (
                            <td key={rn} className='text-center text-border-bright'>
                              —
                            </td>
                          );
                        const isWin = game.winner_id === s.player.id;
                        const oppId = game.player1_id === s.player.id ? game.player2_id : game.player1_id;
                        const oppPos = posByPlayerId.get(oppId);
                        return (
                          <td key={rn} className='text-center'>
                            <span
                              className={`font-semibold text-text${isWin ? ' border border-green-dim py-[0.1rem] px-[0.35rem]' : ''}`}
                            >
                              {oppPos ?? '?'}
                            </span>
                          </td>
                        );
                      })}
                      <td className='text-right text-[0.85rem] text-accent font-semibold'>{s.points}</td>
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
        <div className='text-[0.8rem] tracking-widest text-muted flex gap-6 flex-wrap'>
          <span>
            <span className='border border-green-dim px-1'>N</span> = win vs player N
          </span>
          <span>N = loss vs player N</span>
          <span>
            <span className='text-accent'>PTS</span> = 10 per win + 1 per win earned by each defeated opponent
          </span>
        </div>
      )}
    </div>
  );
}
