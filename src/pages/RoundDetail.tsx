/**
 * RoundDetail — Manage scenarios, schedule games, record results, change round status.
 *
 * games table: id, tournament_id, round_id, scenario_id,
 *   player1_id, player2_id, player1_attacks bool, winner_id (nullable), status
 */

import { createPortal } from 'react-dom';
import { Link, useParams } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { useEffect, useRef, useState } from 'react';
import { openMatchReportPdf } from '@/utils/matchReportPdf';
import { ArrowLeft, ArrowRight, Check, ChevronDown as ChevronDownIcon, X } from 'lucide-react';

// ─── types ───────────────────────────────────────────────────

interface RoundData {
  id: string;
  round_number: number;
  name: string | null;
  status: string;
  tournament_id: string;
}

interface Player { id: string; name: string; }

interface ScenarioRow {
  id: string;
  scen_id: string | null;
  title: string;
  attacker_nationality: string;
  defender_nationality: string;
}

interface GameRow {
  id: string;
  scenario_id: string | null;
  player1_id: string;
  player2_id: string;
  player1_attacks: boolean;
  winner_id: string | null;
  status: string;
}


// ─── constants ───────────────────────────────────────────────

const ROUND_STATUSES = [
  { value: 'PENDING',     label: 'Upcoming' },
  { value: 'IN_PROGRESS', label: 'Started'  },
  { value: 'COMPLETED',   label: 'Complete' },
];

const SELECT_CLS = 'w-full bg-bg text-text border border-border tracking-[0.06em] py-2 pl-3 pr-8 outline-none appearance-none cursor-pointer';

function roundStatusColor(s: string) {
  switch (s) {
    case 'IN_PROGRESS': return 'var(--color-accent)';
    case 'COMPLETED':   return 'var(--color-green-dim)';
    default:            return 'var(--color-muted)';
  }
}
function gameStatusColor(s: string) {
  return s === 'COMPLETED' ? 'var(--color-green-dim)' : 'var(--color-muted)';
}

// ─── scenario search combobox ────────────────────────────────

