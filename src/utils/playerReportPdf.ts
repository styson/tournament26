import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/config/supabase';

export async function openPlayerReportPdf(
  playerId:       string,
  playerName:     string,
  tournamentId:   string,
  tournamentName: string,
  playerById:     Record<string, string>, // id → name
): Promise<void> {
  const { data, error } = await supabase
    .from('games')
    .select(`
      player1_id, player2_id, winner_id,
      rounds!inner(round_number, tournament_id),
      scenarios(title, scen_id)
    `)
    .eq('rounds.tournament_id', tournamentId)
    .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
    .eq('status', 'COMPLETED');

  if (error) { console.error(error); return; }

  const sorted = (data ?? []).slice().sort(
    (a: any, b: any) => (a.rounds?.round_number ?? 0) - (b.rounds?.round_number ?? 0),
  );

  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'letter' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(playerName, 40, 42);

  doc.setFontSize(10);
  doc.text(tournamentName, 40, 60);

  const rows = sorted.map((g: any) => {
    const opponentId   = g.player1_id === playerId ? g.player2_id : g.player1_id;
    const opponentName = playerById[opponentId] ?? '—';
    const roundNum     = g.rounds?.round_number ?? '?';
    const scenTitle    = g.scenarios?.title ?? '—';
    const result       = g.winner_id === playerId ? 'Win' : 'Loss';
    return [roundNum, opponentName, scenTitle, result];
  });

  autoTable(doc, {
    head: [['Round', 'Opponent', 'Scenario', 'Win']],
    body: rows,
    startY: 72,
    theme: 'striped',
    headStyles: { fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    styles: { font: 'helvetica', fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 45 },
      3: { cellWidth: 50 },
    },
  });

  const blob = doc.output('blob');
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
