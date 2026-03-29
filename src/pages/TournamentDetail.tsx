import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
}

interface Player {
  id: string;
  name: string;
  email: string | null;
  location: string | null;
}

interface Scenario {
  id: string;
  scen_id: string | null;
  title: string;
  attacker_nationality: string;
  defender_nationality: string;
}

interface Round {
  id: string;
  round_number: number;
  name: string | null;
  status: string;
  scenarios: Scenario[];
}

// ─── module-level scenario cache (fetched once per session) ──
let _scenarioCache: Scenario[] | null = null;

async function loadScenarios(): Promise<Scenario[]> {
  if (_scenarioCache !== null) return _scenarioCache;
  const { data, error } = await supabase
    .from('scenarios')
    .select('id, scen_id, title, attacker_nationality, defender_nationality')
    .order('title');
  if (error) { console.error('loadScenarios error:', error); return []; }
  _scenarioCache = data ?? [];
  return _scenarioCache;
}

// ─── scenario search combobox ───────────────────────────────

function ScenarioPicker({
  available,
  value,
  onChange,
  currentCount,
}: {
  available: Scenario[];
  value: string;
  onChange: (id: string) => void;
  currentCount: number;
}) {
  const [inputVal, setInputVal] = useState('');
  const [open, setOpen] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) setInputVal('');
  }, [value]);

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

  function handleSelect(s: Scenario) {
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

  const showDrop = open && inputVal.trim().length > 0;

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
        style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.72rem' }}
        autoComplete="off"
      />
      {showDrop && createPortal(
        <div style={{
          position: 'fixed', zIndex: 9999,
          background: 'var(--c-bg)', border: '1px solid var(--c-border-bright)',
          maxHeight: '340px', overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          ...dropStyle,
        }}>
          {filtered.length > 0 ? filtered.map(s => (
            <div
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              style={{
                padding: '0.5rem 0.75rem', cursor: 'pointer',
                display: 'flex', alignItems: 'baseline', gap: '0.6rem',
                borderBottom: '1px solid var(--c-raised)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--c-raised)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              {s.scen_id && (
                <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-accent)', letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {s.scen_id}
                </span>
              )}
              <span style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-text-dim)' }}>
                {s.title}
              </span>
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

// ─── helpers ────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE':      return 'var(--c-green-dim)';
    case 'COMPLETED':   return 'var(--c-muted)';
    case 'CANCELLED':   return 'var(--c-red)';
    case 'IN_PROGRESS': return 'var(--c-accent)';
    default:            return 'var(--c-accent)';
  }
}

function Spinner({ inline }: { inline?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', ...(inline ? {} : { justifyContent: 'center', padding: '4rem' }) }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--c-spin-track)', borderTopColor: 'var(--c-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── main component ─────────────────────────────────────────

export default function TournamentDetail() {
  const { id } = useParams({ strict: false });

  const [tournament, setTournament]         = useState<Tournament | null>(null);
  const [enrolled, setEnrolled]             = useState<Player[]>([]);
  const [roster, setRoster]                 = useState<Player[]>([]);
  const [rounds, setRounds]                 = useState<Round[]>([]);
  const [allScenarios, setAllScenarios]     = useState<Scenario[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  const [loadingTournament, setLoadingTournament] = useState(true);
  const [loadingPlayers, setLoadingPlayers]       = useState(true);
  const [loadingRounds, setLoadingRounds]         = useState(true);

  const [enrolling, setEnrolling]       = useState(false);
  const [removingId, setRemovingId]         = useState<string | null>(null);
  const [confirmRemovePlayer, setConfirmRemovePlayer] = useState<string | null>(null);
  const [addingRound, setAddingRound]       = useState(false);
  const [error, setError]                   = useState('');

  // new-round form
  const [newRoundName, setNewRoundName] = useState('');

  // per-round scenario picker state: roundId → selectedScenarioId
  const [roundScenPick, setRoundScenPick]   = useState<Record<string, string>>({});
  const [addingScenFor, setAddingScenFor]   = useState<string | null>(null);
  const [removingScen, setRemovingScen]     = useState<string | null>(null); // `${roundId}:${scenId}`
  const [confirmRemoveScen, setConfirmRemoveScen] = useState<string | null>(null); // `${roundId}:${scenId}`

  // ── fetch tournament ──────────────────────────────────────
  useEffect(() => {
    supabase.from('tournaments').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) { console.error(error); setError(error.message); }
        else setTournament(data);
        setLoadingTournament(false);
      });
  }, [id]);

  // ── fetch players ─────────────────────────────────────────
  useEffect(() => { fetchPlayers(); }, [id]);

  async function fetchPlayers() {
    setLoadingPlayers(true);
    const [enrolledRes, allRes] = await Promise.all([
      supabase.from('tournament_players')
        .select('player_id, players(id, name, email, location)')
        .eq('tournament_id', id),
      supabase.from('players').select('id, name, email, location').order('name'),
    ]);
    const enrolledPlayers: Player[] = (enrolledRes.data ?? []).map((r: any) => r.players).filter(Boolean);
    const enrolledIds = new Set(enrolledPlayers.map(p => p.id));
    setEnrolled(enrolledPlayers);
    setRoster((allRes.data ?? []).filter(p => !enrolledIds.has(p.id)));
    setSelectedPlayerId('');
    setLoadingPlayers(false);
  }

  // ── fetch rounds + scenarios ──────────────────────────────
  useEffect(() => { fetchRounds(); fetchAllScenarios(); }, [id]);

  async function fetchAllScenarios() {
    // If cache was set to [] on a failed/pre-auth load, bust it and retry
    if (_scenarioCache !== null && _scenarioCache.length === 0) {
      _scenarioCache = null;
    }
    const data = await loadScenarios();
    setAllScenarios(data);
  }

  async function fetchRounds() {
    setLoadingRounds(true);
    const { data: roundData, error: rErr } = await supabase
      .from('rounds')
      .select('id, round_number, name, status')
      .eq('tournament_id', id)
      .order('round_number');
    if (rErr) { console.error(rErr); setLoadingRounds(false); return; }

    const roundList: Round[] = [];
    for (const r of roundData ?? []) {
      const { data: rsData } = await supabase
        .from('round_scenarios')
        .select('scenario_id, scenarios(id, scen_id, title, attacker_nationality, defender_nationality)')
        .eq('round_id', r.id);
      const scenarios: Scenario[] = (rsData ?? []).map((rs: any) => rs.scenarios).filter(Boolean);
      roundList.push({ ...r, scenarios });
    }
    setRounds(roundList);
    setLoadingRounds(false);
  }

  // ── enroll player ─────────────────────────────────────────
  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlayerId) return;
    setEnrolling(true);
    const { error } = await supabase.from('tournament_players')
      .insert({ tournament_id: id, player_id: selectedPlayerId });
    if (error) { console.error(error); setError(error.message); }
    else await fetchPlayers();
    setEnrolling(false);
  }

  // ── remove player ─────────────────────────────────────────
  async function handleRemove(playerId: string) {
    setRemovingId(playerId);
    const { error } = await supabase.from('tournament_players')
      .delete().eq('tournament_id', id).eq('player_id', playerId);
    if (error) { console.error(error); setError(error.message); }
    else await fetchPlayers();
    setRemovingId(null);
  }

  // ── add round ─────────────────────────────────────────────
  async function handleAddRound(e: React.FormEvent) {
    e.preventDefault();
    setAddingRound(true);
    const nextNum = (rounds.length > 0 ? Math.max(...rounds.map(r => r.round_number)) : 0) + 1;
    const { error } = await supabase.from('rounds').insert({
      tournament_id: id,
      round_number: nextNum,
      name: newRoundName.trim() || null,
      status: 'PENDING',
    });
    if (error) { console.error(error); setError(error.message); }
    else { setNewRoundName(''); await fetchRounds(); }
    setAddingRound(false);
  }

  // ── add scenario to round ─────────────────────────────────
  async function handleAddScenario(roundId: string) {
    const scenarioId = roundScenPick[roundId];
    if (!scenarioId) return;
    setAddingScenFor(roundId);
    const { error } = await supabase.from('round_scenarios')
      .insert({ round_id: roundId, scenario_id: scenarioId });
    if (error) { console.error(error); setError(error.message); }
    else {
      setRoundScenPick(p => ({ ...p, [roundId]: '' }));
      await fetchRounds();
    }
    setAddingScenFor(null);
  }

  // ── remove scenario from round ────────────────────────────
  async function handleRemoveScenario(roundId: string, scenarioId: string) {
    const key = `${roundId}:${scenarioId}`;
    setRemovingScen(key);
    const { error } = await supabase.from('round_scenarios')
      .delete().eq('round_id', roundId).eq('scenario_id', scenarioId);
    if (error) { console.error(error); setError(error.message); }
    else await fetchRounds();
    setRemovingScen(null);
  }

  // ─────────────────────────────────────────────────────────
  if (loadingTournament) return <Spinner />;
  if (!tournament) return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', color: 'var(--c-red)', fontSize: '0.8rem' }}>
      Tournament not found. <Link to="/tournaments" style={{ color: 'var(--c-accent)' }}>← Back</Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>

      {/* Back */}
      <div className="anim-0">
        <Link to="/tournaments" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--c-muted)', textTransform: 'uppercase' }}>
          ← Tournaments
        </Link>
      </div>

      {/* Tournament info */}
      <div className="card anim-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '0.3rem' }}>Tournament</div>
            <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.2rem', letterSpacing: '0.06em', margin: '0 0 0.5rem' }}>
              {tournament.name}
            </h1>
            {tournament.description && (
              <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '1rem', color: 'var(--c-muted)', margin: '0 0 0.75rem' }}>
                {tournament.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--c-muted)' }}>
              <span>Start: {tournament.start_date}</span>
              {tournament.end_date && <span>End: {tournament.end_date}</span>}
            </div>
          </div>
          <span style={{
            fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: statusColor(tournament.status),
            border: `1px solid ${statusColor(tournament.status)}`, padding: '0.25rem 0.6rem',
          }}>
            {tournament.status}
          </span>
        </div>
      </div>

      {/* ── ROUNDS ─────────────────────────────────────────── */}
      <div className="card anim-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-label">
            Rounds
            {!loadingRounds && <span style={{ color: 'var(--c-accent)', marginLeft: '0.5rem' }}>{rounds.length}</span>}
          </div>
        </div>

        {loadingRounds ? (
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><Spinner inline /></div>
        ) : rounds.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontFamily: '"Crimson Text", serif', fontSize: '1rem', color: 'var(--c-muted-dim)' }}>
            No rounds yet. Add the first round below.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rounds.map((round, idx) => {
              const availableScenarios = allScenarios.filter(
                s => !round.scenarios.some(rs => rs.id === s.id)
              );
              const atLimit = round.scenarios.length >= 5;
              const isAddingThis = addingScenFor === round.id;

              return (
                <div key={round.id} style={{ borderBottom: idx < rounds.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                  {/* Round header */}
                  <div style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem', letterSpacing: '0.08em', color: 'var(--c-text)' }}>
                        Round {round.round_number}
                      </span>
                      {round.name && (
                        <span style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.9rem', color: 'var(--c-muted)' }}>
                          — {round.name}
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: statusColor(round.status),
                      border: `1px solid ${statusColor(round.status)}`, padding: '0.2rem 0.5rem',
                    }}>
                      {round.status}
                    </span>
                  </div>

                  {/* Scenarios in this round */}
                  <div style={{ padding: '0.75rem 1.25rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {round.scenarios.length === 0 ? (
                      <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: 'var(--c-muted-dim)', letterSpacing: '0.1em' }}>
                        No scenarios selected
                      </div>
                    ) : (
                      round.scenarios.map(s => {
                        const removeKey = `${round.id}:${s.id}`;
                        const removing = removingScen === removeKey;
                        return (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                              {s.scen_id && (
                                <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-accent)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                                  {s.scen_id}
                                </span>
                              )}
                              <span style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.title}
                              </span>
                              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', color: 'var(--c-muted-dim)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                                {s.attacker_nationality} vs {s.defender_nationality}
                              </span>
                            </div>
                            {confirmRemoveScen === removeKey ? (
                              <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                                <button
                                  onClick={() => { setConfirmRemoveScen(null); handleRemoveScenario(round.id, s.id); }}
                                  disabled={removing}
                                  style={{ background: 'var(--c-red-bg)', border: '1px solid var(--c-red)', color: 'var(--c-red-bright)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                                >
                                  {removing ? '...' : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => setConfirmRemoveScen(null)}
                                  style={{ background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-muted)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmRemoveScen(removeKey)}
                                style={{ background: 'transparent', border: '1px solid var(--c-red-border)', color: 'var(--c-red)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.5rem', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c-red-bright)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c-red-border)'; }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Add scenario picker */}
                    {!atLimit && availableScenarios.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                        <ScenarioPicker
                          available={availableScenarios}
                          value={roundScenPick[round.id] ?? ''}
                          onChange={id => setRoundScenPick(p => ({ ...p, [round.id]: id }))}
                          currentCount={round.scenarios.length}
                        />
                        <button
                          onClick={() => handleAddScenario(round.id)}
                          disabled={isAddingThis || !roundScenPick[round.id]}
                          className="btn-primary"
                          style={{ opacity: isAddingThis || !roundScenPick[round.id] ? 0.5 : 1, padding: '0.4rem 0.75rem', fontSize: '0.7rem' }}
                        >
                          {isAddingThis ? '...' : '+ Add'}
                        </button>
                      </div>
                    )}
                    {atLimit && (
                      <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-accent)', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
                        MAX 5 SCENARIOS REACHED
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add round form */}
      <div className="card anim-3">
        <div className="section-label" style={{ marginBottom: '0.75rem' }}>Add Round</div>
        <form onSubmit={handleAddRound} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={`Round ${rounds.length + 1} name (optional)`}
            value={newRoundName}
            onChange={e => setNewRoundName(e.target.value)}
            className="input"
            style={{ flex: 1, minWidth: '180px' }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={addingRound}
            style={{ opacity: addingRound ? 0.5 : 1, cursor: addingRound ? 'wait' : 'pointer' }}
          >
            {addingRound ? 'Adding...' : `+ Round ${rounds.length + 1}`}
          </button>
        </form>
      </div>

      {/* ── ENROLLED PLAYERS ───────────────────────────────── */}
      <div className="card anim-4" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-label">
            Enrolled Players
            {!loadingPlayers && <span style={{ color: 'var(--c-accent)', marginLeft: '0.5rem' }}>{enrolled.length}</span>}
          </div>
        </div>

        {loadingPlayers ? (
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><Spinner inline /></div>
        ) : enrolled.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontFamily: '"Crimson Text", serif', fontSize: '1rem', color: 'var(--c-muted-dim)' }}>
            No players enrolled yet.
          </div>
        ) : (
          <table className="ops-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Location</th><th></th></tr>
            </thead>
            <tbody>
              {enrolled.map(p => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--c-text)', fontWeight: 500 }}>{p.name}</td>
                  <td>{p.email ?? '—'}</td>
                  <td>{p.location ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {confirmRemovePlayer === p.id ? (
                      <div style={{ display: 'inline-flex', gap: '0.3rem' }}>
                        <button
                          onClick={() => { setConfirmRemovePlayer(null); handleRemove(p.id); }}
                          disabled={removingId === p.id}
                          style={{ background: 'var(--c-red-bg)', border: '1px solid var(--c-red)', color: 'var(--c-red-bright)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                        >
                          {removingId === p.id ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmRemovePlayer(null)}
                          style={{ background: 'transparent', border: '1px solid var(--c-border)', color: 'var(--c-muted)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRemovePlayer(p.id)}
                        style={{ background: 'transparent', border: '1px solid var(--c-red-border)', color: 'var(--c-red)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.5rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c-red-bright)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c-red-border)'; }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add player */}
      {!loadingPlayers && roster.length > 0 && (
        <div className="card anim-5">
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>Add From Player List</div>
          <form onSubmit={handleEnroll} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <select
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
                required
                style={{
                  width: '100%', background: 'var(--c-bg)',
                  color: selectedPlayerId ? 'var(--c-text)' : 'var(--c-muted)',
                  border: '1px solid var(--c-border)',
                  fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem',
                  letterSpacing: '0.06em', padding: '0.5rem 2rem 0.5rem 0.75rem',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Select a player...</option>
                {roster.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.location ? ` — ${p.location}` : ''}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)', fontSize: '0.6rem', pointerEvents: 'none' }}>▼</span>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={enrolling || !selectedPlayerId}
              style={{ opacity: enrolling || !selectedPlayerId ? 0.5 : 1, cursor: enrolling ? 'wait' : 'pointer' }}
            >
              {enrolling ? 'Enrolling...' : '+ Enroll'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(139, 46, 46, 0.15)', border: '1px solid var(--c-red-border)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--c-red)' }}>
              {error}
            </div>
          )}
        </div>
      )}

      {!loadingPlayers && roster.length === 0 && enrolled.length > 0 && (
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: 'var(--c-muted-dim)', letterSpacing: '0.12em', textAlign: 'center', padding: '0.5rem' }}>
          All players are enrolled in this tournament.
        </div>
      )}
    </div>
  );
}
