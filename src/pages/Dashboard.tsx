import { useEffect, useState } from 'react';
import { useAuth } from '@/config/auth';
import { Link } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';

// Animated count-up for a numeric string value
function useCountUp(target: string, duration = 900): string {
  const [display, setDisplay] = useState('—');

  useEffect(() => {
    if (target === '—' || target === 'Err') {
      setDisplay(target);
      return;
    }
    const num = parseInt(target, 10);
    if (isNaN(num)) { setDisplay(target); return; }
    if (num === 0) { setDisplay('0'); return; }

    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const ease = 1 - (1 - progress) * (1 - progress);
      setDisplay(String(Math.floor(ease * num)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

interface StatCardProps {
  label: string;
  value: string;
  link?: string;
  code: string;
  delay?: number;
}

function StatCard({ label, value, link, code, delay = 0 }: StatCardProps) {
  const displayed = useCountUp(value);
  const inner = (
    <div
      style={{
        background: 'var(--color-surface)',
        padding: '1rem 1.25rem 0.875rem',
        cursor: link ? 'pointer' : 'default',
        transition: 'background 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { if (link) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-raised)'; }}
      onMouseLeave={e => { if (link) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface)'; }}
    >
      {/* Top accent line — always visible */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, var(--color-accent), transparent 70%)',
      }} />

      <div style={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '0.55rem',
        letterSpacing: '0.2em',
        color: 'var(--color-muted)',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>{label}</span>
        <span style={{ color: 'var(--color-muted-dim)' }}>[{code}]</span>
      </div>

      <div style={{
        fontFamily: '"Bebas Neue", sans-serif',
        fontSize: '2.75rem',
        lineHeight: 1,
        color: value === 'Err' ? 'var(--color-red)' : 'var(--color-accent)',
        letterSpacing: '0.04em',
      }}>
        {displayed}
      </div>
    </div>
  );

  return link
    ? <Link to={link} style={{ display: 'block', animation: `fadeUp 0.45s ${delay}s ease both` }}>{inner}</Link>
    : <div style={{ animation: `fadeUp 0.45s ${delay}s ease both` }}>{inner}</div>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ tournaments: '—', players: '—', games: '—', scenarios: '—' });

  useEffect(() => {
    Promise.all([
      supabase.from('tournaments').select('*', { count: 'exact', head: true }),
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
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
    { label: 'Tournaments',   value: counts.tournaments, link: '/tournaments', code: 'TN' },
    { label: 'Total Players', value: counts.players,     link: '/players',     code: 'PL' },
    { label: 'Games Played',  value: counts.games,                             code: 'GM' },
    { label: 'Scenarios',     value: counts.scenarios,   link: '/scenarios',   code: 'SC' },
  ];

  const quickActions = [
    { name: 'Add Player',     link: '/players/new',     symbol: '+' },
    { name: 'New Tournament', link: '/tournaments/new', symbol: '◈' },
    { name: 'Standings',      link: '/standings',       symbol: '≡' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Command Center</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Welcome, <span style={{ color: 'var(--color-accent)' }}>{user?.name?.split(' ')[0] ?? 'Director'}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Online indicator */}
          <div style={{ position: 'relative', width: '6px', height: '6px', flexShrink: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green)', animation: 'blink 2s step-end infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-green)', animation: 'pulseRing 2s ease-out infinite' }} />
          </div>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--color-muted-dim)', letterSpacing: '0.12em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: 'var(--color-border)' }}>
        {stats.map((stat, i) => (
          <StatCard key={stat.code} {...stat} delay={0.08 + i * 0.06} />
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
                  border: '1px solid var(--color-border)',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    const d = e.currentTarget as HTMLDivElement;
                    d.style.borderColor = 'var(--color-accent)';
                    d.style.background = 'var(--color-raised)';
                  }}
                  onMouseLeave={e => {
                    const d = e.currentTarget as HTMLDivElement;
                    d.style.borderColor = 'var(--color-border)';
                    d.style.background = 'transparent';
                  }}
                >
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1rem', color: 'var(--color-accent)', lineHeight: 1 }}>{action.symbol}</span>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>{action.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card anim-3">
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', gap: '0.5rem' }}>
            <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1.5rem', color: 'var(--color-border)' }}>—</div>
            <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem', color: 'var(--color-muted-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
              No recent activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
