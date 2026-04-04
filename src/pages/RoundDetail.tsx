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
import { toTitleCase } from '@/utils/format';
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
  excludeIds, value, onChange, currentCount,
}: {
  excludeIds: Set<string>;
  value: string;
  onChange: (id: string) => void;
  currentCount: number;
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
    <div style={{ flex: 1, minWidth: '200px' }}>
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => { updateDropPos(); inputVal.trim() && setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={`Search by ID or title… (${currentCount}/10)`}
        className="input"
        style={{ width: '100%' }}
        autoComplete="off"
      />
      {open && inputVal.trim().length > 0 && createPortal(
        <div style={{
          position: 'fixed', zIndex: 9999,
          background: 'var(--color-bg)', border: '1px solid var(--color-border-bright)',
          maxHeight: '320px', overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          ...dropStyle,
        }}>
          {results.length > 0 ? results.map(s => (
            <div
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '0.6rem', borderBottom: '1px solid var(--color-raised)' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--color-raised)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              {s.scen_id && (
                <span style={{ color: 'var(--color-accent)', letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {s.scen_id}
                </span>
              )}
              <span style={{ color: 'var(--color-text-dim)' }}>{s.title}</span>
              <span style={{ color: 'var(--color-muted-dim)', marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {toTitleCase(s.attacker_nationality)} vs {toTitleCase(s.defender_nationality)}
              </span>
            </div>
          )) : (
            <div style={{ padding: '0.6rem 0.75rem', color: 'var(--color-muted-dim)', letterSpacing: '0.1em' }}>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '0.75rem' }}>
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
    <div style={{ color: 'var(--color-red)' }}>
      Round not found. <Link to="/tournaments/$id" params={{ id: tournamentId }} style={{ color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ArrowLeft size={14} /> Back</Link>
    </div>
  );

  const roundComplete = round.status === 'COMPLETED';
  const p1 = p1Id ? playerById[p1Id] : null;
  const p2 = p2Id ? playerById[p2Id] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Breadcrumb + round nav */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.14em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
          <Link to="/tournaments" style={{ color: 'var(--color-muted)' }}>Tournaments</Link>
          <span style={{ color: 'var(--color-muted-dim)' }}>›</span>
          <Link to="/tournaments/$id" params={{ id: tournamentId }} style={{ color: 'var(--color-muted)' }}>
            {tournament?.name ?? '…'}
          </Link>
          <span style={{ color: 'var(--color-muted-dim)' }}>›</span>
          <span style={{ color: 'var(--color-text-dim)' }}>Round {round.round_number}{round.name ? ` — ${round.name}` : ''}</span>
        </div>
        {allRounds.length > 1 && (() => {
          const idx  = allRounds.findIndex(r => r.id === roundId);
          const prev = allRounds[idx - 1];
          const next = allRounds[idx + 1];
          const btnStyle = (enabled: boolean): React.CSSProperties => ({
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '0.25rem 0.6rem',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: enabled ? 'var(--color-muted)' : 'var(--color-border)',
            cursor: enabled ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            pointerEvents: enabled ? 'auto' : 'none',
          });
          return (
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {prev ? (
                <Link to="/tournaments/$id/rounds/$roundId" params={{ id: tournamentId, roundId: prev.id }}
                  style={{ ...btnStyle(true), display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}
                ><ArrowLeft size={14} /> R{prev.round_number}</Link>
              ) : <span style={{ ...btnStyle(false), display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><ArrowLeft size={14} /> R{round.round_number - 1 || '?'}</span>}
              {next ? (
                <Link to="/tournaments/$id/rounds/$roundId" params={{ id: tournamentId, roundId: next.id }}
                  style={{ ...btnStyle(true), display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}
                >R{next.round_number} <ArrowRight size={14} /></Link>
              ) : <span style={{ ...btnStyle(false), display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>R{round.round_number + 1} <ArrowRight size={14} /></span>}
            </div>
          );
        })()}
      </div>

      {/* Round header */}
      <div className="card anim-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', letterSpacing: '0.06em', margin: 0 }}>
              Round {round.round_number}
              {round.name && <span style={{ color: 'var(--color-muted)', marginLeft: '0.5rem', fontSize: '1.4rem' }}>— {round.name}</span>}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={round.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                style={{
                  background: 'var(--color-bg)',
                  color: roundStatusColor(round.status),
                  border: `1px solid ${roundStatusColor(round.status)}`,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '0.3rem 1.75rem 0.3rem 0.6rem',
                  outline: 'none',
                  appearance: 'none',
                  cursor: updatingStatus ? 'wait' : 'pointer',
                  opacity: updatingStatus ? 0.6 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {ROUND_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: roundStatusColor(round.status), pointerEvents: 'none', display: 'inline-flex' }}><ChevronDownIcon size={12} /></span>
            </div>
            {games.length > 0 && (
              <button
                onClick={generateMatchReport}
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-dim)',
                  border: '1px solid var(--color-border-bright)',
                  fontSize: 'inherit',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '0.3rem 0.6rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-accent)'; b.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-border-bright)'; b.style.color = 'var(--color-text-dim)'; }}
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
          <button onClick={() => setError('')} style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}><X size={14} /></button>
        </div>
      )}

      {/* ── Scenarios ──────────────────────────────────────── */}
      <div className="card anim-2" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setScenOpen(o => { const next = !o; localStorage.setItem('roundDetail.scenOpen', String(next)); return next; })}
          style={{ width: '100%', padding: '0.875rem 1.25rem', borderBottom: scenOpen ? '1px solid var(--color-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div className="section-label">
            Scenarios
            <span style={{ color: 'var(--color-accent)', marginLeft: '0.5rem' }}>{roundScenarios.length}/10</span>
          </div>
          <span style={{ color: '#ffffff', transition: 'transform 0.15s ease', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', border: '1px solid #dddddd', transform: scenOpen ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}>▾</span>
        </button>

        {scenOpen && <div style={{ padding: '0.875rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {roundScenarios.length === 0 ? (
            <p style={{ color: 'var(--color-muted-dim)', margin: '0 0 0.5rem' }}>
              No scenarios assigned yet.
            </p>
          ) : (
            roundScenarios.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  {s.scen_id && (
                    <span style={{ color: 'var(--color-accent)', letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {s.scen_id}
                    </span>
                  )}
                  <span style={{ color: 'var(--color-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}
                  </span>
                  <span style={{ color: 'var(--color-muted-dim)', letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {toTitleCase(s.attacker_nationality)} vs {toTitleCase(s.defender_nationality)}
                  </span>
                </div>
                {confirmRemScen === s.id ? (
                  <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleRemoveScenario(s.id)}
                      disabled={removingScen === s.id}
                      style={{ background: 'var(--color-red-bg)', border: '1px solid var(--color-red)', color: 'var(--color-red-bright)', letterSpacing: '0.1em', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    >
                      {removingScen === s.id ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmRemScen(null)}
                      style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-muted)', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemScen(s.id)}
                    style={{ background: 'transparent', border: '1px solid var(--color-red-border)', color: 'var(--color-red)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.5rem', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-red-bright)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-red-border)'}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}

          {!atScenLimit && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: roundScenarios.length > 0 ? '0.5rem' : '0' }}>
              <ScenarioPicker
                excludeIds={roundScenIds}
                value={scenPick}
                onChange={setScenPick}
                currentCount={roundScenarios.length}
              />
              <button
                onClick={handleAddScenario}
                disabled={addingScen || !scenPick}
                className="btn-primary"
                style={{ opacity: addingScen || !scenPick ? 0.5 : 1, padding: '0.4rem 0.75rem', flexShrink: 0 }}
              >
                {addingScen ? '...' : '+ Add'}
              </button>
            </div>
          )}
          {atScenLimit && (
            <div style={{ color: 'var(--color-accent)', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
              MAX 10 SCENARIOS REACHED
            </div>
          )}
        </div>}
      </div>

      {/* ── Games ──────────────────────────────────────────── */}
      <div className="card anim-3" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-label">
            Games
            <span style={{ color: 'var(--color-accent)', marginLeft: '0.5rem' }}>{games.length}</span>
          </div>
          <span style={{ color: 'var(--color-muted-dim)', letterSpacing: '0.12em' }}>
            {games.filter(g => g.status === 'COMPLETED').length}/{games.length} COMPLETED
          </span>
        </div>

        {games.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', gap: '0.75rem' }}>
            <p style={{ color: 'var(--color-muted-dim)', margin: 0, textAlign: 'center' }}>
              No games scheduled yet. Create the first pairing below.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {games.map((game, idx) => {
              const scenario  = game.scenario_id ? scenarioById[game.scenario_id] : null;
              const p1        = playerById[game.player1_id];
              const p2        = playerById[game.player2_id];
              const winner    = game.winner_id ? playerById[game.winner_id] : null;
              // roles based on player1_attacks flag
              const p1Role    = game.player1_attacks ? 'Attacker' : 'Defender';
              const p2Role    = game.player1_attacks ? 'Defender' : 'Attacker';
              const isRecording = recordingFor === game.id;
              // effective roles when swap is active in the recording panel
              const effP1Attacks = resultSidesFlipped ? !game.player1_attacks : game.player1_attacks;
              const effP1Role    = effP1Attacks ? 'Attacker' : 'Defender';
              const effP2Role    = effP1Attacks ? 'Defender' : 'Attacker';

              return (
                <div key={game.id} style={{ borderBottom: idx < games.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {scenario?.scen_id && (
                          <span style={{ color: 'var(--color-accent)', letterSpacing: '0.08em', flexShrink: 0 }}>
                            {scenario.scen_id}
                          </span>
                        )}
                        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                          {scenario?.title ?? '—'}
                        </span>
                        {scenario && (
                          <span style={{ color: 'var(--color-muted-dim)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                            {toTitleCase(scenario.attacker_nationality)} vs {toTitleCase(scenario.defender_nationality)}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <PlayerSideTag name={p1?.name ?? '—'} role={p1Role} isWinner={game.winner_id === game.player1_id} isCompleted={game.status === 'COMPLETED'} points={p1 ? playerPoints[p1.id] : undefined} />
                        <span style={{ color: 'var(--color-muted-dim)' }}>vs</span>
                        <PlayerSideTag name={p2?.name ?? '—'} role={p2Role} isWinner={game.winner_id === game.player2_id} isCompleted={game.status === 'COMPLETED'} points={p2 ? playerPoints[p2.id] : undefined} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: gameStatusColor(game.status), border: `1px solid ${gameStatusColor(game.status)}`, padding: '0.2rem 0.5rem' }}>
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
                              style={{ background: 'var(--color-red-bg)', border: '1px solid var(--color-red)', color: 'var(--color-red-bright)', padding: '0.2rem 0.35rem', cursor: 'pointer', lineHeight: 1 }}
                            >{removingGame ? '…' : <Check size={14} />}</button>
                            <button
                              onClick={() => setConfirmRemGame(null)}
                              title="Cancel"
                              className="btn-secondary"
                              style={{ padding: '0.2rem 0.35rem' }}
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
                        <span style={{ color: 'var(--color-green-dim)', letterSpacing: '0.1em' }}>
                          ✓ {winner.name}
                        </span>
                      )}
                      {game.status !== 'COMPLETED' && !roundComplete && (
                        <button
                          onClick={() => { setRecordingFor(isRecording ? null : game.id); setResultScenId(''); setResultSidesFlipped(false); }}
                          className={isRecording ? 'btn-secondary' : 'btn-primary'}
                          style={{ padding: '0.25rem 0.6rem' }}
                        >
                          {isRecording ? 'Cancel' : '▶ Record Result'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isRecording && (
                    <div style={{ padding: '0.75rem 1.25rem 1rem', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {!game.scenario_id && roundScenarios.length > 0 && (
                        <div>
                          <label className="field-label">Scenario</label>
                          <div style={{ position: 'relative', maxWidth: '360px' }}>
                            <select value={resultScenId} onChange={e => setResultScenId(e.target.value)} style={selectStyle}>
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div className="section-label">Sides</div>
                        <button
                          type="button"
                          onClick={() => setResultSidesFlipped(f => !f)}
                          style={{ background: 'transparent', border: '1px solid var(--color-border-bright)', color: 'var(--color-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.5rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-accent)'; b.style.color = 'var(--color-accent)'; }}
                          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-border-bright)'; b.style.color = 'var(--color-text-dim)'; }}
                        >
                          ⇄ Swap
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '0.5rem 0.75rem' }}>
                        <span style={{ color: 'var(--color-text)' }}>{p1?.name ?? '—'}</span>
                        <span style={{ color: 'var(--color-accent)', letterSpacing: '0.12em' }}>{effP1Role === 'Attacker' ? 'ATK' : 'DEF'}</span>
                        <span style={{ color: 'var(--color-muted-dim)' }}>vs</span>
                        <span style={{ color: 'var(--color-text)' }}>{p2?.name ?? '—'}</span>
                        <span style={{ color: 'var(--color-accent)', letterSpacing: '0.12em' }}>{effP2Role === 'Attacker' ? 'ATK' : 'DEF'}</span>
                      </div>
                      <div className="section-label" style={{ marginBottom: '0.25rem' }}>Who won?</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {[
                          { id: game.player1_id, player: p1, role: effP1Role },
                          { id: game.player2_id, player: p2, role: effP2Role },
                        ].map(({ id, player, role }) => (
                          <button
                            key={id}
                            onClick={() => handleRecordResult(game.id, id, effP1Attacks)}
                            disabled={savingResult}
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', letterSpacing: '0.1em', padding: '0.5rem 1rem', cursor: savingResult ? 'wait' : 'pointer', transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem', opacity: savingResult ? 0.5 : 1 }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-accent)'; b.style.color = 'var(--color-accent)'; }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-border)'; b.style.color = 'var(--color-text)'; }}
                          >
                            <span style={{ color: 'var(--color-muted)', letterSpacing: '0.15em' }}>{role.toUpperCase()}</span>
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
          <div className="section-label" style={{ marginBottom: '0.875rem' }}>Schedule a Game</div>

          {availablePlayers.length < 2 ? (
            <p style={{ color: 'var(--color-muted-dim)', margin: 0 }}>
              {availablePlayers.length === 0
                ? 'All enrolled players already have a game this round.'
                : `Only ${availablePlayers.length} player available — need at least 2 to schedule a game.`}
            </p>
          ) : (
            <form onSubmit={handleAddGame} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                  <label className="field-label">Player 1</label>
                  <div style={{ position: 'relative' }}>
                    <select value={p1Id} onChange={e => { setP1Id(e.target.value); if (e.target.value === p2Id) setP2Id(''); }} required style={selectStyle}>
                      <option value="">Select player…</option>
                      {availablePlayers.map(p => { const r = playerRecords[p.id] ?? { w: 0, l: 0 }; const pts = playerPoints[p.id] ?? 0; return <option key={p.id} value={p.id}>{p.name} ({pts} pts, {r.w}-{r.l})</option>; })}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', paddingBottom: '2px' }}>
                  <label className="field-label" style={{ whiteSpace: 'nowrap' }}>P1 Side</label>
                  <div style={{ display: 'flex', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                    {(['attacker', 'defender'] as const).map(side => (
                      <button key={side} type="button" onClick={() => setP1Side(side)} style={{ background: p1Side === side ? 'var(--color-accent)' : 'var(--color-bg)', color: p1Side === side ? 'var(--color-bg)' : 'var(--color-muted)', border: 'none', borderRight: side === 'attacker' ? '1px solid var(--color-border)' : 'none', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.35rem 0.6rem', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                        {side}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label">Player 2 ({p1Side === 'attacker' ? 'Defender' : 'Attacker'})</label>
                  <div style={{ position: 'relative' }}>
                    <select value={p2Id} onChange={e => setP2Id(e.target.value)} required disabled={!p1Id} style={{ ...selectStyle, opacity: p1Id ? 1 : 0.5 }}>
                      <option value="">Select player…</option>
                      {p2Options.map(p => { const r = playerRecords[p.id] ?? { w: 0, l: 0 }; const pts = playerPoints[p.id] ?? 0; return <option key={p.id} value={p.id}>{p.name} ({r.w}-{r.l}, {pts}pts)</option>; })}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
              </div>

              {p1 && p2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '0.6rem 0.875rem', display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '0.1em' }}>
                    <span style={{ color: 'var(--color-muted)' }}>PREVIEW</span>
                    <span style={{ color: 'var(--color-text)' }}>{p1.name}</span>
                    <span style={{ color: 'var(--color-accent)' }}>{p1Side === 'attacker' ? 'ATK' : 'DEF'}</span>
                    <span style={{ color: 'var(--color-muted-dim)' }}>vs</span>
                    <span style={{ color: 'var(--color-text)' }}>{p2.name}</span>
                    <span style={{ color: 'var(--color-accent)' }}>{p1Side === 'attacker' ? 'DEF' : 'ATK'}</span>
                  </div>
                  {priorMatchups.has([p1Id, p2Id].sort().join('|')) && (
                    <div className="error-box">⚠ These players have already met in this tournament</div>
                  )}
                </div>
              )}

              <div>
                <label className="field-label">Scenario <span style={{ color: 'var(--color-muted-dim)', letterSpacing: '0.08em', textTransform: 'none' }}>(optional — can be set when recording result)</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={gameScenId} onChange={e => setGameScenId(e.target.value)} style={selectStyle}>
                    <option value="">TBD</option>
                    {roundScenarios.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.scen_id ? `${s.scen_id} — ` : ''}{s.title} ({toTitleCase(s.attacker_nationality)} vs {toTitleCase(s.defender_nationality)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>

              <div>
                <button type="submit" className="btn-primary" disabled={addingGame || !p1Id || !p2Id} style={{ opacity: (addingGame || !p1Id || !p2Id) ? 0.5 : 1, cursor: addingGame ? 'wait' : 'pointer' }}>
                  {addingGame ? 'Scheduling…' : '+ Schedule Game'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {roundComplete && (
        <div style={{ color: 'var(--color-muted-dim)', letterSpacing: '0.12em', textAlign: 'center', padding: '0.25rem' }}>
          Round is complete. Change status to Upcoming or Started to modify games or scenarios.
        </div>
      )}
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────

function PlayerSideTag({ name, role, isWinner, isCompleted, points }: { name: string; role: string; isWinner: boolean; isCompleted: boolean; points?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: role === 'Attacker' ? 'var(--color-accent)' : 'var(--color-muted)', border: `1px solid ${role === 'Attacker' ? 'var(--color-accent-dim)' : 'var(--color-border)'}`, padding: '0.1rem 0.35rem', flexShrink: 0 }}>
        {role === 'Attacker' ? 'ATK' : 'DEF'}
      </span>
      <span style={{ color: isCompleted && isWinner ? 'var(--color-green-dim)' : isCompleted ? 'var(--color-muted)' : 'var(--color-text-dim)', fontWeight: isWinner ? 600 : 400 }}>
        {name}
        {points !== undefined && (
          <sup style={{ letterSpacing: '0.05em', color: 'var(--color-muted)', marginLeft: '0.15em', verticalAlign: 'super', lineHeight: 0 }}>
            {points}
          </sup>
        )}
      </span>
      {isWinner && <span style={{ color: 'var(--color-green-dim)' }}>✓</span>}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  letterSpacing: '0.06em',
  padding: '0.5rem 2rem 0.5rem 0.75rem',
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer',
};

function ChevronDown() {
  return (
    <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none', display: 'inline-flex' }}><ChevronDownIcon size={12} /></span>
  );
}
