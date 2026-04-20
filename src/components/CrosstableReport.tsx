import { useState } from 'react';
import { downloadCrosstablePdf } from '@/utils/crosstablePdf';
import { type StandingEntry } from '@/utils/standingsPdf';

interface Props {
  standings:      StandingEntry[];
  tournamentId:   string;
  tournamentName: string;
  style?:         React.CSSProperties;
}

export default function CrosstableReportButton({ standings, tournamentId, tournamentName, style }: Props) {
  const [loading, setLoading] = useState(false);
  const disabled = standings.length === 0 || loading;

  async function handleClick() {
    setLoading(true);
    await downloadCrosstablePdf(standings, tournamentId, tournamentName);
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={disabled} className="btn-sm min-w-32" style={style}>
      {loading ? 'Building…' : 'Standings'}
    </button>
  );
}
