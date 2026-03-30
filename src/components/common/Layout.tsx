import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/config/auth';
import UserMenu from '@/components/common/UserMenu';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', code: 'DB' },
  { name: 'Players',   href: '/players',   code: 'PL' },
  { name: 'Tourney',   href: '/tournaments', code: 'TN' },
  { name: 'Scenarios', href: '/scenarios', code: 'SC' },
  { name: 'Standings', href: '/standings', code: 'ST' },
];

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav bar ── */}
      <header style={{
        background: 'var(--color-bg-header)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Thin amber accent line at top */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, var(--color-accent) 30%, var(--color-accent) 70%, transparent 100%)' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', height: '48px', gap: '1.5rem' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '28px',
                height: '28px',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
              }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem', color: 'var(--color-bg)', letterSpacing: '0.05em' }}>T</span>
              </div>
              {user && (
                <div style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-green)',
                  border: '1px solid var(--color-bg-header)',
                  animation: 'blink 2s step-end infinite',
                }} />
              )}
            </div>
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem', letterSpacing: '0.12em', color: 'var(--color-text)' }}>
              TOURNEY<span style={{ color: 'var(--color-accent)' }}>26</span>
            </span>
          </Link>

          {/* Separator */}
          <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', flexShrink: 0 }} />

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
                      color: active ? 'var(--color-accent)' : 'var(--color-muted)',
                      borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Spacer when no user */}
          {!user && <div style={{ flex: 1 }} />}

          {/* User menu */}
          {user && (
            <UserMenu theme={theme} onThemeChange={setTheme} />
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--color-raised)', padding: '0.75rem 1rem', textAlign: 'center' }}>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--color-muted-dim)', letterSpacing: '0.15em' }}>
          TOURNAMENT26 · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
