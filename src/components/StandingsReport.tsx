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
      className="btn-sm min-w-32"
      style={style}
    >
      Point Details
    </button>
  );
}
