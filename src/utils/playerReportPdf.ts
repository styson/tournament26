import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/config/supabase';
import { toTitleCase } from './format';

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
      player1_id, player2_id, player1_attacks, winner_id,
      rounds!inner(round_number, tournament_id),
      scenarios(title, scen_id, attacker_nationality, defender_nationality)
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

    const isPlayer1    = g.player1_id === playerId;
    const isAttacker   = isPlayer1 ? g.player1_attacks : !g.player1_attacks;
    const role         = isAttacker ? 'Attacker' : 'Defender';
    const nationality  = toTitleCase(isAttacker
      ? (g.scenarios?.attacker_nationality ?? '—')
      : (g.scenarios?.defender_nationality ?? '—'));

    return [roundNum, opponentName, scenTitle, role, nationality, result];
  });

  autoTable(doc, {
    head: [['Round', 'Opponent', 'Scenario', 'Role', 'Side', 'Result']],
    body: rows,
    startY: 72,
    theme: 'striped',
    headStyles: { fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    styles: { font: 'helvetica', fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 45 },
      3: { cellWidth: 60 },
      4: { cellWidth: 80 },
      5: { cellWidth: 50 },
    },
  });

  const blob = doc.output('blob');
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
