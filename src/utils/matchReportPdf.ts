import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toTitleCase } from './format';

// ─── types ───────────────────────────────────────────────────

export interface MatchReportGame {
  player1_id:      string;
  player2_id:      string;
  player1_attacks: boolean;
  winner_id:       string | null;
  scenario_id:     string | null;
}

export interface MatchReportPlayer {
  id:   string;
  name: string;
}

export interface MatchReportScenario {
  id:                     string;
  scen_id:                string | null;
  title:                  string;
  attacker_nationality:   string;
  defender_nationality:   string;
}

// ─── PDF generation ──────────────────────────────────────────

export function openMatchReportPdf(
  games:          MatchReportGame[],
  playerById:     Record<string, MatchReportPlayer>,
  scenarioById:   Record<string, MatchReportScenario>,
  tournamentName: string,
  roundNumber:    number | string,
): void {
  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'letter' });

  doc.text(tournamentName, 40, 30);
  doc.text(`Round ${roundNumber} Matches`, 220, 30);

  if (games.length === 0) {
    doc.text('No matches yet.', 20, 60);
  } else {
    const headers = ['Player', '', 'Player', '', 'Scenario'];
    const rows: (string | number)[][] = [];
    const sidesRowIndices = new Set<number>();

    for (const game of games) {
      const p1 = playerById[game.player1_id];
      const p2 = playerById[game.player2_id];
      const scenario = game.scenario_id ? scenarioById[game.scenario_id] : null;
      const p1Wins = game.winner_id === game.player1_id;
      const noWinner = game.winner_id === null;

      const matchRow: (string | number)[] = [];
      if (noWinner) {
        matchRow.push(p1?.name ?? '—', 'vs.', p2?.name ?? '—');
      } else if (p1Wins) {
        matchRow.push(p1?.name ?? '—', 'def.', p2?.name ?? '—');
      } else {
        matchRow.push(p2?.name ?? '—', 'def.', p1?.name ?? '—');
      }

      if (scenario) {
        matchRow.push('in', `${scenario.scen_id ? scenario.scen_id + ': ' : ''}${scenario.title}`);
      } else {
        matchRow.push('', '');
      }

      const sidesRow: string[] = [];
      if (!noWinner && scenario) {
        const winnerAttacks = p1Wins ? game.player1_attacks : !game.player1_attacks;
        const winnerRole  = toTitleCase(winnerAttacks ? scenario.attacker_nationality : scenario.defender_nationality);
        const loserRole   = toTitleCase(winnerAttacks ? scenario.defender_nationality : scenario.attacker_nationality);
        sidesRow.push(`  as ${winnerRole} (${winnerAttacks ? 'atk' : 'def'})`, '', `  as ${loserRole} (${!winnerAttacks ? 'atk' : 'def'})`, '', '');
      }

      rows.push(matchRow);
      if (sidesRow.length) {
        sidesRowIndices.add(rows.length);
        rows.push(sidesRow);
      }
    }

    autoTable(doc, {
      theme: 'grid',
      head: [headers],
      body: rows,
      didParseCell(data) {
        if (data.section !== 'body') return;
        const i = data.row.index;
        if (sidesRowIndices.has(i))     data.cell.styles.lineWidth = { top: 0, right: 0.1, bottom: 0.1, left: 0.1 };
        if (sidesRowIndices.has(i + 1)) data.cell.styles.lineWidth = { top: 0.1, right: 0.1, bottom: 0, left: 0.1 };
      },
    });
  }

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
