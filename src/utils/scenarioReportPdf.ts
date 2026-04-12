import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/config/supabase';
import { toTitleCase } from './format';

export async function openScenarioReportPdf(
  tournamentId:   string,
  tournamentName: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('games')
    .select(`
      player1_id, player2_id, player1_attacks, winner_id, scenario_id,
      rounds!inner(tournament_id),
      scenarios(id, title, attacker_nationality, defender_nationality)
    `)
    .eq('rounds.tournament_id', tournamentId)
    .eq('status', 'COMPLETED')
    .not('scenario_id', 'is', null);

  if (error) { console.error(error); return; }

  // Group by scenario
  const scenMap = new Map<string, {
    title:               string;
    attacker_nationality: string;
    defender_nationality: string;
    attackerWins:        number;
    defenderWins:        number;
  }>();

  for (const g of (data ?? [])) {
    const scen = (g as any).scenarios;
    if (!scen) continue;
    const sid = (g as any).scenario_id as string;
    if (!scenMap.has(sid)) {
      scenMap.set(sid, {
        title:               scen.title,
        attacker_nationality: scen.attacker_nationality,
        defender_nationality: scen.defender_nationality,
        attackerWins:        0,
        defenderWins:        0,
      });
    }
    const entry    = scenMap.get(sid)!;
    const attackerIsP1 = (g as any).player1_attacks as boolean;
    const winnerId     = (g as any).winner_id as string | null;
    if (!winnerId) continue;
    const attackerWon = attackerIsP1
      ? winnerId === (g as any).player1_id
      : winnerId === (g as any).player2_id;
    if (attackerWon) entry.attackerWins++;
    else             entry.defenderWins++;
  }

  // Sort by scenario title
  const rows = [...scenMap.values()].sort((a, b) => a.title.localeCompare(b.title));

  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'letter' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(tournamentName, 40, 42);

  doc.setFontSize(11);
  doc.text('Scenario Report', 40, 60);

  autoTable(doc, {
    head: [['Scenario', 'Attacker', 'Defender']],
    body: rows.map(r => [
      r.title,
      `${r.attacker_nationality}\n${r.attackerWins}`,
      `${r.defender_nationality}\n${r.defenderWins}`,
    ]),
    startY: 72,
    theme: 'striped',
    headStyles: {
      fontStyle:   'bolditalic',
      fillColor:   [255, 255, 255],
      textColor:   [0, 0, 0],
      lineWidth:   { bottom: 1 },
      lineColor:   [0, 0, 0],
    },
    styles: { font: 'helvetica', fontSize: 11, cellPadding: { top: 6, bottom: 6, left: 8, right: 8 } },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 120, halign: 'center', fontSize: 10 },
      2: { cellWidth: 120, halign: 'center', fontSize: 10 },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && (data.column.index === 1 || data.column.index === 2)) {
        data.cell.styles.halign = 'center';
      }
    },
  });

  const blob = doc.output('blob');
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
