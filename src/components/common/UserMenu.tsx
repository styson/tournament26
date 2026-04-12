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
    <div ref={menuRef} className="relative">

      {/* ── Avatar button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`w-7 h-7 rounded-full border-[1.5px] border-accent text-text tracking-wider cursor-pointer flex items-center justify-center transition-all duration-150 p-0 ${isOpen ? 'bg-raised' : 'bg-transparent hover:bg-raised'}`}
      >
        {initials}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] right-0 bg-bg-header border border-border-bright min-w-62.5 z-100 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">

          {/* Email */}
          {user.email && (
            <div className="py-2.5 px-3 border-b border-border text-accent tracking-wider truncate">
              {user.email}
            </div>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
            className="w-full py-2 px-3 bg-transparent border-0 border-b border-border text-muted tracking-wider cursor-pointer flex items-center justify-between text-left hover:text-text"
          >
            <span>◑ Dark mode</span>
            <span className={`inline-flex w-7.5 h-3.75 rounded-lg items-center px-0.5 transition-all duration-150 shrink-0 border ${theme === 'dark' ? 'bg-raised border-accent justify-end' : 'bg-border border-border-bright justify-start'}`}>
              <span className={`w-2.75 h-2.75 rounded-full block transition-colors duration-150 ${theme === 'dark' ? 'bg-accent' : 'bg-muted'}`} />
            </span>
          </button>

          {/* Reset password — only for email accounts */}
          {user.email && (
            <button
              onClick={handleResetPassword}
              className="w-full py-2 px-3 bg-transparent border-0 border-b border-border text-muted tracking-wider cursor-pointer flex items-center gap-2 text-left hover:text-text"
            >
              ⟳ Reset password
            </button>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full py-2 px-3 bg-transparent border-none text-red tracking-wider cursor-pointer flex items-center gap-2 text-left hover:bg-red/8"
          >
            ⏻ Sign out
          </button>
        </div>
      )}

      {/* ── Success toast ── */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-bg border border-green py-2.5 px-4 tracking-wider text-green shadow-[0_4px_12px_rgba(0,0,0,0.4)] z-200 flex items-center gap-2">
          ✓ Reset link sent — check your inbox
        </div>
      )}
    </div>
  );
}
