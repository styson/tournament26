// ─── component ────────────────────────────────────────────────
import { downloadStandingsPdf, type StandingEntry } from "@/utils/standingsPdf";

interface Props {
  standings:      StandingEntry[];
  tournamentName: string;
  style?:         React.CSSProperties;
}

export default function StandingsReportButton({ standings, tournamentName, style }: Props) {
  const disabled = standings.length === 0;

  function handleClick() {
    downloadStandingsPdf(standings, tournamentName);
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        background: 'transparent',
        color: 'var(--color-text-dim)',
        border: '1px solid var(--color-border-bright)',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 'inherit',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '0.3rem 0.6rem',
        cursor: disabled ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-accent)'; b.style.color = 'var(--color-accent)'; }}}
      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'var(--color-border-bright)'; b.style.color = 'var(--color-text-dim)'; }}
    >
      View Standings
    </button>
  );
}
