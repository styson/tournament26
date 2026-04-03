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
          <h1 style={{ fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Players
          </h1>
        </div>
        <Link to="/players/new" className="btn-primary">+ Enlist Player</Link>
      </div>

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="row" style={{ justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" /><span className="section-label">Loading...</span>
          </div>
        ) : error ? (
          <div className="error-box">
            {error}
          </div>
        ) : players.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.4rem', letterSpacing: '0.06em', color: 'var(--color-muted)', margin: 0 }}>
              No Personnel on Record
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-muted-dim)', margin: 0, textAlign: 'center' }}>
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
                    <td style={{ color: 'var(--color-text)', fontWeight: 500 }}>{p.name}</td>
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
