import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/config/supabase';
import { type StandingEntry } from './standingsPdf';

export async function downloadCrosstablePdf(
  standings: StandingEntry[],
  tournamentId: string,
  tournamentName: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('games')
    .select('player1_id, player2_id, winner_id, rounds!inner(round_number, tournament_id)')
    .eq('rounds.tournament_id', tournamentId)
    .eq('status', 'COMPLETED');

  if (error) { console.error(error); return; }

  const games: any[] = data ?? [];

  // Rank lookup: playerId → rank number
  const rankByPlayerId = new Map<string, number>();
  for (const s of standings) {
    rankByPlayerId.set(s.player.id, s.rank);
  }

  // Ranks that are tied
  const tiedRanks = new Set(
    standings
      .filter((_, __) => true)
      .reduce<number[]>((acc, s) => {
        if (standings.filter(x => x.rank === s.rank).length > 1) acc.push(s.rank);
        return acc;
      }, [])
  );

  // All round numbers present in completed games, sorted
  const roundNumbers = Array.from(
    new Set(games.map(g => g.rounds?.round_number as number).filter(n => n != null))
  ).sort((a, b) => a - b);

  // gameByPlayerRound: playerId → roundNumber → game
  const gameByPlayerRound = new Map<string, Map<number, any>>();
  for (const s of standings) {
    gameByPlayerRound.set(s.player.id, new Map());
  }
  for (const g of games) {
    const rn = g.rounds?.round_number as number;
    if (rn == null) continue;
    for (const pid of [g.player1_id, g.player2_id]) {
      if (gameByPlayerRound.has(pid)) {
        gameByPlayerRound.get(pid)!.set(rn, g);
      }
    }
  }

  const headers = ['Place', 'Player', ...roundNumbers.map(n => `Rd ${n}`), 'Score'];

  // Track which (rowIndex, colIndex) cells are wins for green highlighting
  const winCells = new Set<string>();

  const rows = standings.map((s, rowIdx) => {
    const isTied = tiedRanks.has(s.rank);
    const placeLabel = `${s.rank}${isTied ? '=' : ''}.`;

    const roundCells = roundNumbers.map((rn, rnIdx) => {
      const game = gameByPlayerRound.get(s.player.id)?.get(rn);
      if (!game) return '—';
      const isWin  = game.winner_id === s.player.id;
      const oppId  = game.player1_id === s.player.id ? game.player2_id : game.player1_id;
      const oppRank = rankByPlayerId.get(oppId);
      if (oppRank == null) return '?';
      if (isWin) winCells.add(`${rowIdx},${rnIdx + 2}`); // col offset: Place + Player = 2
      return `${oppRank}`;
    });

    return [placeLabel, s.player.name, ...roundCells, s.points];
  });

  // Use landscape for tournaments with many rounds
  const orientation = roundNumbers.length > 5 ? 'l' : 'p';
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'letter' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${tournamentName}  —  Crosstable`, 40, 36);

  const nameColWidth = 130;
  const placeColWidth = 40;
  const roundColWidth = 38;
  const scoreColWidth = 42;

  const columnStyles: Record<number, object> = {
    0: { cellWidth: placeColWidth, halign: 'center' },
    1: { cellWidth: nameColWidth,  halign: 'left'   },
    [headers.length - 1]: { cellWidth: scoreColWidth, halign: 'right', fontStyle: 'bold' },
  };
  for (let i = 0; i < roundNumbers.length; i++) {
    columnStyles[i + 2] = { cellWidth: roundColWidth, halign: 'center' };
  }

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 50,
    theme: 'grid',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [20, 20, 20],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    styles: { font: 'helvetica', fontSize: 9 },
    columnStyles,
    didParseCell(data) {
      if (data.section === 'body' && winCells.has(`${data.row.index},${data.column.index}`)) {
        data.cell.styles.fillColor  = [220, 242, 220];
        data.cell.styles.textColor  = [20, 60, 20];
        data.cell.styles.fontStyle  = 'bold';
      }
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? 200;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text('Green cell = Win vs player ranked N     Plain = Loss vs player ranked N', 40, finalY + 16);

  const blob = doc.output('blob');
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
