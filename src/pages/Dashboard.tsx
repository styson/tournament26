import { useEffect, useState } from 'react';
import { useAuth } from '@/config/auth';
import { Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ tournaments: '—', players: '—', games: '—', scenarios: '—' });

  useEffect(() => {
    Promise.all([
      supabase.from('tournaments').select('*', { count: 'exact', head: true }),
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('games').select('*', { count: 'exact', head: true }),
      supabase.from('scenarios').select('*', { count: 'exact', head: true }),
    ]).then(([t, p, g, s]) => {
      setCounts({
        tournaments: t.error ? 'Err' : String(t.count ?? 0),
        players:     p.error ? 'Err' : String(p.count ?? 0),
        games:       g.error ? 'Err' : String(g.count ?? 0),
        scenarios:   s.error ? 'Err' : String(s.count ?? 0),
      });
    });
  }, []);

  const stats = [
    { label: 'Tournaments',        value: counts.tournaments, link: '/tournaments', code: 'TN' },
    { label: 'Total Players',      value: counts.players,     link: '/players',     code: 'PL' },
    { label: 'Games Played',       value: counts.games,       link: '/games',       code: 'GM' },
    { label: 'Scenarios',          value: counts.scenarios,   link: '/scenarios',   code: 'SC' },
  ];

  const quickActions = [
    { name: 'Add Player',        link: '/players/new',     symbol: '+' },
    { name: 'New Tournament',    link: '/tournaments/new', symbol: '◈' },
    { name: 'Record Game',       link: '/games/new',       symbol: '▶' },
    { name: 'Standings',         link: '/standings',       symbol: '≡' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Command Center</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Welcome, <span style={{ color: 'var(--c-accent)' }}>{user?.name?.split(' ')[0] ?? 'Director'}</span>
          </h1>
        </div>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-muted-dim)', letterSpacing: '0.12em' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
        </span>
      </div>

      {/* Stats */}
      <div className="anim-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: 'var(--c-border)' }}>
        {stats.map((stat) => (
          <Link key={stat.code} to={stat.link} style={{ display: 'block' }}>
            <div style={{
              background: 'var(--c-surface)',
              padding: '1rem 1.25rem',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              position: 'relative',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--c-raised)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--c-surface)'}
            >
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--c-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{stat.label}</span>
                <span style={{ color: 'var(--c-muted-dim)' }}>[{stat.code}]</span>
              </div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Quick Actions */}
        <div className="card anim-2">
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {quickActions.map((action) => (
              <Link key={action.name} to={action.link} style={{ display: 'block' }}>
                <div style={{
                  border: '1px solid var(--c-border)',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--c-accent)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--c-raised)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--c-border)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1rem', color: 'var(--c-accent)', lineHeight: 1 }}>{action.symbol}</span>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--c-text-dim)', textTransform: 'uppercase' }}>{action.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card anim-3">
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', gap: '0.5rem' }}>
            <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1.5rem', color: 'var(--c-border)' }}>—</div>
            <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: 'var(--c-muted-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
              No recent activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
