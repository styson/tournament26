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

interface TopListRow {
  rank: number;
  label: string;
  value: number;
  link: string;
}

function TopList({ title, rows }: { title: string; rows: TopListRow[] }) {
  return (
    <div className="card">
      <div className="section-label mb-3">{title}</div>
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="text-2xl text-border">—</div>
          <p className="text-muted-dim tracking-widest uppercase m-0">No data yet</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {rows.map((row) => (
            <Link key={row.link} to={row.link} className="flex items-center gap-3 px-1 py-2 border-b border-border last:border-0 hover:bg-raised transition-colors duration-100 group">
              <span className="w-5 text-right text-muted-dim font-mono text-xs shrink-0">{row.rank}</span>
              <span className="flex-1 truncate text-text-dim group-hover:text-text tracking-wide transition-colors duration-100">{row.label}</span>
              <span className="font-mono text-accent tabular-nums">{row.value}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface TopPlayer {
  id: string;
  name: string;
  games: number;
}

interface TopScenario {
  id: string;
  title: string;
  games: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ tournaments: '—', players: '—', games: '—', scenarios: '—' });
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [topScenarios, setTopScenarios] = useState<TopScenario[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('tournaments').select('*', { count: 'exact', head: true }),
      supabase.from('players').select('*', { count: 'exact', head: true }),
      supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
      supabase.from('scenarios').select('*', { count: 'exact', head: true }),
      supabase.from('games').select('player1_id, player2_id').eq('status', 'COMPLETED'),
      supabase.from('games').select('scenario_id, scenarios(id, title)').eq('status', 'COMPLETED'),
    ]).then(([t, p, g, s, gamesForPlayers, gamesForScenarios]) => {
      setCounts({
        tournaments: t.error ? 'Err' : String(t.count ?? 0),
        players:     p.error ? 'Err' : String(p.count ?? 0),
        games:       g.error ? 'Err' : String(g.count ?? 0),
        scenarios:   s.error ? 'Err' : String(s.count ?? 0),
      });

      // Tally games per player
      if (!gamesForPlayers.error && gamesForPlayers.data) {
        const tally = new Map<string, number>();
        for (const row of gamesForPlayers.data as { player1_id: string; player2_id: string }[]) {
          tally.set(row.player1_id, (tally.get(row.player1_id) ?? 0) + 1);
          tally.set(row.player2_id, (tally.get(row.player2_id) ?? 0) + 1);
        }
        const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (sorted.length > 0) {
          const ids = sorted.map(([id]) => id);
          supabase.from('players').select('id, name').in('id', ids).then(({ data }) => {
            if (!data) return;
            const nameMap = new Map(data.map((r) => [r.id, r.name]));
            setTopPlayers(sorted.map(([id, games]) => ({ id, name: nameMap.get(id) ?? id, games })));
          });
        }
      }

      // Tally games per scenario
      if (!gamesForScenarios.error && gamesForScenarios.data) {
        const tally = new Map<string, { title: string; games: number }>();
        for (const row of gamesForScenarios.data as { scenario_id: string; scenarios: { id: string; title: string } | null }[]) {
          if (!row.scenario_id || !row.scenarios || row.scenarios.title === 'Forfeit') continue;
          const cur = tally.get(row.scenario_id);
          tally.set(row.scenario_id, { title: row.scenarios.title, games: (cur?.games ?? 0) + 1 });
        }
        const sorted = [...tally.entries()]
          .sort((a, b) => b[1].games - a[1].games)
          .slice(0, 10)
          .map(([id, { title, games }]) => ({ id, title, games }));
        setTopScenarios(sorted);
      }
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

      {/* Top-10 leaderboards */}
      <div className="grid grid-cols-2 gap-5">
        <TopList
          title="Most Games Played"
          rows={topPlayers.map((p, i) => ({ rank: i + 1, label: p.name, value: p.games, link: `/players/${p.id}` }))}
        />
        <TopList
          title="Most Played Scenarios"
          rows={topScenarios.map((s, i) => ({ rank: i + 1, label: s.title, value: s.games, link: `/scenarios/${s.id}` }))}
        />
      </div>
    </div>
  );
}
