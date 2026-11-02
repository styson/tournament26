import { ChevronDown, ExternalLink } from 'lucide-react';
import { openPlayerReportPdf } from '@/utils/playerReportPdf';
import { supabase } from '@/config/supabase';
import { type StandingEntry, type PlayerRow, type GameResult, computeStandings } from '@/utils/standingsPdf';
import { useEffect, useState } from 'react';
import CrosstableReportButton from '@/components/CrosstableReport';
import StandingsReportButton from '@/components/StandingsReport';

// ─── types ────────────────────────────────────────────────────

interface Tournament {
  id: string;
  name: string;
  status: string;
}

interface EnrolledRow {
  seed: number | null;
  players: { id: string; name: string } | null;
}

interface StandingsGameRow extends GameResult {
  rounds: { round_number: number } | null;
}

// ─── helpers ──────────────────────────────────────────────────

function Spinner() {
  return (
    <div className='flex items-center justify-center p-16'>
      <div className='spinner' />
    </div>
  );
}


// ─── main component ───────────────────────────────────────────

export default function Standings() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [roundNumbers, setRoundNumbers] = useState<number[]>([]);
  const [gameByPlayerRound, setGameByPlayerRound] = useState<Map<string, Map<number, StandingsGameRow>>>(new Map());
  // Loading until the selected tournament's data has been fetched
  const [loadedId, setLoadedId] = useState('');
  const loading = selectedId !== '' && loadedId !== selectedId;
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
    if (!selectedId) return;

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
        setLoadedId(selectedId);
        return;
      }
      if (gamesRes.error) {
        setError(gamesRes.error.message);
        setLoadedId(selectedId);
        return;
      }

      setError('');
      const players: PlayerRow[] = ((enrolledRes.data ?? []) as unknown as EnrolledRow[])
        .flatMap((r) => (r.players ? [{ ...r.players, seed: r.seed ?? null }] : []));
      const games = (gamesRes.data ?? []) as unknown as StandingsGameRow[];
      const computed = computeStandings(players, games);
      setStandings(computed);

      const rounds = (roundsRes.data ?? []).map((r) => r.round_number as number);
      setRoundNumbers(rounds);

      const byPlayerRound = new Map<string, Map<number, StandingsGameRow>>();
      for (const s of computed) byPlayerRound.set(s.player.id, new Map());
      for (const g of games) {
        const rn = g.rounds?.round_number;
        if (rn == null) continue;
        for (const pid of [g.player1_id, g.player2_id]) {
          if (byPlayerRound.has(pid)) byPlayerRound.get(pid)!.set(rn, g);
        }
      }
      setGameByPlayerRound(byPlayerRound);
      setLoadedId(selectedId);
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
          <div className='section-label mb-1'>Field Report</div>
          <h1 className='text-4xl tracking-wider m-0'>Standings</h1>
        </div>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={loadingTourneys}
              className={`bg-bg ${selectedId ? 'text-text' : 'text-muted'} border border-border tracking-widest py-[0.28rem] pl-3 pr-8 outline-none appearance-none ${loadingTourneys ? 'cursor-wait opacity-60' : 'cursor-pointer'} min-w-55`}
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
                  <th className='text-center text-accent'>Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, idx) => {
                  const pos = idx + 1;
                  return (
                    <tr key={s.player.id}>
                      <td className='text-center'>
                        <span className={`text-sm tracking-widest ${pos <= 3 ? 'font-semibold' : 'font-normal'}`}>{pos}</span>
                      </td>
                      <td className='text-text text-base'>
                        <span className='flex items-center gap-1.5'>
                          {s.player.name}
                          <button
                            onClick={() => {
                              const t = tournaments.find((x) => x.id === selectedId);
                              const playerById = Object.fromEntries(standings.map((x) => [x.player.id, x.player.name]));
                              openPlayerReportPdf(s.player.id, s.player.name, selectedId, t?.name ?? '', playerById);
                            }}
                            title='View Player Report'
                            className='icon-btn text-xs py-0.5 px-1 opacity-60'
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
                              className={`font-semibold text-text inline-flex items-center justify-center w-8${isWin ? ' border border-green-dim py-0.5' : ''}`}
                            >
                              {oppPos ?? '?'}
                            </span>
                          </td>
                        );
                      })}
                      <td className='text-center text-sm text-accent font-semibold'>{s.points}</td>
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
        <div className='text-sm tracking-widest text-muted flex gap-6 flex-wrap'>
          <span>
            <span className='border border-green-dim px-1'>N</span> = win vs player N
          </span>
          <span>N = loss vs player N</span>
          <span>
            <span className='text-accent'>Points</span> = 10 per win + 1 per win earned by each defeated opponent
          </span>
        </div>
      )}
    </div>
  );
}
