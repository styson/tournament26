import type { ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/config/auth';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', code: 'DB' },
  { name: 'Players',   href: '/players',   code: 'PL' },
  { name: 'Tourney',   href: '/tournaments', code: 'TN' },
  { name: 'Games',     href: '/games',     code: 'GM' },
  { name: 'Scenarios', href: '/scenarios', code: 'SC' },
  { name: 'Standings', href: '/standings', code: 'ST' },
];

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav bar ── */}
      <header style={{
        background: '#0d0c0a',
        borderBottom: '1px solid #282420',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Thin brass accent line at top */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, #b8861a 30%, #b8861a 70%, transparent 100%)' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', height: '48px', gap: '1.5rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <div style={{
              width: '28px',
              height: '28px',
              background: '#b8861a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
            }}>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem', color: '#0a0908', letterSpacing: '0.05em' }}>T</span>
            </div>
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem', letterSpacing: '0.12em', color: '#ddd4bc' }}>
              TOURNEY<span style={{ color: '#b8861a' }}>26</span>
            </span>
          </Link>

          {/* Separator */}
          <div style={{ width: '1px', height: '20px', background: '#282420', flexShrink: 0 }} />

          {/* Nav links */}
          {user && (
            <nav style={{ display: 'flex', gap: '0.15rem', flex: 1, overflow: 'hidden' }}>
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    style={{
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: '0.62rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      padding: '0.3rem 0.6rem',
                      color: active ? '#b8861a' : '#b0a090',
                      borderBottom: active ? '2px solid #b8861a' : '2px solid transparent',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#c8b8a8'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#b0a090'; }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Spacer when no user */}
          {!user && <div style={{ flex: 1 }} />}

          {/* User info */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: '#9a8e7e', letterSpacing: '0.08em', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
              <button onClick={signOut} className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.6rem' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #1e1c18', padding: '0.75rem 1rem', textAlign: 'center' }}>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: '#706858', letterSpacing: '0.15em' }}>
          TOURNAMENT26 · CLASSIFIED · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
