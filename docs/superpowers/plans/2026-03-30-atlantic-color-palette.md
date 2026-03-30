# Atlantic Color Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the amber-on-navy color scheme with the Atlantic palette (navy/ice-blue/steel-blue) and swap Crimson Text for IBM Plex Mono throughout.

**Architecture:** All color tokens live in CSS custom properties in `src/index.css` — updating those values propagates the palette change to every component automatically. The font change requires updating the Google Fonts import and `body` declaration in `index.css`, plus a mechanical find-and-replace of 22 hardcoded `"Crimson Text", serif` references across 8 component files.

**Tech Stack:** Tailwind v4, CSS custom properties, React + TypeScript

---

## File Map

| File | Change |
|------|--------|
| `src/index.css` | Update `@theme` color tokens, `[data-theme="light"]` tokens, `::selection`, Google Fonts import, `--font-serif`, `body` font-family, `.serif-body` |
| `src/pages/Home.tsx` | Replace `"Crimson Text", serif` → `"IBM Plex Mono", monospace` (2 occurrences) |
| `src/pages/NewTournament.tsx` | Replace (1 occurrence) |
| `src/pages/RoundDetail.tsx` | Replace (7 occurrences) |
| `src/pages/Players.tsx` | Replace (1 occurrence) |
| `src/pages/Scenarios.tsx` | Replace (1 occurrence) |
| `src/pages/TournamentDetail.tsx` | Replace (5 occurrences) |
| `src/pages/Standings.tsx` | Replace (1 occurrence) |
| `src/pages/Tournaments.tsx` | Replace (1 occurrence) |

---

## Task 1: Update color tokens and font in `src/index.css`

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the Google Fonts import**

Open `src/index.css`. Replace line 1:

```css
/* OLD */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

/* NEW */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
```

- [ ] **Step 2: Replace the `@theme` color tokens and font-serif**

Replace the entire `@theme` block (lines ~9–47). New content:

```css
@theme {
  /* Fonts */
  --font-display: "Bebas Neue", sans-serif;
  --font-mono:    "IBM Plex Mono", monospace;
  --font-serif:   "IBM Plex Mono", monospace;

  /* Backgrounds */
  --color-bg:            #07101e;
  --color-bg-header:     #050d18;
  --color-surface:       #0d1d30;
  --color-raised:        #142840;

  /* Borders */
  --color-border:        #1a3652;
  --color-border-bright: #2a4a6a;

  /* Accent (steel blue) */
  --color-accent:        #4a9ed4;
  --color-accent-hover:  #6ab8e8;
  --color-accent-dim:    #1a5480;

  /* Text */
  --color-text:          #ddeaf8;
  --color-text-body:     #b8d0e8;
  --color-text-dim:      #9ab8d4;
  --color-muted:         #b8d8f0;
  --color-muted-dim:     #88b4d4;

  /* Status */
  --color-red:           #e05050;
  --color-red-bright:    #ff7070;
  --color-red-border:    #c03838;
  --color-red-bg:        #2a0e0e;
  --color-green:         #2a9e7a;
  --color-green-dim:     #38b89a;

  /* Misc */
  --color-spin-track:    #1a3652;
}
```

- [ ] **Step 3: Replace the `[data-theme="light"]` block**

Replace the entire `[data-theme="light"]` block. New content:

```css
[data-theme="light"] {
  --color-bg:            #e8f0f8;
  --color-bg-header:     #d8eaf6;
  --color-surface:       #f4f8fd;
  --color-raised:        #dce7f4;

  --color-border:        #a8c0d8;
  --color-border-bright: #7aa0c0;

  --color-accent:        #1a5490;
  --color-accent-hover:  #1e6aaa;
  --color-accent-dim:    #4a9ed4;

  --color-text:          #0a1828;
  --color-text-body:     #162438;
  --color-text-dim:      #1e3650;
  --color-muted:         #0e2e4a;
  --color-muted-dim:     #2a5070;

  --color-red:           #c02020;
  --color-red-bright:    #e03030;
  --color-red-border:    #d04040;
  --color-red-bg:        #fde8e8;
  --color-green:         #1a7858;
  --color-green-dim:     #228870;

  --color-spin-track:    #a8c0d8;
}
```

- [ ] **Step 4: Update `body` font-family**

In the `@layer base` block, update the `body` rule:

```css
/* OLD */
body {
  ...
  font-family: "Crimson Text", serif;
  ...
}

/* NEW */
body {
  ...
  font-family: "IBM Plex Mono", monospace;
  ...
}
```

- [ ] **Step 5: Update `.serif-body` utility class**

In the `@layer components` block, update the `.serif-body` rule:

```css
/* OLD */
.serif-body {
  font-family: "Crimson Text", serif;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-muted-dim);
}

/* NEW */
.serif-body {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-muted-dim);
}
```

- [ ] **Step 6: Update `::selection` background**

```css
/* OLD */
::selection {
  background: rgba(184, 134, 26, 0.3);
  color: var(--color-text);
}

/* NEW */
::selection {
  background: rgba(74, 158, 212, 0.3);
  color: var(--color-text);
}
```

- [ ] **Step 7: Start the dev server and do a visual spot check**

```bash
npm run dev
```

Open the app. Check:
- Dark mode background is deep navy (not grey-black)
- Accent color is steel blue (buttons, card corners, active states)
- Section labels and muted text are clearly readable
- Toggle light mode — background should be pale blue, not parchment
- No amber anywhere

- [ ] **Step 8: Commit**

```bash
git add src/index.css
git commit -m "feat: apply Atlantic color palette and swap Crimson Text for IBM Plex Mono in index.css"
```

---

## Task 2: Replace Crimson Text in component files

**Files:**
- Modify: `src/pages/Home.tsx`, `src/pages/NewTournament.tsx`, `src/pages/RoundDetail.tsx`, `src/pages/Players.tsx`, `src/pages/Scenarios.tsx`, `src/pages/TournamentDetail.tsx`, `src/pages/Standings.tsx`, `src/pages/Tournaments.tsx`

- [ ] **Step 1: Run the replacement across all component files**

```bash
cd C:/projects/tourney26
grep -rl '"Crimson Text", serif' src/pages/ | xargs sed -i 's/"Crimson Text", serif/"IBM Plex Mono", monospace/g'
```

- [ ] **Step 2: Verify all occurrences are gone**

```bash
grep -r '"Crimson Text"' src/
```

Expected output: no matches. If any remain, they are in files not covered above — fix manually.

- [ ] **Step 3: Verify no regressions in the dev server**

With the dev server still running from Task 1, check pages that previously used Crimson Text heavily:

- `/tournaments/<id>` — player names, descriptions, empty states
- `/tournaments/<id>/rounds/<id>` — game rows, scenario titles, player names
- `/players` — player list items

All prose text should now render in IBM Plex Mono. The overall look will be denser and more monospaced — this is expected.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx src/pages/NewTournament.tsx src/pages/RoundDetail.tsx src/pages/Players.tsx src/pages/Scenarios.tsx src/pages/TournamentDetail.tsx src/pages/Standings.tsx src/pages/Tournaments.tsx
git commit -m "feat: replace Crimson Text with IBM Plex Mono in all component files"
```
