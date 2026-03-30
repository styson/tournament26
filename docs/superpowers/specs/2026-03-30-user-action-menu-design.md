# User Action Menu — Design Spec

**Date:** 2026-03-30
**Status:** Approved

## Summary

Replace the three loose controls in the header (username label, theme toggle button, logout button) with a single avatar-circle trigger that opens a dropdown menu. Add a password reset action to the menu.

---

## Problem

The top-right of the header currently has three separate elements: a static username label, a `◑ Light/Dark` toggle button, and a `Logout` button. This is cluttered and leaves no natural place to add user-account actions like password reset.

---

## Design

### Trigger

A 28×28px circular avatar button positioned at the far right of the header, replacing all three existing controls. The button displays the user's initials:

- Derived from `user.name`: first character of each whitespace-separated word (e.g. "John Smith" → "JS")
- Fallback: first two characters of `user.email` if `user.name` is absent or blank
- Fallback of last resort: `??`

Styling: steel-blue (`var(--color-accent)`) border and initials text on a dark background, using `font-family: "IBM Plex Mono"`. Hover and open states lighten the border and background.

### Dropdown

Opens below the avatar, right-aligned. Closes on outside click or on any item action.

| Item | Behaviour |
|---|---|
| Email header | Read-only. Shows `user.email`. Truncated with ellipsis if long. |
| Dark mode toggle | Pill toggle. Replaces the old button. Same `localStorage` + `data-theme` logic. |
| Reset password | Calls `supabase.auth.resetPasswordForEmail(user.email)`, closes the menu, shows a success toast: _"Reset link sent — check your inbox"_. Hidden if `user.email` is absent (OAuth-only accounts). |
| Sign out | Calls `supabase.auth.signOut()`. Styled red to signal a destructive action. |

### Toast

A small fixed-position notification (bottom-right) that appears after the reset email is dispatched and auto-dismisses after 3 seconds. No error state is needed for the MVP — if the call fails, Supabase logs it; the user can retry by reopening the menu.

---

## Component Architecture

**New file:** `src/components/common/UserMenu.tsx`

Responsibilities:
- Manages `isOpen` state for the dropdown
- Computes initials from `user.name` / `user.email`
- Manages `toastVisible` state
- Renders the avatar button, dropdown, and toast
- Imports `useAuth` for `user` and `signOut`
- Imports `supabase` directly for `resetPasswordForEmail`

**Modified file:** `src/components/common/Layout.tsx`

- Remove the username `<span>`, theme toggle `<button>`, and logout `<button>` from the user-info section
- Import and render `<UserMenu />` in their place
- Keep the `theme` / `setTheme` state in `Layout` — pass `theme` and `setTheme` as props to `UserMenu` so the toggle can control it

---

## Props Interface

```ts
interface UserMenuProps {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}
```

---

## Out of Scope

- Confirming before sending the reset email (keep it simple: click → send → toast)
- In-app password change form
- Profile editing (name, avatar image)
- Error handling beyond the success toast (MVP)
