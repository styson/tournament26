/**
 * RoundDetail — Manage scenarios, schedule games, record results, change round status.
 *
 * games table: id, tournament_id, round_id, scenario_id,
 *   player1_id, player2_id, player1_attacks bool, winner_id (nullable), status
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

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

// ─── scenario cache (session-level) ─────────────────────────

let _scenarioCache: ScenarioRow[] | null = null;

async function loadAllScenarios(): Promise<ScenarioRow[]> {
  if (_scenarioCache?.length) return _scenarioCache;
  const { data, error } = await supabase
    .from('scenarios')
    .select('id, scen_id, title, attacker_nationality, defender_nationality')
    .order('title');
  if (error) { console.error(error); return []; }
  _scenarioCache = data ?? [];
  return _scenarioCache;
}

// ─── constants ───────────────────────────────────────────────

const ROUND_STATUSES = [
  { value: 'PENDING',     label: 'Upcoming' },
  { value: 'IN_PROGRESS', label: 'Started'  },
  { value: 'COMPLETED',   label: 'Complete' },
];

function roundStatusColor(s: string) {
  switch (s) {
    case 'IN_PROGRESS': return 'var(--c-accent)';
    case 'COMPLETED':   return 'var(--c-green-dim)';
    default:            return 'var(--c-muted)';
  }
}
function gameStatusColor(s: string) {
  return s === 'COMPLETED' ? 'var(--c-green-dim)' : 'var(--c-muted)';
}

// ─── scenario search combobox ────────────────────────────────

function ScenarioPicker({
  available, value, onChange, currentCount,
}: {
  available: ScenarioRow[];
  value: string;
  onChange: (id: string) => void;
  currentCount: number;
}) {
  const [inputVal, setInputVal] = useState('');
  const [open, setOpen] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!value) setInputVal(''); }, [value]);

  const filtered = inputVal.trim().length > 0
    ? available
        .filter(s =>
          (s.scen_id ?? '').toLowerCase().includes(inputVal.toLowerCase()) ||
          s.title.toLowerCase().includes(inputVal.toLowerCase())
        )
        .sort((a, b) => (a.scen_id ?? '').localeCompare(b.scen_id ?? '', undefined, { numeric: true }))
    : [];

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
    if (!val) onChange('');
    updateDropPos();
    setOpen(true);
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
        placeholder={`Search by ID or title… (${currentCount}/5)`}
        className="input"
        style={{ width: '100%', fontSize: '0.72rem' }}
        autoComplete="off"
      />
      {open && inputVal.trim().length > 0 && createPortal(
        <div style={{
          position: 'fixed', zIndex: 9999,
          background: 'var(--c-bg)', border: '1px solid var(--c-border-bright)',
          maxHeight: '320px', overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          ...dropStyle,
        }}>
          {filtered.length > 0 ? filtered.map(s => (
            <div
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '0.6rem', borderBottom: '1px solid var(--c-raised)' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--c-raised)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              {s.scen_id && (
                <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-accent)', letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {s.scen_id}
                </span>
              )}
              <span style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-text-dim)' }}>{s.title}</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', color: 'var(--c-muted-dim)', marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {s.attacker_nationality} vs {s.defender_nationality}
              </span>
            </div>
          )) : (
            <div style={{ padding: '0.6rem 0.75rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: 'var(--c-muted-dim)', letterSpacing: '0.1em' }}>
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
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--c-spin-track)', borderTopColor: 'var(--c-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  const [allScenarios,   setAllScenarios]   = useState<ScenarioRow[]>([]);
  const [games,          setGames]          = useState<GameRow[]>([]);
  const [playerRecords,  setPlayerRecords]  = useState<Record<string, { w: number; l: number }>>({});

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // round status
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // scenario management
  const [scenOpen,       setScenOpen]       = useState(() => localStorage.getItem('roundDetail.scenOpen') !== 'false');
  const [scenPick,       setScenPick]       = useState('');
  const [addingScen,     setAddingScen]     = useState(false);
  const [removingScen,   setRemovingScen]   = useState<string | null>(null);
  const [confirmRemScen, setConfirmRemScen] = useState<string | null>(null);

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
    const [roundRes, tourneyRes, enrolledRes, scenRes, completedRes] = await Promise.all([
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
    ]);

    if (roundRes.error)   { setError(roundRes.error.message);   setLoading(false); return; }
    if (tourneyRes.error) { setError(tourneyRes.error.message); setLoading(false); return; }

    setRound(roundRes.data);
    setTournament(tourneyRes.data ?? null);
    setEnrolled((enrolledRes.data ?? []).map((r: any) => r.players).filter(Boolean));
    setRoundScenarios((scenRes.data ?? []).map((r: any) => r.scenarios).filter(Boolean));

    const rec: Record<string, { w: number; l: number }> = {};
    for (const g of (completedRes.data ?? [])) {
      for (const pid of [g.player1_id, g.player2_id]) {
        if (!rec[pid]) rec[pid] = { w: 0, l: 0 };
        if (g.winner_id === pid) rec[pid].w++;
        else rec[pid].l++;
      }
    }
    setPlayerRecords(rec);

    const all = await loadAllScenarios();
    setAllScenarios(all);

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

  // ── derived ───────────────────────────────────────────────

  const playerById   = Object.fromEntries(enrolled.map(p => [p.id, p]));
  const scenarioById = Object.fromEntries(roundScenarios.map(s => [s.id, s]));

  const assignedIds      = new Set(games.flatMap(g => [g.player1_id, g.player2_id]));
  const sortByRecord = (a: Player, b: Player) => {
    const ra = playerRecords[a.id] ?? { w: 0, l: 0 };
    const rb = playerRecords[b.id] ?? { w: 0, l: 0 };
    return rb.w - ra.w || a.name.localeCompare(b.name);
  };
  const availablePlayers = enrolled.filter(p => !assignedIds.has(p.id)).sort(sortByRecord);
  const p2Options        = availablePlayers.filter(p => p.id !== p1Id);

  const roundScenIds    = new Set(roundScenarios.map(s => s.id));
  const unassignedScens = allScenarios.filter(s => !roundScenIds.has(s.id));
  const atScenLimit     = roundScenarios.length >= 5;

  // ── render ────────────────────────────────────────────────

  if (loading) return <Spinner />;
  if (!round) return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'var(--c-red)', padding: '1rem' }}>
      Round not found. <Link to="/tournaments/$id" params={{ id: tournamentId }} style={{ color: 'var(--c-accent)' }}>← Back</Link>
    </div>
  );

  const roundComplete = round.status === 'COMPLETED';
  const p1 = p1Id ? playerById[p1Id] : null;
  const p2 = p2Id ? playerById[p2Id] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>

      {/* Breadcrumb */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.14em', color: 'var(--c-muted)', textTransform: 'uppercase' }}>
        <Link to="/tournaments" style={{ color: 'var(--c-muted)' }}>Tournaments</Link>
        <span style={{ color: 'var(--c-muted-dim)' }}>›</span>
        <Link to="/tournaments/$id" params={{ id: tournamentId }} style={{ color: 'var(--c-muted)' }}>
          {tournament?.name ?? '…'}
        </Link>
        <span style={{ color: 'var(--c-muted-dim)' }}>›</span>
        <span style={{ color: 'var(--c-text-dim)' }}>Round {round.round_number}{round.name ? ` — ${round.name}` : ''}</span>
      </div>

      {/* Round header */}
      <div className="card anim-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '0.3rem' }}>Round</div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.2rem', letterSpacing: '0.06em', margin: 0 }}>
              Round {round.round_number}
              {round.name && <span style={{ color: 'var(--c-muted)', marginLeft: '0.5rem', fontSize: '1.4rem' }}>— {round.name}</span>}
            </h1>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={round.status}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              style={{
                background: 'var(--c-bg)',
                color: roundStatusColor(round.status),
                border: `1px solid ${roundStatusColor(round.status)}`,
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.65rem',
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
            <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: roundStatusColor(round.status), fontSize: '0.5rem', pointerEvents: 'none' }}>▼</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ padding: '0.6rem 0.75rem', background: 'var(--c-red-bg)', border: '1px solid var(--c-red-border)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--c-red)' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '1rem', background: 'none', border: 'none', color: 'var(--c-red)', cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem' }}>✕</button>
        </div>
      )}

      {/* ── Scenarios ──────────────────────────────────────── */}
      <div className="card anim-2" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setScenOpen(o => { const next = !o; localStorage.setItem('roundDetail.scenOpen', String(next)); return next; })}
          style={{ width: '100%', padding: '0.875rem 1.25rem', borderBottom: scenOpen ? '1px solid var(--c-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div className="section-label">
            Scenarios
            <span style={{ color: 'var(--c-accent)', marginLeft: '0.5rem' }}>{roundScenarios.length}/5</span>
          </div>
          <span style={{ fontSize: '1rem', color: '#ffffff', transition: 'transform 0.15s ease', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', border: '1px solid #dddddd', transform: scenOpen ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}>▾</span>
        </button>

        {scenOpen && <div style={{ padding: '0.875rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {roundScenarios.length === 0 ? (
            <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-muted-dim)', margin: '0 0 0.5rem' }}>
              No scenarios assigned yet.
            </p>
          ) : (
            roundScenarios.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  {s.scen_id && (
                    <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-accent)', letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {s.scen_id}
                    </span>
                  )}
                  <span style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}
                  </span>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', color: 'var(--c-muted-dim)', letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {s.attacker_nationality} vs {s.defender_nationality}
                  </span>
                </div>
                {confirmRemScen === s.id ? (
                  <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleRemoveScenario(s.id)}
                      disabled={removingScen === s.id}
                      style={{ background: 'var(--c-red-bg)', border: '1px solid var(--c-red)', color: 'var(--c-red-bright)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    >
                      {removingScen === s.id ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmRemScen(null)}
                      style={{ background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-muted)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemScen(s.id)}
                    style={{ background: 'transparent', border: '1px solid var(--c-red-border)', color: 'var(--c-red)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.5rem', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c-red-bright)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c-red-border)'}
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
                available={unassignedScens}
                value={scenPick}
                onChange={setScenPick}
                currentCount={roundScenarios.length}
              />
              <button
                onClick={handleAddScenario}
                disabled={addingScen || !scenPick}
                className="btn-primary"
                style={{ opacity: addingScen || !scenPick ? 0.5 : 1, padding: '0.4rem 0.75rem', fontSize: '0.7rem', flexShrink: 0 }}
              >
                {addingScen ? '...' : '+ Add'}
              </button>
            </div>
          )}
          {atScenLimit && (
            <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-accent)', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
              MAX 5 SCENARIOS REACHED
            </div>
          )}
        </div>}
      </div>

      {/* ── Games ──────────────────────────────────────────── */}
      <div className="card anim-3" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-label">
            Games
            <span style={{ color: 'var(--c-accent)', marginLeft: '0.5rem' }}>{games.length}</span>
          </div>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', color: 'var(--c-muted-dim)', letterSpacing: '0.12em' }}>
            {games.filter(g => g.status === 'COMPLETED').length}/{games.length} COMPLETED
          </span>
        </div>

        {games.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', gap: '0.75rem' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '3rem', color: 'var(--c-raised)', letterSpacing: '0.05em' }}>GM-00</div>
            <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '1rem', color: 'var(--c-muted-dim)', margin: 0, textAlign: 'center' }}>
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
                <div key={game.id} style={{ borderBottom: idx < games.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                  <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {scenario?.scen_id && (
                          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-accent)', letterSpacing: '0.08em', flexShrink: 0 }}>
                            {scenario.scen_id}
                          </span>
                        )}
                        <span style={{ fontFamily: '"Crimson Text", serif', fontSize: '1rem', color: 'var(--c-text)', fontWeight: 600 }}>
                          {scenario?.title ?? '—'}
                        </span>
                        {scenario && (
                          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', color: 'var(--c-muted-dim)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                            {scenario.attacker_nationality} vs {scenario.defender_nationality}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <PlayerSideTag name={p1?.name ?? '—'} role={p1Role} isWinner={game.winner_id === game.player1_id} isCompleted={game.status === 'COMPLETED'} />
                        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: 'var(--c-muted-dim)' }}>vs</span>
                        <PlayerSideTag name={p2?.name ?? '—'} role={p2Role} isWinner={game.winner_id === game.player2_id} isCompleted={game.status === 'COMPLETED'} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: gameStatusColor(game.status), border: `1px solid ${gameStatusColor(game.status)}`, padding: '0.2rem 0.5rem' }}>
                          {game.status === 'COMPLETED' ? 'Complete' : 'Scheduled'}
                        </span>
                        {game.status === 'COMPLETED' && !roundComplete && (
                          <button
                            onClick={() => { setRecordingFor(isRecording ? null : game.id); setResultScenId(''); setResultSidesFlipped(false); }}
                            title="Edit result"
                            style={{ background: isRecording ? 'var(--c-raised)' : 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-muted)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'all 0.15s ease', flexShrink: 0 }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--c-accent)'; b.style.color = 'var(--c-accent)'; }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--c-border)'; b.style.color = 'var(--c-muted)'; }}
                          >
                            ✎
                          </button>
                        )}
                      </div>
                      {game.status === 'COMPLETED' && winner && (
                        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.58rem', color: 'var(--c-green-dim)', letterSpacing: '0.1em' }}>
                          ✓ {winner.name}
                        </span>
                      )}
                      {game.status !== 'COMPLETED' && !roundComplete && (
                        <button
                          onClick={() => { setRecordingFor(isRecording ? null : game.id); setResultScenId(''); setResultSidesFlipped(false); }}
                          className={isRecording ? 'btn-secondary' : 'btn-primary'}
                          style={{ fontSize: '0.6rem', padding: '0.25rem 0.6rem' }}
                        >
                          {isRecording ? 'Cancel' : '▶ Record Result'}
                        </button>
                      )}
                    </div>
                  </div>

                  {isRecording && (
                    <div style={{ padding: '0.75rem 1.25rem 1rem', background: 'var(--c-bg)', borderTop: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                          style={{ background: 'transparent', border: '1px solid var(--c-border-bright)', color: 'var(--c-text-dim)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.5rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--c-accent)'; b.style.color = 'var(--c-accent)'; }}
                          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--c-border-bright)'; b.style.color = 'var(--c-text-dim)'; }}
                        >
                          ⇄ Swap
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.5rem 0.75rem' }}>
                        <span style={{ color: 'var(--c-text)' }}>{p1?.name ?? '—'}</span>
                        <span style={{ color: 'var(--c-accent)', fontSize: '0.55rem', letterSpacing: '0.12em' }}>{effP1Role === 'Attacker' ? 'ATK' : 'DEF'}</span>
                        <span style={{ color: 'var(--c-muted-dim)' }}>vs</span>
                        <span style={{ color: 'var(--c-text)' }}>{p2?.name ?? '—'}</span>
                        <span style={{ color: 'var(--c-accent)', fontSize: '0.55rem', letterSpacing: '0.12em' }}>{effP2Role === 'Attacker' ? 'ATK' : 'DEF'}</span>
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
                            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.68rem', letterSpacing: '0.1em', padding: '0.5rem 1rem', cursor: savingResult ? 'wait' : 'pointer', transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem', opacity: savingResult ? 0.5 : 1 }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--c-accent)'; b.style.color = 'var(--c-accent)'; }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--c-border)'; b.style.color = 'var(--c-text)'; }}
                          >
                            <span style={{ fontSize: '0.55rem', color: 'var(--c-muted)', letterSpacing: '0.15em' }}>{role.toUpperCase()}</span>
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
            <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-muted-dim)', margin: 0 }}>
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
                      {availablePlayers.map(p => { const r = playerRecords[p.id] ?? { w: 0, l: 0 }; return <option key={p.id} value={p.id}>{p.name} ({r.w}-{r.l})</option>; })}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', paddingBottom: '2px' }}>
                  <label className="field-label" style={{ whiteSpace: 'nowrap' }}>P1 Side</label>
                  <div style={{ display: 'flex', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                    {(['attacker', 'defender'] as const).map(side => (
                      <button key={side} type="button" onClick={() => setP1Side(side)} style={{ background: p1Side === side ? 'var(--c-accent)' : 'var(--c-bg)', color: p1Side === side ? 'var(--c-bg)' : 'var(--c-muted)', border: 'none', borderRight: side === 'attacker' ? '1px solid var(--c-border)' : 'none', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.35rem 0.6rem', cursor: 'pointer', transition: 'all 0.15s ease' }}>
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
                      {p2Options.map(p => { const r = playerRecords[p.id] ?? { w: 0, l: 0 }; return <option key={p.id} value={p.id}>{p.name} ({r.w}-{r.l})</option>; })}
                    </select>
                    <ChevronDown />
                  </div>
                </div>
              </div>

              {p1 && p2 && (
                <div style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', padding: '0.6rem 0.875rem', display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                  <span style={{ color: 'var(--c-muted)', fontSize: '0.55rem' }}>PREVIEW</span>
                  <span style={{ color: 'var(--c-text)' }}>{p1.name}</span>
                  <span style={{ color: 'var(--c-accent)' }}>{p1Side === 'attacker' ? 'ATK' : 'DEF'}</span>
                  <span style={{ color: 'var(--c-muted-dim)' }}>vs</span>
                  <span style={{ color: 'var(--c-text)' }}>{p2.name}</span>
                  <span style={{ color: 'var(--c-accent)' }}>{p1Side === 'attacker' ? 'DEF' : 'ATK'}</span>
                </div>
              )}

              <div>
                <label className="field-label">Scenario <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', color: 'var(--c-muted-dim)', letterSpacing: '0.08em', textTransform: 'none' }}>(optional — can be set when recording result)</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={gameScenId} onChange={e => setGameScenId(e.target.value)} style={selectStyle}>
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
                <button type="submit" className="btn-primary" disabled={addingGame || !p1Id || !p2Id} style={{ opacity: (addingGame || !p1Id || !p2Id) ? 0.5 : 1, cursor: addingGame ? 'wait' : 'pointer' }}>
                  {addingGame ? 'Scheduling…' : '+ Schedule Game'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {roundComplete && (
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.62rem', color: 'var(--c-muted-dim)', letterSpacing: '0.12em', textAlign: 'center', padding: '0.25rem' }}>
          Round is complete. Change status to Upcoming or Started to modify games or scenarios.
        </div>
      )}
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────

function PlayerSideTag({ name, role, isWinner, isCompleted }: { name: string; role: string; isWinner: boolean; isCompleted: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: role === 'Attacker' ? 'var(--c-accent)' : 'var(--c-muted)', border: `1px solid ${role === 'Attacker' ? 'var(--c-accent-dim)' : 'var(--c-border)'}`, padding: '0.1rem 0.35rem', flexShrink: 0 }}>
        {role === 'Attacker' ? 'ATK' : 'DEF'}
      </span>
      <span style={{ fontFamily: '"Crimson Text", serif', fontSize: '1rem', color: isCompleted && isWinner ? 'var(--c-green-dim)' : isCompleted ? 'var(--c-muted)' : 'var(--c-text-dim)', fontWeight: isWinner ? 600 : 400 }}>
        {name}
      </span>
      {isWinner && <span style={{ fontSize: '0.7rem', color: 'var(--c-green-dim)' }}>✓</span>}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--c-bg)',
  color: 'var(--c-text)',
  border: '1px solid var(--c-border)',
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: '0.72rem',
  letterSpacing: '0.06em',
  padding: '0.5rem 2rem 0.5rem 0.75rem',
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer',
};

function ChevronDown() {
  return (
    <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)', fontSize: '0.6rem', pointerEvents: 'none' }}>▼</span>
  );
}
