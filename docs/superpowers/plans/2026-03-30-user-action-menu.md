# User Action Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the username label, theme toggle button, and logout button in the header with a single avatar-circle that opens a dropdown menu containing a dark-mode toggle, password reset, and sign-out actions.

**Architecture:** Extract a `UserMenu` component from `Layout`. Theme state stays in `Layout` and is passed as props. The dropdown is rendered inline (no portal) with a `useRef`-based click-outside handler.

**Tech Stack:** React 18, TypeScript, Supabase JS SDK, Vite. No test runner — use `npm run build` for type-checking, then manual browser verification.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| **Create** | `src/components/common/UserMenu.tsx` | Avatar button, dropdown, toast, reset-password call |
| **Modify** | `src/components/common/Layout.tsx` | Remove old controls, render `<UserMenu>` |

---

### Task 1: Create `UserMenu.tsx`

**Files:**
- Create: `src/components/common/UserMenu.tsx`

- [ ] **Step 1: Create the file with this exact content**

```tsx
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

  async function handleResetPassword() {
    if (!user?.email) return;
    setIsOpen(false);
    await supabase.auth.resetPasswordForEmail(user.email);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
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
          color: 'var(--color-accent)',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.55rem',
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
          minWidth: '200px',
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>

          {/* Email */}
          {user.email && (
            <div style={{
              padding: '0.6rem 0.75rem',
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-muted)',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.55rem',
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
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.6rem',
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
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.6rem',
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
            onClick={signOut}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-red, #d05c5c)',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.6rem',
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
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.6rem',
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
```

- [ ] **Step 2: Verify it type-checks**

```bash
npm run build
```

Expected: build completes with no TypeScript errors. (A warning about unused variables is fine; an error about missing imports or type mismatches is not.)

- [ ] **Step 3: Commit**

```bash
git add src/components/common/UserMenu.tsx
git commit -m "feat: add UserMenu component with avatar, dropdown, and password reset"
```

---

### Task 2: Wire `UserMenu` into `Layout.tsx`

**Files:**
- Modify: `src/components/common/Layout.tsx`

- [ ] **Step 1: Add the `UserMenu` import at the top of `Layout.tsx`**

After the existing imports, add:

```tsx
import UserMenu from '@/components/common/UserMenu';
```

- [ ] **Step 2: Replace the user-info section**

Find this block (lines 119–146):

```tsx
          {/* User info */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--color-muted)', letterSpacing: '0.08em', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
              <button
                onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border-bright)',
                  color: 'var(--color-muted)',
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  padding: '0.25rem 0.6rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-bright)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
              >
                {theme === 'dark' ? '◑ Light' : '◑ Dark'}
              </button>
              <button onClick={signOut} className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.6rem' }}>
                Logout
              </button>
            </div>
          )}
```

Replace it with:

```tsx
          {/* User menu */}
          {user && (
            <UserMenu theme={theme} onThemeChange={setTheme} />
          )}
```

- [ ] **Step 3: Verify `signOut` is no longer referenced in `Layout.tsx`**

The `useAuth()` call now only needs `user`. Update the destructure at the top of `Layout`:

Find:
```tsx
  const { user, signOut } = useAuth();
```

Replace with:
```tsx
  const { user } = useAuth();
```

- [ ] **Step 4: Type-check and build**

```bash
npm run build
```

Expected: clean build, zero TypeScript errors.

- [ ] **Step 5: Manual smoke test**

```bash
npm run dev
```

Open `http://localhost:5173` and verify:

1. Header shows the avatar circle with your initials in the top-right (no username label, no old buttons)
2. Clicking the avatar opens the dropdown
3. Email address appears at the top of the dropdown
4. Clicking the dark-mode toggle switches the theme (pill moves, page theme changes)
5. Clicking outside the dropdown closes it
6. Clicking "Sign out" signs you out
7. Clicking "Reset password" closes the menu and shows the green toast for 3 seconds

- [ ] **Step 6: Commit**

```bash
git add src/components/common/Layout.tsx
git commit -m "feat: wire UserMenu into Layout, remove old header controls"
```
