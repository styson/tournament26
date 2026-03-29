import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setError(error.message);
        } else {
          setTournaments(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Tournaments</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Tournaments
          </h1>
        </div>
        <Link to="/tournaments/new" className="btn-primary">+ New Tournament</Link>
      </div>

      {/* List */}
      <div className="anim-1">
        {loading ? (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid var(--c-spin-track)', borderTopColor: 'var(--c-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: 'var(--c-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '1.25rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--c-red)', border: '1px solid var(--c-red-border)' }}>
            {error}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '4rem', color: 'var(--c-raised)', letterSpacing: '0.05em' }}>TN-00</div>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '0.06em', color: 'var(--c-muted)', margin: 0 }}>
              No Tournaments Active
            </h3>
            <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-muted-dim)', margin: 0, textAlign: 'center' }}>
              Launch your first tournament to get boots on the ground
            </p>
            <Link to="/tournaments/new" className="btn-primary" style={{ marginTop: '0.5rem' }}>+ Launch First Tournament</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--c-border)' }}>
            {tournaments.map((tournament) => (
              <div key={tournament.id} style={{ background: 'var(--c-surface)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', transition: 'background 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--c-raised)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--c-surface)'}
              >
                <div>
                  <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', letterSpacing: '0.06em', margin: '0 0 0.35rem' }}>{tournament.name}</h3>
                  {tournament.description && (
                    <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.9rem', color: 'var(--c-muted)', margin: '0 0 0.5rem' }}>{tournament.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: '1.5rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--c-muted)' }}>
                    <span style={{ color: statusColor(tournament.status) }}>{tournament.status}</span>
                    <span>{tournament.start_date}</span>
                    {tournament.end_date && <span>→ {tournament.end_date}</span>}
                  </div>
                </div>
                <Link to="/tournaments/$id" params={{ id: tournament.id }} className="btn-secondary">
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE':    return 'var(--c-green-dim)';
    case 'COMPLETED': return 'var(--c-muted)';
    case 'CANCELLED': return 'var(--c-red)';
    default:          return 'var(--c-accent)'; // DRAFT
  }
}
