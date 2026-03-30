# Atlantic Color Palette — Design Spec
**Date:** 2026-03-30
**Status:** Approved

## Overview

Replace the existing amber-on-navy color scheme with the **Atlantic** palette: deep navy backgrounds, ice-blue text, steel-blue accent, and teal-green status color. Both dark and light modes are redesigned. Crimson Text is removed and replaced with IBM Plex Mono throughout.

## Motivation

The previous scheme had two problems:
1. `--color-muted` (`#e0e4e8`) and `--color-muted-dim` (`#dddddd`) were near-white in dark mode — indistinguishable from primary text, breaking visual hierarchy.
2. The light mode had cold blue-grey backgrounds that clashed with the warm amber accent.

## Scope

Two categories of change:

1. **`src/index.css`** — CSS custom property values in `@theme` and `[data-theme="light"]`, the `::selection` background, the Google Fonts import, the `--font-serif` token, and the `body` font-family declaration.
2. **8 component files** — All 22 hardcoded `"Crimson Text", serif` references replaced with `"IBM Plex Mono", monospace`. Files affected: `Home.tsx`, `NewTournament.tsx`, `RoundDetail.tsx`, `Players.tsx`, `Scenarios.tsx`, `TournamentDetail.tsx`, `Standings.tsx`, `Tournaments.tsx`.

## Token Changes

### Dark Mode (`@theme`)

| Token | Old | New |
|-------|-----|-----|
| `--color-bg` | `#0e1116` | `#07101e` |
| `--color-bg-header` | `#0b0f14` | `#050d18` |
| `--color-surface` | `#161b24` | `#0d1d30` |
| `--color-raised` | `#2a3545` | `#142840` |
| `--color-border` | `#2a3340` | `#1a3652` |
| `--color-border-bright` | `#3a4a5a` | `#2a4a6a` |
| `--color-accent` | `#f0a020` | `#4a9ed4` |
| `--color-accent-hover` | `#fbbf24` | `#6ab8e8` |
| `--color-accent-dim` | `#a06a10` | `#1a5480` |
| `--color-text` | `#f0ece0` | `#ddeaf8` |
| `--color-text-body` | `#e8eef4` | `#b8d0e8` |
| `--color-text-dim` | `#dde2e8` | `#9ab8d4` |
| `--color-muted` | `#e0e4e8` | `#b8d8f0` |
| `--color-muted-dim` | `#dddddd` | `#88b4d4` |
| `--color-green` | `#28a040` | `#2a9e7a` |
| `--color-green-dim` | `#4a9c68` | `#38b89a` |
| `--color-spin-track` | `#2a3340` | `#1a3652` |

Red tokens (`--color-red`, `--color-red-bright`, `--color-red-border`, `--color-red-bg`) are unchanged.

### Light Mode (`[data-theme="light"]`)

| Token | Old | New |
|-------|-----|-----|
| `--color-bg` | `#eef1f6` | `#e8f0f8` |
| `--color-bg-header` | `#dde3ec` | `#d8eaf6` |
| `--color-surface` | `#ffffff` | `#f4f8fd` |
| `--color-raised` | `#f0f3f8` | `#dce7f4` |
| `--color-border` | `#c8d4e0` | `#a8c0d8` |
| `--color-border-bright` | `#a0b4c8` | `#7aa0c0` |
| `--color-accent` | `#c07010` | `#1a5490` |
| `--color-accent-hover` | `#d4880a` | `#1e6aaa` |
| `--color-accent-dim` | `#e8a040` | `#4a9ed4` |
| `--color-text` | `#1a2030` | `#0a1828` |
| `--color-text-body` | `#2a3040` | `#162438` |
| `--color-text-dim` | `#3a4858` | `#1e3650` |
| `--color-muted` | `#5a6878` | `#0e2e4a` |
| `--color-muted-dim` | `#8898a8` | `#2a5070` |
| `--color-green` | `#1a8030` | `#1a7858` |
| `--color-green-dim` | `#2a8848` | `#228870` |
| `--color-spin-track` | `#c8d4e0` | `#a8c0d8` |

Red tokens unchanged.

### Selection highlight

```css
/* Old */
::selection { background: rgba(184, 134, 26, 0.3); }

/* New */
::selection { background: rgba(74, 158, 212, 0.3); }
```

## Font Changes

### `src/index.css`
- Remove `family=Crimson+Text:ital,wght@0,400;0,600;1,400` from the Google Fonts `@import` URL
- Update `--font-serif` token: `"Crimson Text", serif` → `"IBM Plex Mono", monospace`
- Update `body { font-family }`: `"Crimson Text", serif` → `"IBM Plex Mono", monospace`
- Remove `.serif-body` utility class (was `font-family: "Crimson Text", serif`) or redirect it to IBM Plex Mono

### Component files (8 files, 22 occurrences)
Find: `"Crimson Text", serif`
Replace: `"IBM Plex Mono", monospace`

This is a mechanical replacement — no size or weight adjustments needed as part of this spec. IBM Plex Mono at the existing sizes produces a denser, more technical feel consistent with the military-tactical aesthetic.

## Design Rationale

- **Accent** (`#4a9ed4` dark / `#1a5490` light): Steel blue with enough saturation to stand out against the navy backgrounds without feeling neon.
- **Muted** (`#b8d8f0` dark / `#0e2e4a` light): Pushed to max-contrast level during review — light enough in dark mode and dark enough in light mode to be clearly readable as secondary text.
- **Green** (`#38b89a` / `#228870`): Shifted to teal-green to harmonize with the blue palette rather than clashing as a warm green would.
- **Red**: Unchanged — red reads well against navy and doesn't need adjustment.

## What Is Not Changing

- Bebas Neue (display headings) — kept as-is
- IBM Plex Mono weights and sizes — kept as-is
- Component structure (`.card`, `.btn-primary`, `.btn-secondary`, etc.)
- Layout and spacing
- Animations
