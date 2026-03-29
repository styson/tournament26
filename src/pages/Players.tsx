import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

interface Player {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
}

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('players')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setError(error.message);
        } else {
          setPlayers(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Personnel Records</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Players
          </h1>
        </div>
        <Link to="/players/new" className="btn-primary">+ Enlist Player</Link>
      </div>

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid #282420', borderTopColor: '#b8861a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#9a8e7e', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: '1.25rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: '#c46060', border: '1px solid #5a1e1e' }}>
            {error}
          </div>
        ) : players.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '4rem', color: '#1e1c18', letterSpacing: '0.05em' }}>PL-00</div>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '0.06em', color: '#9a8e7e', margin: 0 }}>
              No Personnel on Record
            </h3>
            <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: '#706858', margin: 0, textAlign: 'center' }}>
              Enlist your first player to begin building the roster
            </p>
            <Link to="/players/new" className="btn-primary" style={{ marginTop: '0.5rem' }}>+ Enlist First Player</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: '#ddd4bc', fontWeight: 500 }}>{p.name}</td>
                    <td>{p.email ?? '—'}</td>
                    <td>{p.phone ?? '—'}</td>
                    <td>{p.location ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
