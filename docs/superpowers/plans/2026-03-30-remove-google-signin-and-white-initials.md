# Remove Google Sign-In & White Avatar Initials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Google OAuth sign-in option from the Login page and change the UserMenu avatar initials colour to white.

**Architecture:** Two independent single-file edits. No new files, no new dependencies.

**Tech Stack:** React 18, TypeScript, Vite. No test runner — `npm run build` is the type-check gate.

---

## File Map

| Action | Path | Change |
|---|---|---|
| **Modify** | `src/pages/Login.tsx` | Delete `handleGoogle` function, "OR" divider, Google button |
| **Modify** | `src/components/common/UserMenu.tsx` | Change avatar initials colour from `var(--color-accent)` to `#ffffff` |

---

### Task 1: Remove Google Sign-In from Login.tsx

**Files:**
- Modify: `src/pages/Login.tsx`

- [ ] **Step 1: Delete the `handleGoogle` function**

Find and remove lines 49–55 (the entire function):

```tsx
  async function handleGoogle() {
    setError('');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }
```

- [ ] **Step 2: Delete the "OR" divider**

Find and remove the divider block (currently around lines 195–200):

```tsx
          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--color-muted-dim)', letterSpacing: '0.15em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>
```

- [ ] **Step 3: Delete the Google button**

Find and remove the Google button block (currently around lines 202–215):

```tsx
          {/* Google */}
          <button
            onClick={handleGoogle}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: clean build, zero TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "feat: remove Google OAuth sign-in option"
```

---

### Task 2: White initials in UserMenu avatar

**Files:**
- Modify: `src/components/common/UserMenu.tsx`

- [ ] **Step 1: Change the avatar button's text colour**

In the avatar `<button>` style object, find:

```tsx
          color: 'var(--color-accent)',
```

Replace with:

```tsx
          color: '#ffffff',
```

This is the only colour value to change — do not alter any other style property on this button.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: clean build, zero TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/UserMenu.tsx
git commit -m "fix: use white text for avatar initials"
```
