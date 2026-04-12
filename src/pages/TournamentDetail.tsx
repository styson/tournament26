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
    <div className={`flex items-center gap-3${inline ? '' : ' justify-center p-16'}`}>
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
    setRoster((allRes.data ?? []).map(p => ({ ...p, seed: null })).filter(p => !enrolledIds.has(p.id)));
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
    <div className="text-red">
      Tournament not found. <Link to="/tournaments" className="text-accent inline-flex items-center gap-1"><ArrowLeft size={14} /> Back</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Back */}
      <div className="anim-0">
        <Link to="/tournaments" className="tracking-widest text-muted uppercase inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Tournaments
        </Link>
      </div>

      {/* Tournament info */}
      <div className="card anim-1">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <div className="section-label mb-1">Tournament</div>
            <h1 className="text-2xl tracking-wider mt-0 mb-2">
              {tournament.name}
            </h1>
            {tournament.description && (
              <p className="text-muted mt-0 mb-3">
                {tournament.description}
              </p>
            )}
            <div className="flex gap-6 flex-wrap tracking-widest text-muted">
              <span>Start: {tournament.start_date}</span>
              {tournament.end_date && <span>End: {tournament.end_date}</span>}
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="relative">
              <select
                value={tournament.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`btn-sm appearance-none pr-7 ${updatingStatus ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                style={{ color: tournamentStatusColor(tournament.status), borderColor: tournamentStatusColor(tournament.status) }}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex"
                style={{ color: tournamentStatusColor(tournament.status) }}
              ><ChevronDown size={12} /></span>
            </div>
            <div className="flex flex-col items-stretch gap-1.5">
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
        <div className="flex justify-between items-center mb-3">
          <div className="section-label">
            Rounds
            {!loadingRounds && <span className="text-accent ml-2">{rounds.length}</span>}
          </div>
          <button
            onClick={handleAddRound}
            className={`btn-primary ${addingRound ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
            disabled={addingRound}
            title="Add Round"
          >
            {addingRound ? 'Adding...' : `+ Round ${rounds.length + 1}`}
          </button>
        </div>

        {loadingRounds ? (
          <div className="card p-8"><Spinner inline /></div>
        ) : rounds.length === 0 ? (
          <div className="card p-10 text-center text-muted-dim">
            No rounds yet. Use + Round 1 above to get started.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {rounds.map((round) => (
              <Link
                key={round.id}
                to="/tournaments/$id/rounds/$roundId"
                params={{ id: tournament.id, roundId: round.id }}
                className="card p-4 flex flex-col gap-2.5 transition-colors duration-150 no-underline cursor-pointer hover:bg-raised"
                title="Click to open"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-display text-3xl tracking-wider text-text leading-none">
                      Round {round.round_number}
                    </div>
                    {round.name && (
                      <div className="text-muted mt-1">
                        {round.name}
                      </div>
                    )}
                  </div>
                  <LogIn size={16} className="text-muted shrink-0 mt-1" />
                </div>

                <span
                  className="tracking-widest uppercase px-1.5 py-0.5 self-start border"
                  style={{ color: roundStatusColor(round.status), borderColor: roundStatusColor(round.status) }}
                >
                  {roundStatusLabel(round.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── ENROLLED PLAYERS ───────────────────────────────── */}
      <div className="card anim-4 p-0">
        <div className="py-4 px-5 border-b border-border flex justify-between items-center">
          <div className="section-label">
            Enrolled Players
            {!loadingPlayers && <span className="text-accent ml-2">{enrolled.length}</span>}
          </div>
        </div>

        {loadingPlayers ? (
          <div className="p-8 flex justify-center"><Spinner inline /></div>
        ) : enrolled.length === 0 ? (
          <div className="p-10 text-center text-muted-dim">
            No players enrolled yet.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 py-4 px-5">
            {enrolled.map(p => (
              <div
                key={p.id}
                className="flex flex-col py-2 px-2.5 bg-bg border border-border transition-colors duration-150 cursor-default hover:border-border-bright"
                onClick={e => { if (e.ctrlKey) { setSeedModal(p); setSeedModalVal(p.seed !== null ? String(p.seed) : ''); setTimeout(() => seedModalRef.current?.select(), 50); } }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-text truncate">
                      {p.name}
                    </span>
                    {p.seed !== null && (
                      <span className="text-muted tracking-widest shrink-0">#{p.seed}</span>
                    )}
                  </div>
                  <button
                    onClick={() => openPlayerReportPdf(p.id, p.name, id!, tournament?.name ?? '', Object.fromEntries(enrolled.map(e => [e.id, e.name])))}
                    title="View Player Report"
                    className="icon-btn text-xs shrink-0"
                  ><ExternalLink size={14} /></button>
                </div>
                <div className="tracking-widest text-accent mt-0.5">
                  {`${points[p.id] ?? 0} Points`}
                </div>
                <div className="flex items-center justify-between">
                  <div className="tracking-widest text-muted">
                    {(() => { const r = records[p.id] ?? { w: 0, l: 0 }; return `W/L ${r.w}-${r.l}`; })()}
                  </div>
                  <div className="flex gap-1 shrink-0 items-center">
                    {(() => {
                      const r = records[p.id] ?? { w: 0, l: 0 };
                      const hasPlayed = r.w + r.l > 0;
                      if (hasPlayed) return (
                        <button
                          disabled
                          title="Cannot remove — player has played games"
                          className="icon-btn danger opacity-25 cursor-not-allowed"
                        ><X size={14} /></button>
                      );
                      return confirmRemovePlayer === p.id ? (
                        <>
                          <button
                            onClick={() => { setConfirmRemovePlayer(null); handleRemove(p.id); }}
                            disabled={removingId === p.id}
                            title="Confirm remove"
                            className="bg-red-bg border border-red text-red-bright py-1 px-1.5 cursor-pointer leading-none"
                          >{removingId === p.id ? '…' : <Check size={14} />}</button>
                          <button
                            onClick={() => setConfirmRemovePlayer(null)}
                            title="Cancel"
                            className="btn-secondary py-1 px-1.5"
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
          <form onSubmit={handleEnroll} className="grid grid-cols-[1fr_80px_auto] gap-y-2 gap-x-3 items-center">
            <div className="section-label">Add From Player List</div>
            <label className="field-label">Seed</label>
            <div />
            <div className="relative">
              <select
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
                required
                className={`w-full bg-bg border border-border tracking-wider py-2 pr-8 pl-3 outline-none appearance-none cursor-pointer ${selectedPlayerId ? 'text-text' : 'text-muted'}`}
              >
                <option value="">Select a player...</option>
                {roster.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.location ? ` — ${p.location}` : ''}</option>
                ))}
              </select>
              <span className="absolute right-[0.6rem] top-1/2 -translate-y-1/2 text-muted pointer-events-none inline-flex"><ChevronDown size={12} /></span>
            </div>
            <input
              type="number"
              min="1"
              value={seedInput}
              onChange={e => setSeedInput(e.target.value)}
              className="input w-full"
            />
            <button
              type="submit"
              className={`btn-primary whitespace-nowrap ${enrolling ? 'cursor-wait' : 'cursor-pointer'} ${(enrolling || !selectedPlayerId) ? 'opacity-50' : ''}`}
              disabled={enrolling || !selectedPlayerId}
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
        <div className="text-muted-dim tracking-widest text-center p-2">
          All players are enrolled in this tournament.
        </div>
      )}

      {/* Seed edit modal */}
      {seedModal && createPortal(
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
          onClick={e => { if (e.target === e.currentTarget) setSeedModal(null); }}
        >
          <form onSubmit={handleSaveSeed} className="bg-surface border border-border-bright p-6 flex flex-col gap-4 min-w-70">
            <div className="section-label">Edit Seed</div>
            <div className="text-text font-medium">{seedModal.name}</div>
            <div>
              <label className="field-label">Seed</label>
              <input
                ref={seedModalRef}
                type="number"
                min="1"
                value={seedModalVal}
                onChange={e => setSeedModalVal(e.target.value)}
                className="input w-full"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className={`btn-primary ${seedModalSaving ? 'opacity-60' : ''}`} disabled={seedModalSaving}>
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
