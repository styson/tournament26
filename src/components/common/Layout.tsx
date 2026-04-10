import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/config/auth';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import UserMenu from '@/components/common/UserMenu';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', code: 'DB' },
  { name: 'Tournaments', href: '/tournaments', code: 'TN' },
  { name: 'Standings', href: '/standings', code: 'ST' },
  { name: 'Players', href: '/players', code: 'PL' },
  { name: 'Scenarios', href: '/scenarios', code: 'SC' },
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
    <div className='min-h-screen flex flex-col'>
      {/* ── Nav bar ── */}
      <header className='bg-bg-header border-b border-(--color-border) sticky top-0 z-50'>
        {/* Thin amber accent line at top */}
        <div className='h-0.5 bg-[linear-gradient(90deg,transparent_0%,var(--color-accent)_30%,var(--color-accent)_70%,transparent_100%)]' />

        <div className='max-w-7xl mx-auto px-4 flex items-center h-12 gap-6'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-[0.6rem] shrink-0'>
            <div className='relative'>
              <div className='w-7 h-7 bg-accent flex items-center justify-center [clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,4px_100%,0_calc(100%-4px))]'>
                <span className='font-display text-bg tracking-[0.05em]'>
                  T
                </span>
              </div>
              {user && (
                <div className='absolute -bottom-px -right-px w-1.5 h-1.5 rounded-full bg-green border border-bg-header animate-[blink_2s_step-end_infinite]' />
              )}
            </div>
            <span className='font-display tracking-[0.12em] text-text'>
              TOURNEY<span className='text-accent'>26</span>
            </span>
          </Link>

          {/* Separator */}
          <div className='w-px h-5 bg-(--color-border) shrink-0' />

          {/* Nav links */}
          {user && (
            <nav className='flex gap-[0.15rem] flex-1 overflow-hidden'>
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={
                      'tracking-[0.14em] uppercase py-[0.3rem] px-[0.6rem] border-b-2 transition-all duration-150 ease-in-out whitespace-nowrap ' +
                      (active
                        ? 'text-accent border-b-accent'
                        : 'text-muted border-b-transparent hover:text-text')
                    }
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Spacer when no user */}
          {!user && <div className='flex-1' />}

          {/* User menu */}
          {user && <UserMenu theme={theme} onThemeChange={setTheme} />}
        </div>
      </header>

      {/* ── Page content ── */}
      <main className='flex-1 max-w-7xl w-full mx-auto py-6 px-4'>{children}</main>

      {/* ── Footer ── */}
      <footer className='border-t border-t-raised py-3 px-4 text-center'>
        <span className='text-muted-dim tracking-[0.15em]'>TOURNAMENT26 · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
