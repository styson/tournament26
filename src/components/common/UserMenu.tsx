import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/config/auth';
import { supabase } from '@/config/supabase';

interface UserMenuProps {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '??';
}

export default function UserMenu({ theme, onThemeChange }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  async function handleResetPassword() {
    if (!user?.email) return;
    setIsOpen(false);
    await supabase.auth.resetPasswordForEmail(user.email);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3000);
  }

  function handleSignOut() {
    setIsOpen(false);
    signOut();
  }

  if (!user) return null;

  const initials = getInitials(user.name, user.email);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>

      {/* ── Avatar button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: isOpen ? 'var(--color-raised)' : 'transparent',
          border: '1.5px solid var(--color-accent)',
          color: '#ffffff',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          padding: 0,
        }}
        onMouseEnter={e => {
          if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-raised)';
        }}
        onMouseLeave={e => {
          if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        {initials}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: 'var(--color-bg-header)',
          border: '1px solid var(--color-border-bright)',
          minWidth: '250px',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>

          {/* Email */}
          {user.email && (
            <div style={{
              padding: '0.6rem 0.75rem',
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-accent)',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user.email}
            </div>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
          >
            <span>◑ Dark mode</span>
            <span style={{
              display: 'inline-flex',
              width: '30px',
              height: '15px',
              borderRadius: '8px',
              background: theme === 'dark' ? 'var(--color-raised)' : 'var(--color-border)',
              border: `1px solid ${theme === 'dark' ? 'var(--color-accent)' : 'var(--color-border-bright)'}`,
              alignItems: 'center',
              padding: '0 2px',
              justifyContent: theme === 'dark' ? 'flex-end' : 'flex-start',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}>
              <span style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                background: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-muted)',
                display: 'block',
                transition: 'background 0.15s ease',
              }} />
            </span>
          </button>

          {/* Reset password — only for email accounts */}
          {user.email && (
            <button
              onClick={handleResetPassword}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-muted)',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
            >
              ⟳ Reset password
            </button>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-red, #d05c5c)',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--color-red, #d05c5c) 8%, transparent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            ⏻ Sign out
          </button>
        </div>
      )}

      {/* ── Success toast ── */}
      {toastVisible && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-green)',
          padding: '0.6rem 1rem',
          letterSpacing: '0.08em',
          color: 'var(--color-green)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          ✓ Reset link sent — check your inbox
        </div>
      )}
    </div>
  );
}