function ScenarioPicker({
  excludeIds, value, onChange,
}: {
  excludeIds: Set<string>;
  value: string;
  onChange: (id: string) => void;
}) {
  const [inputVal, setInputVal]   = useState('');
  const [results,  setResults]    = useState<ScenarioRow[]>([]);
  const [open,     setOpen]       = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (!value) setInputVal(''); }, [value]);

  function updateDropPos() {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect();
      setDropStyle({ top: r.bottom + 2, left: r.left, width: r.width });
    }
  }

  function handleSelect(s: ScenarioRow) {
    onChange(s.id);
    setInputVal(`${s.scen_id ? s.scen_id + ' — ' : ''}${s.title}`);
    setOpen(false);
  }

  function handleChange(val: string) {
    setInputVal(val);
    if (!val) { onChange(''); setResults([]); setOpen(false); return; }
    updateDropPos();
    setOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const term = val.trim();
      if (!term) return;
      const { data } = await supabase
        .from('scenarios')
        .select('id, scen_id, title, attacker_nationality, defender_nationality')
        .or(`title.ilike.%${term}%,scen_id.ilike.%${term}%`)
        .order('scen_id', { nullsFirst: false })
        .limit(50);
      setResults((data ?? []).filter(s => !excludeIds.has(s.id)));
    }, 250);
  }

  return (
    <div className="flex-1 min-w-[200px]">
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => { updateDropPos(); inputVal.trim() && setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={'Search by ID or title…'}
        className="input"
        autoComplete="off"
      />
      {open && inputVal.trim().length > 0 && createPortal(
        <div
          className="fixed z-[9999] bg-bg border border-border-bright max-h-[320px] overflow-y-auto shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
          style={dropStyle}
        >
          {results.length > 0 ? results.map(s => (
            <div
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-2 cursor-pointer flex items-baseline gap-2.5 border-b border-raised hover:bg-raised"
            >
              {s.scen_id && (
                <span className="text-accent tracking-tighter whitespace-nowrap shrink-0">
                  {s.scen_id}
                </span>
              )}
              <span className="text-text-dim">{s.title}</span>
              <span className="text-muted-dim ml-auto whitespace-nowrap shrink-0">
                {s.attacker_nationality} vs {s.defender_nationality}
              </span>
            </div>
          )) : (
            <div className="px-3 py-2.5 text-muted-dim tracking-widest">
              No matches
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── spinner ─────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center p-16 gap-3">
      <div className="spinner" />
    </div>
  );
}

// ─── main component ──────────────────────────────────────────

export default function RoundDetail() {
  const { id: tournamentId, roundId } = useParams({ strict: false }) as { id: string; roundId: string };

  const [round,          setRound]          = useState<RoundData | null>(null);
  const [tournament,     setTournament]     = useState<{ id: string; name: string } | null>(null);
  const [enrolled,       setEnrolled]       = useState<Player[]>([]);
  const [roundScenarios, setRoundScenarios] = useState<ScenarioRow[]>([]);
  const [games,          setGames]          = useState<GameRow[]>([]);
  const [allRounds,      setAllRounds]      = useState<{ id: string; round_number: number }[]>([]);
  const [playerRecords,  setPlayerRecords]  = useState<Record<string, { w: number; l: number }>>({});
  const [playerPoints,   setPlayerPoints]   = useState<Record<string, number>>({});
  const [priorMatchups,  setPriorMatchups]  = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // round status
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // scenario management
  const [scenOpen,       setScenOpen]       = useState(() => localStorage.getItem('roundDetail.scenOpen') !== 'false');
  const [scenPick,       setScenPick]       = useState('');
  const [addingScen,     setAddingScen]     = useState(false);
  const [removingScen,   setRemovingScen]   = useState<string | null>(null);
  const [confirmRemScen,  setConfirmRemScen]  = useState<string | null>(null);
  const [confirmRemGame,  setConfirmRemGame]  = useState<string | null>(null);
  const [removingGame,    setRemovingGame]    = useState(false);

  // new game form
  const [p1Id,       setP1Id]       = useState('');
  const [p2Id,       setP2Id]       = useState('');
  const [gameScenId, setGameScenId] = useState('');
  const [p1Side,     setP1Side]     = useState<'attacker' | 'defender'>('attacker');
  const [addingGame, setAddingGame] = useState(false);

  // result recording
  const [recordingFor,       setRecordingFor]       = useState<string | null>(null);
  const [savingResult,       setSavingResult]       = useState(false);
  const [resultScenId,       setResultScenId]       = useState('');
  const [resultSidesFlipped, setResultSidesFlipped] = useState(false);

  // ── load ──────────────────────────────────────────────────

  useEffect(() => { if (roundId && tournamentId) fetchAll(); }, [roundId, tournamentId]);

  async function fetchAll() {
    setLoading(true);
    setError('');
    const [roundRes, tourneyRes, enrolledRes, scenRes, completedRes, allTourneyGamesRes, allRoundsRes] = await Promise.all([
      supabase.from('rounds').select('*').eq('id', roundId).single(),
      supabase.from('tournaments').select('id, name').eq('id', tournamentId).single(),
      supabase.from('tournament_players')
        .select('player_id, players(id, name)')
        .eq('tournament_id', tournamentId),
      supabase.from('round_scenarios')
        .select('scenario_id, scenarios(id, scen_id, title, attacker_nationality, defender_nationality)')
        .eq('round_id', roundId),
      supabase.from('games')
        .select('player1_id, player2_id, winner_id, rounds!inner(tournament_id)')
        .eq('rounds.tournament_id', tournamentId)
        .eq('status', 'COMPLETED'),
      supabase.from('games')
        .select('player1_id, player2_id, rounds!inner(tournament_id)')
        .eq('rounds.tournament_id', tournamentId),
      supabase.from('rounds')
        .select('id, round_number')
        .eq('tournament_id', tournamentId)
        .order('round_number'),
    ]);

    if (roundRes.error)   { setError(roundRes.error.message);   setLoading(false); return; }
    if (tourneyRes.error) { setError(tourneyRes.error.message); setLoading(false); return; }

    setRound(roundRes.data);
    setTournament(tourneyRes.data ?? null);
    setEnrolled((enrolledRes.data ?? []).map((r: any) => r.players).filter(Boolean));
    setRoundScenarios((scenRes.data ?? []).map((r: any) => r.scenarios).filter(Boolean));
    setAllRounds(allRoundsRes.data ?? []);

    const rec: Record<string, { w: number; l: number }> = {};
    const defeated: Record<string, string[]> = {};
    for (const g of (completedRes.data ?? [])) {
      const loserId = g.winner_id === g.player1_id ? g.player2_id : g.player1_id;
      for (const pid of [g.player1_id, g.player2_id]) {
        if (!rec[pid]) rec[pid] = { w: 0, l: 0 };
        if (g.winner_id === pid) rec[pid].w++;
        else rec[pid].l++;
      }
      if (g.winner_id) {
        if (!defeated[g.winner_id]) defeated[g.winner_id] = [];
        defeated[g.winner_id].push(loserId);
      }
    }
    setPlayerRecords(rec);

    const pts: Record<string, number> = {};
    for (const pid of Object.keys(rec)) {
      const bonus = (defeated[pid] ?? []).reduce((sum, oppId) => sum + (rec[oppId]?.w ?? 0), 0);
      pts[pid] = 10 * rec[pid].w + bonus;
    }
    setPlayerPoints(pts);

    const matchups = new Set<string>();
    for (const g of (allTourneyGamesRes.data ?? [])) {
      const key = [g.player1_id, g.player2_id].sort().join('|');
      matchups.add(key);
    }
    setPriorMatchups(matchups);

    await fetchGames();
    setLoading(false);
  }

  async function fetchRoundScenarios() {
    const { data } = await supabase
      .from('round_scenarios')
      .select('scenario_id, scenarios(id, scen_id, title, attacker_nationality, defender_nationality)')
      .eq('round_id', roundId);
    setRoundScenarios((data ?? []).map((r: any) => r.scenarios).filter(Boolean));
  }

  async function fetchGames() {
    const { data, error: gErr } = await supabase
      .from('games').select('*').eq('round_id', roundId).order('created_at');
    if (gErr) { setError(gErr.message); return; }
    setGames(data ?? []);
  }

  // ── scenario handlers ─────────────────────────────────────

  async function handleAddScenario() {
    if (!scenPick) return;
    setAddingScen(true);
    setError('');
    const { error: err } = await supabase.from('round_scenarios')
      .insert({ round_id: roundId, scenario_id: scenPick });
    if (err) setError(err.message);
    else { setScenPick(''); await fetchRoundScenarios(); }
    setAddingScen(false);
  }

  async function handleRemoveScenario(scenarioId: string) {
    setRemovingScen(scenarioId);
    const { error: err } = await supabase.from('round_scenarios')
      .delete().eq('round_id', roundId).eq('scenario_id', scenarioId);
    if (err) setError(err.message);
    else await fetchRoundScenarios();
    setRemovingScen(null);
    setConfirmRemScen(null);
  }

  // ── round status ──────────────────────────────────────────

  async function handleStatusChange(newStatus: string) {
    setUpdatingStatus(true);
    const { data, error: err } = await supabase
      .from('rounds').update({ status: newStatus }).eq('id', roundId).select().single();
    if (err) setError(err.message);
    else if (data) setRound(data);
    setUpdatingStatus(false);
  }

  // ── game handlers ─────────────────────────────────────────

  async function handleAddGame(e: React.FormEvent) {
    e.preventDefault();
    if (!p1Id || !p2Id) return;
    setAddingGame(true);
    setError('');
    const { error: err } = await supabase.from('games').insert({
      tournament_id:  tournamentId,
      round_id:       roundId,
      scenario_id:    gameScenId || null,
      player1_id:     p1Id,
      player2_id:     p2Id,
      player1_attacks: p1Side === 'attacker',
      status:         'SCHEDULED',
    });
    if (err) setError(err.message);
    else { setP1Id(''); setP2Id(''); setGameScenId(''); setP1Side('attacker'); await fetchGames(); }
    setAddingGame(false);
  }

  async function handleRecordResult(gameId: string, winnerId: string, effectiveP1Attacks: boolean) {
    setSavingResult(true);
    setError('');
    const update: Record<string, unknown> = {
      winner_id:       winnerId,
      status:          'COMPLETED',
      player1_attacks: effectiveP1Attacks,
    };
    if (resultScenId) update.scenario_id = resultScenId;
    const { error: err } = await supabase.from('games').update(update).eq('id', gameId);
    if (err) setError(err.message);
    else { setRecordingFor(null); setResultScenId(''); setResultSidesFlipped(false); await fetchGames(); }
    setSavingResult(false);
  }

  async function handleRemoveGame(gameId: string) {
    setRemovingGame(true);
    const { error: err } = await supabase.from('games').delete().eq('id', gameId);
    if (err) setError(err.message);
    else { setConfirmRemGame(null); if (recordingFor === gameId) setRecordingFor(null); await fetchGames(); }
    setRemovingGame(false);
  }

  // ── derived ───────────────────────────────────────────────

  const playerById   = Object.fromEntries(enrolled.map(p => [p.id, p]));
  const scenarioById = Object.fromEntries(roundScenarios.map(s => [s.id, s]));

  const assignedIds      = new Set(games.flatMap(g => [g.player1_id, g.player2_id]));
  const sortByRecord = (a: Player, b: Player) =>
    (playerPoints[b.id] ?? 0) - (playerPoints[a.id] ?? 0) ||
    (playerRecords[b.id]?.w ?? 0) - (playerRecords[a.id]?.w ?? 0) ||
    a.name.localeCompare(b.name);
  const availablePlayers = enrolled.filter(p => !assignedIds.has(p.id)).sort(sortByRecord);
  const p2Options        = availablePlayers.filter(p => p.id !== p1Id);

  const roundScenIds = new Set(roundScenarios.map(s => s.id));
  const atScenLimit  = roundScenarios.length >= 10;

  // ── PDF report ───────────────────────────────────────────

  const generateMatchReport = () => {
    openMatchReportPdf(
      games,
      playerById,
      scenarioById,
      tournament?.name ?? 'Tournament',
      round?.round_number ?? '',
    );
  };

  // ── render ────────────────────────────────────────────────

  if (loading) return <Spinner />;
  if (!round) return (
    <div className='text-red'>
      Round not found. <Link to="/tournaments/$id" params={{ id: tournamentId }} className="text-accent inline-flex items-center gap-1"><ArrowLeft size={14} /> Back</Link>
    </div>
  );

  const roundComplete = round.status === 'COMPLETED';
  const p1 = p1Id ? playerById[p1Id] : null;
  const p2 = p2Id ? playerById[p2Id] : null;

  return (
    <div className="flex flex-col gap-6">

      {/* Breadcrumb + round nav */}
      <div className="anim-0 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 tracking-[0.14em] text-muted uppercase">
          <Link to="/tournaments" className="text-muted">Tournaments</Link>
          <span className="text-muted-dim">›</span>
          <Link to="/tournaments/$id" params={{ id: tournamentId }} className="text-muted">
            {tournament?.name ?? '…'}
          </Link>
          <span className="text-muted-dim">›</span>
          <span className="text-text-dim">Round {round.round_number}{round.name ? ` — ${round.name}` : ''}</span>
        </div>
        {allRounds.length > 1 && (() => {
          const idx  = allRounds.findIndex(r => r.id === roundId);
          const prev = allRounds[idx - 1];
          const next = allRounds[idx + 1];
          return (
            <div className="flex gap-1.5">
              {prev ? (
                <Link
                  to="/tournaments/$id/rounds/$roundId"
                  params={{ id: tournamentId, roundId: prev.id }}
                  className="tracking-[0.12em] uppercase py-1 px-2.5 bg-transparent border border-border text-muted cursor-pointer transition-all duration-150 inline-flex items-center gap-1 hover:border-accent hover:text-accent"
                ><ArrowLeft size={14} /> R{prev.round_number}</Link>
              ) : (
                <span className="tracking-[0.12em] uppercase py-1 px-2.5 bg-transparent border border-border text-border cursor-default transition-all duration-150 pointer-events-none inline-flex items-center gap-1"><ArrowLeft size={14} /> R{round.round_number - 1 || '?'}</span>
              )}
              {next ? (
                <Link
                  to="/tournaments/$id/rounds/$roundId"
                  params={{ id: tournamentId, roundId: next.id }}
                  className="tracking-[0.12em] uppercase py-1 px-2.5 bg-transparent border border-border text-muted cursor-pointer transition-all duration-150 inline-flex items-center gap-1 hover:border-accent hover:text-accent"
                >R{next.round_number} <ArrowRight size={14} /></Link>
              ) : (
                <span className="tracking-[0.12em] uppercase py-1 px-2.5 bg-transparent border border-border text-border cursor-default transition-all duration-150 pointer-events-none inline-flex items-center gap-1">R{round.round_number + 1} <ArrowRight size={14} /></span>
              )}
            </div>
          );
        })()}
      </div>

      {/* Round header */}
      <div className="card anim-1">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-4xl tracking-[0.06em] m-0">
              Round {round.round_number}
              {round.name && <span className="text-muted ml-2 text-2xl">— {round.name}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <select
                value={round.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`bg-bg tracking-[0.14em] uppercase py-1 pl-2.5 pr-7 outline-none appearance-none transition-opacity duration-150 ${updatingStatus ? 'opacity-60 cursor-wait' : 'opacity-100 cursor-pointer'}`}
                style={{ color: roundStatusColor(round.status), border: `1px solid ${roundStatusColor(round.status)}` }}
              >
                {ROUND_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex" style={{ color: roundStatusColor(round.status) }}><ChevronDownIcon size={12} /></span>
            </div>
            {games.length > 0 && (
              <button
                onClick={generateMatchReport}
                className="bg-transparent text-text-dim border border-border-bright tracking-[0.14em] uppercase py-1 px-2.5 cursor-pointer whitespace-nowrap transition-all duration-150 hover:border-accent hover:text-accent"
              >
                View Round Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="error-box">
          {error}
          <button onClick={() => setError('')} className="ml-4 bg-transparent border-none text-red cursor-pointer inline-flex items-center"><X size={14} /></button>
        </div>
      )}

      {/* ── Scenarios ──────────────────────────────────────── */}
      <div className="card anim-2 p-0! overflow-hidden">
        <button
          onClick={() => setScenOpen(o => { const next = !o; localStorage.setItem('roundDetail.scenOpen', String(next)); return next; })}
          className="w-full px-5 py-3.5 flex justify-between items-center bg-transparent border-none cursor-pointer text-left"
          style={{ borderBottom: scenOpen ? '1px solid var(--color-border)' : 'none' }}
        >
          <div className="section-label">
            Scenarios
            <span className="text-accent ml-2">{roundScenarios.length}/10</span>
          </div>
          <span className={`text-white transition-transform inline-flex items-center justify-center w-6 h-6 border border-[#dddddd] ${scenOpen ? 'rotate-0' : '-rotate-90'} shrink-0`}>▾</span>
        </button>

        {scenOpen && (
          <div className="px-5 py-3.5 flex flex-col gap-2">
            {roundScenarios.length === 0 ? (
              <p className="text-muted ml-1">
                No scenarios assigned yet.
              </p>
            ) : (
              roundScenarios.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {s.scen_id && (
                      <span className="text-accent tracking-tighter whitespace-nowrap shrink-0">
                        {s.scen_id}
                      </span>
                    )}
                    <span className="text-text-dim overflow-hidden text-ellipsis whitespace-nowrap">
                      {s.title}
                    </span>
                    <span className="text-muted-dim tracking-tighter whitespace-nowrap shrink-0">
                      {s.attacker_nationality} vs {s.defender_nationality}
                    </span>
                  </div>
                  {confirmRemScen === s.id ? (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleRemoveScenario(s.id)}
                        disabled={removingScen === s.id}
                        className="bg-red-bg border border-red text-red-bright tracking-widest py-1 px-2 cursor-pointer"
                      >
                        {removingScen === s.id ? '...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmRemScen(null)}
                        className="bg-transparent border border-border text-muted py-1 px-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemScen(s.id)}
                      className="bg-transparent border border-red-border text-red tracking-widest uppercase py-1 px-2 cursor-pointer shrink-0 transition-all duration-150 hover:border-red-bright"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}

            {!atScenLimit && (
              <div className={`flex gap-2 items-center ${roundScenarios.length > 0 ? 'mt-2' : 'mt-0'}`}>
                <ScenarioPicker
                  excludeIds={roundScenIds}
                  value={scenPick}
                  onChange={setScenPick}

                />
                <button
                  onClick={handleAddScenario}
                  disabled={addingScen || !scenPick}
                  className={`btn-primary py-1.5! px-3! shrink-0 ${addingScen || !scenPick ? 'opacity-50' : 'opacity-100'}`}
                >
                  {addingScen ? '...' : '+ Add'}
                </button>
              </div>
            )}
            {atScenLimit && (
              <div className="text-accent tracking-widest mt-1">
                MAX 10 SCENARIOS REACHED
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Games ──────────────────────────────────────────── */}
      <div className="card anim-3 p-0! overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <div className="section-label">
            Games
            <span className="text-accent ml-2">{games.length}</span>
          </div>
          <span className="tracking-tight text-muted-dim">
            {games.filter(g => g.status === 'COMPLETED').length}/{games.length} COMPLETED
          </span>
        </div>

        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-8 gap-3">
            <p className="text-muted-dim m-0 text-center">
              No games scheduled yet. Create the first pairing below.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {games.map((game, idx) => {
              const scenario  = game.scenario_id ? scenarioById[game.scenario_id] : null;
              const p1        = playerById[game.player1_id];
              const p2        = playerById[game.player2_id];
              const winner    = game.winner_id ? playerById[game.winner_id] : null;
              const p1Role    = game.player1_attacks ? 'Attacker' : 'Defender';
              const p2Role    = game.player1_attacks ? 'Defender' : 'Attacker';
              const isRecording = recordingFor === game.id;
              const effP1Attacks = resultSidesFlipped ? !game.player1_attacks : game.player1_attacks;
              const effP1Role    = effP1Attacks ? 'Attacker' : 'Defender';
              const effP2Role    = effP1Attacks ? 'Defender' : 'Attacker';

              return (
                <div key={game.id} className={idx < games.length - 1 ? 'border-b border-border' : ''}>
                  <div className="px-5 py-4 grid grid-cols-[1fr_auto] gap-3 items-start">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {scenario?.scen_id && (
                          <span className="text-accent tracking-tighter shrink-0">
                            {scenario.scen_id}
                          </span>
                        )}
                        <span className="text-text font-semibold">
                          {scenario?.title ?? '—'}
                        </span>
                        {scenario && (
                          <span className="text-muted-dim tracking-tighter whitespace-nowrap">
                            {scenario.attacker_nationality} vs {scenario.defender_nationality}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <PlayerSideTag name={p1?.name ?? '—'} role={p1Role} isWinner={game.winner_id === game.player1_id} isCompleted={game.status === 'COMPLETED'} points={p1 ? playerPoints[p1.id] : undefined} />
                        <span className="text-muted-dim">vs</span>
                        <PlayerSideTag name={p2?.name ?? '—'} role={p2Role} isWinner={game.winner_id === game.player2_id} isCompleted={game.status === 'COMPLETED'} points={p2 ? playerPoints[p2.id] : undefined} />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="tracking-tight uppercase border py-1 px-2" style={{ color: gameStatusColor(game.status), borderColor: gameStatusColor(game.status) }}>
                          {game.status === 'COMPLETED' ? 'Complete' : 'Scheduled'}
                        </span>
                        {game.status === 'COMPLETED' && !roundComplete && (
                          <button
                            onClick={() => { setRecordingFor(isRecording ? null : game.id); setResultScenId(''); setResultSidesFlipped(false); }}
                            title="Edit result"
                            className={`icon-btn accent${isRecording ? ' active' : ''}`}
                          >✎</button>
                        )}
                        {!roundComplete && (confirmRemGame === game.id ? (
                          <>
                            <button
                              onClick={() => handleRemoveGame(game.id)}
                              disabled={removingGame}
                              title="Confirm remove"
                              className="bg-red-bg border border-red text-red-bright py-1 px-1.5 cursor-pointer leading-none"
                            >{removingGame ? '…' : <Check size={14} />}</button>
                            <button
                              onClick={() => setConfirmRemGame(null)}
                              title="Cancel"
                              className="btn-secondary py-1! px-1.5!"
                            ><X size={14} /></button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmRemGame(game.id)}
                            title="Remove game"
                            className="icon-btn danger"
                          >🗑</button>
                        ))}
                      </div>
                      {game.status === 'COMPLETED' && winner && (
                        <span className="text-green-dim tracking-widest">
                          ✓ {winner.name}
                        </span>
                      )}
                      {game.status !== 'COMPLETED' && !roundComplete && (
                        <button
                          onClick={() => { setRecordingFor(isRecording ? null : game.id); setResultScenId(''); setResultSidesFlipped(false); }}
                          className={`${isRecording ? 'btn-secondary' : 'btn-primary'} py-1! px-2.5!`}
                        >
                          {isRecording ? 'Cancel' : '▶ Record Result'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isRecording && (
                    <div className="px-5 pt-3 pb-4 bg-bg border-t border-border flex flex-col gap-3">
                      {!game.scenario_id && roundScenarios.length > 0 && (
                        <div>
                          <label className="field-label">Scenario</label>
                          <div className="relative max-w-[360px]">
                            <select value={resultScenId} onChange={e => setResultScenId(e.target.value)} className={SELECT_CLS}>
                              <option value="">TBD</option>
                              {roundScenarios.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.scen_id ? `${s.scen_id} — ` : ''}{s.title}
                                </option>
                              ))}
                            </select>
                            <ChevronDown />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <div className="section-label">Sides</div>
                        <button
                          type="button"
                          onClick={() => setResultSidesFlipped(f => !f)}
                          className="bg-transparent border border-border-bright text-text-dim tracking-widest uppercase py-1 px-2 cursor-pointer transition-all duration-150 hover:border-accent hover:text-accent"
                        >
                          ⇄ Swap
                        </button>
                      </div>
                      <div className="flex items-center gap-3 bg-surface border border-border px-3 py-2">
                        <span className="text-text">{p1?.name ?? '—'}</span>
                        <span className="text-accent tracking-tight">{effP1Role === 'Attacker' ? 'ATK' : 'DEF'}</span>
                        <span className="text-muted-dim">vs</span>
                        <span className="text-text">{p2?.name ?? '—'}</span>
                        <span className="text-accent tracking-tight">{effP2Role === 'Attacker' ? 'ATK' : 'DEF'}</span>
                      </div>
                      <div className="section-label mb-1">Who won?</div>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { id: game.player1_id, player: p1, role: effP1Role },
                          { id: game.player2_id, player: p2, role: effP2Role },
                        ].map(({ id, player, role }) => (
                          <button
                            key={id}
                            onClick={() => handleRecordResult(game.id, id, effP1Attacks)}
                            disabled={savingResult}
                            className={`bg-surface border border-border text-text tracking-widest py-2 px-4 transition-all duration-150 flex flex-col items-start gap-0.5 hover:border-accent hover:text-accent ${savingResult ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                          >
                            <span className="text-muted">{role.toUpperCase()}</span>
                            <span>{player?.name ?? '—'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Schedule a Game ────────────────────────────────── */}
      {!roundComplete && (
        <div className="card anim-4">
          <div className="section-label mb-2">Schedule a Game</div>
          {availablePlayers.length < 2 ? (
            <p className="text-muted m-0">
              {availablePlayers.length === 0
                ? 'All enrolled players already have a game this round.'
                : `Only ${availablePlayers.length} player available — need at least 2 to schedule a game.`}
            </p>
          ) : (
            <form onSubmit={handleAddGame} className="flex flex-col gap-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div>
                  <label className="field-label">Player 1</label>
                  <div className="relative">
                    <select value={p1Id} onChange={e => { setP1Id(e.target.value); if (e.target.value === p2Id) setP2Id(''); }} required className={SELECT_CLS}>
                      <option value="">Select player…</option>
                      {availablePlayers.map(p => { const r = playerRecords[p.id] ?? { w: 0, l: 0 }; const pts = playerPoints[p.id] ?? 0; return <option key={p.id} value={p.id}>{p.name} ({pts} pts, {r.w}-{r.l})</option>; })}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 pb-0.5">
                  <label className="field-label whitespace-nowrap">P1 Side</label>
                  <div className="flex border border-border overflow-hidden">
                    {(['attacker', 'defender'] as const).map(side => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setP1Side(side)}
                        className={`${p1Side === side ? 'bg-accent text-bg' : 'bg-bg text-muted'} border-none ${side === 'attacker' ? 'border-r border-border' : ''} tracking-[0.12em] uppercase py-1.5 px-2.5 cursor-pointer transition-all duration-150`}
                      >
                        {side}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label">Player 2 ({p1Side === 'attacker' ? 'Defender' : 'Attacker'})</label>
                  <div className="relative">
                    <select value={p2Id} onChange={e => setP2Id(e.target.value)} required disabled={!p1Id} className={`${SELECT_CLS} ${p1Id ? 'opacity-100' : 'opacity-50'}`}>
                      <option value="">Select player…</option>
                      {p2Options.map(p => { const r = playerRecords[p.id] ?? { w: 0, l: 0 }; const pts = playerPoints[p.id] ?? 0; return <option key={p.id} value={p.id}>{p.name} ({r.w}-{r.l}, {pts}pts)</option>; })}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
              </div>

              {p1 && p2 && (
                <div className="flex flex-col gap-1.5">
                  <div className="bg-bg border border-border py-2.5 px-3.5 flex items-center gap-4 tracking-widest">
                    <span className="text-muted">PREVIEW</span>
                    <span className="text-text">{p1.name}</span>
                    <span className="text-accent">{p1Side === 'attacker' ? 'ATK' : 'DEF'}</span>
                    <span className="text-muted-dim">vs</span>
                    <span className="text-text">{p2.name}</span>
                    <span className="text-accent">{p1Side === 'attacker' ? 'DEF' : 'ATK'}</span>
                  </div>
                  {priorMatchups.has([p1Id, p2Id].sort().join('|')) && (
                    <div className="error-box">⚠ These players have already met in this tournament</div>
                  )}
                </div>
              )}

              <div>
                <label className="field-label">Scenario <span className="text-muted-dim tracking-tighter normal-case">(optional — can be set when recording result)</span></label>
                <div className="relative">
                  <select value={gameScenId} onChange={e => setGameScenId(e.target.value)} className={SELECT_CLS}>
                    <option value="">TBD</option>
                    {roundScenarios.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.scen_id ? `${s.scen_id} — ` : ''}{s.title} ({s.attacker_nationality} vs {s.defender_nationality})
                      </option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className={`btn-primary ${(addingGame || !p1Id || !p2Id) ? 'opacity-50' : ''} ${addingGame ? 'cursor-wait' : ''}`}
                  disabled={addingGame || !p1Id || !p2Id}
                >
                  {addingGame ? 'Scheduling…' : '+ Schedule Game'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {roundComplete && (
        <div className="text-muted-dim text-center tracking-tighter">
          Round is complete. Change status to Upcoming or Started to modify games or scenarios.
        </div>
      )}
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────

function PlayerSideTag({ name, role, isWinner, isCompleted, points }: { name: string; role: string; isWinner: boolean; isCompleted: boolean; points?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`tracking-tight uppercase ${role === 'Attacker' ? 'text-accent border border-accent-dim' : 'text-muted border border-border'} py-0.5 px-1.5 shrink-0`}>
        {role === 'Attacker' ? 'ATK' : 'DEF'}
      </span>
      <span className={`${isCompleted && isWinner ? 'text-green-dim' : isCompleted ? 'text-muted' : 'text-text-dim'} ${isWinner ? 'font-semibold' : 'font-normal'}`}>
        {name}
        {points !== undefined && (
          <sup className="tracking-[0.05em] text-muted ml-[0.15em] align-super leading-[0]">
            {points}
          </sup>
        )}
      </span>
      {isWinner && <span className="text-green-dim">✓</span>}
    </div>
  );
}

function ChevronDown() {
  return (
    <span className="absolute right-[0.6rem] top-1/2 -translate-y-1/2 text-muted pointer-events-none inline-flex"><ChevronDownIcon size={12} /></span>
  );
}
