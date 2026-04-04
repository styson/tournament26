import { computeStandings, type GameResult, type StandingEntry } from "@/utils/standingsPdf";
import { openPlayerReportPdf } from '@/utils/playerReportPdf';
import { openScenarioReportPdf } from '@/utils/scenarioReportPdf';
import { supabase } from '@/config/supabase';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import StandingsReportButton from '@/components/StandingsReport';
import { ArrowLeft, Check, ChevronDown, ExternalLink, LogIn, X } from 'lucide-react';

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
  seed: number | null;
}

interface Round {
  id: string;
  round_number: number;
  name: string | null;
  status: string;
}

// ─── helpers ────────────────────────────────────────────────

function tournamentStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':      return 'var(--color-green-dim)';
    case 'COMPLETED':   return 'var(--color-muted)';
    case 'CANCELLED':   return 'var(--color-red)';
    case 'IN_PROGRESS': return 'var(--color-accent)';
    default:            return 'var(--color-accent)';
  }
}

function roundStatusColor(status: string) {
  switch (status) {
    case 'IN_PROGRESS': return 'var(--color-accent)';
    case 'COMPLETED':   return 'var(--color-green-dim)';
    default:            return 'var(--color-muted)';
  }
}

function roundStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':     return 'Upcoming';
    case 'IN_PROGRESS': return 'Started';
    case 'COMPLETED':   return 'Complete';
    default:            return status;
  }
}

function Spinner({ inline }: { inline?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', ...(inline ? {} : { justifyContent: 'center', padding: '4rem' }) }}>
      <div className="spinner" />
    </div>
  );
}

// ─── main component ─────────────────────────────────────────

