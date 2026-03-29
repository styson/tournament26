import { useAuth } from '@/config/auth';
import { Link } from '@tanstack/react-router';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Tournaments', value: '0', link: '/tournaments', code: 'TN' },
    { label: 'Total Players',      value: '0', link: '/players',     code: 'PL' },
    { label: 'Games Played',       value: '0', link: '/games',       code: 'GM' },
    { label: 'Scenarios',          value: '0', link: '/scenarios',   code: 'SC' },
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
            Welcome, <span style={{ color: '#b8861a' }}>{user?.name?.split(' ')[0] ?? 'Director'}</span>
          </h1>
        </div>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: '#706858', letterSpacing: '0.12em' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
        </span>
      </div>

      {/* Stats */}
      <div className="anim-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: '#282420' }}>
        {stats.map((stat) => (
          <Link key={stat.code} to={stat.link} style={{ display: 'block' }}>
            <div style={{
              background: '#131110',
              padding: '1rem 1.25rem',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              position: 'relative',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#1c1916'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#131110'}
            >
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: '#9a8e7e', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{stat.label}</span>
                <span style={{ color: '#706858' }}>[{stat.code}]</span>
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
                  border: '1px solid #282420',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#b8861a'; (e.currentTarget as HTMLDivElement).style.background = '#1c1916'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#282420'; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1rem', color: '#b8861a', lineHeight: 1 }}>{action.symbol}</span>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.62rem', letterSpacing: '0.1em', color: '#c8b8a8', textTransform: 'uppercase' }}>{action.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card anim-3">
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', gap: '0.5rem' }}>
            <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1.5rem', color: '#282420' }}>—</div>
            <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#706858', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
              No recent activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
