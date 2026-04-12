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

function StatCard({ label, value, link, delay = 0 }: StatCardProps) {
  const displayed = useCountUp(value);
  const inner = (
    <div
      className={`bg-surface pt-4 pb-3.5 px-5 transition-colors duration-150 relative overflow-hidden${link ? ' cursor-pointer hover:bg-raised' : ' cursor-default'}`}
    >
      {/* Top accent line — always visible */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,var(--color-accent),transparent_70%)]" />

      <div className="tracking-widest text-muted mb-2 flex justify-between">
        <span>{label}</span>
      </div>

      <div className={`font-display text-5xl leading-none tracking-wider ${value === 'Err' ? 'text-red' : 'text-accent'}`}>
        {displayed}
      </div>
    </div>
  );

  return link
    ? <Link to={link} className="block animate-[fadeUp_0.45s_ease_both]" style={{ animationDelay: `${delay}s` }}>{inner}</Link>
    : <div className="animate-[fadeUp_0.45s_ease_both]" style={{ animationDelay: `${delay}s` }}>{inner}</div>;
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
    { name: 'Standings',      link: '/standings',       symbol: '≡' },
    { name: 'New Tournament', link: '/tournaments/new', symbol: '◈' },
    { name: 'Add Player',     link: '/players/new',     symbol: '+' },
    { name: 'Add Scenario',   link: '/scenarios/new',   symbol: '+' },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="anim-0 flex items-end justify-between flex-wrap gap-2">
        <div>
          <div className="section-label mb-1">Command Center</div>
          <h1 className="text-4xl tracking-wider m-0">
            Welcome, <span className="text-accent">{user?.name?.split(' ')[0] ?? 'Director'}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Online indicator */}
          <div className="relative w-1.5 h-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-[blink_2s_step-end_infinite]" />
            <div className="absolute inset-0 rounded-full bg-green animate-[pulseRing_2s_ease-out_infinite]" />
          </div>
          <span className="text-muted-dim tracking-widest">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-px bg-border">
        {stats.map((stat, i) => (
          <StatCard key={stat.code} {...stat} delay={0.08 + i * 0.06} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Quick Actions */}
        <div className="card anim-2">
          <div className="section-label mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link key={action.name} to={action.link} className="block">
                <div className="border border-border p-3 cursor-pointer transition-all duration-150 flex items-center gap-2.5 relative overflow-hidden hover:border-accent hover:bg-raised">
                  <span className="text-accent leading-none">{action.symbol}</span>
                  <span className="tracking-widest text-text-dim uppercase">{action.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card anim-3">
          <div className="section-label mb-3">Recent Activity</div>
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="text-2xl text-border">—</div>
            <p className="text-muted-dim tracking-widest uppercase m-0">
              No recent activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