export default function TournamentDetail() {
  const { id } = useParams({ strict: false });

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [enrolled,   setEnrolled]   = useState<Player[]>([]);
  const [roster,     setRoster]     = useState<Player[]>([]);
  const [rounds,     setRounds]     = useState<Round[]>([]);
  const [records,    setRecords]    = useState<Record<string, { w: number; l: number }>>({});
  const [points,     setPoints]     = useState<Record<string, number>>({});
  const [standings,  setStandings]  = useState<StandingEntry[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [seedInput,        setSeedInput]        = useState('1');

  const [loadingTournament, setLoadingTournament] = useState(true);
  const [loadingPlayers,    setLoadingPlayers]    = useState(true);
  const [loadingRounds,     setLoadingRounds]     = useState(true);

  const [seedModal,      setSeedModal]      = useState<Player | null>(null);
  const [seedModalVal,   setSeedModalVal]   = useState('');
  const [seedModalSaving,setSeedModalSaving]= useState(false);
  const seedModalRef = useRef<HTMLInputElement>(null);

  const [enrolling,            setEnrolling]            = useState(false);
  const [removingId,           setRemovingId]           = useState<string | null>(null);
  const [confirmRemovePlayer,  setConfirmRemovePlayer]  = useState<string | null>(null);
  const [addingRound,          setAddingRound]          = useState(false);
  const [updatingStatus,       setUpdatingStatus]       = useState(false);
  const [error,                setError]                = useState('');

  useEffect(() => { setSeedInput(String(enrolled.length + 1)); }, [enrolled.length]);

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
    const [enrolledRes, allRes, gamesRes] = await Promise.all([
      supabase.from('tournament_players')
        .select('seed, players(id, name, email, location)')
        .eq('tournament_id', id),
      supabase.from('players').select('id, name, email, location').order('name'),
      supabase.from('games')
        .select('player1_id, player2_id, winner_id, rounds!inner(tournament_id)')
        .eq('rounds.tournament_id', id)
        .eq('status', 'COMPLETED'),
    ]);
    const enrolledPlayers: Player[] = (enrolledRes.data ?? [])
      .map((r: any) => r.players ? { ...r.players, seed: r.seed ?? null } : null)
      .filter(Boolean);
    const enrolledIds = new Set(enrolledPlayers.map(p => p.id));
    setEnrolled(enrolledPlayers);
    setRoster((allRes.data ?? []).filter(p => !enrolledIds.has(p.id)));
    setSelectedPlayerId('');

    const rec: Record<string, { w: number; l: number }> = {};
    const defeated: Record<string, string[]> = {};
    for (const g of (gamesRes.data ?? [])) {
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
    setRecords(rec);

    const pts: Record<string, number> = {};
    for (const pid of Object.keys(rec)) {
      const bonus = (defeated[pid] ?? []).reduce((sum, oppId) => sum + (rec[oppId]?.w ?? 0), 0);
      pts[pid] = 10 * rec[pid].w + bonus;
    }
    setPoints(pts);
    setEnrolled(prev => [...prev].sort((a, b) =>
      (pts[b.id] ?? 0) - (pts[a.id] ?? 0) ||
      (a.seed ?? 999) - (b.seed ?? 999) ||
      a.name.localeCompare(b.name)
    ));

    const standingsResult = computeStandings(
      enrolledPlayers.map(p => ({ id: p.id, name: p.name, seed: p.seed })),
      (gamesRes.data ?? []) as GameResult[],
    );
    setStandings(standingsResult);
    setLoadingPlayers(false);
  }

  // ── fetch rounds ──────────────────────────────────────────
  useEffect(() => { fetchRounds(); }, [id]);

  async function fetchRounds() {
    setLoadingRounds(true);
    const { data, error: rErr } = await supabase
      .from('rounds')
      .select('id, round_number, name, status')
      .eq('tournament_id', id)
      .order('round_number');
    if (rErr) { console.error(rErr); }
    setRounds(data ?? []);
    setLoadingRounds(false);
  }

  // ── enroll player ─────────────────────────────────────────
  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlayerId) return;
    setEnrolling(true);
    const seed = seedInput.trim() ? parseInt(seedInput.trim(), 10) : null;
    const { error } = await supabase.from('tournament_players')
      .insert({ tournament_id: id, player_id: selectedPlayerId, seed });
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

  // ── edit seed ─────────────────────────────────────────────
  async function handleSaveSeed(e: React.FormEvent) {
    e.preventDefault();
    if (!seedModal) return;
    setSeedModalSaving(true);
    const seed = seedModalVal.trim() ? parseInt(seedModalVal.trim(), 10) : null;
    const { error } = await supabase.from('tournament_players')
      .update({ seed }).eq('tournament_id', id).eq('player_id', seedModal.id);
    if (error) { setError(error.message); }
    else { setSeedModal(null); await fetchPlayers(); }
    setSeedModalSaving(false);
  }

  // ── update tournament status ──────────────────────────────
  async function handleStatusChange(newStatus: string) {
    setUpdatingStatus(true);
    setError('');
    const { data, error } = await supabase
      .from('tournaments').update({ status: newStatus }).eq('id', id).select().single();
    if (error) { console.error(error); setError(error.message); }
    else if (data) setTournament(data);
    setUpdatingStatus(false);
  }

  // ── add round ─────────────────────────────────────────────
  async function handleAddRound() {
    setAddingRound(true);
    const nextNum = (rounds.length > 0 ? Math.max(...rounds.map(r => r.round_number)) : 0) + 1;
    const { error } = await supabase.from('rounds').insert({
      tournament_id: id,
      round_number: nextNum,
      status: 'PENDING',
    });
    if (error) { console.error(error); setError(error.message); }
    else { await fetchRounds(); }
    setAddingRound(false);
  }

  // ─────────────────────────────────────────────────────────
  if (loadingTournament) return <Spinner />;
  if (!tournament) return (
    <div style={{ color: 'var(--color-red)' }}>
      Tournament not found. <Link to="/tournaments" style={{ color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ArrowLeft size={14} /> Back</Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Back */}
      <div className="anim-0">
        <Link to="/tournaments" style={{ letterSpacing: '0.15em', color: 'var(--color-muted)', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={14} /> Tournaments
        </Link>
      </div>

      {/* Tournament info */}
      <div className="card anim-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '0.3rem' }}>Tournament</div>
            <h1 style={{ fontSize: '2.2rem', letterSpacing: '0.06em', margin: '0 0 0.5rem' }}>
              {tournament.name}
            </h1>
            {tournament.description && (
              <p style={{ color: 'var(--color-muted)', margin: '0 0 0.75rem' }}>
                {tournament.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', letterSpacing: '0.12em', color: 'var(--color-muted)' }}>
              <span>Start: {tournament.start_date}</span>
              {tournament.end_date && <span>End: {tournament.end_date}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={tournament.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="btn-sm"
                style={{
                  color: tournamentStatusColor(tournament.status),
                  borderColor: tournamentStatusColor(tournament.status),
                  paddingRight: '1.75rem',
                  appearance: 'none',
                  cursor: updatingStatus ? 'wait' : 'pointer',
                  opacity: updatingStatus ? 0.6 : 1,
                }}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: tournamentStatusColor(tournament.status), pointerEvents: 'none', display: 'inline-flex' }}><ChevronDown size={12} /></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem' }}>
              <StandingsReportButton
                standings={standings}
                tournamentName={tournament.name}
              />
              <button
                onClick={() => openScenarioReportPdf(id!, tournament.name)}
                className="btn-sm"
              >
                Scenario Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROUNDS GRID ───────────────────────────────────── */}
      <div className="anim-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div className="section-label">
            Rounds
            {!loadingRounds && <span style={{ color: 'var(--color-accent)', marginLeft: '0.5rem' }}>{rounds.length}</span>}
          </div>
          <button
            onClick={handleAddRound}
            className="btn-primary"
            disabled={addingRound}
            title="Add Round"
            style={{ opacity: addingRound ? 0.5 : 1, cursor: addingRound ? 'wait' : 'pointer' }}
          >
            {addingRound ? 'Adding...' : `+ Round ${rounds.length + 1}`}
          </button>
        </div>

        {loadingRounds ? (
          <div className="card" style={{ padding: '2rem' }}><Spinner inline /></div>
        ) : rounds.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-muted-dim)' }}>
            No rounds yet. Use + Round 1 above to get started.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {rounds.map((round) => (
              <Link
                key={round.id}
                to="/tournaments/$id/rounds/$roundId"
                params={{ id: tournament.id, roundId: round.id }}
                className="card"
                title="Click to open"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  transition: 'background 0.15s ease',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-raised)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-surface)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="font-display" style={{ fontSize: '1.75rem', letterSpacing: '0.06em', color: 'var(--color-text)', lineHeight: 1 }}>
                      Round {round.round_number}
                    </div>
                    {round.name && (
                      <div style={{ color: 'var(--color-muted)', marginTop: '0.2rem' }}>
                        {round.name}
                      </div>
                    )}
                  </div>
                  <LogIn size={16} style={{ color: 'var(--color-muted)', flexShrink: 0, marginTop: '0.2rem' }} />
                </div>

                <span style={{
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: roundStatusColor(round.status),
                  border: `1px solid ${roundStatusColor(round.status)}`,
                  padding: '0.15rem 0.4rem',
                  alignSelf: 'flex-start',
                }}>
                  {roundStatusLabel(round.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── ENROLLED PLAYERS ───────────────────────────────── */}
      <div className="card anim-4" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-label">
            Enrolled Players
            {!loadingPlayers && <span style={{ color: 'var(--color-accent)', marginLeft: '0.5rem' }}>{enrolled.length}</span>}
          </div>
        </div>

        {loadingPlayers ? (
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><Spinner inline /></div>
        ) : enrolled.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-muted-dim)' }}>
            No players enrolled yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', padding: '1rem 1.25rem' }}>
            {enrolled.map(p => (
              <div key={p.id} style={{
                display: 'flex', flexDirection: 'column',
                padding: '0.5rem 0.6rem',
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                transition: 'border-color 0.15s ease', cursor: 'default',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-bright)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'}
                onClick={e => { if (e.ctrlKey) { setSeedModal(p); setSeedModalVal(p.seed !== null ? String(p.seed) : ''); setTimeout(() => seedModalRef.current?.select(), 50); } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', minWidth: 0 }}>
                    <span style={{ color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </span>
                    {p.seed !== null && (
                      <span style={{ color: 'var(--color-muted)', letterSpacing: '0.1em', flexShrink: 0 }}>#{p.seed}</span>
                    )}
                  </div>
                  <button
                    onClick={() => openPlayerReportPdf(p.id, p.name, id!, tournament?.name ?? '', Object.fromEntries(enrolled.map(e => [e.id, e.name])))}
                    title="View Player Report"
                    className="icon-btn"
                    style={{ fontSize: '0.65rem', flexShrink: 0 }}
                  ><ExternalLink size={14} /></button>
                </div>
                <div style={{ letterSpacing: '0.1em', color: 'var(--color-accent)', marginTop: '0.1rem' }}>
                  {`${points[p.id] ?? 0} Points`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ letterSpacing: '0.1em', color: 'var(--color-muted)' }}>
                    {(() => { const r = records[p.id] ?? { w: 0, l: 0 }; return `W/L ${r.w}-${r.l}`; })()}
                  </div>
                  <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0, alignItems: 'center' }}>
                    {(() => {
                      const r = records[p.id] ?? { w: 0, l: 0 };
                      const hasPlayed = r.w + r.l > 0;
                      if (hasPlayed) return (
                        <button
                          disabled
                          title="Cannot remove — player has played games"
                          className="icon-btn danger"
                          style={{ opacity: 0.25, cursor: 'not-allowed' }}
                        ><X size={14} /></button>
                      );
                      return confirmRemovePlayer === p.id ? (
                        <>
                          <button
                            onClick={() => { setConfirmRemovePlayer(null); handleRemove(p.id); }}
                            disabled={removingId === p.id}
                            title="Confirm remove"
                            style={{ background: 'var(--color-red-bg)', border: '1px solid var(--color-red)', color: 'var(--color-red-bright)', padding: '0.2rem 0.35rem', cursor: 'pointer', lineHeight: 1 }}
                          >{removingId === p.id ? '…' : <Check size={14} />}</button>
                          <button
                            onClick={() => setConfirmRemovePlayer(null)}
                            title="Cancel"
                            className="btn-secondary"
                            style={{ padding: '0.2rem 0.35rem' }}
                          ><X size={14} /></button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmRemovePlayer(p.id)}
                          title="Remove player"
                          className="icon-btn danger"
                        ><X size={14} /></button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add player */}
      {!loadingPlayers && roster.length > 0 && (
        <div className="card anim-5">
          <form onSubmit={handleEnroll} style={{ display: 'grid', gridTemplateColumns: '1fr 80px auto', gap: '0.5rem 0.75rem', alignItems: 'center' }}>
            <div className="section-label">Add From Player List</div>
            <label className="field-label">Seed</label>
            <div />
            <div style={{ position: 'relative' }}>
              <select
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
                required
                style={{
                  width: '100%', background: 'var(--color-bg)',
                  color: selectedPlayerId ? 'var(--color-text)' : 'var(--color-muted)',
                  border: '1px solid var(--color-border)',
                  letterSpacing: '0.06em', padding: '0.5rem 2rem 0.5rem 0.75rem',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Select a player...</option>
                {roster.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.location ? ` — ${p.location}` : ''}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none', display: 'inline-flex' }}><ChevronDown size={12} /></span>
            </div>
            <input
              type="number"
              min="1"
              value={seedInput}
              onChange={e => setSeedInput(e.target.value)}
              className="input"
              style={{ width: '100%' }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={enrolling || !selectedPlayerId}
              style={{ opacity: enrolling || !selectedPlayerId ? 0.5 : 1, cursor: enrolling ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {enrolling ? 'Enrolling...' : '+ Enroll'}
            </button>
          </form>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}
        </div>
      )}

      {!loadingPlayers && roster.length === 0 && enrolled.length > 0 && (
        <div style={{ color: 'var(--color-muted-dim)', letterSpacing: '0.12em', textAlign: 'center', padding: '0.5rem' }}>
          All players are enrolled in this tournament.
        </div>
      )}

      {/* Seed edit modal */}
      {seedModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}
          onClick={e => { if (e.target === e.currentTarget) setSeedModal(null); }}
        >
          <form onSubmit={handleSaveSeed} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-bright)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '280px' }}>
            <div className="section-label">Edit Seed</div>
            <div style={{ color: 'var(--color-text)', fontWeight: 500 }}>{seedModal.name}</div>
            <div>
              <label className="field-label">Seed</label>
              <input
                ref={seedModalRef}
                type="number"
                min="1"
                value={seedModalVal}
                onChange={e => setSeedModalVal(e.target.value)}
                className="input"
                style={{ width: '100%' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={seedModalSaving} style={{ opacity: seedModalSaving ? 0.6 : 1 }}>
                {seedModalSaving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setSeedModal(null)}>Cancel</button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
