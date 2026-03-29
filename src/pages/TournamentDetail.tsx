import { useEffect, useState } from 'react';
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

export default function TournamentDetail() {
  const { id } = useParams({ strict: false });

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [enrolled, setEnrolled] = useState<Player[]>([]);
  const [roster, setRoster] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loadingTournament, setLoadingTournament] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Fetch tournament
  useEffect(() => {
    supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) { console.error(error); setError(error.message); }
        else setTournament(data);
        setLoadingTournament(false);
      });
  }, [id]);

  // Fetch enrolled players + full roster
  useEffect(() => {
    fetchPlayers();
  }, [id]);

  async function fetchPlayers() {
    setLoadingPlayers(true);

    const [enrolledRes, allRes] = await Promise.all([
      supabase
        .from('tournament_players')
        .select('player_id, players(id, name, email, location)')
        .eq('tournament_id', id),
      supabase
        .from('players')
        .select('id, name, email, location')
        .order('name'),
    ]);

    if (enrolledRes.error) console.error(enrolledRes.error);
    if (allRes.error) console.error(allRes.error);

    const enrolledPlayers: Player[] = (enrolledRes.data ?? [])
      .map((r: any) => r.players)
      .filter(Boolean);

    const enrolledIds = new Set(enrolledPlayers.map(p => p.id));
    const availablePlayers = (allRes.data ?? []).filter(p => !enrolledIds.has(p.id));

    setEnrolled(enrolledPlayers);
    setRoster(availablePlayers);
    setSelectedPlayerId('');
    setLoadingPlayers(false);
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlayerId) return;
    setEnrolling(true);

    const { error } = await supabase
      .from('tournament_players')
      .insert({ tournament_id: id, player_id: selectedPlayerId });

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      await fetchPlayers();
    }
    setEnrolling(false);
  }

  async function handleRemove(playerId: string) {
    setRemovingId(playerId);

    const { error } = await supabase
      .from('tournament_players')
      .delete()
      .eq('tournament_id', id)
      .eq('player_id', playerId);

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      await fetchPlayers();
    }
    setRemovingId(null);
  }

  if (loadingTournament) return <Spinner />;
  if (!tournament) return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#c46060', fontSize: '0.8rem' }}>
      Tournament not found. <Link to="/tournaments" style={{ color: '#b8861a' }}>← Back</Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>

      {/* Back */}
      <div className="anim-0">
        <Link to="/tournaments" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: '#9a8e7e', textTransform: 'uppercase' }}>
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
              <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '1rem', color: '#b0a090', margin: '0 0 0.75rem' }}>
                {tournament.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#9a8e7e' }}>
              <span>Start: {tournament.start_date}</span>
              {tournament.end_date && <span>End: {tournament.end_date}</span>}
            </div>
          </div>
          <span style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: statusColor(tournament.status),
            border: `1px solid ${statusColor(tournament.status)}`,
            padding: '0.25rem 0.6rem',
          }}>
            {tournament.status}
          </span>
        </div>
      </div>

      {/* Enrolled players */}
      <div className="card anim-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #282420', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="section-label">
            Enrolled Players
            {!loadingPlayers && (
              <span style={{ color: '#b8861a', marginLeft: '0.5rem' }}>{enrolled.length}</span>
            )}
          </div>
        </div>

        {loadingPlayers ? (
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><Spinner inline /></div>
        ) : enrolled.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontFamily: '"Crimson Text", serif', fontSize: '1rem', color: '#706858' }}>
            No players enrolled yet. Add players from the roster below.
          </div>
        ) : (
          <table className="ops-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enrolled.map(p => (
                <tr key={p.id}>
                  <td style={{ color: '#ddd4bc', fontWeight: 500 }}>{p.name}</td>
                  <td>{p.email ?? '—'}</td>
                  <td>{p.location ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleRemove(p.id)}
                      disabled={removingId === p.id}
                      style={{
                        background: 'transparent',
                        border: '1px solid #3a2020',
                        color: removingId === p.id ? '#5a5248' : '#8b4040',
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '0.25rem 0.5rem',
                        cursor: removingId === p.id ? 'wait' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { if (removingId !== p.id) (e.currentTarget as HTMLButtonElement).style.borderColor = '#c46060'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a2020'; }}
                    >
                      {removingId === p.id ? '...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add player */}
      {!loadingPlayers && roster.length > 0 && (
        <div className="card anim-3">
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>Add from Roster</div>
          <form onSubmit={handleEnroll} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <select
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#0a0908',
                  color: selectedPlayerId ? '#ddd4bc' : '#9a8e7e',
                  border: '1px solid #282420',
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  padding: '0.5rem 2rem 0.5rem 0.75rem',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select a player...</option>
                {roster.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.location ? ` — ${p.location}` : ''}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#9a8e7e', fontSize: '0.6rem', pointerEvents: 'none' }}>▼</span>
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
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(139, 46, 46, 0.15)', border: '1px solid #5a1e1e', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: '#c46060' }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* All players enrolled */}
      {!loadingPlayers && roster.length === 0 && enrolled.length > 0 && (
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#706858', letterSpacing: '0.12em', textAlign: 'center', padding: '0.5rem' }}>
          All players are enrolled in this tournament.
        </div>
      )}
    </div>
  );
}

function Spinner({ inline }: { inline?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', ...(inline ? {} : { justifyContent: 'center', padding: '4rem' }) }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid #282420', borderTopColor: '#b8861a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE':    return '#6a9c68';
    case 'COMPLETED': return '#9a8e7e';
    case 'CANCELLED': return '#c46060';
    default:          return '#b8861a';
  }
}
